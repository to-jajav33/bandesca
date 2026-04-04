import path from "node:path";
import fs from "node:fs";

/** Allowed `name` on `<meta name="…">` (avoids breaking out of attributes). */
const SAFE_META_NAME = /^[a-zA-Z][a-zA-Z0-9:._-]*$/;

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** `<meta>` fragments only; title is applied via a `title` element handler (escaped text). */
function metaTagsObjectToHeadHtml(metaTags) {
  const parts = [];
  if (metaTags.description != null && metaTags.description !== "") {
    parts.push(
      `<meta name="description" content="${escapeHtmlAttribute(metaTags.description)}">`,
    );
  }
  for (const key of Object.keys(metaTags)) {
    if (key === "title" || key === "description") continue;
    if (!SAFE_META_NAME.test(key)) continue;
    const val = metaTags[key];
    if (val == null || val === "") continue;
    parts.push(
      `<meta name="${escapeHtmlAttribute(key)}" content="${escapeHtmlAttribute(String(val))}">`,
    );
  }
  return parts.join("");
}

const buildSrcFilesAndDir = async (
  generatedDir,
  filesToBuild,
  filesToCopy,
  filesToIgnore,
  dirs,
) => {
  const currentDir = path.join(import.meta.dir, "..", "src", ...dirs);
  console.log("currentDir", currentDir);

  // all pages in src/pages
  const pages = fs.readdirSync(currentDir);
  console.log("pages", pages);

  // build pages
  for (const page of pages) {
    const currentPagePath = path.join(currentDir, page);
    const generatedPagePath = path.join(generatedDir, ...dirs, page);

    if (fs.statSync(currentPagePath).isDirectory()) {
      await buildSrcFilesAndDir(
        generatedDir,
        filesToBuild,
        filesToCopy,
        filesToIgnore,
        [...dirs, page],
      );
      continue;
    }

    let type = "server";
    let possibleType = currentPagePath.split(".").slice(-3);
    possibleType = currentPagePath.endsWith(".module.css")
      ? possibleType[0]
      : possibleType[1];
    if (possibleType === "asset") {
      type = "asset";
    } else if (possibleType === "client") {
      type = "client";
    } else if (possibleType === "dep") {
      type = "dep";
    }
    // create generatedPagePath if it doesn't exist
    fs.mkdirSync(path.dirname(generatedPagePath), { recursive: true });
    if (type !== "server") {
      fs.copyFileSync(currentPagePath, generatedPagePath);
    }

    if (type === "dep") {
      console.log("adding dep page to dep", currentPagePath);
      filesToIgnore.push(currentPagePath);
      continue;
    }

    // check if page is a asset page, copy it to outDir, skip building as its a asset page
    // that should never run on the server
    if (type === "asset") {
      console.log("adding asset page to copy", currentPagePath);
      filesToCopy.push(generatedPagePath);
      continue;
    }

    // check if page is a client page, copy it to outDir, skip building as its a client page
    // that should never run on the server
    if (type === "client") {
      console.log("adding client page to build", page);
      filesToBuild.push(generatedPagePath);
      continue;
    }

    if (!currentPagePath.endsWith(".js")) {
      // non js files should be imported by a js file, ignoring for now. if needed use .asset.html or .dep.html
      console.log("ignoring non js file", currentPagePath);
      continue;
    }

    console.log("page", page);

    const module = await import(path.join(currentDir, page));
    console.log("module", module);
    const { getMetaTags, getProps, default: render } = module;

    // get props and meta tags
    const props = await getProps?.({
      authentication: null,
      request: null,
    });
    const metaTags = await getMetaTags?.({
      authentication: null,
      request: null,
      props,
    });

    const html = new HTMLRewriter();
    if (metaTags && typeof metaTags === "object" && !Array.isArray(metaTags)) {
      if (metaTags.title != null && metaTags.title !== "") {
        html.on("title", {
          element(element) {
            element.setInnerContent(String(metaTags.title), { html: false });
          },
        });
      }
      const headFragment = metaTagsObjectToHeadHtml(metaTags);
      if (headFragment) {
        html.on("head", {
          element(element) {
            element.append(headFragment, { html: true });
          },
        });
      }
    }

    const transformedHtml = html.transform(
      await render({
        authentication: null,
        request: null,
        props,
      }),
    );

    const generatedHtmlPagePath = generatedPagePath.replace(".js", ".html");
    // what ever is generate by the htmlRewriter, write it .generated/
    fs.writeFileSync(generatedHtmlPagePath, transformedHtml.toString());
    filesToBuild.push(generatedHtmlPagePath);
  }
};

/** @param {{ incremental?: boolean }} [options] */
export async function buildStatic(options = {}) {
  const { incremental = false } = options;
  const outDir = path.join(import.meta.dir, "..", "dist", "static");

  if (!incremental) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
  } else if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("outDir", outDir, incremental ? "(incremental)" : "(clean)");
  const generatedDir = path.join(import.meta.dir, "..", ".generated");
  fs.rmSync(generatedDir, { recursive: true, force: true });
  fs.mkdirSync(generatedDir, { recursive: true });
  console.log("generatedDir", generatedDir);

  const filesToBuild = [];
  const filesToCopy = [];
  const filesToIgnore = [];
  await buildSrcFilesAndDir(
    generatedDir,
    filesToBuild,
    filesToCopy,
    filesToIgnore,
    [],
  );

  let result = null;
  try {
    console.log("building pages", filesToBuild);

    result = await Bun.build({
      entrypoints: filesToBuild,
      outdir: outDir,
      minify: process.env.NODE_ENV === "production" ? true : false,
      target: "browser",
      format: "esm",
      sourcemap: process.env.NODE_ENV === "production" ? false : true,
      splitting: process.env.NODE_ENV === "production" ? true : false,
      treeshaking: process.env.NODE_ENV === "production" ? true : false,
      minifyIdentifiers: process.env.NODE_ENV === "production" ? true : false,
      minifySyntax: process.env.NODE_ENV === "production" ? true : false,
      minifyWhitespace: process.env.NODE_ENV === "production" ? true : false,
    });

    for (const filePath of filesToCopy) {
      console.log("copying filePath", filePath);
      fs.copyFileSync(filePath, path.join(outDir, path.basename(filePath)));
    }

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map((error) => error.text).join("\n"));
    }
  } catch (error) {
    console.error(error);
    // delete generatedDir
    fs.rmSync(generatedDir, { recursive: true });
    return process.exit(1);
  }

  // delete generatedDir
  fs.rmSync(generatedDir, { recursive: true });

  console.log("result", result);
  return result.outputs;
}

if (import.meta.main) {
  await buildStatic();
}

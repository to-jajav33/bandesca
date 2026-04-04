import Bun from "bun";
import fs from "node:fs";
import path from "node:path";
import { serveSsr } from "./serve-ssr";
import { serveStatic } from "./serve-static";
import { buildStatic } from "../scripts/build-static";
import { buildSsr } from "../scripts/build-ssr";

const FILE_EXTENSIONS = [
  ".html",
  ".js",
  ".css",
  ".json",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
];

function debounce(fn, ms, label) {
  let t;
  return () => {
    console.log(`[watch] debounce(${label}): reset ${ms}ms timer`);
    clearTimeout(t);
    t = setTimeout(() => {
      console.log(`[watch] debounce(${label}): firing`);
      fn();
    }, ms);
  };
}

function createRouter(root, hostname, port) {
  return new Bun.FileSystemRouter({
    style: "nextjs",
    dir: root,
    origin: `http://${hostname}:${port}`,
    fileExtensions: FILE_EXTENSIONS,
  });
}

try {
  (async () => {
    const port = Number(process.env.PORT) || 3000;
    const hostname = process.env.HOSTNAME || "0.0.0.0";
    const projectRoot = path.join(import.meta.dir, "..");
    const staticRoot = path.join(projectRoot, "dist", "static");
    const ssrRoot = path.join(projectRoot, "dist", "ssr");
    const isStatic = process.env.BANDESCA_MODE === "static";
    const devWatch = process.env.BANDESCA_WATCH === "1" && isStatic;

    console.log("[watch] env BANDESCA_MODE=%s BANDESCA_WATCH=%s → devWatch=%s", process.env.BANDESCA_MODE ?? "(unset)", process.env.BANDESCA_WATCH ?? "(unset)", devWatch);
    if (isStatic && !devWatch) {
      console.log(
        "[watch] off: set BANDESCA_WATCH=1 (default in npm run start:static) or use npm run dev:static for bun --watch on server/",
      );
    }

    const state = {
      router: null,
      buildId: 0,
    };

    if (isStatic) {
      await buildStatic();
      state.buildId += 1;
      state.router = createRouter(staticRoot, hostname, port);
    } else {
      await buildSsr();
      state.router = createRouter(ssrRoot, hostname, port);
    }

    console.log("router", state.router);

    globalThis.__bandesca_server?.stop();
    if (isStatic) {
      globalThis.__bandesca_server = serveStatic(hostname, port, {
        getRouter: () => state.router,
        getBuildId: () => state.buildId,
        devWatch,
      });
    } else {
      globalThis.__bandesca_server = serveSsr(hostname, port, state.router);
    }

    console.log(`open http://${hostname}:${globalThis.__bandesca_server.port}`);
    if (devWatch) {
      console.log("[watch] dev reload enabled; projectRoot=%s", projectRoot);
    }

    if (devWatch) {
      const rebuild = async () => {
        console.log("[watch] rebuild starting…");
        try {
          await buildStatic({ incremental: true });
          // Let the bundler finish flushing; then rescan routes on the same router instance.
          await new Promise((r) => setTimeout(r, 75));
          try {
            state.router.reload();
          } catch (e) {
            console.warn("[watch] router.reload failed, recreating router", e);
            state.router = createRouter(staticRoot, hostname, port);
          }
          state.buildId += 1;
          console.log("[watch] rebuild done, buildId=%s", state.buildId);
        } catch (e) {
          console.error("[watch] build failed", e);
        }
      };
      const schedule = debounce(rebuild, 250, "rebuild");

      for (const rel of ["src", "scripts"]) {
        const dir = path.join(projectRoot, rel);
        if (!fs.existsSync(dir)) {
          console.warn("[watch] skip missing dir: %s", dir);
          continue;
        }
        try {
          const watcher = fs.watch(
            dir,
            { recursive: true },
            (eventType, filename) => {
              console.log(
                "[watch] fs event dir=%s eventType=%s filename=%s",
                rel,
                eventType,
                filename == null ? "(null)" : String(filename),
              );
              schedule();
            },
          );
          console.log("[watch] attached fs.watch recursive → %s", dir);
          watcher.on("error", (err) => {
            console.error("[watch] watcher error on %s", dir, err);
          });
        } catch (e) {
          if (e.code === "ENOENT") {
            console.warn("[watch] ENOENT (skip): %s", dir);
          } else {
            throw e;
          }
        }
      }
    }
  })();
} catch (error) {
  globalThis.__bandesca_server?.stop();
  console.error(error);
  process.exit(1);
}

import Bun from "bun";
import path from "node:path";
import { serveSsr } from "./serve-ssr";
import { serveStatic } from "./serve-static";
import { buildStatic } from "../scripts/build-static";
import { buildSsr } from "../scripts/build-ssr";

try {
  (async () => {
    // build static or ssr
    if (process.env.BANDESCA_MODE === "static") {
      await buildStatic();
    } else {
      await buildSsr();
    }

    const port = Number(process.env.PORT) || 3000;
    const hostname = process.env.HOSTNAME || "0.0.0.0";
    const root = path.join(
      import.meta.dir,
      "../dist/",
      `${process.env.BANDESCA_MODE === "static" ? "static" : "ssr"}`,
    );

    const router = new Bun.FileSystemRouter({
      style: "nextjs",
      dir: root,
      origin: `http://${hostname}:${port}`,
      fileExtensions: [
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
        ".ico",
        ".webp",
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
      ],
    });

    console.log("router", router);

    globalThis.__bandesca_server?.stop();
    if (process.env.BANDESCA_MODE === "static") {
      globalThis.__bandesca_server = serveStatic(hostname, port, router);
    } else {
      globalThis.__bandesca_server = serveSsr(hostname, port, router);
    }

    console.log(`open http://${hostname}:${globalThis.__bandesca_server.port}`);
  })();
} catch (error) {
  globalThis.__bandesca_server?.stop();
  console.error(error);
  process.exit(1);
}

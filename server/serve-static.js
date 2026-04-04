/** Next.js-style FileSystemRouter keys omit extensions; browsers still request `/file.js`. */
const ROUTE_STRIP_EXT =
  /\.(?:html|js|mjs|css|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|otf)$/i;

// Delay reload so in-flight module requests are not aborted mid-flight (DevTools often shows that as 404).
const LIVE_RELOAD_SNIPPET = `<script>(function(){var k="__bandesca_bid";setInterval(function(){fetch("/__bandesca_dev/build-id",{cache:"no-store"}).then(function(r){return r.text()}).then(function(id){var p=sessionStorage.getItem(k);if(p===null)sessionStorage.setItem(k,id);else if(p!==id){sessionStorage.setItem(k,id);setTimeout(function(){location.reload()},200)}}).catch(function(){})},400)})();<\/script>`;

/**
 * @param {string} hostname
 * @param {number} port
 * @param {{ getRouter: () => import("bun").FileSystemRouter; getBuildId: () => number; devWatch?: boolean }} options
 */
export function serveStatic(hostname, port, options) {
  const { getRouter, getBuildId, devWatch = false } = options;

  return Bun.serve({
    port,
    hostname,
    async fetch(request) {
      const url = new URL(request.url);

      if (devWatch && url.pathname === "/__bandesca_dev/build-id") {
        return new Response(String(getBuildId()), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      }

      const router = getRouter();
      let matched = router.match(request);
      if (!matched) {
        const pathname = url.pathname;
        const withoutExt = pathname.replace(ROUTE_STRIP_EXT, "");
        if (withoutExt !== pathname) {
          matched =
            router.match(withoutExt) ??
            router.match(
              new Request(`${url.origin}${withoutExt}${url.search}`, request),
            );
        }
      }

      if (!matched) {
        if (
          devWatch &&
          (url.pathname.includes("chunk-") || url.pathname.endsWith(".js"))
        ) {
          const r = getRouter();
          const chunkRoutes = Object.keys(r.routes).filter((k) =>
            k.includes("chunk"),
          );
          console.warn(
            "[serve] 404 %s (chunk routes: %s)",
            url.pathname,
            chunkRoutes.join(", ") || "(none)",
          );
        }
        return new Response("Not found", { status: 404 });
      }

      const noCache = devWatch ? { "Cache-Control": "no-store" } : {};

      if (devWatch && matched.filePath.endsWith(".html")) {
        const html = await Bun.file(matched.filePath).text();
        const withReload = html.includes("</body>")
          ? html.replace("</body>", `${LIVE_RELOAD_SNIPPET}</body>`)
          : `${html}${LIVE_RELOAD_SNIPPET}`;
        return new Response(withReload, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...noCache,
          },
        });
      }

      return new Response(Bun.file(matched.filePath), {
        headers: noCache,
      });
    },
  });
}

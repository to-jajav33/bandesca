/** Next.js-style FileSystemRouter keys omit extensions; browsers still request `/file.js`. */
const ROUTE_STRIP_EXT =
  /\.(?:html|js|mjs|css|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|otf)$/i;

export function serveStatic(hostname, port, router) {
  return Bun.serve({
    port,
    hostname,
    fetch(request) {
      let matched = router.match(request);
      if (!matched) {
        const pathname = new URL(request.url).pathname;
        const withoutExt = pathname.replace(ROUTE_STRIP_EXT, "");
        if (withoutExt !== pathname) {
          matched = router.match(withoutExt);
        }
      }
      if (matched) {
        return new Response(Bun.file(matched.filePath));
      }
      return new Response("Not found", { status: 404 });
    },
  });
}

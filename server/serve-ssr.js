function getAuthentication(request) {
  const token = request.headers.get("Authorization");
  if (token) {
    return token;
  }
  return null;
}

export function serveSsr(hostname, port, router) {
  return Bun.serve({
    port,
    hostname,
    async fetch(request) {
      const matched = router.match(request);
      if (matched) {
        const {
          default: render,
          getProps,
          getMetaTags,
        } = await import(matched.filePath);

        const authentication = getAuthentication(request);
        const props = await getProps?.({ request, authentication });
        const metaTags = await getMetaTags?.({ request, authentication });
        const html = await render({ request, props, authentication });

        // add props to x-data
        const domParser = new DOMParser();
        const parsedTemplate = domParser.parseFromString(html, "text/html");
        const head = parsedTemplate.querySelector("head");
        head.append(metaTags.map((tag) => `<meta ${tag}>`).join(""));
        const xData = parsedTemplate.querySelector("[x-data]");
        xData.setAttribute("x-data", JSON.stringify(props));

        return new Response(parsedTemplate.serialize(), {
          headers: { "Content-Type": "text/html" },
        });
      }
      return new Response("Not found", { status: 404 });
    },
  });
}

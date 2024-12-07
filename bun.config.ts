export default {
  async fetch(req: Request) {
    const url = new URL(req.url);
    const filePath =
      url.pathname === "/" ? "./out/index.html" : `./out${url.pathname}`;

    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      } else {
        return new Response("404 Not Found", { status: 404 });
      }
    } catch (e) {
      return new Response("Error serving file", { status: 500 });
    }
  },
};

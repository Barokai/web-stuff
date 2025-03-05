const server = Bun.serve({
  port: 3000,
  development: true,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;

    try {
      const file = Bun.file(`.${filePath}`);
      return new Response(file);
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
});

console.log(`Listening on http://localhost:${server.port}`);

// Open browser
Bun.spawn(['open', `http://localhost:${server.port}`]);

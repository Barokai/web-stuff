const { execPath } = require('process');

// Start TypeScript compilation for each project
const projects = [
  { name: 'audio', path: 'audio-visualizer-from-microphone' },
  { name: 'network', path: 'network-tools' },
  { name: 'camera', path: 'camera-utils' }
];

projects.forEach(({ name, path }) => {
  Bun.spawn(['bun', 'build', './src/script.ts', '--outdir', './dist', '--watch'], {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: path,
    env: process.env
  });
  console.log(`Started TypeScript compilation for ${name}`);
});

// Start the dev server
const server = Bun.serve({
  port: 3000,
  development: true,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    // Handle directory requests
    if (filePath.endsWith('/')) {
      filePath += 'index.html';
    } else {
      // Check if path exists, if not, try adding index.html
      const directFile = Bun.file('.' + filePath);
      const directExists = await directFile.exists();
      if (!directExists && !filePath.endsWith('.html')) {
        const withIndex = Bun.file('.' + filePath + '/index.html');
        if (await withIndex.exists()) {
          filePath += '/index.html';
        }
      }
    }

    try {
      const file = Bun.file('.' + filePath);
      const exists = await file.exists();

      if (!exists) {
        console.log('Not found:', filePath);
        return new Response('Not Found', { status: 404 });
      }

      // Set appropriate Content-Type
      const headers = new Headers();
      if (filePath.endsWith('.js')) headers.set('Content-Type', 'application/javascript');
      else if (filePath.endsWith('.css')) headers.set('Content-Type', 'text/css');
      else if (filePath.endsWith('.html')) headers.set('Content-Type', 'text/html');

      return new Response(file, { headers });
    } catch (e) {
      console.error('Error serving:', filePath, e);
      return new Response('Server Error', { status: 500 });
    }
  },
});

console.log(`
🚀 Development server running at: http://localhost:${server.port}
📦 TypeScript compilation active for all projects
🔥 Hot reload enabled
⌨️  Press Ctrl+C to stop
`);

// No need for explicit cleanup as Bun handles it

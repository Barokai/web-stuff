const { spawn } = require('child_process');
const processes = [
  { cmd: 'bun', args: ['run', 'watch:audio'] },
  { cmd: 'bun', args: ['run', 'watch:network'] },
  { cmd: 'bun', args: ['run', 'watch:camera'] },
  { cmd: 'bun', args: ['run', 'serve'] }
];

processes.forEach(({ cmd, args }) => {
  const process = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true
  });

  process.on('error', (err) => {
    console.error(`Failed to start ${cmd}:`, err);
  });
});

console.log('All processes started. Press Ctrl+C to stop all.');

// Handle cleanup
const cleanup = () => {
  console.log('\nStopping all processes...');
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

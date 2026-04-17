// Tic-tac-toe backend service
// This service uses Nakama server for real-time multiplayer functionality

const { execSync } = require('child_process');

console.log('Starting Tic-tac-toe backend service...');
console.log('This service runs on Nakama server');

// Start the Nakama server using the shell script
try {
  execSync('./start.sh', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Nakama server:', error);
  process.exit(1);
}
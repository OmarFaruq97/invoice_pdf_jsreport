require('dotenv').config();
const app = require('./app'); // Import the app instance
const port = process.env.PORT || 3000;

let server;

// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  console.log('Shutting down due to uncaught exception.');
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

// Start the server
(async function startServer() {
  try {
    server = app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Handling unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  console.log('Shutting down due to unhandled promise rejection.');
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

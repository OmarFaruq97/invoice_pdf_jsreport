require('dotenv').config();
const express = require('express');
const route = require('./routes/rootRoute');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
route(app);

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https'); // Use https instead of http

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `./config.env` });

const app = require(`./app`);

// Read the SSL certificate and key
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Create an HTTPS server
const server = https.createServer(sslOptions, app);

const DB = process.env.DATABASE;
mongoose.set("strictQuery", true);
mongoose
  .connect(DB)
  .then((con) => {
    console.log('DB connection Successfully');
  });

const port = process.env.PORT || 5000;
const host = process.env.HOST;

server.listen(port, host, () => {
  console.log(`App running on https://${host}:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

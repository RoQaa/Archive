const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

const http = require('http');
const app = require(`${__dirname}/app`);
const server = http.createServer(app);


const DB = process.env.DATABASE
mongoose.set("strictQuery", true);
mongoose
  .connect(DB)
  .then((con) => {
    console.log('DB connection Successfully');
  });



const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const morganBody = require("morgan-body");
const path = require("path");
const rateLimit = require("express-rate-limit"); // security
const helmet = require("helmet"); // security
const mongoSanitize = require("express-mongo-sanitize"); // security
const xss = require("xss-clean"); // security
const cors = require("cors");
const AppError = require("../Arshief/utils/appError");
const globalErrorHandler = require("../Arshief/controllers/errorController");
const userRouter = require(`${__dirname}/routes/userRouter`);

const app = express();

// Global MiddleWares

//set security http headers
app.use(helmet()); // set el htttp headers property

app.use(cors());
app.options("*", cors());
// Poclicy for blocking images
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

//development logging
if (process.env.NODE_ENV === "development") {
  // app.use(morgan('dev'));
  morganBody(app, {
    logAllReqHeader: true,
  });
}

//Limit requests from same API

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "too many requests please try again later",
});

app.use("/api", limiter); // (/api)=> all routes start with /api

//Body parser,reading data from body into req.body
app.use(express.json()); //middle ware for req,res json files 3and req.body

//Data sanitization against no SQL injection
app.use(mongoSanitize());

//Data sanitization against cross site scripting attacks (XSS)
app.use(xss());

//app.set('view engine', 'ejs'); // Change 'ejs' to your desired template engine
app.use("/api/public", express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use("/api/auth", userRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(`Can't find the url ${req.originalUrl} on this server`, 404),
  );
});
app.use(globalErrorHandler);

module.exports = app;

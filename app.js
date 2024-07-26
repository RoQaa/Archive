const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const morganBody = require('morgan-body');
const path=require('path')
const rateLimit = require('express-rate-limit'); // security
const helmet = require('helmet'); // security
const mongoSanitize = require('express-mongo-sanitize'); // security
const xss = require('xss-clean'); // security
const cors =require('cors')
const AppError = require(`./utils/appError`);
const globalErrorHandler=require('./controllers/errorController')
const userRouter=require(`./routes/userRouter`)

const app = express();

// Global MiddleWares

app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
const corsOptions = {
  origin: "http://localhost:5001",
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  morganBody(app, {
    logAllReqHeader: true,
  });
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "too many requests please try again later",
});

app.use("/api", limiter);
app.use(express.json());
app.use(mongoSanitize());
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

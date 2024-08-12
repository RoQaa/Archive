const express = require("express");
const morgan = require("morgan");
const morganBody = require("morgan-body");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRouter");
const destinationRoutes = require("./routes/destinationRouter");
const subjectRoutes = require("./routes/subjectRouter");
const aboutRoutes = require("./routes/aboutRouter");
const uploadRoutes = require("./routes/uploadsRouter");
const faxRoutes = require("./routes/faxRouter");

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",// Replace with your frontend URLs
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Logging in development environment
if (process.env.NODE_ENV === "development") {
  morganBody(app, {
    logAllReqHeader: true,
  });
}

// Rate Limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(mongoSanitize());
app.use(xss());

// Serving static files
app.use("/api/v1/public", express.static(path.join(__dirname, "public")));

// Timestamp Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send("Welcomeeeeeeeeeeeeeeeeeeeee");
});

app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/about", aboutRoutes);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/faxes", faxRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find the URL ${req.originalUrl} on this server`, 404));
});

// Global error handling
app.use(globalErrorHandler);

module.exports = app;

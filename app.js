//dotenv
require("dotenv").config();

//express errors
require("express-async-errors");

//server
const express = require("express");
const app = express();

//rest of the packages
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//database
const connectDB = require("./db/connect");

//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
//signing our cookies, now available in req.signedCookies
app.use(cookieParser(process.env.JWT_SECRET));
//make public folder available (setting it up as our static assets);
app.use(express.static("./public"));
app.use(fileUpload());


//routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
//why 404 before errorhandler? error handler needs to come last as per express rules.
//you only get to it if the route exists and there's an issue
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//set up port variable and start function
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log("server is listening on 5000..."));
  } catch (err) {
    console.log(err);
  }
};

start();

const express = require("express");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const app = express();
app.use(cors());

// Routes Imports
const Product = require("./routes/productRoute");
const User = require("./routes/userRoutes");
const order = require("./routes/orderRoute");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(express.static("public"));

app.use(cookieParser());
app.use("/api/vi", Product);
app.use("/api/vi", User);
app.use("/api/vi", order);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;

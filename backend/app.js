const express = require("express");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const app = express();

// Routes Imports
const Product = require("./routes/productRoute");
const User = require("./routes/userRoutes");
const order = require("./routes/orderRoute");
const Vendor = require("./routes/vendorDashboardRoute");

app.use(express.json());
app.use(cookieParser());
app.use("/api/vi", Product);
app.use("/api/vi", User);
app.use("/api/vi", order);
app.use("/api/vi", Vendor);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;

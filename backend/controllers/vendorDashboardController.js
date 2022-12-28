const catchAsyncError = require("../middleware/catchAsyncError");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apiFeatures");

// dashboard --Admin || vendor
exports.vendorDashboard = catchAsyncError(async (req, res, next) => {
  let vendorId = Order.findById(req.params.vendorId);

  if (!vendorId) {
    return next(new ErrorHandler("Vendor not found", 404));
  }

  const Res = await Order.find({
    name: vendorId,
  }).exec();

  res.status(200).json({
    success: true,
    Res,
  });
});

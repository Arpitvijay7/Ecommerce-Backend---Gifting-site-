const catchAsyncError = require("../middleware/catchAsyncError");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// multer diskStrorage
const Storage = multer.diskStorage({
  destination: "backend/uploads/images",
  filename: (req, file, cb) => {
    var tmp_file_arr = file.originalname.split(".");
    var tmp_file_name = tmp_file_arr[0];
    var tmp_file_ext = tmp_file_arr[tmp_file_arr.length - 1];

    cb(null, tmp_file_name + "-" + Date.now() + "." + tmp_file_ext);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: Storage,
  fileFilter: filefilter,
}).array("images", 10);

// Create Product   --Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  console.log(req.body);

  upload(req, res, async (err) => {
    // console.log(req.file[0]);

    console.log(req.body);
    if (err) {
      console.log(err);
    } else {
      req.body.user = req.user._id;
      req.body.images = [];
      console.log(req.body);

      for (let i = 0; i < req.files.length; i++) {
        req.body.images.push({
          path: req.files[i].filename,
          contentType: req.files[i].mimetype,
        });
      }

      const product = await Product.create(req.body);

      await product.save();
      res.status(201).json({
        success: true,
        product,
      });
    }
  });
});
// Get all products
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeatures.query;

  res.status(201).json({
    success: true,
    products,
    productsCount,
    resultPerPage: resultPerPage,
  });
});

// Update product --Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: false,
    product,
  });
});

// Delete a product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Deleted successfully",
  });
});

// Get a product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product Found successfully",
    product,
  });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comments: comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comments = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let rating = 0;

  if (reviews.length === 0) {
    rating = 0;
  } else {
    rating = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

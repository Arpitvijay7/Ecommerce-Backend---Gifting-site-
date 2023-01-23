const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const multer = require("multer");
const path = require("path");

// multer diskStrorage 
const Storage =  multer.diskStorage({
  destination : "users/images",
  filename: (req ,file,cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random())
    cb(null, file.fieldname + '-' + uniqueSuffix + "."+ path.extname(file.originalname))
  },
})

const filefilter = (req,file,cb)=> {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
     cb(null,true);
  }else{
    cb(null,false);
  }
}

const upload = multer({
  storage: Storage,
  fileFilter:filefilter,
}).array('images',10)

// Create a new order
exports.newOrder = catchAsyncError(async (req, res, next) => {

  upload(req,res,async (err) => {

    if (err) {
      return next(new ErrorHandler(err));
    }
    
    let product = await Product.findById(req.body.orderItems.product)
    
    let imagesSize = product.requiredImages;

    if (product.isCustomizable) {
      if (product.requiredText) {
        if (!req.body.Text) {
          return next(new ErrorHandler("Text is required",400));
        }
      }
      console.log(req.files);
      console.log(req.files.length);

      if (imagesSize != req.files.length) {
        return next(new ErrorHandler("Please enter the required no of images",400));
      }
      req.body.images = [];
      for(let i = 0 ;i < req.files.length;i++) {
        req.body.images.push({
          path :path.join(__dirname , ".." ,'users','images',req.files[i].filename),
          contentType:req.files[i].mimetype,
        })
    }
    }
    // console.log(product);
    
    console.log(req.files);
    
    req.body.user = req.user._id;
    req.body.paidAt = Date.now();
    
    const order = await Order.create(req.body);
    
    res.status(201).json({
      success: true,
      order,
    });

  })

});

// get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user  Orders
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderItems.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

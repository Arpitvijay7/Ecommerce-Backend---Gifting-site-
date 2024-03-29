const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.DB_link, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log("Database connected successfully");
    });
};

module.exports = connectDatabase;

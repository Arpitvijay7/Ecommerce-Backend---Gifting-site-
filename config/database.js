const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(
      "mongodb+srv://stunhaul:stunhaul123@0725cluster0.x7coikv.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then((data) => {
      console.log("Database connected successfully");
    });
};

module.exports = connectDatabase;

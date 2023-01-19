const { log } = require("console");
const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
// Config
dotenv.config({ path: __dirname + "/config/config.env" });
console.log(process.env.PORT);

const PORT = process.env.PORT || 4000;

//Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaughtException ");

  process.exit(1);
});



// database connecting
connectDatabase();

const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled Promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});

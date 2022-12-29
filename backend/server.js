const { log } = require("console");
const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const PORT = process.env.PORT || 5000;
//Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaughtException ");

  process.exit(1);
});

// Config
dotenv.config({ path: "/config/config.env" });
// console.log(process.env);

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

const express = require("express");
const app = express();

app.use("/charan", (req, res) => {
  res.send("Hello, Charan!");
});

app.use("/not-found", (req, res) => {
  res.send("404 Not Found");
});

app.use("/", (req, res) => {
  res.send("Welcome to the home page!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

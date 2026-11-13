const express = require("express");
const app = express();

app.get("/user", (req, res) => {
  res.send("User page");
});

app.post("/user", (req, res) => {
  res.send("User created");
});

app.put("/user", (req, res) => {
  res.send("User updated");
});

app.patch("/user", (req, res) => {
  res.send("User partially updated");
});

app.delete("/user", (req, res) => {
  res.send("User deleted");
});

app.use("/", (req, res) => {
  res.send("Welcome to the home page!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

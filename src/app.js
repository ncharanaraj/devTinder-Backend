const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const { User } = require("./models/user");

app.post("/signup", async (req, res) => {
  const userData = {
    firstName: "Swati",
    lastName: "Narayan",
    emailId: "swatinarayan@gmail.com",
    password: "swati123",
    age: 25,
    gender: "Female",
  };

  const user = new User(userData);

  try {
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    console.error("Error creating user", error.message);
    res.status(400).send("Error creating user");
  }
});

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

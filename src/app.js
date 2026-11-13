const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const { User } = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

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

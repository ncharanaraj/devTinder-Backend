const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const { Users } = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({
      ...req.body,
      password: hashedPassword,
    });
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    console.error("Error creating user", error.message);
    res.status(400).send("Error creating user");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (validator.isEmail(emailId)) {
      const user = await Users.findOne({ emailId });
      if (!user) {
        return res.status(404).send("Invalid credentials");
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send("Invalid credentials");
      } else {
        const token = jwt.sign({ _id: user._id }, "DEVTINDER@TOKEN", {
          expiresIn: "7d",
        });
        res.cookie("token", token);
        res.send("Login successful");
      }
    } else {
      res.status(400).send("Invalid email format");
    }
  } catch (error) {
    console.error("Error logging in", error.message);
    res.status(400).send("Error logging in");
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    console.error("Error fetching profile", error.message);
    res.status(400).send("Error fetching profile");
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  console.log("Received connection request:", req.body);

  res.send("Connection request sent successfully");
});

app.get("/user", userAuth, async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await Users.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    console.error("Error fetching user", error.message);
    res.status(400).send("Error fetching user");
  }
});

app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await Users.find({});
    res.send(users);
  } catch (error) {
    console.error("Error fetching feed", error.message);
    res.status(400).send("Error fetching feed");
  }
});

app.delete("/user", userAuth, async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await Users.findByIdAndDelete({ _id: userId });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting user", error.message);
    res.status(400).send("Error deleting user");
  }
});

app.patch("/user/:userId", userAuth, async (req, res) => {
  const userId = req.params?.userId;
  const updateData = req.body;

  try {
    const allowedUpdates = [
      "firstName",
      "lastName",
      "password",
      "age",
      "gender",
      "photoUrl",
      "about",
      "skills",
    ];

    const isValidOperation = Object.keys(updateData).every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).send("Invalid update fields");
    }

    if (updateData?.skills.length > 10) {
      return res.status(400).send("Skills cannot exceed 10 items");
    }

    const user = await Users.findByIdAndUpdate({ _id: userId }, updateData, {
      runValidators: true,
    });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User updated successfully");
    }
  } catch (error) {
    console.error("Error updating user", error.message);
    res.status(400).send("Error updating user");
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

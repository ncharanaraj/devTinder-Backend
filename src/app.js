const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const { Users } = require("./models/user");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

const { authRoutes } = require("./routes/auth");
const { requestRoutes } = require("./routes/request");
const { profileRoutes } = require("./routes/profile");

app.use("/", authRoutes);
app.use("/", requestRoutes);
app.use("/", profileRoutes);

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

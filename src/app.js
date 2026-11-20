const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const { Users } = require("./models/user");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");
const cors = require("cors");
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const { authRoutes } = require("./routes/auth");
const { requestRoutes } = require("./routes/request");
const { profileRoutes } = require("./routes/profile");
const { userRouters } = require("./routes/user");

app.use("/", authRoutes);
app.use("/", requestRoutes);
app.use("/", profileRoutes);
app.use("/", userRouters);

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
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
  });

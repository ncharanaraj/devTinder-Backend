const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const { Users } = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const authRoutes = express.Router();

authRoutes.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({
      ...req.body,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json({
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    res.status(400).send("Error creating user", error.message);
  }
});

authRoutes.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (validator.isEmail(emailId)) {
      const user = await Users.findOne({ emailId });
      if (!user) {
        return res.status(404).send("Invalid credentials");
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.status(400).send("Invalid credentials");
      } else {
        const token = await user.getJWT();
        res.cookie("token", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        res.json(user);
      }
    } else {
      res.status(400).send("Invalid email format");
    }
  } catch (error) {
    res.status(400).send("Error logging in", error.message);
  }
});

authRoutes.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("Logout successful");
  } catch (error) {
    res.status(400).send("Error logging out", error.message);
  }
});

module.exports = { authRoutes };

const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const profileRoutes = express.Router();

profileRoutes.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error fetching profile", error.message);
  }
});

profileRoutes.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (validateEditProfileData(req)) {
      return res.status(400).send("Invalid update fields");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Error updating user", error.message);
  }
});

module.exports = { profileRoutes };

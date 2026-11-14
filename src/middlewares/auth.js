const jwt = require("jsonwebtoken");
const { Users } = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, "DEVTINDER@TOKEN");
    const { _id } = decoded;

    const user = await Users.findById({ _id });
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in user authentication", error.message);
    res.status(400).send("Error in user authentication");
  }
};

module.exports = { userAuth };

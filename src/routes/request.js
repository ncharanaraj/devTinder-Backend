const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestRoutes = express.Router();

requestRoutes.post("/sendConnectionRequest", userAuth, async (req, res) => {
  console.log("Received connection request:", req.body);

  res.send("Connection request sent successfully");
});

module.exports = { requestRoutes };

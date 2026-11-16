const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestsModel } = require("../models/connectionRequests");
const { USER_SAFE_DATA } = require("../models/user");
const userRouters = express.Router();

userRouters.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequestsModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    if (!connectionRequests) {
      return res.status(404).json({ message: "Requests not found" });
    }

    res.json({
      message: "Data fetched sucessfully",
      connectionRequests,
    });
  } catch (error) {
    return res.status(400).send("ERROR" + error.message);
  }
});

userRouters.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequestsModel.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Connections data fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(400).send("ERROR" + error.message);
  }
});

module.exports = { userRouters };

const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestsModel } = require("../models/connectionRequests");
const { Users } = require("../models/user");

const requestRoutes = express.Router();

requestRoutes.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status type " + status);
      }

      const isUserExist = await Users.findById(toUserId);

      if (!isUserExist) {
        return res.status(404).send("User not found");
      }

      const isConnectionRequestExist = await ConnectionRequestsModel.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (isConnectionRequestExist) {
        return res.status(400).send("Connection request already exists");
      }

      const connectionRequest = new ConnectionRequestsModel({
        fromUserId,
        toUserId,
        status,
      });

      const result = await connectionRequest.save();

      res.json({
        message: "Connection request sent successfully!",
        result,
      });
    } catch (error) {
      return res.status(400).send("ERRor: " + error.message);
    }
  },
);

requestRoutes.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed" });
      }

      const connectionRequest = await ConnectionRequestsModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({
        message: `${status} request`,
        data,
      });
    } catch (error) {
      return res.status(400).send("ERROR" + error.message);
    }
  },
);

module.exports = { requestRoutes };

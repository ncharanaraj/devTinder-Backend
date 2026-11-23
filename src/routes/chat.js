const express = require("express");
const { chatModel } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const chatRouters = express.Router();

chatRouters.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await chatModel
      .findOne({
        participants: {
          $all: [userId, targetUserId],
        },
      })
      .populate("messages.senderId", "firstName lastName");

    if (!chat) {
      chat = new chatModel({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
  }
});

module.exports = { chatRouters };

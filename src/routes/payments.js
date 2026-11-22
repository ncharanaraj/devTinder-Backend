const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { instance } = require("../utils/razorpay");
const { paymentModel } = require("../models/payments");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const { Users } = require("../models/user");
const paymentRouters = express.Router();

paymentRouters.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { _id, firstName, lastName, emailId } = req.user;
    const { membershipType } = req.body;

    const createOrder = await instance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    const { id, status, amount, currency, notes, receipt } = createOrder;

    const order = new paymentModel({
      orderId: id,
      status,
      userId: _id,
      amount,
      currency,
      receipt,
      notes,
    });

    const payment = await order.save();

    res.json({ ...payment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error(error);
  }
});

paymentRouters.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    const isValidWebhookSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isValidWebhookSignature) {
      return res.status(400).send("Webhook signature is invalid");
    }

    const paymentDetails = req.body.payload.payment.entity;

    const payment = await paymentModel.find({
      orderId: paymentDetails.order_id,
    });

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await Users.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;

    await user.save();

    // if (req.body.event === "payment.captured") {
    // }

    // if ((req.body.event = "payment.failed")) {
    // }

    res.status(200).json({ msg: "Webhook received successfully" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = { paymentRouters };

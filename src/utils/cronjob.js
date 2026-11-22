const { CronJob } = require("cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { ConnectionRequestsModel } = require("../models/connectionRequests");
const sendEmail = require("../utils/sendEmail");

const job = new CronJob("22 20 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestsModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    for (const email of listOfEmails) {
      await sendEmail.run(
        `You have request from ${email}`,
        "Login to devTinder, to check the request",
      );
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = { job };

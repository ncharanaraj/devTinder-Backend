const { Schema, model } = require("mongoose");

const connectionRequestsSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not supported`,
      },
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestsSchema.pre("save", function () {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cann't send request to yourself.");
  }
});

connectionRequestsSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequestsModel = model(
  "ConnectionRequests",
  connectionRequestsSchema,
);

module.exports = { ConnectionRequestsModel };

const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://ncharanaraj_db_user:ebEeGNBw1pWN5RHa@node.wejlqgk.mongodb.net/devTinder",
  );
};

module.exports = { connectDB };

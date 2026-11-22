const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
      validate(value) {
        if (
          !validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          })
        ) {
          throw new Error(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          );
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `Gender must be Male, Female, or Other`,
      },
      // validate(value) {
      //   if (!["male", "female", "other"].includes(value.toLowerCase())) {
      //     throw new Error("Gender must be Male, Female, or Other");
      //   }
      // },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoUrl: {
      type: String,
      default: "https://cdn.wallpapersafari.com/95/19/uFaSYI.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL format");
        }
      },
    },
    about: {
      type: String,
      default: "No information provided",
      minlength: 10,
      maxlength: 200,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEVTINDER@TOKEN", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (inputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordMatch = await bcrypt.compare(inputPassword, passwordHash);
  return isPasswordMatch;
};

const USER_SAFE_DATA = "firstName lastName photoUrl about skills";

const Users = mongoose.model("User", userSchema);

module.exports = { Users, USER_SAFE_DATA };

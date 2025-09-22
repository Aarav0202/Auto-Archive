const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["carDealership", "employee", "customer"],
      required: true,
      default: "customer",
    },

    // dealershipId field optional for Customers, required for Employees
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: function () {
        return this.role === "employee";
      },
    },
  },
  { timestamps: true }
);

// Helper methods
userSchema.methods.isDealership = function () {
  return this.role === "carDealership";
};

userSchema.methods.isEmployee = function () {
  return this.role === "employee";
};

userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

const User = mongoose.model("User", userSchema);

module.exports = User;

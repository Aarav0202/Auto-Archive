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

    // For Employees: single dealershipId (required)
    // For Customers: dealershipIds array (can be linked to multiple dealerships)
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: function () {
        return this.role === "employee";
      },
    },

    // Customers can be linked to multiple dealerships
    dealershipIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Dealership",
      default: [],
    },
    // customer specific fields
    phone: {
      type: String,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    dateOfBirth: { type: Date },
    licenseNumber: { type: String },
    preferredContact: { type: String },
    customerType: { type: String },
    notes: { type: String },
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

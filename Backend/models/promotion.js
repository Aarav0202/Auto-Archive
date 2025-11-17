const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    
    promotionType: {
      type: String,
      enum: ["discount", "cashback", "freebies", "seasonal", "combo", "other"],
      required: true,
    },
    
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount", "buyOne_getOne", "other"],
      required: true,
    },
    
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    
    applicableOn: {
      type: [String],
      enum: ["new_vehicles", "used_vehicles", "services", "accessories", "all"],
      required: true,
    },
    
    applicableVehicleIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Vehicle",
      default: [],
    },
    
    applicableServiceIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Service",
      default: [],
    },
    
    startDate: {
      type: Date,
      required: true,
    },
    
    endDate: {
      type: Date,
      required: true,
    },
    
    minimumPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    maximumDiscount: {
      type: Number,
      default: null,
    },
    
    usageLimit: {
      type: Number,
      default: null,
      description: "Total number of times offer can be used",
    },
    
    usageCount: {
      type: Number,
      default: 0,
    },
    
    perCustomerLimit: {
      type: Number,
      default: null,
      description: "Number of times one customer can use this offer",
    },
    
    couponCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    
    targetCustomers: {
      type: String,
      enum: ["all", "new_customers", "existing_customers", "vip_customers", "specific_group"],
      default: "all",
    },
    
    targetCustomerIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    
    description_detailed: {
      type: String,
    },
    
    terms_and_conditions: {
      type: String,
    },
    
    imageUrl: {
      type: String,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
    status: {
      type: String,
      enum: ["scheduled", "active", "expired", "cancelled"],
      default: "scheduled",
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    notificationsSent: {
      type: Boolean,
      default: false,
    },
    
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
      revenueGenerated: {
        type: Number,
        default: 0,
      },
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
promotionSchema.index({ dealershipId: 1, status: 1 });
promotionSchema.index({ couponCode: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1, dealershipId: 1 });

module.exports = mongoose.model("Promotion", promotionSchema);

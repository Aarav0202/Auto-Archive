const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: true,
    },
    
    type: {
      type: String,
      enum: ["promotion", "new_car_launch", "booking_update", "service_reminder", "general", "offer_expiring"],
      required: true,
    },
    
    title: {
      type: String,
      required: true,
    },
    
    message: {
      type: String,
      required: true,
    },
    
    relatedEntityType: {
      type: String,
      enum: ["promotion", "newCarLaunch", "booking", "service", null],
      default: null,
    },
    
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    
    imageUrl: {
      type: String,
    },
    
    actionUrl: {
      type: String,
    },
    
    isRead: {
      type: Boolean,
      default: false,
    },
    
    readAt: {
      type: Date,
    },
    
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    
    deliveryStatus: {
      inApp: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "sent",
      },
      email: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
      },
      sms: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
      },
    },
    
    expiresAt: {
      type: Date,
      description: "Notification auto-deletes after this date",
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ dealershipId: 1, type: 1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", notificationSchema);

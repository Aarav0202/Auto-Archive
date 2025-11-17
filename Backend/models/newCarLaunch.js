const mongoose = require("mongoose");

const newCarLaunchSchema = new mongoose.Schema(
  {
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealership",
      required: true,
    },
    
    carName: {
      type: String,
      required: true,
      trim: true,
    },
    
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    
    model: {
      type: String,
      required: true,
      trim: true,
    },
    
    launchDate: {
      type: Date,
      required: true,
    },
    
    preOrderDate: {
      type: Date,
    },
    
    shortDescription: {
      type: String,
      required: true,
    },
    
    fullDescription: {
      type: String,
    },
    
    specifications: {
      engine: String,
      transmission: String,
      fuelType: String,
      bhp: String,
      torque: String,
      acceleration: String,
      topSpeed: String,
      mileage: String,
      bootSpace: String,
      seatingCapacity: Number,
      dimensions: String,
      weight: String,
    },
    
    features: [
      {
        featureName: String,
        description: String,
      },
    ],
    
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      variantPricing: [
        {
          variantName: String,
          price: Number,
        },
      ],
      expectedPrice: Number,
      currency: {
        type: String,
        default: "INR",
      },
    },
    
    variants: [
      {
        variantName: String,
        color: String,
        features: [String],
        price: Number,
      },
    ],
    
    colors: [
      {
        colorName: String,
        colorCode: String,
        imageUrl: String,
      },
    ],
    
    images: {
      exteriorImages: [String],
      interiorImages: [String],
      thumbnailImage: String,
    },
    
    videos: {
      promoVideo: String,
      reviewVideo: String,
      featureHighlights: String,
    },
    
    highlights: [String],
    
    targetAudience: {
      type: String,
      enum: ["budget_conscious", "premium", "family", "performance", "eco_friendly", "luxury", "all"],
      default: "all",
    },
    
    segment: {
      type: String,
      enum: ["sedan", "suv", "hatchback", "coupe", "convertible", "mpv", "pickup", "other"],
      required: true,
    },
    
    competingModels: [
      {
        modelName: String,
        advantages: String,
      },
    ],
    
    launchStatus: {
      type: String,
      enum: ["teaser", "announced", "preOrder_open", "launched", "discontinued"],
      default: "announced",
    },
    
    preOrdersCount: {
      type: Number,
      default: 0,
    },
    
    bookings: [
      {
        customerId: mongoose.Schema.Types.ObjectId,
        bookingDate: Date,
        variantSelected: String,
        colorSelected: String,
      },
    ],
    
    isHighlighted: {
      type: Boolean,
      default: false,
      description: "Featured on dealership homepage",
    },
    
    promotionAssociated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
    },
    
    keyFeatures: [String],
    
    comparison: {
      previousModel: String,
      improvements: [String],
    },
    
    marketRelease: {
      globalLaunchDate: Date,
      countryLaunchDate: Date,
      cityLaunchDate: Date,
    },
    
    serviceAssurance: {
      warrantyPeriod: String,
      servicePackages: [String],
      roadAssistance: Boolean,
    },
    
    finance: {
      emiOptions: Boolean,
      easyLoans: Boolean,
      downPaymentOptions: [String],
    },
    
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      preOrderClicks: {
        type: Number,
        default: 0,
      },
      bookings: {
        type: Number,
        default: 0,
      },
      sharedCount: {
        type: Number,
        default: 0,
      },
    },
    
    isActive: {
      type: Boolean,
      default: true,
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

// Indexes for quick lookups
newCarLaunchSchema.index({ dealershipId: 1, launchStatus: 1 });
newCarLaunchSchema.index({ launchDate: 1 });
newCarLaunchSchema.index({ manufacturer: 1, model: 1 });
newCarLaunchSchema.index({ isActive: 1, dealershipId: 1 });

module.exports = mongoose.model("NewCarLaunch", newCarLaunchSchema);

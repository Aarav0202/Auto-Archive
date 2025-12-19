const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  // Chat identification
  carModel: {
    companyName: { type: String, required: true }, // e.g., "Toyota"
    vehicleName: { type: String, required: true }, // e.g., "Camry"
    model: { type: String, trim: true },            // e.g., "XLE" or "S(O)"
    year: { type: Number }                          // e.g., 2020
  },

  // Sender information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['customer', 'carDealership', 'employee'],
    required: true
  },

  // For dealership messages: show special banner
  dealershipBanner: {
    name: { type: String },                  // "ABC Dealership"
    isOfficial: { type: Boolean, default: false }, // Shows blue badge
  },

  // Message content
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional message features
  issueType: {
    type: String,
    enum: ['general', 'problem', 'question', 'solution', 'update'],
    default: 'general'
  },

  // Moderation
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient queries
chatMessageSchema.index({ 'carModel.companyName': 1, 'carModel.vehicleName': 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

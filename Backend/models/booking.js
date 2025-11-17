const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  dealershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  customerPhone: {
    type: String,
    required: true
  },
  carName: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  carEngine: {
    type: String,
    required: true
  },
  carTransmission: {
    type: String,
    required: true,
    enum: ['Manual', 'Automatic']
  },
  carColour: {
    type: String,
    required: true
  },
  carPrice: {
    type: Number,
    required: true,
    description: 'On-road price of the car'
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  estimatedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date,
    default: null
  },
  soldByEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update remainingAmount before saving (only if not delivered)
bookingSchema.pre('save', function(next) {
  // Only calculate remainingAmount if booking is not yet delivered
  // Once delivered, remainingAmount should remain 0
  if (this.status !== 'Delivered') {
    this.remainingAmount = this.carPrice - this.amountPaid;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const cancelledBookingSchema = new mongoose.Schema({
  originalBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
    required: true
  },
  carColour: {
    type: String,
    required: true
  },
  carPrice: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  soldByEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  cancellationReason: {
    type: String,
    required: true
  },
  refundAmount: {
    type: Number,
    required: true
  },
  cancelledAt: {
    type: Date,
    default: Date.now
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CancelledBooking', cancelledBookingSchema);

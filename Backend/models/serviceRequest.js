const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  // Request Identification
  requestId: { type: String, unique: true, trim: true }, // Auto-generated request ID
  
  // Relationships
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealership', required: true },
  
  // Request Details
  serviceType: { 
    type: String, 
    enum: ['Regular', 'Major', 'Minor', 'Oil Change', 'Inspection', 'Repair', 'Other'],
    default: 'Regular'
  },
  
  // Requested Timing
  requestedDate: { type: Date, required: true },
  requestedTime: { type: String, required: true }, // HH:MM format
  
  // Customer Information
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  description: { type: String },
  
  // Issue Photos & Details
  issuePhotos: [{
    filename: String,
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Request Status
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled', 'In Progress'],
    default: 'Pending'
  },
  
  // Appointment Status Tracking
  appointmentStatus: {
    current: {
      type: String,
      enum: ['Scheduled', 'In Service', 'Quality Check', 'Ready for Pickup', 'Picked Up', 'Cancelled'],
      default: 'Scheduled'
    },
    timeline: [{
      stage: String, // e.g., 'Scheduled', 'In Service', etc.
      timestamp: { type: Date, default: Date.now },
      notes: String,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
    }],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Dealership Response
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Employee who responded
  responseDate: { type: Date }, // When dealership responded
  responseMessage: { type: String }, // Why accepted/rejected
  
  // Confirmed Service Details (After Acceptance)
  confirmedDate: { type: Date }, // Confirmed service date
  confirmedTime: { type: String }, // Confirmed service time (HH:MM format)
  estimatedCost: { type: Number }, // Estimated service cost
  
  // Vehicle Information (Snapshot)
  vehicleDetails: {
    companyName: String,
    vehicleName: String,
    model: String,
    licensePlateNumber: String,
    currentKms: Number
  },

  // Service Record (Added After Service Completion)
  serviceRecord: {
    partsChanged: { type: String }, // Text format of parts changed
    nextServiceDueKms: { type: Number }, // KMs for next service
    nextServiceDueDate: { type: Date }, // Date for next service
    notes: { type: String }, // Additional notes about the service
    completedDate: { type: Date }, // Date service was completed
    completedKms: { type: Number } // Vehicle KMs when service was completed
  },
  
  // Timestamps
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
}, { timestamps: true });

// Generate request ID before saving
serviceRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestId = `REQ-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for efficient queries
serviceRequestSchema.index({ dealershipId: 1, status: 1 });
serviceRequestSchema.index({ customerId: 1, dealershipId: 1 });
serviceRequestSchema.index({ vehicleId: 1, dealershipId: 1 });
serviceRequestSchema.index({ confirmedDate: 1, status: 1 });
serviceRequestSchema.index({ requestedAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

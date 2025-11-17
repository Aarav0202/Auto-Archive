const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Service Reference
  serviceId: { type: String, unique: true, trim: true }, // Auto-generated service ID
  
  // Relationships
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealership', required: true },
  
  // Service Details
  serviceDate: { type: Date, required: true }, // Date of service
  serviceType: { 
    type: String, 
    enum: ['Regular', 'Major', 'Minor', 'Oil Change', 'Inspection', 'Repair', 'Other'],
    default: 'Regular'
  },
  
  // Service Information
  description: { type: String }, // Service description
  serviceCenter: { type: String }, // Name of service center
  technician: { type: String }, // Name of technician
  
  // Parts and Costs
  partsChanged: [
    {
      partName: { type: String, required: true },
      partNumber: { type: String },
      quantity: { type: Number, default: 1 },
      cost: { type: Number, default: 0 },
      notes: { type: String }
    }
  ],
  
  // Service Costs
  laborCost: { type: Number, default: 0 },
  partsTotal: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  
  // Odometer
  kmBefore: { type: Number }, // Km reading before service
  kmAfter: { type: Number }, // Km reading after service
  
  // Invoice and Documents
  invoiceNumber: { type: String, unique: true, sparse: true },
  invoiceUrl: { type: String }, // URL to invoice document
  invoiceDocument: { type: Buffer }, // Binary invoice file
  invoiceFileName: { type: String }, // Original filename
  
  // Next Service
  nextServiceDate: { type: Date }, // Recommended next service date
  nextServiceKms: { type: Number }, // Recommended next service km
  
  // Status and Notes
  status: { 
    type: String, 
    enum: ['Completed', 'Pending', 'In Progress', 'Cancelled'],
    default: 'Completed'
  },
  notes: { type: String }, // Additional notes
  
}, { timestamps: true });

// Generate service ID before saving
serviceSchema.pre('save', async function(next) {
  if (this.isNew && !this.serviceId) {
    const count = await mongoose.model('Service').countDocuments();
    this.serviceId = `SRV-${Date.now()}-${count + 1}`;
  }
  next();
});

// Calculate total cost before saving
serviceSchema.pre('save', function(next) {
  this.partsTotal = this.partsChanged.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
  this.totalCost = this.laborCost + this.partsTotal;
  next();
});

// Index for efficient queries
serviceSchema.index({ vehicleId: 1, dealershipId: 1 });
serviceSchema.index({ ownerId: 1, dealershipId: 1 });
serviceSchema.index({ serviceDate: -1 });

module.exports = mongoose.model('Service', serviceSchema);

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  companyName: { type: String, required: true, trim: true }, // Vehicle manufacturer/brand
  vehicleName: { type: String, required: true, trim: true }, // Model name
  model: { type: String, trim: true }, // Model variant
  
  // Identification
  chassyNumber: { type: String, trim: true, sparse: true }, // VIN/Chassis Number
  licensePlateNumber: { type: String, trim: true, sparse: true }, // License plate
  
  // Purchase Details
  dateOfBuying: { type: Date }, // Date of purchase
  color: { type: String, trim: true },
  year: { type: Number }, // Model year
  
  // Service Information
  lastServicedDate: { type: Date }, // Last service date
  lastServicedKms: { type: Number }, // Kilometers at last service
  dueServiceDate: { type: Date }, // Next scheduled service date
  dueServiceKms: { type: Number }, // Kilometers until next service due
  
  // Ownership
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealership', required: true },
  
  // Additional Information
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other'], trim: true },
  transmission: { type: String, enum: ['Manual', 'Automatic', 'CVT', 'Other'], trim: true },
  engineCapacity: { type: String, trim: true }, // e.g., "2000cc"
  currentKms: { type: Number, default: 0 }, // Current odometer reading
  notes: { type: String },
}, { timestamps: true });

// Index owner + dealership for efficient lookups
vehicleSchema.index({ ownerId: 1, dealershipId: 1 });
vehicleSchema.index({ licensePlateNumber: 1, dealershipId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

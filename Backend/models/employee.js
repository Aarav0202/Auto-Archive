const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dealershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dealership",
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ["Sales", "Service", "Finance", "Administration", "HR", "Marketing", "Inventory", "Security"]
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  carsSold: {
    type: Number,
    default: 0,
    min: 0
  },
  salesTarget: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: "India"
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  role: {
    type: String,
    default: "employee",
    immutable: true
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ dealershipId: 1 });
employeeSchema.index({ department: 1 });

// Virtual for full name display
employeeSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.employeeId})`;
});

// Method to calculate years of service
employeeSchema.methods.getYearsOfService = function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.dateOfJoining);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365);
};

// Method to calculate sales performance
employeeSchema.methods.getSalesPerformance = function() {
  if (this.salesTarget === 0) return 0;
  return (this.carsSold / this.salesTarget) * 100;
};

// Static method to find employees by dealership
employeeSchema.statics.findByDealership = function(dealershipId) {
  return this.find({ dealershipId: dealershipId, isActive: true });
};

// Static method to find sales employees
employeeSchema.statics.findSalesEmployees = function(dealershipId) {
  return this.find({ 
    dealershipId: dealershipId, 
    department: "Sales", 
    isActive: true 
  });
};

module.exports = mongoose.model("Employee", employeeSchema);
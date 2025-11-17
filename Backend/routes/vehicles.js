const express = require('express');
const jwt = require('jsonwebtoken');

const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const Dealership = require('../models/dealership');
const Employee = require('../models/employee');

const router = express.Router();

// Middleware to verify token and get dealershipId
const getAuthInfo = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if dealership
    let dealership = await Dealership.findById(decoded.id);
    if (dealership) {
      return { dealershipId: dealership._id, userId: decoded.id, role: 'dealership', id: decoded.id };
    }
    
    // Check if employee
    let employee = await Employee.findById(decoded.id);
    if (employee) {
      return { dealershipId: employee.dealershipId, userId: decoded.id, role: 'employee', id: decoded.id };
    }
    
    // Check if customer
    let customer = await User.findById(decoded.id);
    if (customer && customer.role === 'customer') {
      return { dealershipId: null, userId: decoded.id, role: 'customer', id: decoded.id };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// ---- ADD VEHICLE ----
router.post('/', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    const {
      companyName,
      vehicleName,
      model,
      chassyNumber,
      licensePlateNumber,
      dateOfBuying,
      color,
      year,
      lastServicedDate,
      lastServicedKms,
      dueServiceDate,
      dueServiceKms,
      fuelType,
      transmission,
      engineCapacity,
      currentKms,
      notes,
      ownerId, // customer id
      dealershipId
    } = req.body;

    // Validate required fields
    if (!companyName || !vehicleName) {
      return res.status(400).json({ message: 'Company name and vehicle name are required' });
    }

    if (!ownerId || !dealershipId) {
      return res.status(400).json({ message: 'Owner ID and dealership ID are required' });
    }

    // Access control: only dealership/employee of same dealership can add vehicles
    if (authInfo.role === 'dealership') {
      if (authInfo.dealershipId.toString() !== dealershipId.toString()) {
        return res.status(403).json({ message: 'Access denied: not your dealership' });
      }
    } else if (authInfo.role === 'employee') {
      if (authInfo.dealershipId.toString() !== dealershipId.toString()) {
        return res.status(403).json({ message: 'Access denied: not your dealership' });
      }
    } else {
      return res.status(403).json({ message: 'Only dealerships and employees can add vehicles' });
    }

    // Verify customer exists and is linked to this dealership
    const customer = await User.findById(ownerId);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if customer is linked to this dealership - use string comparison
    const dealershipIdStr = dealershipId.toString();
    if (!customer.dealershipIds.some(id => id.toString() === dealershipIdStr)) {
      return res.status(403).json({ message: 'Customer not linked to this dealership' });
    }

    // Check if chassy number already exists for this dealership
    const existingVehicle = await Vehicle.findOne({ chassyNumber, dealershipId });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle with this chassy number already exists in your dealership' });
    }

    // Create new vehicle
    const newVehicle = new Vehicle({
      companyName: companyName.trim(),
      vehicleName: vehicleName.trim(),
      model: model ? model.trim() : undefined,
      chassyNumber: chassyNumber.trim().toUpperCase(),
      licensePlateNumber: licensePlateNumber.trim().toUpperCase(),
      dateOfBuying: dateOfBuying ? new Date(dateOfBuying) : undefined,
      color: color ? color.trim() : undefined,
      year: year ? parseInt(year) : undefined,
      lastServicedDate: lastServicedDate ? new Date(lastServicedDate) : undefined,
      lastServicedKms: lastServicedKms ? parseInt(lastServicedKms) : undefined,
      dueServiceDate: dueServiceDate ? new Date(dueServiceDate) : undefined,
      dueServiceKms: dueServiceKms ? parseInt(dueServiceKms) : undefined,
      fuelType,
      transmission,
      engineCapacity: engineCapacity ? engineCapacity.trim() : undefined,
      currentKms: currentKms ? parseInt(currentKms) : 0,
      notes: notes ? notes.trim() : undefined,
      ownerId,
      dealershipId
    });

    await newVehicle.save();
    const populatedVehicle = await newVehicle.populate('ownerId', 'name email phone');

    res.status(201).json({ message: 'Vehicle added successfully', vehicle: populatedVehicle });
  } catch (error) {
    console.error('Add vehicle error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- GET VEHICLES FOR CUSTOMER ----
router.get('/customer/:customerId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    const { customerId } = req.params;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Access control: user must be from one of the dealerships the customer is linked to
    let hasAccess = false;
    if (authInfo.role === 'dealership') {
      const dealershipIdStr = authInfo.dealershipId.toString();
      hasAccess = customer.dealershipIds.some(id => id.toString() === dealershipIdStr);
    } else if (authInfo.role === 'employee') {
      const dealershipIdStr = authInfo.dealershipId.toString();
      hasAccess = customer.dealershipIds.some(id => id.toString() === dealershipIdStr);
    }

    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    // Get vehicles - if dealership/employee, filter by their dealership
    let query = { ownerId: customerId };
    if (authInfo.dealershipId) {
      query.dealershipId = authInfo.dealershipId;
    }

    const vehicles = await Vehicle.find(query)
      .populate('dealershipId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ vehicles, count: vehicles.length });
  } catch (error) {
    console.error('Get customer vehicles error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- GET ALL VEHICLES AT DEALERSHIP ----
router.get('/', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    if (!authInfo.dealershipId) {
      return res.status(403).json({ message: 'Only dealerships and employees can view vehicles' });
    }

    const vehicles = await Vehicle.find({ dealershipId: authInfo.dealershipId })
      .populate('ownerId', 'name email phone')
      .populate('dealershipId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ vehicles, count: vehicles.length });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- GET SINGLE VEHICLE ----
router.get('/:vehicleId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId)
      .populate('ownerId', 'name email phone')
      .populate('dealershipId', 'name');

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Access control - use string comparison
    if (authInfo.dealershipId) {
      const authDealershipIdStr = authInfo.dealershipId.toString();
      const vehicleDealershipIdStr = (vehicle.dealershipId._id || vehicle.dealershipId).toString();
      if (authDealershipIdStr !== vehicleDealershipIdStr) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.status(200).json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- UPDATE VEHICLE ----
router.put('/:vehicleId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Access control - use string comparison
    if (authInfo.dealershipId) {
      const authDealershipIdStr = authInfo.dealershipId.toString();
      const vehicleDealershipIdStr = vehicle.dealershipId.toString();
      if (authDealershipIdStr !== vehicleDealershipIdStr) {
        return res.status(403).json({ message: 'Access denied: not your dealership' });
      }
    }

    // Allowed update fields
    const allowed = [
      'companyName', 'vehicleName', 'model', 'chassyNumber', 'licensePlateNumber',
      'dateOfBuying', 'color', 'year', 'lastServicedDate', 'lastServicedKms',
      'dueServiceDate', 'dueServiceKms', 'fuelType', 'transmission',
      'engineCapacity', 'currentKms', 'notes'
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['dateOfBuying', 'lastServicedDate', 'dueServiceDate'].includes(key)) {
          updates[key] = req.body[key] ? new Date(req.body[key]) : undefined;
        } else if (['year', 'lastServicedKms', 'dueServiceKms', 'currentKms'].includes(key)) {
          updates[key] = req.body[key] ? parseInt(req.body[key]) : undefined;
        } else if (['companyName', 'vehicleName', 'model', 'color', 'engineCapacity', 'notes'].includes(key)) {
          updates[key] = req.body[key] ? req.body[key].trim() : undefined;
        } else if (key === 'chassyNumber') {
          updates[key] = req.body[key] ? req.body[key].trim().toUpperCase() : undefined;
        } else if (key === 'licensePlateNumber') {
          updates[key] = req.body[key] ? req.body[key].trim().toUpperCase() : undefined;
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    // Check if chassy number is being changed to an existing one
    if (updates.chassyNumber && updates.chassyNumber !== vehicle.chassyNumber) {
      const existing = await Vehicle.findOne({
        chassyNumber: updates.chassyNumber,
        dealershipId: vehicle.dealershipId,
        _id: { $ne: vehicleId }
      });
      if (existing) {
        return res.status(400).json({ message: 'Another vehicle with this chassy number already exists' });
      }
    }

    const updated = await Vehicle.findByIdAndUpdate(vehicleId, { $set: updates }, { new: true })
      .populate('ownerId', 'name email phone')
      .populate('dealershipId', 'name');

    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updated });
  } catch (error) {
    console.error('Update vehicle error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- DELETE VEHICLE ----
router.delete('/:vehicleId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const authInfo = await getAuthInfo(token);
    if (!authInfo) return res.status(401).json({ message: 'Invalid authentication token' });

    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Access control - use string comparison
    if (authInfo.dealershipId) {
      const authDealershipIdStr = authInfo.dealershipId.toString();
      const vehicleDealershipIdStr = vehicle.dealershipId.toString();
      if (authDealershipIdStr !== vehicleDealershipIdStr) {
        return res.status(403).json({ message: 'Access denied: not your dealership' });
      }
    }

    await Vehicle.findByIdAndDelete(vehicleId);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

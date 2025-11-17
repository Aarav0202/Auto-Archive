const express = require('express');
const Service = require('../models/service');
const Vehicle = require('../models/vehicle');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify authentication
const verifyAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ---- GET SERVICE RECORDS FOR A VEHICLE ----
router.get('/vehicle/:vehicleId', verifyAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Verify vehicle belongs to the user
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this vehicle' });
    }

    // Get all service records for this vehicle
    const services = await Service.find({ vehicleId }).sort({ serviceDate: -1 });

    res.status(200).json({
      message: 'Service records fetched successfully',
      services
    });
  } catch (error) {
    console.error('Error fetching service records:', error);
    res.status(500).json({ message: 'Server error fetching service records' });
  }
});

// ---- GET LATEST SERVICE RECORD ----
router.get('/vehicle/:vehicleId/latest', verifyAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Verify vehicle belongs to the user
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const latestService = await Service.findOne({ vehicleId }).sort({ serviceDate: -1 });

    res.status(200).json({
      message: 'Latest service record fetched',
      service: latestService
    });
  } catch (error) {
    console.error('Error fetching latest service record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- ADD NEW SERVICE RECORD (for dealership/admin) ----
router.post('/add', verifyAuth, async (req, res) => {
  try {
    const {
      vehicleId,
      dealershipId,
      serviceDate,
      serviceType,
      description,
      serviceCenter,
      technician,
      partsChanged,
      laborCost,
      kmBefore,
      kmAfter,
      invoiceNumber,
      nextServiceDate,
      nextServiceKms,
      notes
    } = req.body;

    // Validate required fields
    if (!vehicleId || !dealershipId || !serviceDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create service record
    const service = new Service({
      vehicleId,
      ownerId: vehicle.ownerId,
      dealershipId,
      serviceDate,
      serviceType: serviceType || 'Regular',
      description,
      serviceCenter,
      technician,
      partsChanged: partsChanged || [],
      laborCost: laborCost || 0,
      kmBefore,
      kmAfter,
      invoiceNumber,
      nextServiceDate,
      nextServiceKms,
      notes
    });

    await service.save();

    // Update vehicle's last serviced date
    if (kmAfter) {
      vehicle.lastServicedKms = kmAfter;
      vehicle.currentKms = kmAfter;
    }
    vehicle.lastServicedDate = new Date(serviceDate);
    if (nextServiceDate) {
      vehicle.dueServiceDate = new Date(nextServiceDate);
    }
    await vehicle.save();

    res.status(201).json({
      message: 'Service record added successfully',
      service
    });
  } catch (error) {
    console.error('Error adding service record:', error);
    res.status(500).json({ message: 'Server error adding service record' });
  }
});

// ---- UPDATE SERVICE RECORD ----
router.put('/:serviceId', verifyAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      serviceDate,
      serviceType,
      description,
      serviceCenter,
      technician,
      partsChanged,
      laborCost,
      kmBefore,
      kmAfter,
      invoiceNumber,
      nextServiceDate,
      nextServiceKms,
      notes
    } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Verify ownership
    if (service.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this record' });
    }

    // Update fields
    if (serviceDate) service.serviceDate = serviceDate;
    if (serviceType) service.serviceType = serviceType;
    if (description) service.description = description;
    if (serviceCenter) service.serviceCenter = serviceCenter;
    if (technician) service.technician = technician;
    if (partsChanged) service.partsChanged = partsChanged;
    if (laborCost !== undefined) service.laborCost = laborCost;
    if (kmBefore !== undefined) service.kmBefore = kmBefore;
    if (kmAfter !== undefined) service.kmAfter = kmAfter;
    if (invoiceNumber) service.invoiceNumber = invoiceNumber;
    if (nextServiceDate) service.nextServiceDate = nextServiceDate;
    if (nextServiceKms !== undefined) service.nextServiceKms = nextServiceKms;
    if (notes) service.notes = notes;

    await service.save();

    res.status(200).json({
      message: 'Service record updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service record:', error);
    res.status(500).json({ message: 'Server error updating service record' });
  }
});

// ---- GET SERVICE RECORD BY ID ----
router.get('/:serviceId', verifyAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId).populate('vehicleId dealershipId');
    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Verify ownership
    if (service.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json({
      message: 'Service record fetched',
      service
    });
  } catch (error) {
    console.error('Error fetching service record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- DELETE SERVICE RECORD ----
router.delete('/:serviceId', verifyAuth, async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Verify ownership
    if (service.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this record' });
    }

    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({
      message: 'Service record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service record:', error);
    res.status(500).json({ message: 'Server error deleting service record' });
  }
});

module.exports = router;

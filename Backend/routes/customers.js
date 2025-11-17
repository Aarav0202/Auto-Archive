const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Dealership = require('../models/dealership');
const Vehicle = require('../models/vehicle');

const router = express.Router();

// ---- CUSTOMER REGISTER ----
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, dealershipId, address, dateOfBirth, licenseNumber, preferredContact, customerType, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!dealershipId) {
      return res.status(400).json({ message: 'Dealership ID is required' });
    }

    // Validate dealership exists
    const dealership = await Dealership.findById(dealershipId);
    if (!dealership) {
      return res.status(400).json({ message: 'Invalid dealership ID' });
    }

    // Check if a customer with this email already exists (across dealerships)
    let customer = await User.findOne({ email, role: 'customer' });

    if (customer) {
      // Customer exists - check if already linked to this dealership
      if (customer.dealershipIds.includes(dealershipId)) {
        return res.status(400).json({ message: 'Customer already linked to this dealership' });
      }

      // Link customer to new dealership
      customer.dealershipIds.push(dealershipId);
      await customer.save();

      // Add customer to dealership's customers array if not already present
      if (!dealership.customers.includes(customer._id)) {
        dealership.customers.push(customer._id);
        await dealership.save();
      }

      const customerObj = customer.toObject();
      delete customerObj.password;
      return res.status(201).json({ message: 'Customer linked to dealership successfully', customer: customerObj, isNew: false });
    }

    // Customer doesn't exist - create new one with default password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const defaultPassword = 'customer1234';
    const hashedPass = await bcrypt.hash(defaultPassword, salt);

    const newCustomer = new User({
      name,
      email,
      password: hashedPass,
      role: 'customer',
      dealershipIds: [dealershipId], // Array with single dealership for now
      phone: phone || undefined,
      address: address || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      licenseNumber: licenseNumber || undefined,
      preferredContact: preferredContact || undefined,
      customerType: customerType || undefined,
      notes: notes || undefined,
    });

    await newCustomer.save();

    // Add customer to dealership's customers array
    dealership.customers.push(newCustomer._id);
    await dealership.save();

    // return created customer without password
    const created = newCustomer.toObject();
    delete created.password;
    res.status(201).json({ message: 'Customer registered successfully', customer: created, isNew: true });
  } catch (error) {
    console.error('Customer register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- GET ALL CUSTOMERS for dealership ----
router.get('/', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Determine requester dealershipId
    let dealership = await Dealership.findById(decoded.id);
    let dealershipId = null;

    if (dealership) {
      dealershipId = dealership._id;
    } else {
      // Maybe an employee
      const employee = await require('../models/employee').findById(decoded.id);
      if (employee) dealershipId = employee.dealershipId;
      else return res.status(403).json({ message: 'Only dealerships and employees can view customer list' });
    }

    // Find customers linked to this dealership (via dealershipIds array)
    const customers = await User.find({ 
      dealershipIds: dealershipId, 
      role: 'customer' 
    })
      .select('-password')
      .populate('dealershipIds', 'name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ customers, totalCustomers: customers.length });
  } catch (error) {
    console.error('Get customers error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid authentication token' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---- GET SINGLE CUSTOMER (with vehicles) ----
router.get('/:customerId', async (req, res) => {
  const token = req.cookies.token;
  const { customerId } = req.params;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer
    const customer = await User.findById(customerId).select('-password').populate('dealershipIds', 'name');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Determine access rights: requester must be same dealership (dealership or employee)
    let dealershipId = null;
    let hasAccess = false;

    const dealership = await Dealership.findById(decoded.id);
    if (dealership) {
      dealershipId = dealership._id;
      // Check if customer is linked to this dealership - convert all IDs to strings for comparison
      const dealershipIdStr = dealershipId.toString();
      if (customer.dealershipIds.some(id => {
        const idStr = (id._id || id).toString();
        return idStr === dealershipIdStr;
      })) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      const Employee = require('../models/employee');
      const requestingEmployee = await Employee.findById(decoded.id);
      if (requestingEmployee) {
        dealershipId = requestingEmployee.dealershipId;
        // Check if customer is linked to this dealership
        const dealershipIdStr = dealershipId.toString();
        if (customer.dealershipIds.some(id => {
          const idStr = (id._id || id).toString();
          return idStr === dealershipIdStr;
        })) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    // Fetch customer's vehicles at this dealership
    const vehicles = await Vehicle.find({ 
      ownerId: customer._id, 
      dealershipId: dealershipId 
    }).sort({ createdAt: -1 });

    return res.status(200).json({ customer, vehicles });
  } catch (error) {
    console.error('Get customer error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid authentication token' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---- UPDATE CUSTOMER ----
router.put('/:customerId', async (req, res) => {
  const token = req.cookies.token;
  const { customerId } = req.params;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Access check: requester must belong to same dealership
    let hasAccess = false;
    const dealership = await Dealership.findById(decoded.id);
    if (dealership) {
      // Check if customer is linked to this dealership - use string comparison
      const dealershipIdStr = dealership._id.toString();
      if (customer.dealershipIds.some(id => id.toString() === dealershipIdStr)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      const Employee = require('../models/employee');
      const requestingEmployee = await Employee.findById(decoded.id);
      if (requestingEmployee) {
        // Check if customer is linked to employee's dealership
        const dealershipIdStr = requestingEmployee.dealershipId.toString();
        if (customer.dealershipIds.some(id => id.toString() === dealershipIdStr)) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    // Allowed update fields
    const allowed = ['name', 'email', 'phone', 'address', 'dateOfBirth', 'licenseNumber', 'preferredContact', 'customerType', 'notes'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.dateOfBirth) updates.dateOfBirth = new Date(updates.dateOfBirth);

    const updated = await User.findByIdAndUpdate(customerId, { $set: updates }, { new: true }).select('-password').populate('dealershipIds', 'name');
    return res.status(200).json({ message: 'Customer updated', customer: updated });
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid authentication token' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// ---- DELETE CUSTOMER (from dealership) ----
router.delete('/:customerId', async (req, res) => {
  const token = req.cookies.token;
  const { customerId } = req.params;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Determine requester dealership
    let dealership = await Dealership.findById(decoded.id);
    let dealershipId = null;

    if (dealership) {
      dealershipId = dealership._id;
    } else {
      const Employee = require('../models/employee');
      const requestingEmployee = await Employee.findById(decoded.id);
      if (requestingEmployee) dealershipId = requestingEmployee.dealershipId;
      else return res.status(403).json({ message: 'Access denied' });
    }

    // Access check: customer must be linked to this dealership - use string comparison
    const dealershipIdStr = dealershipId.toString();
    const isLinked = customer.dealershipIds.some(id => id.toString() === dealershipIdStr);
    if (!isLinked) return res.status(403).json({ message: 'Customer not linked to your dealership' });

    // Remove dealership from customer's dealershipIds
    customer.dealershipIds = customer.dealershipIds.filter(id => id.toString() !== dealershipIdStr);
    
    // Delete all vehicles owned by this customer at this dealership
    await Vehicle.deleteMany({ ownerId: customer._id, dealershipId: dealershipId });

    // Remove customer from dealership's customers array
    if (dealership) {
      dealership.customers = dealership.customers.filter(id => !id.equals(customerId));
      await dealership.save();
    } else {
      // If deleting by employee, update dealership
      const d = await Dealership.findById(dealershipId);
      if (d) {
        d.customers = d.customers.filter(id => !id.equals(customerId));
        await d.save();
      }
    }

    // If customer has no more dealerships, delete the customer completely
    if (customer.dealershipIds.length === 0) {
      await User.findByIdAndDelete(customerId);
      return res.status(200).json({ message: 'Customer deleted completely (no more dealerships)', fullyDeleted: true });
    } else {
      // Customer still linked to other dealerships, just unlink from this one
      await customer.save();
      return res.status(200).json({ message: 'Customer unlinked from dealership', fullyDeleted: false });
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid authentication token' });
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

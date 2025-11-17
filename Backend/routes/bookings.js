const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/booking');
const CancelledBooking = require('../models/cancelledBooking');
const Dealership = require('../models/dealership');
const Employee = require('../models/employee');
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
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ---- CREATE NEW BOOKING ----
router.post('/create', verifyAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      carName,
      carModel,
      carEngine,
      carTransmission,
      carColour,
      carPrice,
      amountPaid,
      estimatedDeliveryDate,
      soldByEmployeeId,
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !carName || !carModel || !carEngine || !carTransmission || !carColour || !carPrice || !estimatedDeliveryDate || !soldByEmployeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can create bookings' });
    }

    // Verify employee belongs to this dealership
    const employee = await Employee.findById(soldByEmployeeId);
    if (!employee || employee.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Employee does not belong to this dealership' });
    }

    // Create booking
    const booking = new Booking({
      dealershipId: req.userId,
      customerName,
      customerEmail,
      customerPhone,
      carName,
      carModel,
      carEngine,
      carTransmission,
      carColour,
      carPrice,
      amountPaid: amountPaid || 0,
      estimatedDeliveryDate: new Date(estimatedDeliveryDate),
      soldByEmployeeId,
      notes: notes || '',
      status: 'Pending'
    });

    await booking.save();

    // Populate employee details
    await booking.populate('soldByEmployeeId', 'name email phone');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// ---- GET ALL BOOKINGS FOR DEALERSHIP ----
router.get('/all', verifyAuth, async (req, res) => {
  try {
    // Verify dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can access bookings' });
    }

    const { status, sortBy } = req.query;
    let query = { dealershipId: req.userId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'deliveryDate') {
      sortOption = { estimatedDeliveryDate: 1 };
    } else if (sortBy === 'amount') {
      sortOption = { carPrice: -1 };
    }

    const bookings = await Booking.find(query)
      .populate('soldByEmployeeId', 'name email phone')
      .sort(sortOption);

    res.status(200).json({
      message: 'Bookings fetched',
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// ---- GET BOOKING BY ID ----
router.get('/:bookingId', verifyAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('soldByEmployeeId', 'name email phone')
      .populate('dealershipId', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify dealership access
    if (booking.dealershipId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.status(200).json({
      message: 'Booking fetched',
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
});

// ---- UPDATE BOOKING ----
router.put('/:bookingId/update', verifyAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      carModel,
      carColour,
      carPrice,
      amountPaid,
      estimatedDeliveryDate,
      actualDeliveryDate,
      status,
      notes
    } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify dealership access
    if (booking.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Update fields
    if (customerName) booking.customerName = customerName;
    if (customerEmail) booking.customerEmail = customerEmail;
    if (customerPhone) booking.customerPhone = customerPhone;
    if (carModel) booking.carModel = carModel;
    if (carColour) booking.carColour = carColour;
    if (carPrice) booking.carPrice = carPrice;
    if (amountPaid !== undefined) booking.amountPaid = amountPaid;
    if (estimatedDeliveryDate) booking.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (actualDeliveryDate) booking.actualDeliveryDate = new Date(actualDeliveryDate);
    if (status) booking.status = status;
    if (notes) booking.notes = notes;

    await booking.save();

    await booking.populate('soldByEmployeeId', 'name email phone');

    res.status(200).json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error updating booking' });
  }
});

// ---- CANCEL BOOKING ----
router.post('/:bookingId/cancel', verifyAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason, refundAmount } = req.body;

    if (!cancellationReason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify dealership access
    if (booking.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Create cancelled booking record
    const cancelledBooking = new CancelledBooking({
      originalBookingId: booking._id,
      dealershipId: booking.dealershipId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      carName: booking.carName,
      carModel: booking.carModel,
      carEngine: booking.carEngine,
      carTransmission: booking.carTransmission,
      carColour: booking.carColour,
      carPrice: booking.carPrice,
      amountPaid: booking.amountPaid,
      soldByEmployeeId: booking.soldByEmployeeId,
      cancellationReason,
      refundAmount: refundAmount || booking.amountPaid,
      cancelledBy: req.userId,
      notes: booking.notes
    });

    await cancelledBooking.save();

    // Delete from active bookings
    await Booking.findByIdAndDelete(bookingId);

    await cancelledBooking.populate('soldByEmployeeId', 'name email phone');

    res.status(200).json({
      message: 'Booking cancelled successfully',
      cancelledBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

// ---- GET ALL CANCELLED BOOKINGS ----
router.get('/cancelled/all', verifyAuth, async (req, res) => {
  try {
    // Verify dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can access bookings' });
    }

    const cancelledBookings = await CancelledBooking.find({ dealershipId: req.userId })
      .populate('soldByEmployeeId', 'name email phone')
      .sort({ cancelledAt: -1 });

    res.status(200).json({
      message: 'Cancelled bookings fetched',
      cancelledBookings
    });
  } catch (error) {
    console.error('Error fetching cancelled bookings:', error);
    res.status(500).json({ message: 'Server error fetching cancelled bookings' });
  }
});

// ---- GET BOOKING STATISTICS ----
router.get('/stats/dashboard', verifyAuth, async (req, res) => {
  try {
    // Verify dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can access stats' });
    }

    // Get total bookings
    const totalBookings = await Booking.countDocuments({ dealershipId: req.userId });

    // Get pending deliveries (not delivered yet)
    const pendingDeliveries = await Booking.countDocuments({
      dealershipId: req.userId,
      status: { $ne: 'Delivered' }
    });

    // Get delivered bookings
    const deliveredBookings = await Booking.countDocuments({
      dealershipId: req.userId,
      status: 'Delivered'
    });

    // Get cancelled bookings count
    const cancelledCount = await CancelledBooking.countDocuments({ dealershipId: req.userId });

    // Calculate total revenue from completed bookings
    const totalRevenue = await Booking.aggregate([
      { $match: { dealershipId: mongoose.Types.ObjectId(req.userId), status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$carPrice' } } }
    ]);

    // Calculate total amount paid
    const totalAmountPaid = await Booking.aggregate([
      { $match: { dealershipId: mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    // Calculate pending amount
    const pendingAmount = await Booking.aggregate([
      { $match: { dealershipId: mongoose.Types.ObjectId(req.userId), status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } }
    ]);

    res.status(200).json({
      message: 'Statistics fetched',
      stats: {
        totalBookings,
        pendingDeliveries,
        deliveredBookings,
        cancelledCount,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalAmountPaid: totalAmountPaid[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// ---- COMPLETE DELIVERY ----
router.post('/:bookingId/complete-delivery', verifyAuth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { actualDeliveryDate } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify dealership owns this booking
    if (booking.dealershipId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check booking status
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot complete delivery for cancelled booking' });
    }

    if (booking.status === 'Delivered') {
      return res.status(400).json({ message: 'Booking already delivered' });
    }

    const User = require('../models/user');
    const Vehicle = require('../models/vehicle');

    // Check if customer already exists with this email
    let customer = await User.findOne({ email: booking.customerEmail || `${booking.customerName.toLowerCase().replace(/\s+/g, '.')}@booking`, role: 'customer' });

    if (!customer) {
      // Create new customer
      const defaultPassword = 'customer1234';
      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
      const salt = require('bcryptjs').genSaltSync(saltRounds);
      const hashedPassword = require('bcryptjs').hashSync(defaultPassword, salt);

      customer = new User({
        name: booking.customerName,
        email: booking.customerEmail || `${booking.customerName.toLowerCase().replace(/\s+/g, '.')}@booking`,
        password: hashedPassword,
        role: 'customer',
        dealershipIds: [req.userId],
        phone: booking.customerPhone,
        notes: `Created from booking delivery`
      });

      await customer.save();

      // Add customer to dealership's customers array
      const dealership = await Dealership.findById(req.userId);
      if (dealership) {
        dealership.customers.push(customer._id);
        await dealership.save();
      }
    }

    // Create vehicle from booking information
    const vehicle = new Vehicle({
      companyName: booking.carName,
      vehicleName: booking.carName,
      model: booking.carModel,
      color: booking.carColour,
      transmission: booking.carTransmission,
      engineCapacity: booking.carEngine,
      ownerId: customer._id,
      dealershipId: req.userId,
      dateOfBuying: actualDeliveryDate ? new Date(actualDeliveryDate) : new Date(),
      currentKms: 0,
      fuelType: 'Other',
      notes: `Created from booking`
    });

    await vehicle.save();

    // Update booking status, actual delivery date, and set remaining amount to zero
    booking.status = 'Delivered';
    booking.actualDeliveryDate = actualDeliveryDate ? new Date(actualDeliveryDate) : new Date();
    booking.remainingAmount = 0; // Set remaining amount to zero on delivery completion
    await booking.save();

    // Increment employee's carsSold and salesTarget count
    const Employee = require('../models/employee');
    const employee = await Employee.findByIdAndUpdate(
      booking.soldByEmployeeId,
      { $inc: { carsSold: 1, salesTarget: 1 } },
      { new: true }
    );

    // Populate employee details
    await booking.populate('soldByEmployeeId', 'name email phone');

    res.status(200).json({
      message: 'Delivery completed successfully',
      booking,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      vehicle: {
        _id: vehicle._id,
        companyName: vehicle.companyName,
        vehicleName: vehicle.vehicleName,
        model: vehicle.model,
        color: vehicle.color
      }
    });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ message: 'Server error completing delivery' });
  }
});

// ---- GET COMPLETED BOOKINGS BY EMPLOYEE ----
router.get('/employee/:employeeId/completed', verifyAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Verify dealership
    const dealership = await Dealership.findById(req.userId);
    if (!dealership) {
      return res.status(403).json({ message: 'Only dealerships can access bookings' });
    }

    // Get all completed (delivered) bookings for this employee
    const completedBookings = await Booking.find({
      soldByEmployeeId: employeeId,
      status: 'Delivered',
      dealershipId: req.userId
    })
      .populate('soldByEmployeeId', 'name email phone position department carsSold salesTarget')
      .sort({ actualDeliveryDate: -1 });

    res.status(200).json({
      message: 'Employee sales history fetched',
      bookings: completedBookings,
      totalSales: completedBookings.length,
      totalRevenue: completedBookings.reduce((sum, b) => sum + b.carPrice, 0)
    });
  } catch (error) {
    console.error('Error fetching employee sales history:', error);
    res.status(500).json({ message: 'Server error fetching sales history' });
  }
});

module.exports = router;


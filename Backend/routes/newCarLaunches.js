const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const NewCarLaunch = require('../models/newCarLaunch');
const Notification = require('../models/notification');
const User = require('../models/user');

// CREATE a new car launch (Dealership only)
router.post('/', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const {
      carName,
      manufacturer,
      model,
      launchDate,
      preOrderDate,
      shortDescription,
      fullDescription,
      specifications,
      features,
      pricing,
      variants,
      colors,
      images,
      videos,
      highlights,
      targetAudience,
      segment,
      competingModels,
      isHighlighted,
      serviceAssurance,
      finance
    } = req.body;

    // Validate required fields
    if (!carName || !manufacturer || !model || !launchDate || !shortDescription || !pricing) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLaunch = new NewCarLaunch({
      dealershipId: req.user.dealershipId,
      carName,
      manufacturer,
      model,
      launchDate,
      preOrderDate,
      shortDescription,
      fullDescription,
      specifications,
      features,
      pricing,
      variants,
      colors,
      images,
      videos,
      highlights,
      targetAudience,
      segment,
      competingModels,
      launchStatus: new Date(launchDate) <= new Date() ? "launched" : "announced",
      isHighlighted,
      serviceAssurance,
      finance,
      createdBy: req.user._id
    });

    await newLaunch.save();

    // Send notifications to customers
    const customers = await User.find({
      dealershipIds: req.user.dealershipId,
      role: "customer"
    });

    const notifications = customers.map(customer => ({
      recipientId: customer._id,
      dealershipId: req.user.dealershipId,
      type: "new_car_launch",
      title: `🚗 New Launch: ${carName}`,
      message: `Check out the new ${manufacturer} ${carName}! Starting from ₹${pricing.basePrice}`,
      relatedEntityType: "newCarLaunch",
      relatedEntityId: newLaunch._id,
      imageUrl: images?.thumbnailImage,
      priority: "high",
      actionUrl: `/customer/launches/${newLaunch._id}`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "New car launch created successfully", launch: newLaunch });
  } catch (error) {
    console.error('Error creating car launch:', error);
    res.status(500).json({ message: "Error creating car launch", error: error.message });
  }
});

// GET all car launches for a dealership
router.get('/', requireAuth, async (req, res) => {
  try {
    const dealershipId = req.user.dealershipId || req.query.dealershipId;
    const { status, segment, manufacturer } = req.query;

    let query = { dealershipId, isActive: true };
    if (status) query.launchStatus = status;
    if (segment) query.segment = segment;
    if (manufacturer) query.manufacturer = manufacturer;

    const launches = await NewCarLaunch.find(query)
      .sort({ launchDate: -1 })
      .lean();

    res.status(200).json({ launches });
  } catch (error) {
    console.error('Error fetching car launches:', error);
    res.status(500).json({ message: "Error fetching car launches", error: error.message });
  }
});

// GET a single car launch
router.get('/:launchId', requireAuth, async (req, res) => {
  try {
    const launch = await NewCarLaunch.findById(req.params.launchId);

    if (!launch) {
      return res.status(404).json({ message: "Car launch not found" });
    }

    // Increment views
    launch.analytics.views += 1;
    await launch.save();

    res.status(200).json({ launch });
  } catch (error) {
    console.error('Error fetching car launch:', error);
    res.status(500).json({ message: "Error fetching car launch", error: error.message });
  }
});

// UPDATE a car launch
router.put('/:launchId', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const launch = await NewCarLaunch.findById(req.params.launchId);

    if (!launch) {
      return res.status(404).json({ message: "Car launch not found" });
    }

    if (launch.dealershipId.toString() !== req.user.dealershipId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update allowed fields
    const allowedUpdates = [
      'carName', 'shortDescription', 'fullDescription', 'specifications',
      'features', 'pricing', 'variants', 'colors', 'images', 'videos',
      'highlights', 'launchStatus', 'isHighlighted', 'serviceAssurance', 'finance'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        launch[field] = req.body[field];
      }
    });

    await launch.save();

    res.status(200).json({ message: "Car launch updated successfully", launch });
  } catch (error) {
    console.error('Error updating car launch:', error);
    res.status(500).json({ message: "Error updating car launch", error: error.message });
  }
});

// DELETE a car launch
router.delete('/:launchId', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const launch = await NewCarLaunch.findByIdAndDelete(req.params.launchId);

    if (!launch) {
      return res.status(404).json({ message: "Car launch not found" });
    }

    res.status(200).json({ message: "Car launch deleted successfully" });
  } catch (error) {
    console.error('Error deleting car launch:', error);
    res.status(500).json({ message: "Error deleting car launch", error: error.message });
  }
});

// GET featured/highlighted launches (for customer view)
router.get('/dealership/:dealershipId/featured', async (req, res) => {
  try {
    const launches = await NewCarLaunch.find({
      dealershipId: req.params.dealershipId,
      isActive: true,
      isHighlighted: true
    })
      .select('carName manufacturer model shortDescription pricing images launchStatus segment')
      .sort({ launchDate: -1 })
      .limit(6)
      .lean();

    res.status(200).json({ launches });
  } catch (error) {
    console.error('Error fetching featured launches:', error);
    res.status(500).json({ message: "Error fetching launches", error: error.message });
  }
});

// PRE-ORDER a car
router.post('/:launchId/preorder', requireAuth, async (req, res) => {
  try {
    const { variantSelected, colorSelected } = req.body;
    const launch = await NewCarLaunch.findById(req.params.launchId);

    if (!launch) {
      return res.status(404).json({ message: "Car launch not found" });
    }

    // Check if customer already pre-ordered
    const existingOrder = launch.bookings.find(
      booking => booking.customerId.toString() === req.user._id.toString()
    );

    if (existingOrder) {
      return res.status(400).json({ message: "You have already pre-ordered this car" });
    }

    // Add pre-order
    launch.bookings.push({
      customerId: req.user._id,
      bookingDate: new Date(),
      variantSelected,
      colorSelected
    });

    launch.preOrdersCount += 1;
    launch.analytics.bookings += 1;
    await launch.save();

    // Send confirmation notification
    const dealership = await NewCarLaunch.findById(req.params.launchId).select('dealershipId');
    await Notification.create({
      recipientId: req.user._id,
      dealershipId: dealership.dealershipId,
      type: "new_car_launch",
      title: `Pre-Order Confirmed: ${launch.carName}`,
      message: `Your pre-order for ${launch.carName} has been confirmed. We'll notify you when it's ready for delivery.`,
      relatedEntityType: "newCarLaunch",
      relatedEntityId: launch._id,
      priority: "high"
    });

    res.status(200).json({ message: "Pre-order successful", launch });
  } catch (error) {
    console.error('Error pre-ordering car:', error);
    res.status(500).json({ message: "Error pre-ordering car", error: error.message });
  }
});

// SEARCH launches by manufacturer, model, segment
router.get('/search/query', async (req, res) => {
  try {
    const { manufacturer, model, segment, priceMin, priceMax } = req.query;

    let query = { isActive: true, launchStatus: { $in: ["announced", "preOrder_open", "launched"] } };

    if (manufacturer) query.manufacturer = { $regex: manufacturer, $options: 'i' };
    if (model) query.model = { $regex: model, $options: 'i' };
    if (segment) query.segment = segment;
    if (priceMin || priceMax) {
      query['pricing.basePrice'] = {};
      if (priceMin) query['pricing.basePrice'].$gte = parseInt(priceMin);
      if (priceMax) query['pricing.basePrice'].$lte = parseInt(priceMax);
    }

    const launches = await NewCarLaunch.find(query)
      .select('carName manufacturer model segment pricing launchStatus images highlights')
      .sort({ launchDate: -1 })
      .lean();

    res.status(200).json({ launches, total: launches.length });
  } catch (error) {
    console.error('Error searching launches:', error);
    res.status(500).json({ message: "Error searching launches", error: error.message });
  }
});

module.exports = router;

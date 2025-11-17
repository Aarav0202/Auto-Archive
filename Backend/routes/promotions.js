const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const Promotion = require('../models/promotion');
const Notification = require('../models/notification');
const User = require('../models/user');

// CREATE a new promotion (Dealership only)
router.post('/', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const { title, description, promotionType, discountType, discountValue, applicableOn, applicableVehicleIds, applicableServiceIds, startDate, endDate, minimumPurchaseAmount, maximumDiscount, usageLimit, perCustomerLimit, couponCode, targetCustomers, targetCustomerIds, description_detailed, terms_and_conditions, imageUrl } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const newPromotion = new Promotion({
      dealershipId: req.user.dealershipId,
      title,
      description,
      promotionType,
      discountType,
      discountValue,
      applicableOn,
      applicableVehicleIds,
      applicableServiceIds,
      startDate,
      endDate,
      minimumPurchaseAmount,
      maximumDiscount,
      usageLimit,
      perCustomerLimit,
      couponCode,
      targetCustomers,
      targetCustomerIds,
      description_detailed,
      terms_and_conditions,
      imageUrl,
      createdBy: req.user._id,
      status: new Date(startDate) <= new Date() ? "active" : "scheduled"
    });

    await newPromotion.save();

    // Send notifications to customers if dealership has "all" target
    if (targetCustomers === "all") {
      const customers = await User.find({
        dealershipIds: req.user.dealershipId,
        role: "customer"
      });

      const notifications = customers.map(customer => ({
        recipientId: customer._id,
        dealershipId: req.user.dealershipId,
        type: "promotion",
        title: `New Promotion: ${title}`,
        message: description,
        relatedEntityType: "promotion",
        relatedEntityId: newPromotion._id,
        imageUrl,
        priority: "high"
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } else if (targetCustomerIds && targetCustomerIds.length > 0) {
      const notifications = targetCustomerIds.map(customerId => ({
        recipientId: customerId,
        dealershipId: req.user.dealershipId,
        type: "promotion",
        title: `Special Offer: ${title}`,
        message: description,
        relatedEntityType: "promotion",
        relatedEntityId: newPromotion._id,
        imageUrl,
        priority: "high"
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "Promotion created successfully", promotion: newPromotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: "Error creating promotion", error: error.message });
  }
});

// GET all promotions for a dealership (with filters)
router.get('/', requireAuth, async (req, res) => {
  try {
    const dealershipId = req.user.dealershipId || req.query.dealershipId;
    const { status, isActive, type } = req.query;

    let query = { dealershipId };
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (type) query.promotionType = type;

    const promotions = await Promotion.find(query)
      .sort({ startDate: -1 })
      .lean();

    // Update status based on current date
    const updatedPromotions = promotions.map(promo => {
      const now = new Date();
      if (new Date(promo.endDate) < now && promo.status !== "cancelled") {
        promo.status = "expired";
      } else if (new Date(promo.startDate) <= now && promo.status === "scheduled") {
        promo.status = "active";
      }
      return promo;
    });

    res.status(200).json({ promotions: updatedPromotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: "Error fetching promotions", error: error.message });
  }
});

// GET a single promotion
router.get('/:promotionId', requireAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.promotionId);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // Check if user has access to this promotion
    if (promotion.dealershipId.toString() !== (req.user.dealershipId || req.query.dealershipId)?.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.status(200).json({ promotion });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: "Error fetching promotion", error: error.message });
  }
});

// UPDATE a promotion
router.put('/:promotionId', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.promotionId);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    if (promotion.dealershipId.toString() !== req.user.dealershipId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(promotion, req.body);
    await promotion.save();

    res.status(200).json({ message: "Promotion updated successfully", promotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: "Error updating promotion", error: error.message });
  }
});

// DELETE a promotion
router.delete('/:promotionId', requireAuth, requireRole('carDealership'), async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.promotionId);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: "Error deleting promotion", error: error.message });
  }
});

// VALIDATE coupon code
router.post('/validate/coupon', requireAuth, async (req, res) => {
  try {
    const { couponCode, purchaseAmount, customerId } = req.body;

    const promotion = await Promotion.findOne({
      couponCode: couponCode.toUpperCase(),
      isActive: true,
      dealershipId: req.user.dealershipId
    });

    if (!promotion) {
      return res.status(404).json({ message: "Coupon code not found or invalid" });
    }

    // Check if promotion is active (date-wise)
    const now = new Date();
    if (new Date(promotion.startDate) > now || new Date(promotion.endDate) < now) {
      return res.status(400).json({ message: "Coupon code has expired or not yet active" });
    }

    // Check minimum purchase amount
    if (purchaseAmount < promotion.minimumPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount of ₹${promotion.minimumPurchaseAmount} required` });
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit exceeded" });
    }

    // Calculate discount
    let discount = 0;
    if (promotion.discountType === "percentage") {
      discount = (purchaseAmount * promotion.discountValue) / 100;
      if (promotion.maximumDiscount) {
        discount = Math.min(discount, promotion.maximumDiscount);
      }
    } else if (promotion.discountType === "fixed_amount") {
      discount = promotion.discountValue;
    }

    res.status(200).json({
      message: "Coupon valid",
      discount,
      promotion: {
        title: promotion.title,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: "Error validating coupon", error: error.message });
  }
});

// GET active promotions for customers (public view)
router.get('/dealership/:dealershipId/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      dealershipId: req.params.dealershipId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .select('title description promotionType discountType discountValue imageUrl startDate endDate couponCode')
      .sort({ endDate: 1 });

    res.status(200).json({ promotions });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ message: "Error fetching promotions", error: error.message });
  }
});

module.exports = router;

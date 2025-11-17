const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const Vehicle = require("../models/vehicle");

const router = express.Router();

router.get(
  "/customer/home",
  requireAuth,
  requireRole("customer"),
  (req, res) => {
    res.json({ message: "Welcome to Customer Home" });
  }
);

// ---- GET CUSTOMER'S VEHICLES ----
router.get(
  "/customer/vehicles",
  requireAuth,
  requireRole("customer"),
  async (req, res) => {
    try {
      const customerId = req.user.id;

      // Fetch all vehicles for this customer across all dealerships
      const vehicles = await Vehicle.find({ ownerId: customerId })
        .populate("dealershipId", "name")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "Vehicles retrieved successfully",
        vehicles: vehicles,
        totalVehicles: vehicles.length,
      });
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;

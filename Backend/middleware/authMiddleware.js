const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Dealership = require("../models/dealership");
const Employee = require("../models/employee");

async function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user data based on role
    let user = null;
    
    if (decoded.role === "carDealership") {
      user = await Dealership.findById(decoded.id);
      if (user) {
        req.user = {
          _id: user._id,
          id: user._id,
          email: user.email,
          role: "carDealership",
          dealershipId: user._id,
          name: user.name
        };
      }
    } else if (decoded.role === "employee") {
      user = await Employee.findById(decoded.id);
      if (user) {
        req.user = {
          _id: user._id,
          id: user._id,
          email: user.email,
          role: "employee",
          dealershipId: user.dealershipId,
          employeeId: user.employeeId,
          name: user.name
        };
      }
    } else {
      user = await User.findById(decoded.id);
      if (user) {
        req.user = {
          _id: user._id,
          id: user._id,
          email: user.email,
          role: user.role,
          dealershipIds: user.dealershipIds || [],
          dealershipId: user.dealershipIds && user.dealershipIds.length > 0 ? user.dealershipIds[0] : null,
          name: user.name
        };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

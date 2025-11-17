const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Dealership = require("../models/dealership");
const Employee = require("../models/employee");

const router = express.Router();

// ---- REGISTER ----
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, dealershipId } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    const existingDealership = await Dealership.findOne({ email });
    const existingEmployee = await Employee.findOne({ email });
    if (existingUser || existingDealership || existingEmployee) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    if (role === "employee") {
      if (!dealershipId) {
        return res
          .status(400)
          .json({ message: "dealershipId is required for employees" });
      }
      const dealership = await Dealership.findById(dealershipId);
      if (!dealership) {
        return res.status(400).json({ message: "Invalid dealership ID" });
      }
    }

    if (role === "customer" && dealershipId) {
      const dealership = await Dealership.findById(dealershipId);
      if (!dealership) {
        return res
          .status(400)
          .json({ message: "Invalid dealership ID for customer" });
      }
    }

  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPass = await bcrypt.hash(password, salt);


    if (role === "carDealership") {
      const newDealership = new Dealership({
        name,
        email,
        password: hashedPass,
        employees: [],
        customers: [],
        carsSold: [],
        totalCarsSold: 0,
      });
      await newDealership.save();

      res.status(201).json({
        message: "Dealership registered successfully",
        dealership: { id: newDealership._id, name: newDealership.name, email: newDealership.email },
      });
      return;
    }

    const newUser = new User({
      name,
      email,
      password: hashedPass,
      role,
      dealershipId:
        role === "employee" || (role === "customer" && dealershipId)
          ? dealershipId
          : null,
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, role: newUser.role },
    });
  } catch (error) {
    console.error("Register route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ----LOGIN ----
router.post("/login", async (req, res) => {
  try {
  const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Try to find user in User db (includes both customers and any other users)
    let user = await User.findOne({ email });
    let isDealership = false;
    let isEmployee = false;
    let dealership = null;
    let employee = null;
    
    if (user) {
      // User found (could be customer, etc.)
      if (role && role !== user.role) {
        return res.status(400).json({ message: "Invalid email, password, or role" });
      }
    } else {
      // Check if it's an employee
      employee = await Employee.findOne({ email });
      if (employee) {
        isEmployee = true;
        if (role && role !== "employee") {
          return res.status(400).json({ message: "Invalid email, password, or role" });
        }
      } else {
        // Check if it's a dealership
        dealership = await Dealership.findOne({ email });
        if (!dealership) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
        isDealership = true;
        if (role && role !== "carDealership") {
          return res.status(400).json({ message: "Invalid email, password, or role" });
        }
      }
    }

    // Validate password
    const validPass = await bcrypt.compare(
      password,
      isDealership ? dealership.password : (isEmployee ? employee.password : user.password)
    );
    if (!validPass) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const tokenPayload = isDealership
      ? { id: dealership._id, email: dealership.email, role: "carDealership" }
      : isEmployee
      ? { id: employee._id, email: employee.email, role: "employee" }
      : { id: user._id, email: user.email, role: user.role };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      user: isDealership
        ? {
            id: dealership._id,
            email: dealership.email,
            role: "carDealership",
            name: dealership.name,
            dealershipId: dealership._id,
          }
        : isEmployee
        ? {
            id: employee._id,
            email: employee.email,
            role: "employee",
            name: employee.name,
            employeeId: employee.employeeId,
            department: employee.department,
            dealershipId: employee.dealershipId,
          }
        : {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            dealershipIds: user.dealershipIds || [],
            dealershipId: user.dealershipIds && user.dealershipIds.length > 0 ? user.dealershipIds[0] : null,
          },
    });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- LOGOUT ----
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// ----- CHECK TOKEN ----
router.get("/checkToken", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select("id name email role dealershipId dealershipIds");
    if (user) {
      return res.json({ 
        loggedIn: true, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dealershipIds: user.dealershipIds || [],
          dealershipId: user.dealershipIds && user.dealershipIds.length > 0 ? user.dealershipIds[0] : null,
        }
      });
    }

    let employee = await Employee.findById(decoded.id).select("id name email employeeId department dealershipId");
    if (employee) {
      return res.json({
        loggedIn: true,
        user: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: "employee",
          employeeId: employee.employeeId,
          department: employee.department,
          dealershipId: employee.dealershipId,
        },
      });
    }

    let dealership = await Dealership.findById(decoded.id).select("id name email");
    if (dealership) {
      return res.json({
        loggedIn: true,
        user: {
          id: dealership._id,
          name: dealership.name,
          email: dealership.email,
          role: "carDealership",
          dealershipId: dealership._id,
        },
      });
    }

    return res.status(401).json({ loggedIn: false });
  } catch (err) {
    return res.status(401).json({ loggedIn: false });
  }
});

// ---- CHANGE PASSWORD ----
router.post("/change-password", async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: "Current password, new password, and confirm password are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "New passwords do not match" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find the user in all models (Customer, Dealership, Employee)
    let user = null;
    let userModel = null;
    
    // Check if it's a customer
    user = await User.findById(decoded.id);
    if (user) {
      userModel = "User";
    }
    
    // Check if it's a dealership
    if (!user) {
      user = await Dealership.findById(decoded.id);
      if (user) {
        userModel = "Dealership";
      }
    }
    
    // Check if it's an employee
    if (!user) {
      user = await Employee.findById(decoded.id);
      if (user) {
        userModel = "Employee";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: "New password cannot be the same as current password" 
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ 
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Change password error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE ACCOUNT ----
router.delete("/delete-account", async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let dealership = await Dealership.findById(decoded.id);
    
    if (dealership) {
      await Employee.deleteMany({ dealershipId: dealership._id });
      
      // For customers, unlink from this dealership or delete if no other dealerships
      const customers = await User.find({ dealershipIds: dealership._id, role: "customer" });
      for (const customer of customers) {
        customer.dealershipIds = customer.dealershipIds.filter(id => !id.equals(dealership._id));
        if (customer.dealershipIds.length === 0) {
          await User.findByIdAndDelete(customer._id);
        } else {
          await customer.save();
        }
      }
      
      await Dealership.findByIdAndDelete(dealership._id);
      
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      
      return res.status(200).json({ 
        message: "Dealership account and all associated data deleted successfully" 
      });
    }
    
    let user = await User.findById(decoded.id);
    
    if (user && user.role === "customer") {
      // Remove from all dealerships
      if (user.dealershipIds && user.dealershipIds.length > 0) {
        for (const dealershipId of user.dealershipIds) {
          await Dealership.findByIdAndUpdate(
            dealershipId,
            { $pull: { customers: user._id } }
          );
        }
      }
      
      await User.findByIdAndDelete(user._id);
      
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      
      return res.status(200).json({ 
        message: "Customer account deleted successfully" 
      });
    }
    
    let employee = await Employee.findById(decoded.id);
    
    if (employee) {
      if (employee.dealershipId) {
        await Dealership.findByIdAndUpdate(
          employee.dealershipId,
          { $pull: { employees: employee._id } }
        );
      }
      
      await Employee.findByIdAndDelete(employee._id);
      
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      
      return res.status(200).json({ 
        message: "Employee account deleted successfully" 
      });
    }
    
    return res.status(404).json({ message: "Account not found" });
    
  } catch (error) {
    console.error("Delete account error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE CUSTOMER ----
router.delete("/delete-customer/:customerId", async (req, res) => {
  const token = req.cookies.token;
  const { customerId } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let dealership = await Dealership.findById(decoded.id);
    let user = null;
    
    if (!dealership) {
      user = await User.findById(decoded.id);
      if (!user || user.role !== "employee") {
        return res.status(403).json({ 
          message: "Only dealerships and employees can delete customers" 
        });
      }
    }
    
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    const dealershipId = dealership ? dealership._id : user.dealershipId;
    
    // Check if customer is linked to this dealership (new dealershipIds array)
    const isLinked = customer.dealershipIds && customer.dealershipIds.some(id => id.equals(dealershipId));
    if (!isLinked) {
      return res.status(403).json({ 
        message: "You can only delete customers from your own dealership" 
      });
    }
    
    try {
      // Remove dealership from customer's dealershipIds
      customer.dealershipIds = customer.dealershipIds.filter(id => !id.equals(dealershipId));
      
      // Remove customer from dealership's customers array
      if (dealership) {
        dealership.customers = dealership.customers.filter(id => !id.equals(customerId));
        await dealership.save();
      } else {
        const d = await Dealership.findById(dealershipId);
        if (d) {
          d.customers = d.customers.filter(id => !id.equals(customerId));
          await d.save();
        }
      }
      
      // If customer has no more dealerships, delete completely
      if (customer.dealershipIds.length === 0) {
        await User.findByIdAndDelete(customerId);
      } else {
        await customer.save();
      }
      
      return res.status(200).json({ 
        message: "Customer deleted successfully" 
      });
    } catch (deleteError) {
      console.error("Error deleting customer:", deleteError);
      return res.status(500).json({ 
        message: "Error deleting customer" 
      });
    }
    
  } catch (error) {
    console.error("Delete customer route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

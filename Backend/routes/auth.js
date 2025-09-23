const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Dealership = require("../models/dealership");
const Employee = require("../models/employee");

const router = express.Router();

// ---------------------- REGISTER ----------------------
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

    // Try to find user in User collection
    let user = await User.findOne({ email });
    let isDealership = false;
    let isEmployee = false;
    let dealership = null;
    let employee = null;
    
    if (user) {
      if (role !== user.role) {
        return res.status(400).json({ message: "Invalid email, password, or role" });
      }
    } else {
      // Check if it's an employee
      employee = await Employee.findOne({ email });
      if (employee) {
        isEmployee = true;
        if (role !== "employee") {
          return res.status(400).json({ message: "Invalid email, password, or role" });
        }
      } else {
        // Check if it's a dealership
        dealership = await Dealership.findOne({ email });
        if (!dealership) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
        isDealership = true;
        if (role !== "carDealership") {
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
            dealershipId: user.dealershipId || null,
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

    // Try User collection first
    let user = await User.findById(decoded.id).select("id name email role dealershipId");
    if (user) {
      return res.json({ loggedIn: true, user });
    }

    // Try Employee collection
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

    // If not found, try Dealership collection
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

// ---- DELETE ACCOUNT ----
router.delete("/delete-account", async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Delete account request for user ID:", decoded.id);
    
    // Set timeout for database operations
    const timeoutMs = 15000; // 15 seconds
    
    // Check if user is a dealership
    console.log("Checking if user is a dealership...");
    let dealership = null;
    try {
      dealership = await Dealership.findById(decoded.id).maxTimeMS(timeoutMs);
    } catch (dbError) {
      console.error("Database error when finding dealership:", dbError);
      return res.status(500).json({ 
        message: "Database connection error. Please try again." 
      });
    }
    
    if (dealership) {
      console.log("Found dealership, proceeding with dealership deletion");
      // Delete dealership account
      try {
        // First, delete all employees from Employee collection
        console.log("Deleting employees from Employee collection...");
        const employeesFromEmployeeModel = await Employee.deleteMany({ 
          dealershipId: dealership._id
        }).maxTimeMS(timeoutMs);
        console.log("Deleted employees from Employee collection:", employeesFromEmployeeModel.deletedCount);
        
        // Delete employees that might still be in User collection (legacy)
        console.log("Deleting legacy employees from User collection...");
        const legacyEmployeesResult = await User.deleteMany({ 
          dealershipId: dealership._id, 
          role: "employee" 
        }).maxTimeMS(timeoutMs);
        console.log("Deleted legacy employees from User collection:", legacyEmployeesResult.deletedCount);
        
        // Delete all customers associated with this dealership
        console.log("Deleting customers...");
        const customersResult = await User.deleteMany({ 
          dealershipId: dealership._id, 
          role: "customer" 
        }).maxTimeMS(timeoutMs);
        console.log("Deleted customers:", customersResult.deletedCount);
        
        // Finally, delete the dealership itself
        console.log("Deleting dealership...");
        await Dealership.findByIdAndDelete(dealership._id).maxTimeMS(timeoutMs);
        console.log("Dealership deleted successfully");
        
        // Clear the authentication cookie
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        return res.status(200).json({ 
          message: "Dealership account and all associated data deleted successfully" 
        });
      } catch (deleteError) {
        console.error("Error deleting dealership:", deleteError);
        return res.status(500).json({ 
          message: "Error deleting dealership account. Please try again." 
        });
      }
    }
    
    // Check if user is a customer/employee from User collection
    console.log("Checking if user is a customer/employee in User collection...");
    let user = null;
    try {
      user = await User.findById(decoded.id).maxTimeMS(timeoutMs);
    } catch (dbError) {
      console.error("Database error when finding user:", dbError);
      return res.status(500).json({ 
        message: "Database connection error. Please try again." 
      });
    }
    
    if (user) {
      console.log("Found user:", user.role, "proceeding with user deletion");
      try {
        // If user is an employee, remove them from dealership's employee list
        if (user.role === "employee" && user.dealershipId) {
          console.log("Removing employee from dealership...");
          await Dealership.findByIdAndUpdate(
            user.dealershipId,
            { $pull: { employees: user._id } }
          ).maxTimeMS(timeoutMs);
        }
        
        // If user is a customer, remove them from dealership's customer list
        if (user.role === "customer" && user.dealershipId) {
          console.log("Removing customer from dealership...");
          await Dealership.findByIdAndUpdate(
            user.dealershipId,
            { $pull: { customers: user._id } }
          ).maxTimeMS(timeoutMs);
        }
        
        // Delete the user account
        console.log("Deleting user account...");
        await User.findByIdAndDelete(user._id).maxTimeMS(timeoutMs);
        console.log("User deleted successfully");
        
        // Clear the authentication cookie
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        return res.status(200).json({ 
          message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account deleted successfully` 
        });
      } catch (deleteError) {
        console.error("Error deleting user:", deleteError);
        return res.status(500).json({ 
          message: "Error deleting user account. Please try again." 
        });
      }
    }
    
    // Check if user is an employee from Employee collection
    console.log("Checking if user is an employee in Employee collection...");
    let employee = null;
    try {
      employee = await Employee.findById(decoded.id).maxTimeMS(timeoutMs);
    } catch (dbError) {
      console.error("Database error when finding employee:", dbError);
      return res.status(500).json({ 
        message: "Database connection error. Please try again." 
      });
    }
    
    if (employee) {
      console.log("Found employee:", employee.name, "proceeding with employee deletion");
      try {
        // Remove employee from dealership's employee list
        if (employee.dealershipId) {
          console.log("Removing employee from dealership...");
          await Dealership.findByIdAndUpdate(
            employee.dealershipId,
            { $pull: { employees: employee._id } }
          ).maxTimeMS(timeoutMs);
        }
        
        // Delete the employee account
        console.log("Deleting employee account...");
        await Employee.findByIdAndDelete(employee._id).maxTimeMS(timeoutMs);
        console.log("Employee deleted successfully");
        
        // Clear the authentication cookie
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        
        return res.status(200).json({ 
          message: "Employee account deleted successfully" 
        });
      } catch (deleteError) {
        console.error("Error deleting user:", deleteError);
        return res.status(500).json({ 
          message: "Error deleting user account. Please try again." 
        });
      }
    }
    
    console.log("No account found for deletion");
    return res.status(404).json({ message: "Account not found" });
    
  } catch (error) {
    console.error("Delete account route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    if (error.name === "MongooseError" || error.message.includes("timeout")) {
      return res.status(500).json({ 
        message: "Database connection timeout. Please check your connection and try again." 
      });
    }
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ---- DELETE CUSTOMER (for dealership use) ----
router.delete("/delete-customer/:customerId", async (req, res) => {
  const token = req.cookies.token;
  const { customerId } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify that the requester is a dealership or employee
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
    
    // Find the customer to delete
    const customer = await User.findById(customerId);
    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Verify the customer belongs to the dealership
    const dealershipId = dealership ? dealership._id : user.dealershipId;
    if (customer.dealershipId && !customer.dealershipId.equals(dealershipId)) {
      return res.status(403).json({ 
        message: "You can only delete customers from your own dealership" 
      });
    }
    
    try {
      // Remove customer from dealership's customer list
      if (customer.dealershipId) {
        await Dealership.findByIdAndUpdate(
          customer.dealershipId,
          { $pull: { customers: customer._id } }
        );
      }
      
      // Delete the customer account
      await User.findByIdAndDelete(customerId);
      
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

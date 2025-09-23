const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Dealership = require("../models/dealership");
const Employee = require("../models/employee");

const router = express.Router();

// ---------------------- EMPLOYEE REGISTER ----------------------
router.post("/register", async (req, res) => {
  try {
    const { 
      name, email, password, phone, dealershipId, employeeId, 
      department, position, salary, dateOfJoining, salesTarget,
      address, emergencyContact 
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !dealershipId || !employeeId || !department || !position || !salary) {
      return res.status(400).json({ 
        message: "Name, email, password, phone, dealershipId, employeeId, department, position, and salary are required" 
      });
    }

    // Check if email already exists in any collection
    const existingUser = await User.findOne({ email });
    const existingDealership = await Dealership.findOne({ email });
    const existingEmployee = await Employee.findOne({ email });
    if (existingUser || existingDealership || existingEmployee) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if employeeId already exists
    const existingEmployeeId = await Employee.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // Validate dealership exists
    const dealership = await Dealership.findById(dealershipId);
    if (!dealership) {
      return res.status(400).json({ message: "Invalid dealership ID" });
    }

    // Hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create new employee
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPass,
      phone,
      dealershipId,
      employeeId,
      department,
      position,
      salary,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
      salesTarget: salesTarget || 0,
      address: address || {},
      emergencyContact: emergencyContact || {}
    });

    await newEmployee.save();

    // Add employee to dealership's employees array
    await Dealership.findByIdAndUpdate(
      dealershipId,
      { $push: { employees: newEmployee._id } }
    );

    res.status(201).json({
      message: "Employee registered successfully",
      employee: { 
        id: newEmployee._id, 
        name: newEmployee.name, 
        email: newEmployee.email, 
        employeeId: newEmployee.employeeId,
        department: newEmployee.department
      },
    });
  } catch (error) {
    console.error("Employee register route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- GET ALL EMPLOYEES (for dealership) ----
router.get("/", async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify that the requester is a dealership or employee
    let dealership = await Dealership.findById(decoded.id);
    let dealershipId = null;
    
    if (dealership) {
      dealershipId = dealership._id;
    } else {
      // Check if it's an employee requesting
      const employee = await Employee.findById(decoded.id);
      if (employee) {
        dealershipId = employee.dealershipId;
      } else {
        return res.status(403).json({ 
          message: "Only dealerships and employees can view employee list" 
        });
      }
    }
    
    // Fetch all employees for this dealership
    const employees = await Employee.find({ dealershipId: dealershipId })
      .select("-password") // Exclude password field
      .populate("dealershipId", "name") // Include dealership name
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      employees: employees,
      totalEmployees: employees.length
    });
    
  } catch (error) {
    console.error("Get employees route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- GET SINGLE EMPLOYEE ----
router.get("/:employeeId", async (req, res) => {
  const token = req.cookies.token;
  const { employeeId } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the employee
    const employee = await Employee.findById(employeeId)
      .select("-password")
      .populate("dealershipId", "name");
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Verify access rights
    let hasAccess = false;
    
    // Check if requester is the dealership
    const dealership = await Dealership.findById(decoded.id);
    if (dealership && dealership._id.equals(employee.dealershipId._id)) {
      hasAccess = true;
    }
    
    // Check if requester is an employee from the same dealership
    if (!hasAccess) {
      const requestingEmployee = await Employee.findById(decoded.id);
      if (requestingEmployee && requestingEmployee.dealershipId.equals(employee.dealershipId._id)) {
        hasAccess = true;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return res.status(200).json({ employee });
    
  } catch (error) {
    console.error("Get employee route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- UPDATE EMPLOYEE ----
router.put("/:employeeId", async (req, res) => {
  const token = req.cookies.token;
  const { employeeId } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Verify that the requester is the dealership (only dealership can update employee data)
    const dealership = await Dealership.findById(decoded.id);
    if (!dealership || !dealership._id.equals(employee.dealershipId)) {
      return res.status(403).json({ 
        message: "Only the dealership can update employee information" 
      });
    }
    
    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== employee.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      const existingDealership = await Dealership.findOne({ email: req.body.email });
      const existingEmployee = await Employee.findOne({ 
        email: req.body.email, 
        _id: { $ne: employeeId } 
      });
      
      if (existingUser || existingDealership || existingEmployee) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }
    
    // Check if employeeId is being updated and if it already exists
    if (req.body.employeeId && req.body.employeeId !== employee.employeeId) {
      const existingEmployeeId = await Employee.findOne({ 
        employeeId: req.body.employeeId, 
        _id: { $ne: employeeId } 
      });
      
      if (existingEmployeeId) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
    }
    
    // Update employee data (exclude sensitive fields like password)
    const allowedUpdates = [
      'name', 'email', 'phone', 'employeeId', 'department', 'position', 
      'salary', 'dateOfJoining', 'carsSold', 'salesTarget', 'isActive', 
      'address', 'emergencyContact'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updates,
      { new: true, runValidators: true }
    ).select("-password").populate("dealershipId", "name");
    
    return res.status(200).json({ 
      message: "Employee updated successfully",
      employee: updatedEmployee 
    });
    
  } catch (error) {
    console.error("Update employee route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error: " + error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ---- DELETE EMPLOYEE BY ID (for employee management) ----
router.delete("/:id", async (req, res) => {
  const token = req.cookies.token;
  const { id } = req.params;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify that the requester is a dealership
    let dealership = await Dealership.findById(decoded.id);
    if (!dealership) {
      return res.status(403).json({ 
        message: "Only dealerships can delete employees" 
      });
    }
    
    // Find the employee to delete in Employee collection
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Verify the employee belongs to this dealership
    if (!employee.dealershipId || !employee.dealershipId.equals(dealership._id)) {
      return res.status(403).json({ 
        message: "You can only delete employees from your own dealership" 
      });
    }
    
    try {
      // Delete the employee from Employee collection
      await Employee.findByIdAndDelete(id);
      
      console.log(`Employee ${employee.name} (${employee.employeeId}) deleted successfully`);
      
      return res.status(200).json({ 
        message: "Employee deleted successfully" 
      });
    } catch (deleteError) {
      console.error("Error deleting employee:", deleteError);
      return res.status(500).json({ 
        message: "Error deleting employee from database" 
      });
    }
    
  } catch (error) {
    console.error("Delete employee route error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
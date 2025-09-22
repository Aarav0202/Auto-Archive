const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Dealership = require("../models/dealership");

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
    if (existingUser || existingDealership) {
      return res
        .status(400)
        .json({ message: "User or Dealership with this email already exists" });
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
    let dealership = null;
    if (user) {
      if (role !== user.role) {
        return res.status(400).json({ message: "Invalid email, password, or role" });
      }
    } else {
      dealership = await Dealership.findOne({ email });
      if (!dealership) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      isDealership = true;
      if (role !== "carDealership") {
        return res.status(400).json({ message: "Invalid email, password, or role" });
      }
    }

    // Validate password
    const validPass = await bcrypt.compare(
      password,
      isDealership ? dealership.password : user.password
    );
    if (!validPass) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const tokenPayload = isDealership
      ? { id: dealership._id, email: dealership.email, role: "carDealership" }
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


module.exports = router;

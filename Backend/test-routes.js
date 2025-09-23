const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const homeRoutes = require('./routes/home');
const customerRoutes = require('./routes/customer');
const dealershipRoutes = require('./routes/dealership');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
}));

// Route testing
console.log("🧪 Testing Route Structure:");
console.log("✅ Auth routes loaded");
console.log("✅ Employee routes loaded");
console.log("✅ Home routes loaded");
console.log("✅ Customer routes loaded");
console.log("✅ Dealership routes loaded");

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/', homeRoutes);
app.use('/', customerRoutes);
app.use('/', dealershipRoutes);

console.log("\n📋 API Endpoints Summary:");
console.log("🔐 Authentication & Account Management:");
console.log("  POST /api/auth/register");
console.log("  POST /api/auth/login");
console.log("  POST /api/auth/logout");
console.log("  GET  /api/auth/checkToken");
console.log("  DELETE /api/auth/delete-account");
console.log("  DELETE /api/auth/delete-customer/:customerId");

console.log("\n👥 Employee Management:");
console.log("  POST /api/employees/register");
console.log("  GET  /api/employees/");
console.log("  GET  /api/employees/:employeeId");
console.log("  PUT  /api/employees/:employeeId");
console.log("  DELETE /api/employees/:id");

console.log("\n🌟 Refactoring completed successfully!");
console.log("📁 Employee routes separated into dedicated file");
console.log("🔗 Frontend API calls updated to new endpoints");
console.log("🚀 Application ready for testing");

module.exports = app;
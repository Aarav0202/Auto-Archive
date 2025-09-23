const express = require('express');
const mongoose = require('mongoose');
const cookieParser= require('cookie-parser')
const cors = require('cors');
const { requireAuth, requireRole } = require("./middleware/authMiddleware");


const homeRoutes = require("./routes/home");
const customerRoutes = require("./routes/customer");
const dealershipRoutes = require("./routes/dealership");
const employeeRoutes = require("./routes/employee");

require('dotenv').config();

const appRoutes= require("./routes/auth")

const app = express();
const port= process.env.PORT

// Connected MongoDB Atlas Database
const mongouri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');
mongoose.connect(mongouri)
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database connection established');
})
.catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('Will attempt to reconnect...');
});



app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials:true,
}));
app.use('/api/auth', appRoutes);
app.use('/api/employees', employeeRoutes);
app.use("/", homeRoutes);
app.use("/", customerRoutes);
app.use("/", dealershipRoutes);


app.get("/home", requireAuth, (req, res) => {
  if (req.user.role === "customer") {
    return res.redirect("/customer/home");
  } else if (req.user.role === "carDealership") {
    return res.redirect("/dealership/home");
  }
  return res.redirect("/");
});


app.get("/", (req, res) => {
    console.log("GET / request received");
    res.send("Hello World");
});

app.listen(port, () => {
    console.log("Server is running on port 8080");
});

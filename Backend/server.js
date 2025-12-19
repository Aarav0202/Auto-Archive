const express = require('express');
const mongoose = require('mongoose');
const cookieParser= require('cookie-parser')
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { requireAuth, requireRole } = require("./middleware/authMiddleware");


const homeRoutes = require("./routes/home");
const customerRoutes = require("./routes/customer");
const dealershipRoutes = require("./routes/dealership");
const employeeRoutes = require("./routes/employee");
const customersApiRoutes = require("./routes/customers");
const vehiclesRoutes = require("./routes/vehicles");
const servicesRoutes = require("./routes/services");
const serviceRequestsRoutes = require("./routes/serviceRequests");
const bookingsRoutes = require("./routes/bookings");
const promotionsRoutes = require("./routes/promotions");
const newCarLaunchesRoutes = require("./routes/newCarLaunches");
const notificationsRoutes = require("./routes/notifications");
const chatRoutes = require("./routes/chat");

require('dotenv').config();

const appRoutes= require("./routes/auth")

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true
  }
});
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
    credentials: true,
}));

// Add explicit CORS headers for API routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api/auth', appRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customersApiRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-requests', serviceRequestsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/new-car-launches', newCarLaunchesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chat', chatRoutes(io));
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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`📱 User connected: ${socket.id}`);

  // Join chat room
  socket.on("chat:join-room", (data) => {
    const { roomId, companyName, vehicleName } = data;
    
    // Remove from any previous rooms to avoid memory leaks
    const currentRooms = Array.from(socket.rooms);
    currentRooms.forEach(room => {
      if (room !== socket.id && room.startsWith('chat:')) {
        socket.leave(room);
      }
    });
    
    socket.join(roomId);
    console.log(`✅ User ${socket.id} joined room: ${roomId}`);
    
    socket.to(roomId).emit("chat:user-joined", {
      userId: socket.id,
      message: `A user joined the ${companyName} ${vehicleName} chat room`
    });
  });

  // Send chat message
  socket.on("chat:send-message", (data) => {
    const { companyName, vehicleName, message, issueType } = data;
    const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
    
    // Just broadcast to room - actual message saving happens via REST API
    io.to(roomId).emit("chat:message", {
      socketId: socket.id,
      message,
      issueType,
      carModel: { companyName, vehicleName },
      timestamp: new Date()
    });
  });

  // Typing indicator
  socket.on("chat:typing", (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit("chat:user-typing", {
      userId: socket.id,
      isTyping
    });
  });

  // Leave room
  socket.on("chat:leave-room", (data) => {
    const { roomId } = data;
    socket.leave(roomId);
    console.log(`👋 User ${socket.id} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
    console.log("Server is running on port 8080");
});

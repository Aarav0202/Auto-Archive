const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const ChatMessage = require('../models/chatMessage');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');

module.exports = function(io) {
  const router = express.Router();

// GET chat history for a car model
router.get('/history/:companyName/:vehicleName', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleName } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user has a vehicle with this model OR is dealership
    const userVehicles = await Vehicle.find({
      ownerId: req.user._id,
      companyName: companyName,
      vehicleName: vehicleName
    });

    if (userVehicles.length === 0 && req.user.role !== 'carDealership') {
      return res.status(403).json({ message: 'Access denied: no vehicle with this model' });
    }

    // Fetch chat messages for this car model
    const messages = await ChatMessage.find({
      'carModel.companyName': companyName,
      'carModel.vehicleName': vehicleName,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    const total = await ChatMessage.countDocuments({
      'carModel.companyName': companyName,
      'carModel.vehicleName': vehicleName,
      isDeleted: false
    });

    res.status(200).json({ 
      success: true,
      messages, 
      total, 
      limit, 
      skip 
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all car models user has access to
router.get('/models/available', requireAuth, async (req, res) => {
  try {
    console.log('Fetching chat models for user:', req.user._id, 'Role:', req.user.role);
    let carModels = [];

    if (req.user.role === 'customer') {
      // Get all unique car models for this customer
      const vehicles = await Vehicle.find({ ownerId: req.user._id })
        .select('companyName vehicleName model');

      console.log('Found vehicles:', vehicles.length);

      carModels = vehicles.map(v => ({
        companyName: v.companyName,
        vehicleName: v.vehicleName,
        model: v.model,
        displayName: `${v.companyName} ${v.vehicleName}`,
        roomId: `chat:${v.companyName.toLowerCase()}:${v.vehicleName.toLowerCase()}`
      }));

      // Remove duplicates
      carModels = Array.from(new Map(
        carModels.map(m => [`${m.companyName}:${m.vehicleName}`, m])
      ).values());
    } else if (req.user.role === 'carDealership') {
      // Dealership can see all car models in the system
      const distinctModels = await Vehicle.aggregate([
        { $group: {
          _id: { company: '$companyName', name: '$vehicleName', model: '$model' },
          count: { $sum: 1 }
        }}
      ]);

      carModels = distinctModels.map(m => ({
        companyName: m._id.company,
        vehicleName: m._id.name,
        model: m._id.model,
        displayName: `${m._id.company} ${m._id.name}`,
        userCount: m.count,
        roomId: `chat:${m._id.company.toLowerCase()}:${m._id.name.toLowerCase()}`
      }));
    }

    res.status(200).json({ success: true, carModels });
  } catch (error) {
    console.error('Error fetching available models:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST send a chat message
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleName, message, issueType } = req.body;
    const senderId = req.user._id;

    if (!message || !companyName || !vehicleName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify access
    const hasAccess = await Vehicle.findOne({
      companyName,
      vehicleName,
      ...(req.user.role !== 'carDealership' && { ownerId: senderId })
    });

    if (!hasAccess && req.user.role !== 'carDealership') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Create chat message with vehicle model and year
    const chatMessage = new ChatMessage({
      carModel: { 
        companyName, 
        vehicleName,
        model: hasAccess?.model,
        year: hasAccess?.year
      },
      senderId,
      senderName: req.user.name,
      senderEmail: req.user.email,
      senderRole: req.user.role === 'carDealership' ? 'carDealership' : 'customer',
      dealershipBanner: req.user.role === 'carDealership' ? {
        name: req.user.name,
        isOfficial: true
      } : undefined,
      message,
      issueType: issueType || 'general'
    });

    await chatMessage.save();

    // Broadcast to all users in the room
    const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
    console.log(`💬 Broadcasting new message to room: ${roomId}`);
    io.to(roomId).emit('chat:message', chatMessage);

    res.status(201).json({ 
      success: true, 
      message: 'Message sent', 
      chatMessage 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE a chat message (soft delete)
router.delete('/:messageId', requireAuth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    // Only sender or dealership admin can delete
    if (message.senderId.toString() !== req.user._id.toString() && req.user.role !== 'carDealership') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Broadcast deletion to all users in the room
    const roomId = `chat:${message.carModel.companyName.toLowerCase()}:${message.carModel.vehicleName.toLowerCase()}`;
    console.log(`🗑️ Broadcasting message deletion for room: ${roomId}, messageId: ${message._id}`);
    io.to(roomId).emit('chat:message-deleted', { messageId: message._id });

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

  return router;
};

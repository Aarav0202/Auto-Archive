# WebSocket Chat Integration Plan - Car Model-based Chatrooms

This document provides a detailed implementation plan for adding real-time WebSocket chatting to your Medical Records Manager project, organized by car models with special dealership messaging.

---

## Architecture Overview

### Chat System Components

```
Vehicle (MongoDB)
  └─ companyName + vehicleName + model
     └─ Creates chat room key: "chat:toyota:camry" or "chat:honda:accord"
        └─ All users with that car model join this room automatically

User/Customer
  ├─ Links to multiple dealerships
  ├─ Registers multiple vehicles
  └─ Automatically joins chat rooms for each vehicle's car model

Dealership
  ├─ Employees join car model chat rooms
  ├─ Display special banner: "Dealership Name (Official)" with blue badge
  └─ Can respond to customer issues

Chat Message (New MongoDB Collection)
  ├─ sender (userId)
  ├─ senderRole (customer/dealership)
  ├─ dealershipName (if sender is dealership)
  ├─ message content
  ├─ carModel identifier
  ├─ timestamp
  └─ reactions/replies support

Socket.IO Rooms
  ├─ "chat:toyota:camry" - All users with Toyota Camry
  ├─ "chat:honda:accord" - All users with Honda Accord
  ├─ "user:{userId}" - Personal notifications
  └─ "dealership:{dealershipId}" - Dealership team messages
```

---

## Implementation Plan - Step by Step

### Step 1: Create Chat Message Model

**File to create: `Backend/models/chatMessage.js`**

```javascript
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  // Chat identification
  carModel: {
    companyName: { type: String, required: true }, // e.g., "Toyota"
    vehicleName: { type: String, required: true }, // e.g., "Camry"
    model: { type: String, trim: true }            // e.g., "XLE"
  },

  // Sender information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel' // Can be User or Dealership
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Dealership'],
    default: 'User'
  },
  senderName: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['customer', 'dealership'],
    required: true
  },

  // For dealership messages: show special banner
  dealershipBanner: {
    name: { type: String },                  // "ABC Dealership"
    isOfficial: { type: Boolean, default: false }, // Shows blue badge
    badgeColor: { type: String, default: 'blue' }  // Can customize
  },

  // Message content
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional message features
  attachments: [{
    type: String,  // URL to image/file
    filename: String
  }],
  
  issueType: {
    type: String,
    enum: ['general', 'problem', 'question', 'solution', 'update'],
    default: 'general'
  },

  // Reactions/engagement
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],

  // Moderation
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isPinned: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient queries
chatMessageSchema.index({ 'carModel.companyName': 1, 'carModel.vehicleName': 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, createdAt: -1 });
chatMessageSchema.index({ 'carModel.vehicleName': 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
```

---

### Step 2: Create Chat Routes & Endpoints

**File to create: `Backend/routes/chat.js`**

```javascript
const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const ChatMessage = require('../models/chatMessage');
const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const Dealership = require('../models/dealership');

const router = express.Router();

// GET chat history for a car model
router.get('/history/:companyName/:vehicleName', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleName } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user has a vehicle with this model
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
      .populate('senderId', 'name email')
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    const total = await ChatMessage.countDocuments({
      'carModel.companyName': companyName,
      'carModel.vehicleName': vehicleName,
      isDeleted: false
    });

    res.status(200).json({ messages, total, limit, skip });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all car models the user has access to (for chat)
router.get('/models/available', requireAuth, async (req, res) => {
  try {
    let carModels = [];

    if (req.user.role === 'customer') {
      // Get all unique car models for this customer
      const vehicles = await Vehicle.find({ ownerId: req.user._id })
        .select('companyName vehicleName model');

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
      const vehicles = await Vehicle.find({ dealershipId: req.user._id })
        .select('companyName vehicleName model')
        .distinct('companyName vehicleName');

      // This would need custom aggregation
      const distinctModels = await Vehicle.aggregate([
        { $match: { dealershipId: req.user._id } },
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

    res.status(200).json({ carModels });
  } catch (error) {
    console.error('Error fetching available models:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST send a chat message
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { companyName, vehicleName, message, issueType } = req.body;
    const senderId = req.user._id;

    if (!message || !companyName || !vehicleName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify access
    const hasAccess = await Vehicle.findOne({
      companyName,
      vehicleName,
      ownerId: senderId
    });

    if (!hasAccess && req.user.role !== 'carDealership') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create chat message
    const chatMessage = new ChatMessage({
      carModel: { companyName, vehicleName },
      senderId,
      senderModel: req.user.role === 'carDealership' ? 'Dealership' : 'User',
      senderName: req.user.name,
      senderRole: req.user.role === 'carDealership' ? 'dealership' : 'customer',
      dealershipBanner: req.user.role === 'carDealership' ? {
        name: req.user.name,
        isOfficial: true,
        badgeColor: 'blue'
      } : undefined,
      message,
      issueType: issueType || 'general'
    });

    await chatMessage.save();

    // Broadcast via WebSocket if available
    if (req.io) {
      const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
      req.io.to(roomId).emit('chat:message', {
        _id: chatMessage._id,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        senderRole: chatMessage.senderRole,
        dealershipBanner: chatMessage.dealershipBanner,
        message: chatMessage.message,
        issueType: chatMessage.issueType,
        carModel: chatMessage.carModel,
        createdAt: chatMessage.createdAt
      });
    }

    res.status(201).json({ message: 'Message sent', chatMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a chat message (soft delete)
router.delete('/:messageId', requireAuth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only sender or dealership admin can delete
    if (message.senderId.toString() !== req.user._id.toString() && req.user.role !== 'carDealership') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Broadcast deletion
    if (req.io) {
      const roomId = `chat:${message.carModel.companyName.toLowerCase()}:${message.carModel.vehicleName.toLowerCase()}`;
      req.io.to(roomId).emit('chat:message-deleted', { messageId });
    }

    res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

---

### Step 3: Extend Frontend Socket Client

**Update: `Frontend/med_rec_frontend/lib/socket.ts`**

Add these functions to your existing socket.ts file:

```typescript
/**
 * Join a car model chat room
 * @param companyName - Car company name
 * @param vehicleName - Car model name
 */
export function joinChatRoom(companyName: string, vehicleName: string): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:join-room', { roomId, companyName, vehicleName });
  console.log(`📱 Joined chat room: ${roomId}`);
}

/**
 * Leave a car model chat room
 * @param companyName - Car company name
 * @param vehicleName - Car model name
 */
export function leaveChatRoom(companyName: string, vehicleName: string): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:leave-room', { roomId });
  console.log(`👋 Left chat room: ${roomId}`);
}

/**
 * Send a chat message
 * @param companyName - Car company name
 * @param vehicleName - Car model name
 * @param message - Message text
 * @param issueType - Type of issue (general, problem, question, solution, update)
 */
export function sendChatMessage(
  companyName: string,
  vehicleName: string,
  message: string,
  issueType: string = 'general'
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.emit('chat:send-message', {
    companyName,
    vehicleName,
    message,
    issueType
  });
}

/**
 * Listen for new chat messages
 * @param callback - Function to call when message is received
 */
export function onChatMessage(
  callback: (messageData: {
    _id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    dealershipBanner?: {
      name: string;
      isOfficial: boolean;
      badgeColor: string;
    };
    message: string;
    issueType: string;
    carModel: { companyName: string; vehicleName: string };
    createdAt: string;
  }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:message', callback);

  return () => {
    socket?.off('chat:message', callback);
  };
}

/**
 * Listen for message deletion
 * @param callback - Function to call when message is deleted
 */
export function onChatMessageDeleted(
  callback: (data: { messageId: string }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:message-deleted', callback);

  return () => {
    socket?.off('chat:message-deleted', callback);
  };
}

/**
 * Listen for user typing indicator
 * @param callback - Function to call when someone is typing
 */
export function onUserTyping(
  callback: (data: { userId: string; senderName: string; isTyping: boolean }) => void
): () => void {
  if (!socket) {
    console.error('Socket not initialized');
    return () => {};
  }

  socket.on('chat:user-typing', callback);

  return () => {
    socket?.off('chat:user-typing', callback);
  };
}

/**
 * Emit typing indicator
 * @param companyName - Car company name
 * @param vehicleName - Car model name
 * @param isTyping - Whether user is typing
 */
export function emitTypingIndicator(
  companyName: string,
  vehicleName: string,
  isTyping: boolean
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const roomId = `chat:${companyName.toLowerCase()}:${vehicleName.toLowerCase()}`;
  socket.emit('chat:typing', { roomId, isTyping });
}
```

---

### Step 4: Extend Backend Socket Manager

**Update: `Backend/websocket/socketManager.js`**

Add chat-related methods:

```javascript
/**
 * Handle chat room joining
 */
handleChatRoomJoin(socket, data) {
  const { roomId, companyName, vehicleName } = data;
  socket.join(roomId);
  
  // Broadcast that user joined
  this.io.to(roomId).emit('chat:user-joined', {
    userId: socket.user.id,
    userName: socket.user.name,
    timestamp: new Date()
  });

  console.log(`✅ User ${socket.user.email} joined chat room: ${roomId}`);
}

/**
 * Handle chat room leaving
 */
handleChatRoomLeave(socket, data) {
  const { roomId } = data;
  socket.leave(roomId);
  
  this.io.to(roomId).emit('chat:user-left', {
    userId: socket.user.id,
    userName: socket.user.name,
    timestamp: new Date()
  });

  console.log(`👋 User ${socket.user.email} left chat room: ${roomId}`);
}

/**
 * Handle chat message broadcasting
 */
broadcastChatMessage(roomId, messageData) {
  this.io.to(roomId).emit('chat:message', messageData);
}

/**
 * Handle typing indicator
 */
handleTypingIndicator(roomId, userId, userName, isTyping) {
  this.io.to(roomId).emit('chat:user-typing', {
    userId,
    senderName: userName,
    isTyping,
    timestamp: new Date()
  });
}
```

---

### Step 5: Create Chat UI Component

**File to create: `Frontend/med_rec_frontend/components/ChatRoom.tsx`**

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  joinChatRoom, 
  leaveChatRoom, 
  sendChatMessage, 
  onChatMessage,
  emitTypingIndicator,
  onUserTyping 
} from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, Trash2 } from 'lucide-react';

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'dealership';
  dealershipBanner?: {
    name: string;
    isOfficial: boolean;
    badgeColor: string;
  };
  message: string;
  issueType: string;
  createdAt: string;
}

interface Props {
  companyName: string;
  vehicleName: string;
  displayName: string;
  userRole: 'customer' | 'carDealership';
}

export function ChatRoom({ companyName, vehicleName, displayName, userRole }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [issueType, setIssueType] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Join chat room
    joinChatRoom(companyName, vehicleName);

    // Listen for new messages
    const unsubscribeMessages = onChatMessage((messageData) => {
      setMessages(prev => [...prev, messageData as ChatMessage]);
    });

    // Listen for typing indicators
    const unsubscribeTyping = onUserTyping((data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set([...prev, data.userId]));
      } else {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      leaveChatRoom(companyName, vehicleName);
    };
  }, [companyName, vehicleName]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    try {
      // Send via API for persistence
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          vehicleName,
          message: inputMessage,
          issueType
        })
      });

      if (response.ok) {
        // Also emit via socket for real-time broadcasting
        sendChatMessage(companyName, vehicleName, inputMessage, issueType);
        setInputMessage('');
        setIsTyping(false);
        emitTypingIndicator(companyName, vehicleName, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Emit typing indicator
    if (!isTyping) {
      setIsTyping(true);
      emitTypingIndicator(companyName, vehicleName, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingIndicator(companyName, vehicleName, false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">{displayName} Chat</h2>
        <p className="text-sm text-blue-100">Model discussions & support</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.senderRole === 'dealership' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                msg.senderRole === 'dealership'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {/* Dealership Banner */}
              {msg.dealershipBanner && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white">
                    {msg.dealershipBanner.name} (Official)
                  </Badge>
                </div>
              )}

              {/* Message Content */}
              <p className="font-semibold text-sm">{msg.senderName}</p>
              <p className="text-sm">{msg.message}</p>

              {/* Issue Type Badge */}
              {msg.issueType !== 'general' && (
                <Badge className="mt-2 text-xs bg-opacity-50">
                  {msg.issueType}
                </Badge>
              )}

              {/* Timestamp */}
              <p className="text-xs opacity-75 mt-1 flex items-center gap-1">
                <Clock size={12} />
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic">
            {Array.from(typingUsers).length} user(s) typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t p-4 space-y-3">
        <div className="flex gap-2">
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="general">General</option>
            <option value="problem">Problem</option>
            <option value="question">Question</option>
            <option value="solution">Solution</option>
            <option value="update">Update</option>
          </select>

          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleTyping}
            className="flex-1"
          />

          <Button type="submit" size="sm" className="bg-blue-600">
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## Areas to Add Chat in Your Project

### 1. **After Vehicle Registration** (Customer View)
- Path: `Frontend/src/app/customer/vehicles`
- Add "View Chat Room" button below each registered vehicle
- Automatically joins user to chat room for that car model

### 2. **Customer Dashboard** (New Section)
- Path: `Frontend/src/app/customer/` 
- Add new page: `chat` or `community`
- Show all car models user has registered
- Display active users in each room

### 3. **Dealership Management** (Employee Access)
- Path: `Frontend/src/app/dealership/employees`
- Allow dealership managers/employees to join car model chat rooms
- Show chat rooms for car models they service
- Messages appear with "Dealership Name (Official)" banner

### 4. **Service Request Integration**
- Path: `Backend/routes/serviceRequests.js`
- When customer creates service request, link to relevant chat room
- Add link: "Discuss this issue in the [Model] Chat Room"
- Show related issues from chat in service request details

### 5. **Vehicle Profile Page** (New)
- Create: `Frontend/src/app/customer/vehicle/[vehicleId]`
- Show vehicle details
- Embedded chat room for that car model
- View service history linked to chat discussions

### 6. **Dealership Dashboard** (New Section)
- Path: `Frontend/src/app/dealership/home`
- Add "Chat Rooms" section
- Show all car models they service
- Count of active conversations
- Unread messages badge

---

## Database Changes Needed

### Add Chat Message Collection

```javascript
// Already in Step 1 - chatMessage.js
```

### Update Vehicle Model (optional)

Add to `Backend/models/vehicle.js`:
```javascript
// Add to schema:
chatRoomEnabled: { type: Boolean, default: true },
lastChatActivity: { type: Date },
totalChatMessages: { type: Number, default: 0 }
```

### Create Chat Statistics Collection (optional)

```javascript
// Backend/models/chatStats.js
const chatStatsSchema = new mongoose.Schema({
  carModel: {
    companyName: String,
    vehicleName: String
  },
  totalMessages: Number,
  totalParticipants: Number,
  lastMessageAt: Date,
  activeToday: Number,
  topIssueTypes: [String]
}, { timestamps: true });
```

---

## Socket.IO Events for Chat

| Event | Direction | Purpose |
|-------|-----------|---------|
| `chat:join-room` | Client→Server | User joins car model chat |
| `chat:leave-room` | Client→Server | User leaves chat room |
| `chat:send-message` | Client→Server | Send message |
| `chat:message` | Server→Client | Broadcast new message to room |
| `chat:user-typing` | Client→Server | Typing indicator |
| `chat:user-typing` | Server→Client | Display who's typing |
| `chat:user-joined` | Server→Client | User joined notification |
| `chat:user-left` | Server→Client | User left notification |
| `chat:message-deleted` | Server→Client | Message deleted |
| `chat:reaction-added` | Both | User reacted to message |

---

## Key Features to Implement (Phased)

### Phase 1 - MVP (Essential)
- ✅ Car model-based chat rooms
- ✅ Real-time messaging
- ✅ Dealership banner/badge
- ✅ Message history persistence
- ✅ Automatic room joining on vehicle registration

### Phase 2 - Enhancement
- 📌 Pin important messages
- 🏆 Message reactions (😍, 👍, etc.)
- 🔍 Search chat history
- 📊 Chat statistics
- 🔔 Notifications for mentioned issues

### Phase 3 - Advanced
- 👥 User presence indicators (online/offline)
- 🎯 Mention specific users (@username)
- 📎 File/image attachments
- 🌐 Language translation
- 📋 Create FAQ from resolved issues

---

## Security Considerations

1. **Access Control**
   - Only users with vehicle of that model can view chat
   - Dealerships can join if they service that model
   - Rate limiting on message sending

2. **Content Moderation**
   - Soft delete messages (not permanent)
   - Dealership can delete inappropriate messages
   - Log deletions for audit trail

3. **Privacy**
   - Don't expose email/phone in chat
   - Anonymous mode option for customers
   - Report feature for offensive content

4. **Data Retention**
   - Archive old messages (>6 months)
   - Delete messages on account deletion
   - GDPR compliance for EU users

---

## Implementation Timeline

| Phase | Timeline | Components |
|-------|----------|-----------|
| Setup | 1 day | Database model, socket events, API routes |
| Backend | 2 days | Socket handlers, validation, persistence |
| Frontend | 3 days | Chat UI, room list, integration |
| Testing | 1 day | End-to-end testing, load testing |
| **Total** | **~1 week** | Full production-ready chat |

---

## Example User Flows

### Customer Flow:
1. Customer registers Toyota Camry
2. Automatically added to "chat:toyota:camry" room
3. Can see other Camry owners discussing issues
4. Posts question about maintenance
5. Dealership employee responds with official badge
6. Creates service request from chat discussion

### Dealership Flow:
1. Dealership manager logs in
2. Views "Chat Rooms" dashboard
3. Sees 15 active conversations in "Honda Accord"
4. Joins room and reads customer discussions
5. Responds to problem with "Official" badge
6. Pins helpful solution messages
7. Generates FAQ from common questions

---

**Next Steps:**
1. Start with Step 1-2 (Database model + API routes)
2. Extend socket manager (Step 4)
3. Build React component (Step 5)
4. Add integration points in existing pages

Ready to start implementation?

---

**Last Updated:** January 2025
**Status:** Comprehensive Plan Ready

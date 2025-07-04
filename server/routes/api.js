const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { getIO } = require('../socket');

// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Message.distinct('room');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for a specific room
router.get('/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new message (alternative to socket)
router.post('/messages', async (req, res) => {
  try {
    const { sender, content, room } = req.body;
    const message = new Message({ sender, content, room });
    await message.save();
    
    // Broadcast via socket
    getIO().to(room).emit('new_message', {
      ...message.toObject(),
      createdAt: message.createdAt.toISOString()
    });
    
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
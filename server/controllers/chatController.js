import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import Room from '../models/Room.js';

// @desc    Get all rooms
// @route   GET /api/chat/rooms
// @access  Private
export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ participants: req.user._id })
    .populate('participants', 'username avatar online')
    .sort({ updatedAt: -1 });
  
  res.json(rooms);
});

// @desc    Create new room
// @route   POST /api/chat/rooms
// @access  Private
export const createRoom = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  // Add current user to participants if not already included
  if (!participants.includes(req.user._id)) {
    participants.push(req.user._id);
  }

  const room = await Room.create({
    name,
    participants,
    createdBy: req.user._id
  });

  const populatedRoom = await Room.populate(room, {
    path: 'participants',
    select: 'username avatar online'
  });

  res.status(201).json(populatedRoom);
});

// @desc    Get messages for a room
// @route   GET /api/chat/:roomId/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ room: req.params.roomId })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json(messages.reverse());
});

// @desc    Create new message
// @route   POST /api/chat/messages
// @access  Private
export const createMessage = asyncHandler(async (req, res) => {
  const { content, roomId } = req.body;

  const message = new Message({
    content,
    sender: req.user._id,
    room: roomId
  });

  await message.save();

  // Update room's last message timestamp
  await Room.findByIdAndUpdate(roomId, { updatedAt: Date.now() });

  const populatedMessage = await Message.populate(message, {
    path: 'sender room',
    select: 'username avatar participants'
  });

  // Emit to Socket.io
  req.app.get('io').to(roomId).emit('receive_message', populatedMessage);

  res.status(201).json(populatedMessage);
});
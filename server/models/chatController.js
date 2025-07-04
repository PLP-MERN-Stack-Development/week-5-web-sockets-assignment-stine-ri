import Message from '../models/Message.js';
import Room from '../models/Room.js';

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = new Message({
      content: req.body.content,
      sender: req.user.id,
      room: req.body.roomId,
    });
    await message.save();
    
    const populatedMessage = await Message.populate(message, {
      path: 'sender',
      select: 'username avatar'
    });
    
    req.app.get('io').to(req.body.roomId).emit('new_message', populatedMessage);
    
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('participants', 'username avatar');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
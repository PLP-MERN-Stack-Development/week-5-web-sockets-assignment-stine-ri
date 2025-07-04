import express from 'express';
import {
  getRooms,
  createRoom,
  getMessages,
  createMessage
} from '../controllers/chatController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.route('/rooms')
  .get(protect, getRooms)
  .post(protect, createRoom);

router.get('/:roomId/messages', protect, getMessages);
router.post('/messages', protect, createMessage);

export default router;
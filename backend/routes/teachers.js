import express from 'express';
import { auth } from '../middleware/auth.js'; // Ensure this matches the export in auth.js
import User from '../models/User.js';

const router = express.Router();

// Get all teachers
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('id name subject');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
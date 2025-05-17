import express from 'express';
import SlotRequest from '../models/SlotRequest.js';
import TimeSlot from '../models/TimeSlot.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Request a slot
router.post('/request-slot', auth, async (req, res) => {
  try {
    const { slotId, teacherId, day, startTime, endTime } = req.body;
    
    const request = new SlotRequest({
      slotId,
      studentId: req.user.userId,
      teacherId,
      day,
      startTime,
      endTime,
      subject: (await TimeSlot.findById(slotId)).subject
    });
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student requests
router.get('/student/requests', auth, async (req, res) => {
  try {
    const requests = await SlotRequest.find({ studentId: req.user.userId })
      .populate('teacherId', 'name')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher requests
router.get('/teacher/requests', auth, async (req, res) => {
  try {
    const requests = await SlotRequest.find({ teacherId: req.user.userId })
      .populate('studentId', 'name')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to request
router.post('/respond-request/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await SlotRequest.findOneAndUpdate(
      { _id: req.params.requestId, teacherId: req.user.userId },
      { status },
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (status === 'accepted') {
      await TimeSlot.findByIdAndUpdate(request.slotId, { isAvailable: false });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
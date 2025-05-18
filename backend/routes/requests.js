import express from 'express';
import { auth } from '../middleware/auth.js';
import Request from '../models/Request.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const {
      teacherId,
      slot,
      purpose,
      studentYear,
      isStaffMember
    } = req.body;

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if slot is already taken
    const existingRequest = await Request.findOne({
      teacher: teacherId,
      'slot.date': slot.date,
      'slot.startTime': slot.startTime,
      'slot.endTime': slot.endTime,
      status: 'approved'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const request = new Request({
      student: req.user._id,
      teacher: teacherId,
      slot,
      purpose,
      studentYear,
      isStaffMember
    });

    // Calculate and set priority
    request.priority = request.calculatePriority();
    await request.save();

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests for a teacher
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await Request.find({ teacher: req.user._id })
      .populate('student', 'name email')
      .sort({ priority: -1, requestTime: 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get teacher requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests for a student
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await Request.find({ student: req.user._id })
      .populate('teacher', 'name email')
      .sort({ requestTime: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get student requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (approve/reject)
router.patch('/:requestId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Request.findOne({
      _id: req.params.requestId,
      teacher: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // If approving, check if slot is still available
    if (status === 'approved') {
      const conflictingRequest = await Request.findOne({
        teacher: req.user._id,
        'slot.date': request.slot.date,
        'slot.startTime': request.slot.startTime,
        'slot.endTime': request.slot.endTime,
        status: 'approved',
        _id: { $ne: request._id }
      });

      if (conflictingRequest) {
        return res.status(400).json({ message: 'This slot is no longer available' });
      }
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
import express from 'express';
import SlotRequest from '../models/SlotRequest.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Helper function to parse time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

// Helper function to check if two time slots overlap
const doSlotsOverlap = (slot1Start, slot1End, slot2Start, slot2End) => {
  const start1 = timeToMinutes(slot1Start);
  const end1 = timeToMinutes(slot1End);
  const start2 = timeToMinutes(slot2Start);
  const end2 = timeToMinutes(slot2End);
  return start1 < end2 && start2 < end1;
};

// Get teacher availability for a specific day
router.get('/availability/:teacherId/:day', auth, async (req, res) => {
  try {
    const { teacherId, day } = req.params;
    
    // First check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Read timetable data
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const timetablePath = path.join(__dirname, '..', 'timetable.json');
    const timetableData = JSON.parse(fs.readFileSync(timetablePath, 'utf8'));

    // Find the day's schedule
    const daySchedule = timetableData.find(d => d.day === day);
    if (!daySchedule) {
      return res.status(404).json({ message: 'Day not found in timetable' });
    }

    // Get teacher's classes for the day
    const teacherClasses = daySchedule.slots.filter(slot => 
      slot.teacher === teacher.name && 
      slot.subject !== 'LUNCH' && 
      slot.subject !== ''
    );

    // Define standard time slots (excluding lunch time)
    const standardSlots = [
      { start: '8:00', end: '8:55' },
      { start: '8:55', end: '9:50' },
      { start: '10:10', end: '11:05' },
      { start: '11:05', end: '12:00' },
      { start: '1:00', end: '1:55' },
      { start: '1:55', end: '2:50' },
      { start: '3:10', end: '4:00' },
      { start: '4:00', end: '4:55' }
    ];

    // Generate free slots
    const freeSlots = standardSlots.filter(standardSlot => {
      // Check if this standard slot overlaps with any of teacher's classes
      return !teacherClasses.some(teacherClass => 
        doSlotsOverlap(
          standardSlot.start, 
          standardSlot.end,
          teacherClass.start, 
          teacherClass.end
        )
      );
    }).map(slot => ({
      _id: `${teacher._id}-${day}-${slot.start}-${slot.end}`,
      teacherId: teacher._id,
      day,
      startTime: slot.start,
      endTime: slot.end,
      subject: 'Free Slot',
      isAvailable: true
    }));

    res.json(freeSlots);
  } catch (error) {
    console.error('Error getting teacher availability:', error);
    res.status(500).json({ 
      message: 'Failed to get teacher availability',
      error: error.message 
    });
  }
});

// Request a slot
router.post('/request-slot', auth, async (req, res) => {
  try {
    const { teacherId, day, startTime, endTime, purpose, studentDetails } = req.body;
    
    // First check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Generate the slot ID
    const slotId = `${teacher._id}-${day}-${startTime}-${endTime}`;

    // Create or find the time slot
    let timeSlot = await TimeSlot.findOne({ 
      teacherId: teacher._id,
      day,
      startTime,
      endTime
    });

    if (!timeSlot) {
      // Create the time slot if it doesn't exist
      timeSlot = new TimeSlot({
        _id: slotId,
        teacherId: teacher._id,
        day,
        startTime,
        endTime,
        subject: 'Free Slot'
      });
      try {
        await timeSlot.save();
      } catch (error) {
        console.error('Error saving time slot:', error);
        if (error.code === 11000) {
          // If there's a duplicate key error, try to find the existing slot again
          timeSlot = await TimeSlot.findOne({
            teacherId: teacher._id,
            day,
            startTime,
            endTime
          });
          if (!timeSlot) {
            return res.status(500).json({ message: 'Failed to create or find time slot' });
          }
        } else {
          throw error;
        }
      }
    }

    if (!timeSlot.isAvailable) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }
    
    const request = new SlotRequest({
      slotId: timeSlot._id,
      studentId: req.user._id,
      teacherId: teacher._id,
      day,
      startTime,
      endTime,
      purpose,
      studentDetails,
      subject: 'Meeting Request',
      status: 'pending'
    });
    
    await request.save();
    
    // Mark the slot as unavailable
    timeSlot.isAvailable = false;
    await timeSlot.save();
    
    res.json(request);
  } catch (error) {
    console.error('Error creating slot request:', error);
    res.status(500).json({ 
      message: 'Failed to create slot request',
      error: error.message 
    });
  }
});

// Get student requests
router.get('/student/requests', auth, async (req, res) => {
  try {
    const requests = await SlotRequest.find({ studentId: req.user._id })
      .populate('teacherId', 'name')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching student requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch requests',
      error: error.message 
    });
  }
});

// Get teacher requests
router.get('/teacher/requests', auth, async (req, res) => {
  try {
    const requests = await SlotRequest.find({ teacherId: req.user._id })
      .populate('studentId', 'name')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch requests',
      error: error.message 
    });
  }
});

// Respond to request
router.put('/respond-request/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Update request status
    const updatedRequest = await SlotRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate(['teacherId', 'studentId']);

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Get the socket.io instance
    const io = req.app.get('io');
    if (!io) {
      console.error('Socket.io instance not found');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Emit socket event to notify student
    io.to(updatedRequest.studentId._id.toString()).emit('request_response', {
      requestId: updatedRequest._id,
      studentId: updatedRequest.studentId._id,
      status,
      teacherName: updatedRequest.teacherId.name,
      subject: updatedRequest.subject,
      startTime: updatedRequest.startTime,
      endTime: updatedRequest.endTime
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
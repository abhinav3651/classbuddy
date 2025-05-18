import express from 'express';
import Classroom from '../models/Classroom.js';

const router = express.Router();

// Get all classrooms
router.get('/', async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Find free classrooms at a given time
router.get('/free', async (req, res) => {
  try {
    const { day, time } = req.query;
    
    if (!day || !time) {
      return res.status(400).json({ message: 'Day and time are required' });
    }

    // Convert time to 24-hour format for comparison
    const queryTime = new Date(`2000-01-01 ${time}`);

    // Find all classrooms
    const classrooms = await Classroom.find();
    
    // Filter out occupied classrooms
    const freeClassrooms = classrooms.filter(classroom => {
      const daySchedule = classroom.schedule.find(s => s.day === day);
      if (!daySchedule) return true; // If no schedule for this day, room is free

      // Check if the room is occupied in any slot
      return !daySchedule.slots.some(slot => {
        const startTime = new Date(`2000-01-01 ${slot.startTime}`);
        const endTime = new Date(`2000-01-01 ${slot.endTime}`);
        return queryTime >= startTime && queryTime <= endTime;
      });
    });

    res.json(freeClassrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new classroom
router.post('/', async (req, res) => {
  const classroom = new Classroom(req.body);
  try {
    const newClassroom = await classroom.save();
    res.status(201).json(newClassroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update classroom schedule
router.put('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;
    
    const classroom = await Classroom.findByIdAndUpdate(
      id,
      { schedule },
      { new: true }
    );
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 
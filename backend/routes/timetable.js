import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET /api/timetable
router.get('/', (req, res) => {
  const timetablePath = path.join(__dirname, '../timetable.json');
  console.log("Timetabledata",timetablePath)
  fs.readFile(timetablePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Could not read timetable data' });
    }
    res.json(JSON.parse(data));
  });
});

// GET /api/timetable/teachers
router.get('/teachers', (req, res) => {
  const timetablePath = path.join(__dirname, '../timetable.json');
  fs.readFile(timetablePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Could not read timetable data' });
    }
    const timetable = JSON.parse(data);
    const teacherSet = new Set();
    timetable.forEach(day => {
      day.slots.forEach(slot => {
        if (slot.teacher && slot.teacher !== '' && slot.teacher !== 'All') {
          teacherSet.add(slot.teacher);
        }
      });
    });
    res.json(Array.from(teacherSet));
  });
});

export default router; 
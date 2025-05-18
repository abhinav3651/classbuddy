import Classroom from './models/Classroom.js';
import { readFileSync } from 'fs';

const timetableData = JSON.parse(readFileSync(new URL('./timetable.json', import.meta.url)));

const extractLocations = () => {
  const locations = new Set();
  timetableData.forEach(day => {
    day.slots.forEach(slot => {
      if (slot.location && slot.location !== '') {
        locations.add(slot.location);
      }
    });
  });
  return Array.from(locations);
};

const createClassroomData = (location) => {
  let type = 'Classroom';
  if (location.toLowerCase().includes('lab')) {
    type = 'Lab';
  } else if (location.toLowerCase().includes('lt')) {
    type = 'Lecture Theater';
  }

  return {
    name: location,
    type,
    capacity: type === 'Lecture Theater' ? 120 : type === 'Lab' ? 60 : 40,
    department: 'Computer Science',
    schedule: timetableData.map(day => ({
      day: day.day,
      slots: day.slots
        .filter(slot => slot.location === location)
        .map(slot => ({
          startTime: slot.start,
          endTime: slot.end,
          subject: slot.subject,
          teacher: slot.teacher,
          section: slot.group,
          department: 'Computer Science'
        }))
    }))
  };
};

const seedClassrooms = async () => {
  try {
    // Clear existing classrooms
    await Classroom.deleteMany({});

    // Get unique locations from timetable
    const locations = extractLocations();

    // Create classroom documents
    const classroomData = locations.map(createClassroomData);

    // Insert classrooms into database
    await Classroom.insertMany(classroomData);
    console.log('Classrooms seeded successfully');
  } catch (error) {
    console.error('Error seeding classrooms:', error);
  }
};

export default seedClassrooms; 
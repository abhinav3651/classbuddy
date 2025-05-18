import bcrypt from 'bcrypt';
import User from './models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get teachers from timetable
const getTeachersFromTimetable = () => {
  const timetablePath = path.join(__dirname, 'timetable.json');
  const timetableData = JSON.parse(fs.readFileSync(timetablePath, 'utf-8'));
  const teacherSet = new Set();
  
  timetableData.forEach(day => {
    day.slots.forEach(slot => {
      if (slot.teacher && slot.teacher !== '' && slot.teacher !== 'All') {
        teacherSet.add(slot.teacher);
      }
    });
  });
  
  return Array.from(teacherSet);
};

const testStudents = [
  {
    name: "Test Student 1",
    email: "student1@example.com",
    password: "student1pass",
    role: "student"
  },
  {
    name: "Test Student 2",
    email: "student2@example.com",
    password: "student2pass",
    role: "student"
  },
  {
    name: "Test Student 3",
    email: "student3@example.com",
    password: "student3pass",
    role: "student"
  },
  {
    name: "Test Student 4",
    email: "student4@example.com",
    password: "student4pass",
    role: "student"
  }
];

const testTeachers = [
  {
    name: "Test Teacher 1",
    email: "teacher1@example.com",
    password: "teacher1pass",
    role: "teacher"
  },
  {
    name: "Test Teacher 2", 
    email: "teacher2@example.com",
    password: "teacher2pass",
    role: "teacher"
  }
];

// Create teacher accounts from timetable
const createTeacherAccounts = () => {
  const teachers = getTeachersFromTimetable();
  const accounts = teachers.map(teacherName => {
    // Remove the title and clean up the name
    const cleanName = teacherName.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.) /, '').trim();
    const email = cleanName.toLowerCase().replace(/[^a-z]/g, '') + '@geu.ac.in';
    console.log(`Creating account for ${teacherName} with email ${email}`);
    return {
      name: teacherName,
      email,
      password: 'teacher123',
      role: 'teacher'
    };
  });
  return accounts;
};

// Define the function
const seedTestUser = async () => {
  try {
    const timetableTeachers = createTeacherAccounts();
    const allUsers = [...testStudents, ...testTeachers, ...timetableTeachers];
    
    const hashedUsers = await Promise.all(
      allUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    await User.deleteMany({ role: { $in: ['student', 'teacher'] } });
    await User.insertMany(hashedUsers);
    
    console.log('Test students and teachers created');
    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

export default seedTestUser;
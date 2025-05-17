import bcrypt from 'bcrypt';
import User from './models/User.js';

const testUsers = [
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
  },
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
// Define the function
const seedTestUser = async () => {
  try {
    const hashedUsers = await Promise.all(
      testUsers.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    await User.deleteMany({ role: { $in: ['student', 'teacher'] } });
    await User.insertMany(hashedUsers);
    
    console.log(' Test students created');
    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

// Export as default
export default seedTestUser;
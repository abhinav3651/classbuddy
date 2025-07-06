import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import slotRoutes from './routes/slots.js';
import seedTestUser from './seed.js';
import seedClassrooms from './seedClassrooms.js';
import seedSeminarHall from './seedSeminarHall.js';
import User from './models/User.js';
import timetableRoutes from './routes/timetable.js';
import requestRoutes from './routes/requests.js';
import classroomRoutes from './routes/classrooms.js';
import seminarBookingRoutes from './routes/seminarBooking.js';
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Attach io to app for use in routes
app.set('io', io);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', ({ userId }) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/seminar', seminarBookingRoutes);

// Connect to MongoDB and seed data
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await seedTestUser();
    await seedClassrooms();
    await seedSeminarHall();
    
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS configured for ${process.env.NODE_ENV !== 'production' ? 'all origins' : 'production domains'}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};
startServer();

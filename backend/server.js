import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import teacherRoutes from './routes/teachers.js';
import slotRoutes from './routes/slots.js';
import seedTestUser from './seed.js';  // Direct import from same directory
import User from './models/User.js';
import timetableRoutes from './routes/timetable.js';
dotenv.config();

const app = express();
const httpServer = createServer(app);
// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, specify allowed domains
    const allowedDomains = [
      'https://yourproductiondomain.com',
      'https://www.yourproductiondomain.com'
    ];
    
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV !== 'production' ? '*' : [
      'https://yourproductiondomain.com',
      'https://www.yourproductiondomain.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ userId, role }) => {
    socket.join(userId);
    console.log(`${role} ${userId} joined their room`);
  });

  socket.on('requestSlot', (data) => {
    io.to(data.teacherId).emit('newRequest', data);
  });

  socket.on('requestResponse', (data) => {
    io.to(data.studentId).emit('requestResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/timetable', timetableRoutes);

// Connect to MongoDB and seed data
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await seedTestUser();
    
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

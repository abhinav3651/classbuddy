import express from 'express';
import { SeminarBooking, USER_TYPES, PRIORITY_LEVELS } from '../models/SeminarBooking.js';
import SeminarHall from '../models/SeminarHall.js';

const router = express.Router();

// Helper function to check time slot availability
const isTimeSlotAvailable = async (date, startTime, endTime) => {
    const existingBookings = await SeminarBooking.find({
        date: new Date(date),
        status: 'approved',
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    });
    return existingBookings.length === 0;
};

// Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await SeminarBooking.find()
            .sort({ requestedAt: 1, priority: -1 })
            .populate('userId', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new booking request
router.post('/book', async (req, res) => {
    try {
        const { userId, userType, date, startTime, endTime, purpose } = req.body;

        // Validate user type and set priority
        if (!Object.values(USER_TYPES).includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Check if the time slot is available
        const isAvailable = await isTimeSlotAvailable(date, startTime, endTime);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Time slot is not available' });
        }

        // Create new booking with priority
        const booking = new SeminarBooking({
            userId,
            userType,
            date,
            startTime,
            endTime,
            purpose,
            priority: PRIORITY_LEVELS[userType]
        });

        // Process pending bookings for the same time slot based on FCFS and priority
        const pendingBookings = await SeminarBooking.find({
            date: new Date(date),
            status: 'pending',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        }).sort({ priority: -1, requestedAt: 1 });

        // If there are pending bookings with higher priority, set status to pending
        const hasHigherPriorityBooking = pendingBookings.some(
            (pendingBooking) => pendingBooking.priority > booking.priority
        );

        if (!pendingBookings.length) {
            booking.status = 'approved';
        }

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Process pending bookings (can be called by an admin or automated system)
router.post('/process-pending', async (req, res) => {
    try {
        const { date } = req.body;
        
        // Get all pending bookings for the date, sorted by priority and request time
        const pendingBookings = await SeminarBooking.find({
            date: new Date(date),
            status: 'pending'
        }).sort({ priority: -1, requestedAt: 1 });

        const processedBookings = [];
        
        for (const booking of pendingBookings) {
            const isAvailable = await isTimeSlotAvailable(
                booking.date,
                booking.startTime,
                booking.endTime
            );

            if (isAvailable) {
                booking.status = 'approved';
            } else {
                booking.status = 'rejected';
            }
            
            await booking.save();
            processedBookings.push(booking);
        }

        res.json(processedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        const booking = await SeminarBooking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await booking.deleteOne();
        
        // Process any pending bookings that might be able to take this slot
        const pendingBookings = await SeminarBooking.find({
            date: booking.date,
            status: 'pending',
            startTime: { $lt: booking.endTime },
            endTime: { $gt: booking.startTime }
        }).sort({ priority: -1, requestedAt: 1 });

        if (pendingBookings.length > 0) {
            const nextBooking = pendingBookings[0];
            nextBooking.status = 'approved';
            await nextBooking.save();
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 
import mongoose from 'mongoose';

const USER_TYPES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    HOD: 'hod'
};

const PRIORITY_LEVELS = {
    [USER_TYPES.STUDENT]: 1,
    [USER_TYPES.TEACHER]: 2,
    [USER_TYPES.HOD]: 3
};

const seminarBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: Object.values(USER_TYPES),
        required: true
    },
    priority: {
        type: Number,
        required: true,
        enum: Object.values(PRIORITY_LEVELS),
        default: function() {
            return PRIORITY_LEVELS[this.userType];
        }
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for FCFS and priority-based sorting
seminarBookingSchema.index({ requestedAt: 1, priority: -1 });

const SeminarBooking = mongoose.model('SeminarBooking', seminarBookingSchema);

export { SeminarBooking, USER_TYPES, PRIORITY_LEVELS }; 
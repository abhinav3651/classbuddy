import mongoose from 'mongoose';

const seminarHallSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Main Seminar Hall'
    },
    capacity: {
        type: Number,
        default: 100
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('SeminarHall', seminarHallSchema); 
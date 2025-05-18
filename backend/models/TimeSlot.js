import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate format: teacherId-day-startTime-endTime
        return /^[a-f\d]{24}-[A-Za-z]+-\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid slot ID format!`
    }
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{1,2}:\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{1,2}:\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  subject: {
    type: String,
    default: 'Free Slot'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

// Add a compound index to ensure uniqueness of the combination
timeSlotSchema.index({ teacherId: 1, day: 1, startTime: 1, endTime: 1 }, { unique: true });

// Pre-save middleware to construct _id if not provided
timeSlotSchema.pre('save', function(next) {
  if (!this._id) {
    this._id = `${this.teacherId}-${this.day}-${this.startTime}-${this.endTime}`;
  }
  next();
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

// Ensure indexes are created
TimeSlot.createIndexes().catch(console.error);

export default TimeSlot;
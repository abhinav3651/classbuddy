import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
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
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: Number,
    default: 0 // Higher number means higher priority
  },
  requestTime: {
    type: Date,
    default: Date.now
  },
  purpose: {
    type: String,
    required: true
  },
  studentYear: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  isStaffMember: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to calculate priority
requestSchema.methods.calculatePriority = function() {
  let priority = 0;
  
  // Staff members get highest priority
  if (this.isStaffMember) {
    priority += 100;
  }
  
  // Senior students get higher priority
  priority += this.studentYear * 10;
  
  // First come first serve - earlier requests get higher priority
  // Convert time difference to hours and add to priority
  const timeDiff = Date.now() - this.requestTime.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  priority += hoursDiff;
  
  return priority;
};

const Request = mongoose.model('Request', requestSchema);
export default Request; 
import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Lecture Theater', 'Lab', 'Classroom'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    slots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      subject: String,
      teacher: String,
      section: String,
      department: String
    }]
  }]
});

const Classroom = mongoose.model('Classroom', classroomSchema);
export default Classroom; 
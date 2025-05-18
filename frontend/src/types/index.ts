// Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

// Slot & Schedule Types
export interface TimeSlot {
  _id: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  isAvailable: boolean;
}

export interface SlotRequest {
  _id: string;
  slotId: string;
  studentId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  purpose: string;
  studentDetails: string;
  subject: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  _id: string;
  name: string;
  subject?: string;
}

// Socket Message Types
export interface SocketMessage {
  type: string;
  payload: any;
}

export interface TimetableSlot {
  teacher: string;
  subject: string;
  location: string;
  startTime: string;
  endTime: string;
}
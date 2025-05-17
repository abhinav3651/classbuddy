// Authentication Types
export interface User {
  id: string;
  name: string;
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
  id: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  location: string;
  isAvailable: boolean;
}

export interface SlotRequest {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
}

// Socket Message Types
export interface SocketMessage {
  type: string;
  payload: any;
}
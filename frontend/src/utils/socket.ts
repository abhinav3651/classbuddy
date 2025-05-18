import { io } from 'socket.io-client';
import { API_URL, SOCKET_EVENTS } from './constants';
import { User } from '../types';

const socket = io(API_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

// Initialize socket connection
export const initSocket = () => {
  // Setup connection event listeners
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('Socket connected');
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

// Join user to their specific room based on userId and role
export const joinUserRoom = (user: User) => {
  socket.emit(SOCKET_EVENTS.JOIN, {
    userId: user.id,
    role: user.role,
  });
};

// Request a slot (student)
export const emitSlotRequest = (requestData: {
  slotId: string;
  teacherId: string;
  studentId: string;
  day: string;
  startTime: string;
  endTime: string;
}) => {
  socket.emit(SOCKET_EVENTS.REQUEST_SLOT, requestData);
};

export interface RequestResponseData {
  requestId: string;
  studentId: string;
  status: 'accepted' | 'rejected';
  teacherName: string;
  subject: string;
  startTime: string;
  endTime: string;
}

// Respond to a slot request (teacher)
export const emitRequestResponse = (data: RequestResponseData) => {
  socket.emit(SOCKET_EVENTS.REQUEST_RESPONSE, data);
};

// Add event listener
export const addSocketListener = (event: string, callback: (data: any) => void) => {
  socket.on(event, callback);
};

// Remove event listener
export const removeSocketListener = (event: string) => {
  socket.off(event);
};

// Disconnect socket
export const disconnectSocket = () => {
  socket.disconnect();
};

export const joinRoom = (userId: string) => {
  socket.emit('join', { userId });
};

export default socket;
import { io, Socket } from 'socket.io-client';
import { API_URL, SOCKET_EVENTS } from './constants';
import { User } from '../types';

let socket: Socket | null = null;

// Initialize socket connection
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

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
  }

  return socket;
};

// Join user to their specific room based on userId and role
export const joinUserRoom = (user: User) => {
  if (!socket) {
    initSocket();
  }

  socket?.emit(SOCKET_EVENTS.JOIN, {
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
  socket?.emit(SOCKET_EVENTS.REQUEST_SLOT, requestData);
};

// Respond to a slot request (teacher)
export const emitRequestResponse = (responseData: {
  requestId: string;
  studentId: string;
  status: 'accepted' | 'rejected';
}) => {
  socket?.emit(SOCKET_EVENTS.REQUEST_RESPONSE, responseData);
};

// Add event listener
export const addSocketListener = (event: string, callback: (data: any) => void) => {
  socket?.on(event, callback);
};

// Remove event listener
export const removeSocketListener = (event: string, callback?: (data: any) => void) => {
  if (callback) {
    socket?.off(event, callback);
  } else {
    socket?.off(event);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  joinUserRoom,
  emitSlotRequest,
  emitRequestResponse,
  addSocketListener,
  removeSocketListener,
  disconnectSocket,
};
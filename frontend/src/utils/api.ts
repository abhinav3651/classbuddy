import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants';
import { SlotRequest, TimeSlot, Teacher } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
export const loginUser = async (email: string, password: string, role: string) => {
  try {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  } catch (error: any) {
    // Check if it's a network error
    if (!error.response) {
      throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
    }
    // Handle specific API errors
    if (error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    // Handle other HTTP errors
    throw new Error(`Login failed: ${error.response.status === 401 ? 'Invalid credentials' : 'An unexpected error occurred'}`);
  }
};

// Student API calls
export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get('/teachers');
  return response.data;
};

export const getAvailability = async (teacherId: string, day: string): Promise<TimeSlot[]> => {
  const response = await api.get(`/availability/${teacherId}/${day}`);
  return response.data;
};

export const requestSlot = async (slotId: string, teacherId: string, day: string, startTime: string, endTime: string): Promise<SlotRequest> => {
  const response = await api.post('/request-slot', {
    slotId,
    teacherId,
    day,
    startTime,
    endTime
  });
  return response.data;
};

export const getStudentRequests = async (): Promise<SlotRequest[]> => {
  const response = await api.get('/slots/student/requests');
  return response.data;
};

// Teacher API calls
export const getTeacherRequests = async (): Promise<SlotRequest[]> => {
  const response = await api.get('/teacher/requests');
  return response.data;
};

export const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<SlotRequest> => {
  const response = await api.post(`/respond-request/${requestId}`, { status });
  return response.data;
};

// Error handling
export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || 'An error occurred with the server response';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unknown error occurred';
  }
};

export const getTimetableTeachers = async (): Promise<string[]> => {
  const response = await api.get('/timetable/teachers');
  return response.data;
};
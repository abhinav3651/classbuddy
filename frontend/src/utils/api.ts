import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants';
import { SlotRequest, TimeSlot, Teacher, TimetableSlot } from '../types';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const loginUser = async (email: string, password: string, role: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password, role });
    return response.data;
  } catch (error: any) {
    if (!error.response) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    throw new Error(error.response.data?.message || 'Login failed');
  }
};

// Get all teachers
export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await api.get('/api/teachers');
  return response.data;
};

// Get timetable data
export const getTimetable = async () => {
  const response = await api.get('/api/timetable');
  return response.data;
};

// Get teacher availability from timetable
export const getAvailability = async (teacherId: string, day: string): Promise<TimeSlot[]> => {
  try {
    const response = await api.get(`/api/slots/availability/${teacherId}/${day}`);
    return response.data;
  } catch (error) {
    console.error('Error getting availability:', error);
    return [];
  }
};

export const requestSlot = async (
  teacherId: string,
  day: string,
  startTime: string,
  endTime: string,
  purpose: string,
  studentDetails: string
): Promise<SlotRequest> => {
  const response = await api.post('/api/slots/request-slot', {
    teacherId,
    day,
    startTime,
    endTime,
    purpose,
    studentDetails
  });
  return response.data;
};

export const getStudentRequests = async (): Promise<SlotRequest[]> => {
  const response = await api.get('/api/slots/student/requests');
  return response.data;
};

// Teacher API calls
export const getTeacherRequests = async (): Promise<SlotRequest[]> => {
  const response = await api.get('/api/slots/teacher/requests');
  return response.data;
};

export const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected'): Promise<SlotRequest> => {
  const response = await api.put(`/api/slots/respond-request/${requestId}`, { status });
  return response.data;
};

// Get timetable teachers
export const getTimetableTeachers = async (): Promise<TimetableSlot[]> => {
  const response = await api.get('/api/timetable');
  return response.data.flatMap((day: { slots: TimetableSlot[] }) => day.slots);
};

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { requireAuth = true, ...fetchOptions } = options;
  
  // Get the token from localStorage if authentication is required
  const token = requireAuth ? localStorage.getItem(TOKEN_KEY) : null;
  
  const headers = new Headers(fetchOptions.headers);
  
  // Add auth header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Add default headers
  headers.set('Content-Type', 'application/json');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    // Redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
};
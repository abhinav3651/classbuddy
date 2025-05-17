// API Endpoints
export const API_URL = 'http://localhost:5000/api'; // Local backend URL

// Local Storage Keys
export const TOKEN_KEY = 'slot_selector_token';
export const USER_KEY = 'slot_selector_user';

// Days of the week
export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

// Time slots
export const TIME_SLOTS = [
  { label: '8:00-9:50', value: '8:00-9:50' },
  { label: '10:10-11:55', value: '10:10-11:55' },
  { label: '12:00-12:55', value: '12:00-12:55' },
  { label: '1:00-1:55', value: '1:00-1:55' },
  { label: '2:00-3:55', value: '2:00-3:55' },
  { label: '4:00-5:00', value: '4:00-5:00' },
];

// Subject codes and names (based on the image)
export const SUBJECTS = [
  { code: 'CS-601', name: 'Computer Graphics' },
  { code: 'CS-611', name: 'Software Engineering' },
  { code: 'CS-603', name: 'Computer Networks-I' },
  { code: 'CS-605', name: 'Full Stack Web Development' },
  { code: 'OC-601', name: 'Competitive Programming Audit Course' },
  { code: 'OCS-601', name: 'Image Processing and Computer Vision' },
  { code: 'CS-651', name: 'DevOps on Cloud' },
  { code: 'CS-655', name: 'Network and System Security' },
  { code: 'CS-659', name: 'Sourcing and Staffing' },
];

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN: 'join',
  REQUEST_SLOT: 'requestSlot',
  REQUEST_RESPONSE: 'requestResponse',
  NEW_REQUEST: 'newRequest',
};
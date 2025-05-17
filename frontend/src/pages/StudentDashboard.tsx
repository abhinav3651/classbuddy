import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import Layout from '../components/Layout';
import SlotCard from '../components/SlotCard';
import NotificationToast from '../components/NotificationToast';
import { useAuth } from '../context/AuthContext';
import { requestSlot, getStudentRequests, getTimetableTeachers } from '../utils/api';
import { addSocketListener, emitSlotRequest, removeSocketListener } from '../utils/socket';
import { DAYS } from '../utils/constants';
import {  TimeSlot, SlotRequest } from '../types';
import { SOCKET_EVENTS } from '../utils/constants';

const StudentDashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // State variables
  const [teachers, setTeachers] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [myRequests, setMyRequests] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Handler for socket request response - moved before useEffect and added useCallback
  const handleRequestResponse = useCallback((data: { requestId: string; status: 'pending' | 'accepted' | 'rejected' }) => {
    setMyRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === data.requestId ? { ...req, status: data.status } : req
      )
    );
    setNotification({
      message: `Your request has been ${data.status} by the teacher.`,
      type: data.status === 'accepted' ? 'success' : 'info',
    });
  }, []);

  // Fetch teachers on component mount - updated dependency array
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersList = await getTimetableTeachers();
        setTeachers(teachersList);
        if (teachersList.length > 0) {
          setSelectedTeacher(teachersList[0]);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setNotification({
          message: 'Failed to load teachers. Please try again.',
          type: 'error',
        });
      }
    };

    fetchTeachers();
    loadStudentRequests();

    addSocketListener(SOCKET_EVENTS.REQUEST_RESPONSE, handleRequestResponse);

    return () => {
      removeSocketListener(SOCKET_EVENTS.REQUEST_RESPONSE, handleRequestResponse);
    };
  }, [handleRequestResponse]); // Added dependency

  // Load student's requests
  const loadStudentRequests = async () => {
    try {
      const requests = await getStudentRequests();
      setMyRequests(requests);
    } catch (error) {
      console.error('Error fetching student requests:', error);
    }
  };

  // Early return for null user - moved to render section
  if (!user) {
    return (
      <Layout title="Student Dashboard">
        <NotificationToast
          message="User not logged in"
          type="error"
          onClose={() => setNotification(null)}
        />
      </Layout>
    );
  }

  // Check availability for selected teacher and day
  const checkAvailability = async () => {
    if (!selectedTeacher || !selectedDay) {
      setNotification({
        message: 'Please select both a teacher and a day.',
        type: 'error',
      });
      return;
    }
    setLoading(true);
    try {
      // Fetch the full timetable
      const response = await fetch('http://localhost:5000/api/timetable');
      const timetable = await response.json();
      // Find the selected day
      const dayData = timetable.find((d: any) => d.day.toLowerCase() === selectedDay.toLowerCase());
      // Filter slots for the selected teacher
      let slots = [];
      if (dayData) {
        slots = dayData.slots.filter((slot: any) => slot.teacher === selectedTeacher);
      }
      setAvailableSlots(slots);
    } catch (error) {
      setNotification({
        message: 'Failed to load availability. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Updated handleRequestSlot with proper user null handling
  const handleRequestSlot = async (slotId: string) => {
    if (!user) return;
    
    const slot = availableSlots.find((s) => s.id === slotId);
    if (!slot) return;

    try {
      const request = await requestSlot(
        slotId,
        selectedTeacher,
        selectedDay,
        slot.startTime,
        slot.endTime
      );

      emitSlotRequest({
        slotId,
        teacherId: selectedTeacher,
        studentId: user.id, // Now safe due to early return
        day: selectedDay,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      setMyRequests([request, ...myRequests]);
      setNotification({
        message: 'Slot request sent successfully!',
        type: 'success',
      });

      checkAvailability();
    } catch (error) {
      console.error('Error requesting slot:', error);
      setNotification({
        message: 'Failed to request slot. Please try again.',
        type: 'error',
      });
    }
  };

  // THE REST OF THE COMPONENT REMAINS EXACTLY THE SAME
  return (
    <Layout title="Student Dashboard">
      <div className="mb-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
            Find Available Slots
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="teacher"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Select Teacher
              </label>
              <select
                id="teacher"
                name="teacher"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="day"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Select Day
              </label>
              <select
                id="day"
                name="day"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={checkAvailability}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  'Check Availability'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Available Slots</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                item={slot}
                type="availability"
                onAction={handleRequestSlot}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Requests */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">My Requests</h2>
        {myRequests.length === 0 ? (
          <div className="py-8 text-center border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500">You haven't made any requests yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myRequests.map((request) => (
              <SlotCard
                key={request.id}
                item={request}
                type="request"
              />
            ))}
          </div>
        )}
      </div>

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Layout>
  );
};

export default StudentDashboard;
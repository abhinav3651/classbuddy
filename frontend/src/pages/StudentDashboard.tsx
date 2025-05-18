import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getTimetableTeachers, getTeachers, getAvailability } from '../utils/api';
import { DAYS } from '../utils/constants';
import { TimeSlot, Teacher, TimetableSlot } from '../types';
import RequestMeeting from '../components/RequestMeeting';
import NotificationToast from '../components/NotificationToast';
import { addSocketListener, removeSocketListener, joinRoom } from '../utils/socket';
import { SOCKET_EVENTS } from '../utils/constants';
import { RequestResponseData } from '../utils/socket';
import { toast } from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // State variables
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Load teachers from the database
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true);
        const teachersData = await getTeachers();
        setTeachers(teachersData);
        if (teachersData.length > 0) {
          setSelectedTeacher(teachersData[0]);
        }
      } catch (err) {
        setError('Failed to load teachers');
        console.error('Error loading teachers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);

  // Load available slots when teacher or day changes
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedTeacher || !selectedDay) return;

      try {
        setLoading(true);
        const slots = await getAvailability(selectedTeacher._id, selectedDay);
        setAvailableSlots(slots);
      } catch (err) {
        setError('Failed to load availability');
        console.error('Error loading availability:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [selectedTeacher, selectedDay]);

  useEffect(() => {
    if (!user) return;

    // Join user's room for notifications
    joinRoom(user.id);

    // Listen for request responses
    const handleRequestResponse = (data: RequestResponseData) => {
      const message = `Your meeting request with ${data.teacherName} has been ${data.status}`;
      if (data.status === 'accepted') {
        toast.success(message);
      } else {
        toast.error(message);
      }
    };

    addSocketListener(SOCKET_EVENTS.REQUEST_RESPONSE, handleRequestResponse);

    return () => {
      removeSocketListener(SOCKET_EVENTS.REQUEST_RESPONSE);
    };
  }, [user]);

  const handleTeacherSelect = (teacher: Teacher | null) => {
    setSelectedTeacher(teacher);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleRequestComplete = async () => {
    setSelectedSlot(null);
    if (selectedTeacher) {
      try {
        const slots = await getAvailability(selectedTeacher._id, selectedDay);
        setAvailableSlots(slots);
      } catch (err) {
        setError('Failed to refresh availability');
        console.error('Error refreshing availability:', err);
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Student Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-8">
        {/* Teachers List */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Teacher</h2>
          <select
            value={selectedTeacher?._id || ''}
            onChange={(e) => {
              const teacher = teachers.find(t => t._id === e.target.value);
              handleTeacherSelect(teacher || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </section>

        {/* Day Selection */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Day</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-md ${
                  selectedDay === day
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </section>

        {/* Available Slots */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Free Slots</h2>
          <div className="grid gap-4">
            {availableSlots.length === 0 ? (
              <p className="text-gray-500">No free slots available for this day</p>
            ) : (
              availableSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="p-4 rounded-lg border border-green-200 bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{slot.startTime} - {slot.endTime}</p>
                      <p className="text-sm text-green-600">Free Slot</p>
                      <p className="text-xs text-gray-500 mt-1">
                        This slot is available for meeting requests
                      </p>
                    </div>
                    <button
                      onClick={() => handleSlotSelect(slot)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Request Meeting
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error}</p>
          </div>
        )}

        {selectedTeacher && selectedSlot && (
          <RequestMeeting
            teacherId={selectedTeacher._id}
            teacherName={selectedTeacher.name}
            slot={selectedSlot}
            onRequestComplete={handleRequestComplete}
            onCancel={() => setSelectedSlot(null)}
          />
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
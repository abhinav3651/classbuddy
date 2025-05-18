import React, { useState } from 'react';
import { TimeSlot } from '../types';
import { requestSlot } from '../utils/api';

interface RequestMeetingProps {
  teacherId: string;
  teacherName: string;
  slot: TimeSlot;
  onRequestComplete: () => void;
  onCancel: () => void;
}

const RequestMeeting: React.FC<RequestMeetingProps> = ({
  teacherId,
  teacherName,
  slot,
  onRequestComplete,
  onCancel
}) => {
  const [purpose, setPurpose] = useState('');
  const [studentDetails, setStudentDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !studentDetails.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await requestSlot(
        teacherId,
        slot.day,
        slot.startTime,
        slot.endTime,
        purpose,
        studentDetails
      );
      onRequestComplete();
    } catch (err) {
      setError('Failed to send request. Please try again.');
      console.error('Error sending request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Meeting</h2>
        
        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-medium">Teacher:</span> {teacherName}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Time:</span> {slot.startTime} - {slot.endTime}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Day:</span> {slot.day}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Purpose of Meeting
            </label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Please describe the purpose of your meeting request..."
              required
            />
          </div>

          <div>
            <label htmlFor="studentDetails" className="block text-sm font-medium text-gray-700">
              Your Details
            </label>
            <input
              type="text"
              id="studentDetails"
              value={studentDetails}
              onChange={(e) => setStudentDetails(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., BTech CSE 6th Semester, Section A"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestMeeting; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

interface Booking {
  _id: string;
  userId: string;
  userType: 'student' | 'teacher' | 'hod';
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

const SeminarHall: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newBooking, setNewBooking] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seminar/bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setError('Failed to fetch bookings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to make a booking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/seminar/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          userType: user.role.toLowerCase(),
          ...newBooking
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      setNewBooking({
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
      });
      fetchBookings();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (userType: string) => {
    switch (userType) {
      case 'student':
        return 'Priority 1';
      case 'teacher':
        return 'Priority 2';
      case 'hod':
        return 'Priority 3';
      default:
        return 'Unknown';
    }
  };

  return (
    <Layout title="Seminar Hall Booking">
      <div className="container mx-auto px-4 py-8">
        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">New Booking Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={newBooking.startTime}
                  onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={newBooking.endTime}
                  onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                value={newBooking.purpose}
                onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </form>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4">{booking.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityLabel(booking.userType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SeminarHall; 
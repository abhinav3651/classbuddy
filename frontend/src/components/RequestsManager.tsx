import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

interface Request {
  _id: string;
  student: {
    name: string;
    email: string;
  };
  slot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: number;
  studentYear: number;
  isStaffMember: boolean;
  requestTime: string;
}

const RequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/requests/teacher');
      setRequests(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/api/requests/${requestId}/status`, { status });
      // Refresh requests after update
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Meeting Requests</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {request.student.name}
                    {request.isStaffMember && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Staff Member
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{request.student.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Year {request.studentYear}
                  </p>
                  <p className="text-xs text-gray-500">
                    Priority Score: {request.priority.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requested Slot:</span>{' '}
                  {new Date(request.slot.date).toLocaleDateString()} at{' '}
                  {request.slot.startTime} - {request.slot.endTime}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Purpose:</span> {request.purpose}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Requested on: {new Date(request.requestTime).toLocaleString()}
                </p>
              </div>

              {request.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'approved')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status !== 'pending' && (
                <div className={`text-sm font-medium ${
                  request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsManager; 
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SlotCard from '../components/SlotCard';
import NotificationToast from '../components/NotificationToast';
import { useAuth } from '../context/AuthContext';
import { getTeacherRequests, respondToRequest } from '../utils/api';
import { addSocketListener, emitRequestResponse, removeSocketListener } from '../utils/socket';
import { SlotRequest } from '../types';
import { SOCKET_EVENTS } from '../utils/constants';

const TeacherDashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // State variables
  const [requests, setRequests] = useState<SlotRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Fetch requests on component mount
  useEffect(() => {
    loadRequests();

    // Set up socket listener for new requests
    addSocketListener(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);

    return () => {
      removeSocketListener(SOCKET_EVENTS.NEW_REQUEST);
    };
  }, []);

  // Load teacher's requests
  const loadRequests = async () => {
    setLoading(true);
    try {
      const requestsList = await getTeacherRequests();
      setRequests(requestsList);
    } catch (error) {
      console.error('Error fetching teacher requests:', error);
      setNotification({
        message: 'Failed to load requests. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for new request socket event
  const handleNewRequest = (data: SlotRequest) => {
    setRequests((prevRequests) => [data, ...prevRequests]);
    setNotification({
      message: `New slot request from ${data.studentName}`,
      type: 'info',
    });
  };

  // Respond to a request (accept/reject)
  const handleRespond = async (requestId: string, action: string) => {
    if (!user) return;

    const status = action === 'accept' ? 'accepted' : 'rejected';
    try {
      const updatedRequest = await respondToRequest(requestId, status);

      // Find the student ID from the request
      const request = requests.find((r) => r.id === requestId);
      if (!request) return;

      // Emit socket event
      emitRequestResponse({
        requestId,
        studentId: request.studentId,
        status,
      });

      // Update UI
      setRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === requestId ? { ...req, status } : req))
      );

      setNotification({
        message: `Request ${status} successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error(`Error ${status} request:`, error);
      setNotification({
        message: `Failed to ${action} request. Please try again.`,
        type: 'error',
      });
    }
  };

  // Group requests by status
  const pendingRequests = requests.filter((req) => req.status === 'pending');
  const acceptedRequests = requests.filter((req) => req.status === 'accepted');
  const rejectedRequests = requests.filter((req) => req.status === 'rejected');

  return (
    <Layout title="Teacher Dashboard">
      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-gray-50 py-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">No pending requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((request) => (
              <SlotCard
                key={request.id}
                item={request}
                type="request"
                onAction={handleRespond}
              />
            ))}
          </div>
        )}
      </div>

      {/* Responded Requests (Tabs) */}
      <div>
        <div className="sm:hidden">
          <label htmlFor="requestTabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="requestTabs"
            name="requestTabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            defaultValue="accepted"
          >
            <option value="accepted">Accepted Requests</option>
            <option value="rejected">Rejected Requests</option>
          </select>
        </div>
        
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                aria-current="page"
              >
                Accepted Requests
              </button>
              <button
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Rejected Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Accepted Requests Content */}
        <div className="mt-6">
          {acceptedRequests.length === 0 ? (
            <div className="bg-gray-50 py-8 text-center rounded-lg border border-gray-200">
              <p className="text-gray-500">No accepted requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedRequests.map((request) => (
                <SlotCard key={request.id} item={request} type="request" />
              ))}
            </div>
          )}
        </div>
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

export default TeacherDashboard;
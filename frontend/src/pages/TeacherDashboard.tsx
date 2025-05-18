import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SlotCard from '../components/SlotCard';
import NotificationToast from '../components/NotificationToast';
import { useAuth } from '../context/AuthContext';
import { getTeacherRequests, respondToRequest } from '../utils/api';
import { addSocketListener, emitRequestResponse, removeSocketListener, joinRoom } from '../utils/socket';
import { SOCKET_EVENTS } from '../utils/constants';
import { toast } from 'react-hot-toast';
import { SlotRequest } from '../types';
import RequestsManager from '../components/RequestsManager';

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

  // Load initial requests
  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Join user's room for notifications
    joinRoom(user.id);

    // Listen for new requests
    const handleNewRequest = (data: SlotRequest) => {
      setRequests(prev => [data, ...prev]);
      toast(`New meeting request from ${data.studentDetails}`);
    };

    addSocketListener(SOCKET_EVENTS.NEW_REQUEST, handleNewRequest);

    return () => {
      removeSocketListener(SOCKET_EVENTS.NEW_REQUEST);
    };
  }, [user]);

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

  // Respond to a request (accept/reject)
  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    if (!user) return;

    const status = action === 'accept' ? 'accepted' : 'rejected';
    try {
      await respondToRequest(requestId, status);

      // Update UI
      setRequests(prevRequests => 
        prevRequests.map(r => 
          r._id === requestId ? { ...r, status } : r
        )
      );

      // Emit socket event
      const request = requests.find(r => r._id === requestId);
      if (request) {
        emitRequestResponse({
          requestId,
          studentId: request.studentId,
          status,
          teacherName: user.name,
          subject: request.subject,
          startTime: request.startTime,
          endTime: request.endTime
        });
      }

      toast.success(`Successfully ${status} the request`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} the request`);
    }
  };

  // Group requests by status
  const pendingRequests = requests.filter((req) => req.status === 'pending');
  const acceptedRequests = requests.filter((req) => req.status === 'accepted');
  const rejectedRequests = requests.filter((req) => req.status === 'rejected');

  return (
    <Layout title="Teacher Dashboard">
      <div className="space-y-8">
        {/* Existing timetable/schedule components */}
        
        {/* Meeting Requests Section */}
        <section>
          <RequestsManager />
        </section>

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
                  key={request._id}
                  item={request}
                  type="request"
                  onAction={(id, action) => handleRespond(id, action as 'accept' | 'reject')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Accepted Requests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accepted Requests</h2>
          {acceptedRequests.length === 0 ? (
            <div className="bg-gray-50 py-8 text-center rounded-lg border border-gray-200">
              <p className="text-gray-500">No accepted requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedRequests.map((request) => (
                <SlotCard key={request._id} item={request} type="request" />
              ))}
            </div>
          )}
        </div>

        {/* Rejected Requests */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rejected Requests</h2>
          {rejectedRequests.length === 0 ? (
            <div className="bg-gray-50 py-8 text-center rounded-lg border border-gray-200">
              <p className="text-gray-500">No rejected requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedRequests.map((request) => (
                <SlotCard key={request._id} item={request} type="request" />
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
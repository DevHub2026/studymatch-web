/**
 * MATCH REQUESTS PAGE
 * 
 * View and manage all match requests (both received and sent)
 * 
 * Features:
 * - Tabbed interface (Received vs Sent requests)
 * - Accept or decline incoming requests
 * - Cancel sent requests
 * - View request status (pending, accepted, declined)
 * - Display match information and optional messages
 * 
 * How it works:
 * 1. User receives match requests from Partners page
 * 2. User can accept (creates active match) or decline requests
 * 3. User can view sent requests and cancel pending ones
 * 4. Accepted matches appear in Chat page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as matchRequestsApi from '../api/matchRequests';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function MatchRequestsPage() {
  const navigate = useNavigate();
  
  // State for received and sent requests
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Active tab state (received or sent)
  const [activeTab, setActiveTab] = useState('received');
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Action loading states (for individual requests)
  const [actionLoading, setActionLoading] = useState({});

  /**
   * Fetch all match requests on component mount
   * Separates received and sent requests
   */
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await matchRequestsApi.getMatchRequests();
        
        // Separate received vs sent requests
        setReceivedRequests(data.received || []);
        setSentRequests(data.sent || []);
      } catch (error) {
        console.error('Failed to fetch match requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  /**
   * Accept a match request
   * @param {number} requestId - ID of the request to accept
   */
  const handleAccept = async (requestId) => {
    // Set loading state for this specific request
    setActionLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      await matchRequestsApi.acceptMatchRequest(requestId);
      
      alert('Match request accepted! You can now chat with your new study partner.');
      
      // Remove from received requests list
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Optionally redirect to chat
      // navigate('/chat');
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  /**
   * Decline a match request
   * @param {number} requestId - ID of the request to decline
   */
  const handleDecline = async (requestId) => {
    if (!window.confirm('Are you sure you want to decline this request?')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      await matchRequestsApi.declineMatchRequest(requestId);
      
      alert('Match request declined.');
      
      // Remove from received requests list
      setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to decline request:', error);
      alert('Failed to decline request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  /**
   * Cancel a sent match request
   * @param {number} requestId - ID of the request to cancel
   */
  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      await matchRequestsApi.cancelMatchRequest(requestId);
      
      alert('Match request cancelled.');
      
      // Remove from sent requests list
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  /**
   * Get status badge styling based on request status
   * @param {string} status - Request status (pending, accepted, declined)
   * @returns {Object} Color classes for the badge
   */
  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
      accepted: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Accepted' },
      declined: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Declined' }
    };
    return badges[status] || badges.pending;
  };

  /**
   * Format date to relative time (e.g., "2 days ago")
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading requests...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon="🤝"
        title="Match Requests"
        subtitle="Manage your incoming and outgoing match requests"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {/* Received Tab */}
        <button
          onClick={() => setActiveTab('received')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'received'
              ? 'bg-purple-600 text-white'
              : 'bg-[#1a1d2e] text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Received ({receivedRequests.length})
        </button>

        {/* Sent Tab */}
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'sent'
              ? 'bg-purple-600 text-white'
              : 'bg-[#1a1d2e] text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Received Requests Tab Content */}
      {activeTab === 'received' && (
        <div>
          {receivedRequests.length === 0 ? (
            // Empty state - No received requests
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Received Requests</h3>
              <p className="text-gray-400 mb-6">
                You don't have any pending match requests. Keep your profile updated to attract study partners!
              </p>
              <Button onClick={() => navigate('/partners')}>
                Find Study Partners
              </Button>
            </Card>
          ) : (
            // Received requests list
            <div className="space-y-4">
              {receivedRequests.map(request => {
                const sender = request.sender || {};
                const status = getStatusBadge(request.status);

                return (
                  <Card key={request.id}>
                    <div className="flex items-start gap-4">
                      {/* Sender Avatar */}
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {sender.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        {/* Sender Name & Status */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {sender.name || 'Unknown User'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{sender.username || 'username'}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} uppercase`}>
                            {status.label}
                          </span>
                        </div>

                        {/* Sender Details */}
                        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-400">
                          {sender.institution && (
                            <div className="flex items-center gap-1">
                              <span>🏫</span>
                              <span>{sender.institution}</span>
                            </div>
                          )}
                          {sender.course && (
                            <div className="flex items-center gap-1">
                              <span>📚</span>
                              <span>{sender.course}</span>
                            </div>
                          )}
                        </div>

                        {/* Message (if provided) */}
                        {request.message && (
                          <div className="bg-[#0f1218] rounded-lg p-4 mb-3">
                            <p className="text-gray-300 text-sm italic">"{request.message}"</p>
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-gray-500 text-xs mb-3">
                          {formatDate(request.created_at)}
                        </p>

                        {/* Action Buttons - Only show for pending requests */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAccept(request.id)}
                              disabled={actionLoading[request.id]}
                            >
                              {actionLoading[request.id] ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDecline(request.id)}
                              disabled={actionLoading[request.id]}
                            >
                              {actionLoading[request.id] ? 'Declining...' : 'Decline'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests Tab Content */}
      {activeTab === 'sent' && (
        <div>
          {sentRequests.length === 0 ? (
            // Empty state - No sent requests
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Sent Requests</h3>
              <p className="text-gray-400 mb-6">
                You haven't sent any match requests yet. Browse partners and send connection requests!
              </p>
              <Button onClick={() => navigate('/partners')}>
                Find Study Partners
              </Button>
            </Card>
          ) : (
            // Sent requests list
            <div className="space-y-4">
              {sentRequests.map(request => {
                const receiver = request.receiver || {};
                const status = getStatusBadge(request.status);

                return (
                  <Card key={request.id}>
                    <div className="flex items-start gap-4">
                      {/* Receiver Avatar */}
                      <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {receiver.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        {/* Receiver Name & Status */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {receiver.name || 'Unknown User'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{receiver.username || 'username'}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} uppercase`}>
                            {status.label}
                          </span>
                        </div>

                        {/* Receiver Details */}
                        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-400">
                          {receiver.institution && (
                            <div className="flex items-center gap-1">
                              <span>🏫</span>
                              <span>{receiver.institution}</span>
                            </div>
                          )}
                          {receiver.course && (
                            <div className="flex items-center gap-1">
                              <span>📚</span>
                              <span>{receiver.course}</span>
                            </div>
                          )}
                        </div>

                        {/* Your Message (if provided) */}
                        {request.message && (
                          <div className="bg-[#0f1218] rounded-lg p-4 mb-3">
                            <p className="text-gray-500 text-xs mb-1">Your message:</p>
                            <p className="text-gray-300 text-sm italic">"{request.message}"</p>
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-gray-500 text-xs mb-3">
                          Sent {formatDate(request.created_at)}
                        </p>

                        {/* Cancel Button - Only show for pending requests */}
                        {request.status === 'pending' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(request.id)}
                            disabled={actionLoading[request.id]}
                          >
                            {actionLoading[request.id] ? 'Cancelling...' : 'Cancel Request'}
                          </Button>
                        )}

                        {/* Accepted Status Message */}
                        {request.status === 'accepted' && (
                          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                            <p className="text-green-300 text-sm">
                              ✅ Request accepted! You can now <button onClick={() => navigate('/chat')} className="underline hover:text-green-200">start chatting</button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
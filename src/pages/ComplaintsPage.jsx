/**
 * COMPLAINTS PAGE (Report User)
 * 
 * Report users for policy violations
 * 
 * Features:
 * - Submit complaints against other users
 * - Categories (harassment, inappropriate_behavior, spam, fake_profile, other)
 * - View submitted complaints with status
 * - Admin response display
 * - Warning banner about community safety
 * - Confirmation for false reports
 * - Status tracking (pending, under_review, resolved, dismissed)
 */

import { useState, useEffect } from 'react';
import * as complaintsApi from '../api/complaints';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [complaintForm, setComplaintForm] = useState({
    reported_user_id: '',
    category: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await complaintsApi.getMyComplaints();
        setComplaints(data.data || []);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintForm(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await complaintsApi.submitComplaint(
        parseInt(complaintForm.reported_user_id),
        complaintForm.category,
        complaintForm.description
      );
      
      setComplaints(prev => [response.complaint, ...prev]);
      
      setComplaintForm({
        reported_user_id: '',
        category: '',
        description: ''
      });
      setShowSubmitForm(false);
      
      alert('Complaint submitted successfully. Our team will review it promptly.');
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to submit complaint. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      harassment: '⚠️',
      inappropriate_behavior: '🚫',
      spam: '📧',
      fake_profile: '🎭',
      other: '📝'
    };
    return icons[category] || '❗';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      under_review: 'bg-blue-500',
      resolved: 'bg-green-500',
      dismissed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      under_review: '🔍',
      resolved: '✅',
      dismissed: '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="🚨"
        title="Report a User"
        subtitle="Help us maintain a safe and respectful community"
        action={
          <Button
            variant="danger"
            onClick={() => setShowSubmitForm(true)}
          >
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Report User</span>
            </span>
          </Button>
        }
      />

      {/* Warning Banner */}
      <Card className="mb-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🛡️</div>
          <div>
            <h3 className="text-lg font-bold text-red-100 mb-1">Community Safety</h3>
            <p className="text-red-200 text-sm mb-2">
              We take user safety seriously. Use this feature to report violations of our community guidelines:
            </p>
            <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
              <li>Harassment or threatening behavior</li>
              <li>Inappropriate or offensive content</li>
              <li>Spam or fraudulent activity</li>
              <li>Fake profiles or impersonation</li>
            </ul>
          </div>
        </div>
      </Card>

      {complaints.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Complaints Submitted</h3>
          <p className="text-gray-400">
            You haven't reported any users yet. If you encounter inappropriate behavior, don't hesitate to report it.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map(complaint => (
            <Card
              key={complaint.id}
              hover
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getCategoryIcon(complaint.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Complaint against {complaint.reported_user?.name || 'User'}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        @{complaint.reported_user?.username || 'username'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xl">{getStatusIcon(complaint.status)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(complaint.status)} uppercase`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="bg-red-600/50 text-red-100 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {complaint.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="flex items-center justify-between text-gray-400 text-xs">
                    <span>📅 {formatDate(complaint.created_at)}</span>
                    <span className="text-purple-400">Click to view details →</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Complaint Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-red-500/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Report a User
            </h3>

            <div className="bg-red-500/20 rounded-lg p-4 mb-4 border border-red-500/30">
              <p className="text-red-200 text-sm">
                <strong>Important:</strong> False reports may result in action against your account. 
                Only submit complaints for genuine violations of our community guidelines.
              </p>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-white mb-2">User ID to Report *</label>
                <input
                  type="number"
                  name="reported_user_id"
                  value={complaintForm.reported_user_id}
                  onChange={handleInputChange}
                  placeholder="Enter the user ID"
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <p className="text-gray-400 text-xs mt-1">
                  You can find the user ID in their profile or from match requests
                </p>
                {formErrors.reported_user_id && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.reported_user_id[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Violation Category *</label>
                <select
                  name="category"
                  value={complaintForm.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Select category...</option>
                  <option value="harassment">⚠️ Harassment or Threats</option>
                  <option value="inappropriate_behavior">🚫 Inappropriate Behavior</option>
                  <option value="spam">📧 Spam or Scam</option>
                  <option value="fake_profile">🎭 Fake Profile</option>
                  <option value="other">📝 Other Violation</option>
                </select>
                {formErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.category[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Detailed Description *</label>
                <textarea
                  name="description"
                  value={complaintForm.description}
                  onChange={handleInputChange}
                  placeholder="Provide specific details about the violation. Include dates, times, and specific messages or behaviors if applicable..."
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.description[0]}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowSubmitForm(false);
                    setComplaintForm({
                      reported_user_id: '',
                      category: '',
                      description: ''
                    });
                    setFormErrors({});
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-red-500/50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-3xl">
                  {getCategoryIcon(selectedComplaint.category)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Complaint Details
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(selectedComplaint.status)} uppercase`}>
                      {selectedComplaint.status.replace('_', ' ')}
                    </span>
                    <span className="bg-red-600/50 text-red-100 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {selectedComplaint.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-white text-2xl ml-4"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Reported User</h3>
                <p className="text-gray-200">
                  {selectedComplaint.reported_user?.name || 'User'} 
                  <span className="text-gray-400"> (@{selectedComplaint.reported_user?.username || 'username'})</span>
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Your Report</h3>
                <p className="text-gray-200 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.admin_notes && (
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-blue-200 font-semibold mb-2">Admin Response</h3>
                  <p className="text-blue-100 whitespace-pre-wrap">
                    {selectedComplaint.admin_notes}
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Submitted:</span>
                    <p className="text-white">{formatDate(selectedComplaint.created_at)}</p>
                  </div>
                  {selectedComplaint.resolved_at && (
                    <div>
                      <span className="text-gray-400">Resolved:</span>
                      <p className="text-white">{formatDate(selectedComplaint.resolved_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="danger"
              fullWidth
              className="mt-6"
              onClick={() => setSelectedComplaint(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
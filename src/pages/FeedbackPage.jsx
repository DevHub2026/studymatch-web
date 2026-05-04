/**
 * FEEDBACK PAGE
 * 
 * Submit and view feedback about the platform
 * 
 * Features:
 * - Submit feedback (type, rating, message)
 * - Feedback types (feature_request, bug_report, general, compliment)
 * - Star rating slider (1-5)
 * - View submitted feedback with status
 * - Admin response display
 * - Status badges (pending, reviewed, implemented, dismissed)
 */

import { useState, useEffect } from 'react';
import * as feedbackApi from '../api/feedback';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [feedbackForm, setFeedbackForm] = useState({
    type: '',
    message: '',
    rating: 5
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await feedbackApi.getMyFeedback();
        setFeedbackList(data.data || []);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await feedbackApi.submitFeedback(
        feedbackForm.type,
        feedbackForm.message,
        parseInt(feedbackForm.rating)
      );
      
      setFeedbackList(prev => [response.feedback, ...prev]);
      
      setFeedbackForm({
        type: '',
        message: '',
        rating: 5
      });
      setShowSubmitForm(false);
      
      alert('Feedback submitted successfully! Thank you for helping us improve.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      feature_request: '💡',
      bug_report: '🐛',
      general: '💬',
      compliment: '🌟'
    };
    return icons[type] || '📝';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      reviewed: 'bg-blue-500',
      implemented: 'bg-green-500',
      dismissed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="💭"
        title="Feedback"
        subtitle="Share your thoughts and help us improve StudyMatch"
        action={
          <Button onClick={() => setShowSubmitForm(true)}>
            <span className="flex items-center gap-2">
              <span>+</span>
              <span>Give Feedback</span>
            </span>
          </Button>
        }
      />

      {/* Info Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-lg font-bold text-blue-100 mb-1">We Value Your Input</h3>
            <p className="text-blue-200 text-sm">
              Your feedback helps us build a better study partner matching experience. 
              Whether it's a feature request, bug report, or general suggestion - we want to hear from you!
            </p>
          </div>
        </div>
      </Card>

      {feedbackList.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Feedback Submitted Yet</h3>
          <p className="text-gray-400 mb-6">
            Share your thoughts! Let us know what you love, what could be better, or any ideas you have.
          </p>
          <Button onClick={() => setShowSubmitForm(true)}>
            Submit Your First Feedback
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackList.map(feedback => (
            <Card key={feedback.id}>
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getTypeIcon(feedback.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-purple-600/50 text-purple-100 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                        {feedback.category.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(feedback.status)} uppercase`}>
                        {feedback.status}
                      </span>
                    </div>
                    
                    {feedback.rating && (
                      <div className="flex-shrink-0">
                        {renderStars(feedback.rating)}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-3">
                    <p className="text-gray-200 whitespace-pre-wrap">
                      {feedback.message}
                    </p>
                  </div>

                  {feedback.admin_notes && (
                    <div className="bg-blue-500/20 rounded-lg p-4 mb-3 border border-blue-500/30">
                      <h4 className="text-blue-200 font-semibold text-sm mb-1">Admin Response</h4>
                      <p className="text-blue-100 text-sm">
                        {feedback.admin_notes}
                      </p>
                    </div>
                  )}

                  <div className="text-gray-400 text-xs">
                    📅 Submitted on {formatDate(feedback.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Feedback Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-purple-500/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Submit Feedback
            </h3>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Feedback Type *</label>
                <select
                  name="type"
                  value={feedbackForm.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select type...</option>
                  <option value="feature_request">💡 Feature Request</option>
                  <option value="bug_report">🐛 Bug Report</option>
                  <option value="general">💬 General Feedback</option>
                  <option value="compliment">🌟 Compliment</option>
                </select>
                {formErrors.type && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.type[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">
                  Overall Rating (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="rating"
                    min="1"
                    max="5"
                    value={feedbackForm.rating}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {renderStars(parseInt(feedbackForm.rating))}
                  </div>
                  <span className="text-white font-bold">{feedbackForm.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Your Feedback *</label>
                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInputChange}
                  placeholder="Share your thoughts, ideas, or report issues..."
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                {formErrors.message && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.message[0]}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowSubmitForm(false);
                    setFeedbackForm({
                      type: '',
                      message: '',
                      rating: 5
                    });
                    setFormErrors({});
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
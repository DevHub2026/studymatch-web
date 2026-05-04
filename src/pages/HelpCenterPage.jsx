/**
 * HELP CENTER PAGE
 * 
 * Submit and track support tickets
 * 
 * Features:
 * - Submit new support tickets (subject, category, priority, description)
 * - View all submitted tickets
 * - Track ticket status (open, in_progress, resolved, closed)
 * - View admin responses
 * - FAQ section
 * - Category-based icons
 */

import { useState, useEffect } from 'react';
import * as helpCenterApi from '../api/helpCenter';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function HelpCenterPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await helpCenterApi.getMyTickets();
        setTickets(data.data || []);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      const response = await helpCenterApi.submitTicket(
        ticketForm.subject,
        ticketForm.category,
        ticketForm.description,
        ticketForm.priority
      );
      
      setTickets(prev => [response.ticket, ...prev]);
      
      setTicketForm({
        subject: '',
        category: '',
        description: '',
        priority: 'medium'
      });
      setShowSubmitForm(false);
      
      alert('Ticket submitted successfully! We\'ll get back to you soon.');
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Failed to submit ticket. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: '🆕',
      in_progress: '⏳',
      resolved: '✅',
      closed: '🔒'
    };
    return icons[status] || '📝';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technical: '🔧',
      account: '👤',
      matching: '🤝',
      general: '💬'
    };
    return icons[category] || '❓';
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
        <div className="text-white text-2xl">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="🆘"
        title="Help Center"
        subtitle="Get support from our team"
        action={
          <Button onClick={() => setShowSubmitForm(true)}>
            <span className="flex items-center gap-2">
              <span>+</span>
              <span>Submit Ticket</span>
            </span>
          </Button>
        }
      />

      {/* FAQ Section */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="text-lg font-bold text-blue-100 mb-2">Quick Help</h3>
            <div className="space-y-2 text-blue-200 text-sm">
              <p><strong>How do I find study partners?</strong> Go to Partners page and browse compatible matches.</p>
              <p><strong>How do I accept match requests?</strong> Check the Match Requests page for incoming requests.</p>
              <p><strong>Can't login?</strong> Use the "Forgot Password" link on the login page.</p>
            </div>
          </div>
        </div>
      </Card>

      {tickets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>
          <p className="text-gray-400 mb-6">
            You haven't submitted any support tickets yet. Need help? Submit a ticket and our team will assist you!
          </p>
          <Button onClick={() => setShowSubmitForm(true)}>
            Submit Your First Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Card
              key={ticket.id}
              hover
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getCategoryIcon(ticket.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xl">{getStatusIcon(ticket.status)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(ticket.status)} uppercase`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-purple-600/50 text-purple-100 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {ticket.category}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Priority: <span className="capitalize">{ticket.priority}</span>
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between text-gray-400 text-xs">
                    <span>📅 {formatDate(ticket.created_at)}</span>
                    <span className="text-purple-400">Click to view details →</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Ticket Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-purple-500/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Submit Support Ticket
            </h3>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={ticketForm.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                {formErrors.subject && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.subject[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Category *</label>
                <select
                  name="category"
                  value={ticketForm.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select category...</option>
                  <option value="technical">🔧 Technical Issue</option>
                  <option value="account">👤 Account Problem</option>
                  <option value="matching">🤝 Matching Issue</option>
                  <option value="general">💬 General Inquiry</option>
                </select>
                {formErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.category[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2">Priority</label>
                <select
                  name="priority"
                  value={ticketForm.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Description *</label>
                <textarea
                  name="description"
                  value={ticketForm.description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about your issue..."
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
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
                    setTicketForm({
                      subject: '',
                      category: '',
                      description: '',
                      priority: 'medium'
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
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-purple-500/50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-3xl">
                  {getCategoryIcon(selectedTicket.category)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(selectedTicket.status)} uppercase`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className="bg-purple-600/50 text-purple-100 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {selectedTicket.category}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Priority: <span className="capitalize">{selectedTicket.priority}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white text-2xl ml-4"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Description</h3>
                <p className="text-gray-200 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.admin_response && (
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <h3 className="text-green-200 font-semibold mb-2">Admin Response</h3>
                  <p className="text-green-100 whitespace-pre-wrap">
                    {selectedTicket.admin_response}
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                  {selectedTicket.resolved_at && (
                    <div>
                      <span className="text-gray-400">Resolved:</span>
                      <p className="text-white">{formatDate(selectedTicket.resolved_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              fullWidth
              className="mt-6"
              onClick={() => setSelectedTicket(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
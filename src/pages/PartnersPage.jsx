/**
 * PARTNERS PAGE
 * 
 * Find and connect with study partners based on matching criteria
 * 
 * Features:
 * - Search and filter partners by username, department, study style, etc.
 * - View match compatibility scores (0-100%)
 * - Send match requests with optional messages
 * - View partner details (subjects, preferences, availability)
 * - Profile completion reminder for better matches
 * 
 * How it works:
 * 1. User searches/filters for partners
 * 2. System shows compatible partners with match scores
 * 3. User can send connection requests
 * 4. Recipients see requests in Match Requests page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as partnersApi from '../api/partners';
import * as matchRequestsApi from '../api/matchRequests';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function PartnersPage() {
  // State for partners list from API
  const [partners, setPartners] = useState([]);
  
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  
  // Modal state for sending match requests
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    studyStyle: '',
    availability: '',
    subjects: ''
  });

  /**
   * Fetch partners from API on component mount
   * This runs once when the page loads
   */
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnersApi.getPotentialPartners();
        setPartners(data.potential_partners || []);
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  /**
   * Handle filter input changes
   * Updates the filters state when user types in search/filter fields
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Reset all filters to default values
   */
  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: '',
      studyStyle: '',
      availability: '',
      subjects: ''
    });
  };

  /**
   * Open the request modal for a specific partner
   * @param {Object} partner - The partner to send request to
   */
  const openRequestModal = (partner) => {
    setSelectedPartner(partner);
    setRequestMessage('');
    setShowRequestModal(true);
  };

  /**
   * Close the request modal and clear state
   */
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedPartner(null);
    setRequestMessage('');
  };

  /**
   * Send match request to selected partner
   * Includes optional message and updates UI
   */
  const handleSendRequest = async () => {
    if (!selectedPartner) return;

    setSendingRequest(true);

    try {
      await matchRequestsApi.sendMatchRequest(selectedPartner.id, requestMessage);
      
      alert(`Request sent to ${selectedPartner.name}!`);
      
      // Remove partner from list (they're now pending)
      setPartners(prev => prev.filter(p => p.id !== selectedPartner.id));
      
      closeRequestModal();
    } catch (error) {
      console.error('Failed to send request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  /**
   * Calculate and display match score with color coding
   * @param {number} score - Match score (0-100)
   * @returns {Object} Color class and label
   */
  const getMatchScoreColor = (score) => {
    if (score >= 80) return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Excellent Match' };
    if (score >= 60) return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Good Match' };
    if (score >= 40) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Fair Match' };
    return { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Low Match' };
  };

  /**
   * Filter partners based on current filter state
   * Applies search and filter criteria to the partners list
   */
  const filteredPartners = partners.filter(partner => {
    // Search filter (username or name)
    if (filters.search && !partner.username?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !partner.name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Department filter
    if (filters.department && partner.institution !== filters.department) {
      return false;
    }

    // Study style filter
    if (filters.studyStyle && partner.learning_style !== filters.studyStyle) {
      return false;
    }

    // Availability filter
    if (filters.availability && partner.preferred_study_time !== filters.availability) {
      return false;
    }

    // Subjects filter
    if (filters.subjects) {
      const partnerSubjects = partner.study_subjects ? JSON.parse(partner.study_subjects) : [];
      if (!partnerSubjects.some(subject => subject.toLowerCase().includes(filters.subjects.toLowerCase()))) {
        return false;
      }
    }

    return true;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading partners...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon="👥"
        title="Find Study Partners"
        subtitle="Matched based on your week & strong subjects"
      />

      {/* Filter Section */}
      <Card className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔍</span>
          <h3 className="text-xl font-bold text-white">Filter Partners</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by username */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Search username...</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Department filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">All Departments</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
            </select>
          </div>

          {/* Study style filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">All Study Styles</label>
            <select
              name="studyStyle"
              value={filters.studyStyle}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">All Study Styles</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading_writing">Reading/Writing</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>
          </div>

          {/* Availability filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">All Days</label>
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">All Time Blocks</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>

          {/* Subjects filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">All Subjects</label>
            <input
              type="text"
              name="subjects"
              value={filters.subjects}
              onChange={handleFilterChange}
              placeholder="e.g., Mathematics"
              className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              fullWidth
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Completion Warning */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-purple-200 mb-1">Complete your profile</h3>
            <p className="text-purple-300 text-sm mb-3">
              Complete your <Link to="/profile-setup" className="underline hover:text-purple-200">profile setup</Link> to get better matched
            </p>
          </div>
        </div>
      </Card>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        // Empty state - No partners found
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Partners Found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or check back later for new matches!
          </p>
        </Card>
      ) : (
        // Partners list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(partner => {
            const matchScore = partner.match_score || 0;
            const scoreStyle = getMatchScoreColor(matchScore);
            const subjects = partner.study_subjects ? JSON.parse(partner.study_subjects) : [];

            return (
              <Card key={partner.id} hover>
                {/* Partner Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {partner.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {partner.name || 'User'}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      @{partner.username || 'username'}
                    </p>
                    
                    {/* Match Score Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${scoreStyle.bg} ${scoreStyle.color}`}>
                      <span>{matchScore}% Match</span>
                      <span>•</span>
                      <span>{scoreStyle.label}</span>
                    </div>
                  </div>
                </div>

                {/* Partner Info */}
                <div className="space-y-3 mb-4">
                  {/* Institution */}
                  {partner.institution && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">🏫</span>
                      <span className="text-gray-300">{partner.institution}</span>
                    </div>
                  )}

                  {/* Study Time */}
                  {partner.preferred_study_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">🕐</span>
                      <span className="text-gray-300 capitalize">
                        {partner.preferred_study_time.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Study Location */}
                  {partner.study_location_preference && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">📍</span>
                      <span className="text-gray-300 capitalize">
                        {partner.study_location_preference.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Study Subjects */}
                  {subjects.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                        {subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                            +{subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>Chat</span>
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => openRequestModal(partner)}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>🤝</span>
                    <span>Request</span>
                  </Button>
                </div>

                {/* Profile Incomplete Badge */}
                {!partner.profile_completed && (
                  <div className="mt-3 text-center">
                    <p className="text-gray-500 text-xs italic">
                      This user hasn't completed their profile yet
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Send Request Modal */}
      {showRequestModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-md w-full border border-purple-500/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              Send Match Request
            </h3>

            {/* Partner Info */}
            <div className="flex items-center gap-3 mb-4 p-4 bg-[#0f1218] rounded-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedPartner.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-semibold">{selectedPartner.name}</p>
                <p className="text-gray-400 text-sm">@{selectedPartner.username}</p>
              </div>
            </div>

            {/* Optional Message */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Add a message (optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd love to study together..."
                rows="4"
                className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={closeRequestModal}
                disabled={sendingRequest}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSendRequest}
                disabled={sendingRequest}
              >
                {sendingRequest ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/**
 * ANNOUNCEMENTS PAGE
 * 
 * View important announcements and updates from the StudyMatch team
 * 
 * Features:
 * - List of all announcements with priority levels
 * - Click to view full announcement details
 * - Priority badges (urgent, high, medium, low)
 * - Timestamp display
 * - Empty state when no announcements
 * - Read-only for students (admins can create)
 */

import { useState, useEffect } from 'react';
import * as announcementsApi from '../api/announcements';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await announcementsApi.getAnnouncements();
        setAnnouncements(data.data || []);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      urgent: '🚨',
      high: '⚠️',
      medium: 'ℹ️',
      low: '📌'
    };
    return icons[priority] || '📢';
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
        <div className="text-white text-2xl">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="📢"
        title="Announcements"
        subtitle="Important updates and notices from the StudyMatch team"
      />

      {announcements.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Announcements</h3>
          <p className="text-gray-400">
            There are no announcements at the moment. Check back later for updates!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <Card
              key={announcement.id}
              hover
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {getPriorityIcon(announcement.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {announcement.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(announcement.priority)} uppercase flex-shrink-0`}>
                      {announcement.priority}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {announcement.content}
                  </p>

                  <div className="flex items-center gap-4 text-gray-400 text-xs">
                    <span>📅 {formatDate(announcement.published_at || announcement.created_at)}</span>
                    <span className="text-purple-400">Click to read more →</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-2xl w-full border border-purple-500/50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-4xl">
                  {getPriorityIcon(selectedAnnouncement.priority)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedAnnouncement.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getPriorityColor(selectedAnnouncement.priority)} uppercase`}>
                      {selectedAnnouncement.priority}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatDate(selectedAnnouncement.published_at || selectedAnnouncement.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-gray-400 hover:text-white text-2xl ml-4"
              >
                ×
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-6 mb-4">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.content}
              </p>
            </div>

            <Button
              fullWidth
              onClick={() => setSelectedAnnouncement(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
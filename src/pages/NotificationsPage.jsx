/**
 * NOTIFICATIONS PAGE
 * 
 * View and manage all notifications
 * 
 * Features:
 * - List all notifications with unread count
 * - Mark single notification as read
 * - Mark all notifications as read
 * - Delete all notifications
 * - Type-based icons (match_request, message, announcement, system)
 * - Relative time formatting
 * - Unread indicator (purple dot)
 * - Empty state
 */

import { useState, useEffect } from 'react';
import * as notificationsApi from '../api/notifications';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState({});

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    setMarkingRead(prev => ({ ...prev, [notificationId]: true }));
    
    try {
      await notificationsApi.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingRead(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      alert('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      alert('Failed to mark all as read. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) {
      return;
    }
    
    try {
      await notificationsApi.deleteAllNotifications();
      setNotifications([]);
      alert('All notifications deleted');
    } catch (error) {
      console.error('Failed to delete notifications:', error);
      alert('Failed to delete notifications. Please try again.');
    }
  };

  const getNotificationIcon = (type) => {
  const icons = {
    match_request: '🤝',
    message: '💬',
    announcement: '📢',
    system: '⚙️',
    support: '🆘'  // Add this line
  };
  return icons[type] || '🔔';
};

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="🔔"
        title={
          <span className="flex items-center gap-3">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-lg bg-red-500 text-white px-3 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </span>
        }
        subtitle="Stay updated with your activity"
        action={
          notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAll}
              >
                Delete All
              </Button>
            </div>
          )
        }
      />

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔕</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Notifications</h3>
          <p className="text-gray-400">
            You're all caught up! New notifications will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`rounded-2xl p-4 border transition ${
                notification.is_read
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/10 border-purple-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className={`text-lg font-bold flex-1 ${
                      notification.is_read ? 'text-gray-300' : 'text-white'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </div>

                  <p className={`text-sm mb-2 ${
                    notification.is_read ? 'text-gray-400' : 'text-gray-300'
                  }`}>
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      {formatTime(notification.created_at)}
                    </span>

                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markingRead[notification.id]}
                        className="text-purple-400 hover:text-purple-300 text-xs font-semibold disabled:opacity-50"
                      >
                        {markingRead[notification.id] ? 'Marking...' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-blue-100 mb-1">Tip</h3>
              <p className="text-blue-200 text-sm">
                Click on notifications to mark them as read. You'll receive notifications for match requests, 
                messages, announcements, and important system updates.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
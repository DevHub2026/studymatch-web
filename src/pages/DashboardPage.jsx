/**
 * DASHBOARD PAGE
 * 
 * This is the main landing page after login.
 * Shows: Welcome message, stats, quick actions, and profile completion status
 * 
 * Features:
 * - Displays user stats (pending requests, active matches, notifications)
 * - Quick action buttons to navigate to key features
 * - Profile completion reminder if profile is not complete
 * - Loading state while fetching data
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../store/authStore';
import * as matchRequestsApi from '../api/matchRequests';
import * as notificationsApi from '../api/notifications';
import PageHeader from '../components/layout/PageHeader';

export default function DashboardPage() {
  // Get current user from localStorage
  const user = getUser();
  const navigate = useNavigate();
  
  // State management for stats
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeMatches: 0,
    unreadNotifications: 0
  });
  
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  /**
   * Fetch dashboard stats on component mount
   * This runs once when the page loads
   */
  useEffect(() => {
  const fetchStats = async () => {
    try {
      // Fetch notifications
      const notificationsData = await notificationsApi.getNotifications();
      
      // Safely get unread count
      const notifications = notificationsData?.data || [];
      const unreadCount = Array.isArray(notifications) 
        ? notifications.filter(n => !n.is_read).length 
        : 0;
      
      setStats(prev => ({ ...prev, notifications: unreadCount }));
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values on error
      setStats(prev => ({ ...prev, notifications: 0 }));
    }
    
    try {
      // Fetch match requests
      const requestsData = await matchRequestsApi.getMatchRequests();
      
      // Safely get received requests count
      const received = requestsData?.received || [];
      const receivedCount = Array.isArray(received) ? received.length : 0;
      
      setStats(prev => ({ ...prev, matchRequests: receivedCount }));
    } catch (error) {
      console.error('Failed to fetch match requests:', error);
      setStats(prev => ({ ...prev, matchRequests: 0 }));
    }
    
    try {
      // Fetch active matches (accepted requests)
      const matchesData = await matchRequestsApi.getMatchRequests();
      
      // Count accepted requests
      const received = matchesData?.received || [];
      const sent = matchesData?.sent || [];
      const allRequests = [...(Array.isArray(received) ? received : []), ...(Array.isArray(sent) ? sent : [])];
      const activeCount = allRequests.filter(r => r.status === 'accepted').length;
      
      setStats(prev => ({ ...prev, activeMatches: activeCount }));
    } catch (error) {
      console.error('Failed to fetch active matches:', error);
      setStats(prev => ({ ...prev, activeMatches: 0 }));
    }
    
    // IMPORTANT: Set loading to false when done
    setLoading(false);
  };

  fetchStats();
}, []); // Empty dependency array means this runs only once on mount

  /**
   * Quick action buttons configuration
   * These are the main actions users can take from the dashboard
   */
  const quickActions = [
    {
      icon: '👥',
      title: 'Find Study Partners',
      description: 'Connect with study partners',
      path: '/partners',
      color: 'purple'
    },
    {
      icon: '📚',
      title: 'Browse Library',
      description: 'Access study resources',
      path: '/library',
      color: 'blue'
    },
    {
      icon: '📢',
      title: 'View Announcements',
      description: 'Check latest updates',
      path: '/announcements',
      color: 'green'
    },
    {
      icon: '🆘',
      title: 'Get Help',
      description: 'Contact support team',
      path: '/help',
      color: 'orange'
    }
  ];

  /**
   * Get color classes for quick action buttons
   * @param {string} color - Color name (purple, blue, green, orange)
   * @returns {string} Tailwind CSS classes for the button
   */
  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      green: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      orange: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
    };
    return colors[color] || colors.purple;
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header with welcome message */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}! 👋`}
        subtitle="Complete your profile to start matching with study partners!"
      />

      {/* Profile Completion Warning - Only show if profile is not complete */}
      {!user?.profile_completed && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            {/* Warning icon */}
            <div className="text-4xl">⚠️</div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-200 mb-2">Complete Your Profile</h3>
              <p className="text-yellow-100 mb-4">
                You need to complete your profile setup to start finding study partners.
              </p>
              
              {/* Call-to-action button */}
              <button
                onClick={() => navigate('/profile-setup')}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition"
              >
                Complete Profile Setup →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Shows key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Requests Card */}
        <Link 
          to="/requests" 
          className="bg-[#1a1d2e] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📬</div>
            <div className="text-4xl font-bold text-white group-hover:text-purple-400 transition">
              {stats.pendingRequests}
            </div>
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Pending Requests</h3>
          <p className="text-gray-500 text-sm">View incoming match requests</p>
        </Link>

        {/* Active Matches Card */}
        <Link 
          to="/chat" 
          className="bg-[#1a1d2e] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🤝</div>
            <div className="text-4xl font-bold text-white group-hover:text-purple-400 transition">
              {stats.activeMatches}
            </div>
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Active Matches</h3>
          <p className="text-gray-500 text-sm">Chat with your study partners</p>
        </Link>

        {/* Notifications Card */}
        <Link 
          to="/notifications" 
          className="bg-[#1a1d2e] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🔔</div>
            <div className="text-4xl font-bold text-white group-hover:text-purple-400 transition">
              {stats.unreadNotifications}
            </div>
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Notifications</h3>
          <p className="text-gray-500 text-sm">View unread notifications</p>
        </Link>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Map through quick action buttons */}
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className={`bg-gradient-to-br ${getColorClasses(action.color)} rounded-xl p-6 transition transform hover:scale-105 hover:shadow-xl`}
            >
              {/* Action icon */}
              <div className="text-4xl mb-3">{action.icon}</div>
              
              {/* Action title and description */}
              <h3 className="text-white font-bold text-lg mb-2">{action.title}</h3>
              <p className="text-white/80 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        
        <div className="bg-[#1a1d2e] rounded-xl p-8 border border-gray-700 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No Recent Activity</h3>
          <p className="text-gray-400">
            Start connecting with study partners to see your activity here!
          </p>
        </div>
      </div>
    </div>
  );
}
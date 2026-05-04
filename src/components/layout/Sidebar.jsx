import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../store/authStore';

// Sidebar component (left navigation panel)
export default function Sidebar() {

  // Gets current URL (used to highlight active menu)
  const location = useLocation();

  // Used to redirect user programmatically
  const navigate = useNavigate();

  // Get logged-in user from your auth store (localStorage or state)
  const user = getUser();

  // Handle logout button click
  const handleLogout = () => {
    // Confirm before logging out
    if (window.confirm('Are you sure you want to log out?')) {

      // Remove token + user from storage
      clearAuth();

      // Redirect to login page
      navigate('/login');
    }
  };

  // Main navigation items (top section)
  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/partners', icon: '👥', label: 'Partners' },
    { path: '/requests', icon: '🤝', label: 'Requests' },
    { path: '/chat', icon: '💬', label: 'Messages' },
    { path: '/library', icon: '📚', label: 'Library' },
    { path: '/announcements', icon: '📢', label: 'Announcements' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  // Support-related links (bottom section)
  const supportItems = [
    { path: '/help', icon: '🆘', label: 'Help Center' },
    { path: '/feedback', icon: '💭', label: 'Feedback' },
    { path: '/complaints', icon: '🚨', label: 'Report User' },
  ];

  // Check if current route matches item path
  // Used to highlight active menu
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-[#1a1d2e] h-screen flex flex-col fixed left-0 top-0">

      {/* ===================== LOGO ===================== */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            Study<span className="text-purple-400">Match</span>
          </span>
        </Link>
      </div>

      {/* ===================== MAIN NAVIGATION ===================== */}
      <nav className="flex-1 overflow-y-auto py-4">

        {/* Main menu list */}
        <div className="px-3 space-y-1">

          {/* Loop through navItems array */}
          {navItems.map((item) => (
            <Link
              key={item.path} // unique key for React
              to={item.path}  // route path

              // Dynamic styling:
              // if active → purple
              // else → gray with hover effect
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {/* Icon */}
              <span className="text-xl">{item.icon}</span>

              {/* Label */}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ===================== SUPPORT SECTION ===================== */}
        <div className="mt-6 px-3">

          {/* Section title */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Support
          </div>

          {/* Support menu list */}
          <div className="space-y-1">
            {supportItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ===================== USER FOOTER ===================== */}
      <div className="p-4 border-t border-gray-700">

        {/* User info */}
        <div className="flex items-center gap-3 mb-3">

          {/* Avatar (first letter of name) */}
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Name + Email */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
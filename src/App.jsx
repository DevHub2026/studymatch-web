import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './store/authStore';
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';

// Import all pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import PartnersPage from './pages/PartnersPage';
import MatchRequestsPage from './pages/MatchRequestsPage';
import ChatPage from './pages/ChatPage';
import ChatConversationPage from './pages/ChatConversationPage';
import LibraryPage from './pages/LibraryPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import FeedbackPage from './pages/FeedbackPage';
import ComplaintsPage from './pages/ComplaintsPage';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
}

function App() {
  const showSidebar = isAuthenticated(); // Only show sidebar when logged in

  return (
    <Router>
      {showSidebar && <Sidebar />} {/* Add sidebar here */}
      
      <Routes>
        {/* Public Routes - NO MainLayout wrapper */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<ProtectedRoute><VerifyEmailPage /></ProtectedRoute>} />

        {/* Protected Routes with MainLayout */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile-setup" element={<ProtectedRoute><MainLayout><ProfileSetupPage /></MainLayout></ProtectedRoute>} />
        <Route path="/partners" element={<ProtectedRoute><MainLayout><PartnersPage /></MainLayout></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><MainLayout><MatchRequestsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><MainLayout><ChatPage /></MainLayout></ProtectedRoute>} />
        <Route path="/chat/:partnerId" element={<ProtectedRoute><MainLayout><ChatConversationPage /></MainLayout></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><MainLayout><LibraryPage /></MainLayout></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><MainLayout><AnnouncementsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><MainLayout><HelpCenterPage /></MainLayout></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><MainLayout><FeedbackPage /></MainLayout></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute><MainLayout><ComplaintsPage /></MainLayout></ProtectedRoute>} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
/**
 * SETTINGS PAGE
 * 
 * Manage account settings and preferences
 * 
 * Features:
 * - Theme toggle (dark/light)
 * - Change password form
 * - Profile setup link
 * - Delete account with confirmation
 * - Privacy & notification settings (placeholders)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profile';
import { clearAuth } from '../store/authStore';
import { getTheme, saveTheme, applyTheme } from '../store/themeStore';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getTheme());
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    saveTheme(newTheme);
    applyTheme(newTheme);
    setTheme(newTheme);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordErrors({ new_password_confirmation: ['Passwords do not match'] });
      return;
    }
    
    setChangingPassword(true);
    setPasswordErrors({});
    
    try {
      await profileApi.updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      });
      
      alert('Password changed successfully!');
      
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    
    setDeleting(true);
    
    try {
      await profileApi.deleteAccount();
      
      clearAuth();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon="⚙️"
        title="Settings"
        subtitle="Manage your account preferences and security"
      />

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Theme</h3>
              <p className="text-gray-300 text-sm">Choose between light and dark mode</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="bg-[#0f1218] hover:bg-[#1a1d2e] border border-gray-700 px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
              <span className="text-white font-semibold capitalize">{theme}</span>
            </button>
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {passwordErrors.current_password && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.current_password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-white mb-2">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-400 text-xs mt-1">Must be at least 8 characters</p>
              {passwordErrors.new_password && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.new_password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                name="new_password_confirmation"
                value={passwordForm.new_password_confirmation}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              {passwordErrors.new_password_confirmation && (
                <p className="text-red-400 text-sm mt-1">{passwordErrors.new_password_confirmation[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </Card>

        {/* Account Management */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Account Management</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-semibold mb-1">Profile Setup</h3>
                <p className="text-gray-300 text-sm">Update your profile preferences and study settings</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile-setup')}
              >
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-semibold mb-1">Privacy & Data</h3>
                <p className="text-gray-300 text-sm">Manage your privacy settings and data preferences</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-semibold mb-1">Notifications</h3>
                <p className="text-gray-300 text-sm">Configure notification preferences</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30">
          <h2 className="text-2xl font-bold text-red-200 mb-4">Danger Zone</h2>
          
          <div className="bg-red-500/10 rounded-lg p-4">
            <h3 className="text-red-200 font-semibold mb-2">Delete Account</h3>
            <p className="text-red-300 text-sm mb-4">
              Once you delete your account, there is no going back. This action is permanent and will:
            </p>
            <ul className="text-red-300 text-sm space-y-1 mb-4 list-disc list-inside">
              <li>Delete all your data and messages</li>
              <li>Remove all your matches and conversations</li>
              <li>Cancel all pending match requests</li>
              <li>Remove all uploaded resources</li>
            </ul>
            
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete My Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-md w-full border border-red-500/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              Are you absolutely sure?
            </h3>
            
            <div className="bg-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm mb-3">
                This action <strong>cannot be undone</strong>. This will permanently delete your account 
                and remove all your data from our servers.
              </p>
              
              <p className="text-white text-sm mb-2">
                Please type <strong className="text-red-400">DELETE</strong> to confirm:
              </p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
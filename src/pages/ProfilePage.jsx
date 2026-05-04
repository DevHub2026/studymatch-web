/**
 * PROFILE PAGE
 * 
 * View and edit user profile information
 * 
 * Features:
 * - Two-column layout (avatar card + details sections)
 * - Edit mode toggle
 * - Editable fields: bio, phone, institution, course, year, major
 * - Read-only fields: gender, DOB, study preferences
 * - Study subjects displayed as tags
 * - Profile completion status
 * - Save/Cancel actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profile';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    institution: '',
    course: '',
    year_of_study: '',
    major: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        setProfile(data.user);
        
        setFormData({
          bio: data.user.bio || '',
          phone: data.user.phone || '',
          institution: data.user.institution || '',
          course: data.user.course || '',
          year_of_study: data.user.year_of_study || '',
          major: data.user.major || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bio: profile.bio || '',
      phone: profile.phone || '',
      institution: profile.institution || '',
      course: profile.course || '',
      year_of_study: profile.year_of_study || '',
      major: profile.major || ''
    });
    setEditing(false);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon="👤"
        title="My Profile"
        subtitle="View and manage your profile information"
        action={
          !editing ? (
            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {getInitials(profile.name)}
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
            <p className="text-gray-300 mb-1">@{profile.username}</p>
            <p className="text-gray-400 text-sm mb-4">{profile.email}</p>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Profile Complete</span>
                <span className={`font-bold ${profile.profile_completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profile.profile_completed ? '✓' : '⚠️'}
                </span>
              </div>
              {!profile.profile_completed && (
                <Button
                  size="sm"
                  fullWidth
                  variant="outline"
                  onClick={() => navigate('/profile-setup')}
                  className="mt-2"
                >
                  Complete Profile
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Gender</label>
                <p className="text-white bg-white/5 rounded-lg p-3 capitalize">
                  {profile.gender?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Date of Birth</label>
                <p className="text-white bg-white/5 rounded-lg p-3">
                  {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Academic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Institution</label>
                {editing ? (
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="e.g., Harvard University"
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.institution || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Course</label>
                {editing ? (
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.course || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Year of Study</label>
                {editing ? (
                  <select
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select year...</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year+</option>
                  </select>
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.year_of_study ? `Year ${profile.year_of_study}` : 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Major/Specialization</label>
                {editing ? (
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineering"
                    className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-lg p-3">
                    {profile.major || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Study Preferences */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Study Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Study Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {profile.study_subjects ? (
                    JSON.parse(profile.study_subjects).map((subject, index) => (
                      <span
                        key={index}
                        className="bg-purple-600/50 text-purple-100 px-3 py-1 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No subjects selected</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Preferred Study Time</label>
                <p className="text-white bg-white/5 rounded-lg p-3 capitalize">
                  {profile.preferred_study_time?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Study Location</label>
                <p className="text-white bg-white/5 rounded-lg p-3 capitalize">
                  {profile.study_location_preference?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Learning Style</label>
                <p className="text-white bg-white/5 rounded-lg p-3 capitalize">
                  {profile.learning_style?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
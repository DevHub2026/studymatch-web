import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as profileApi from '../api/profile';
import { saveAuth, getToken } from '../store/authStore';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data for all 4 steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    bio: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    
    // Step 2: Academic Info
    institution: '',
    course: '',
    year_of_study: '',
    major: '',
    
    // Step 3: Study Preferences
    study_subjects: [],
    preferred_study_time: '',
    study_location_preference: '',
    learning_style: '',
    
    // Step 4: Matching Preferences
    partner_gender_preference: '',
    partner_year_preference: '',
    max_partners: 5,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle subject selection (checkboxes)
  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      study_subjects: prev.study_subjects.includes(subject)
        ? prev.study_subjects.filter(s => s !== subject)
        : [...prev.study_subjects, subject]
    }));
  };

  // Submit current step
  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let response;
      
      if (currentStep === 1) {
        response = await profileApi.updateProfileStep1({
          bio: formData.bio,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
        });
      } else if (currentStep === 2) {
        response = await profileApi.updateProfileStep2({
          institution: formData.institution,
          course: formData.course,
          year_of_study: parseInt(formData.year_of_study),
          major: formData.major,
        });
      } else if (currentStep === 3) {
        response = await profileApi.updateProfileStep3({
          study_subjects: formData.study_subjects,
          preferred_study_time: formData.preferred_study_time,
          study_location_preference: formData.study_location_preference,
          learning_style: formData.learning_style,
        });
      } else if (currentStep === 4) {
        response = await profileApi.updateProfileStep4({
          partner_gender_preference: formData.partner_gender_preference,
          partner_year_preference: formData.partner_year_preference,
          max_partners: parseInt(formData.max_partners),
        });
        
        // Update auth store with completed profile
        saveAuth(getToken(), response.user);

        
        // Redirect to dashboard after final step
        navigate('/dashboard');
        return;
      }

      // Move to next step
      setCurrentStep(prev => prev + 1);
      
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Available subjects for selection
  const availableSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'Engineering', 'Literature', 'History',
    'Economics', 'Business', 'Psychology', 'Art'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`flex-1 text-center ${
                  step < currentStep ? 'text-green-400' :
                  step === currentStep ? 'text-white' : 'text-gray-500'
                }`}
              >
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold mb-2 ${
                  step < currentStep ? 'bg-green-500' :
                  step === currentStep ? 'bg-purple-600' : 'bg-gray-700'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                <div className="text-sm">
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Academic'}
                  {step === 3 && 'Preferences'}
                  {step === 4 && 'Matching'}
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-2">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Academic Information'}
            {currentStep === 3 && 'Study Preferences'}
            {currentStep === 4 && 'Matching Preferences'}
          </h2>
          <p className="text-gray-300 mb-6">
            Step {currentStep} of 4
          </p>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-200">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleStepSubmit}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Bio (Optional)</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Gender (Optional)</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Academic Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="e.g., Harvard University"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  {errors.institution && <p className="text-red-400 text-sm mt-1">{errors.institution[0]}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Course/Program *</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  {errors.course && <p className="text-red-400 text-sm mt-1">{errors.course[0]}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Year of Study *</label>
                  <select
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select year...</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year+</option>
                  </select>
                  {errors.year_of_study && <p className="text-red-400 text-sm mt-1">{errors.year_of_study[0]}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Major/Specialization (Optional)</label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineering"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Study Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Study Subjects * (Select at least one)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSubjects.map(subject => (
                      <label
                        key={subject}
                        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.study_subjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="w-4 h-4"
                        />
                        <span className="text-white">{subject}</span>
                      </label>
                    ))}
                  </div>
                  {errors.study_subjects && <p className="text-red-400 text-sm mt-1">{errors.study_subjects[0]}</p>}
                </div>
                <div>
                  <label className="block text-white mb-2">Preferred Study Time *</label>
                  <select
                    name="preferred_study_time"
                    value={formData.preferred_study_time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 10PM)</option>
                    <option value="night">Night (10PM - 2AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Study Location Preference *</label>
                  <select
                    name="study_location_preference"
                    value={formData.study_location_preference}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="library">Library</option>
                    <option value="cafe">Cafe</option>
                    <option value="online">Online</option>
                    <option value="home">Home</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Learning Style (Optional)</label>
                  <select
                    name="learning_style"
                    value={formData.learning_style}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="reading_writing">Reading/Writing</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Matching Preferences */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Partner Gender Preference (Optional)</label>
                  <select
                    name="partner_gender_preference"
                    value={formData.partner_gender_preference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">No preference</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Partner Year Preference (Optional)</label>
                  <select
                    name="partner_year_preference"
                    value={formData.partner_year_preference}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">No preference</option>
                    <option value="same">Same year as me</option>
                    <option value="similar">Similar year (±1)</option>
                    <option value="any">Any year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2">Maximum Active Partners</label>
                  <input
                    type="number"
                    name="max_partners"
                    value={formData.max_partners}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-gray-400 text-sm mt-1">How many study partners would you like to match with? (1-10)</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : currentStep === 4 ? 'Complete Setup' : 'Next →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { getUser, saveAuth, getToken } from '../store/authStore';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const user = getUser();
  
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Verify email with OTP code
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      await authApi.verifyEmail(otp);
      
      // Update user in auth store (mark as verified)
      const updatedUser = { ...user, email_verified_at: new Date().toISOString() };
      saveAuth(getToken(), updatedUser);
      
      alert('Email verified successfully!');
      navigate('/profile-setup');
    } catch (err) {
      console.error('Verification failed:', err);
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Resend verification code
   */
  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setResending(true);

    try {
      await authApi.resendVerification();
      setSuccessMessage('Verification code sent! Check your email.');
    } catch (err) {
      console.error('Resend failed:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Verification Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-300">
              We've sent a verification code to<br />
              <span className="text-purple-400 font-semibold">{user?.email}</span>
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <p className="text-green-200 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-purple-400 hover:text-purple-300 font-semibold text-sm disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Skip for Now (Optional) */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/profile-setup')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              Skip for now →
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/20 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30">
          <p className="text-blue-200 text-sm text-center">
            💡 Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}
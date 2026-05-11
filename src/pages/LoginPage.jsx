import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { saveAuth } from '../store/authStore'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(email, password)
      saveAuth(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .password-toggle-btn:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .forgot-link:hover, .signup-link:hover {
          color: #764ba2;
          background: rgba(102, 126, 234, 0.1);
        }

        .gradient-orb {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        
        {/* Animated Background Orbs */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
          <div className="gradient-orb" style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            filter: 'blur(80px)',
            opacity: 0.5,
            top: '-100px',
            left: '-100px',
            animationDelay: '0s'
          }}></div>
          
          <div className="gradient-orb" style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            filter: 'blur(80px)',
            opacity: 0.5,
            bottom: '-200px',
            right: '-200px',
            animationDelay: '7s'
          }}></div>
          
          <div className="gradient-orb" style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            filter: 'blur(80px)',
            opacity: 0.5,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: '14s'
          }}></div>
        </div>

        {/* Login Card */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'bounce 2s ease-in-out infinite'
            }}>
              <img 
            src={logo} 
            alt="StudyMatch Logo" 
            style={{ 
              width: '150px !important',
              height: '150px !important',
              minWidth: '150px',
              minHeight: '150px',
              maxWidth: '150px',
              maxHeight: '150px',
              objectFit: 'contain',
              margin: '10px',
              display: 'block',
              filter: 'drop-shadow(0 10px 30px rgba(102, 126, 234, 0.4))',
              animation: 'bounce 2s ease-in-out infinite',
              mixBlendMode: 'multiply'
            }} 
          />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 400 }}>
              Sign in to your StudyMatch account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '24px',
              animation: 'shake 0.4s ease-in-out'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="13" r="0.5" fill="currentColor" stroke="currentColor"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ position: 'absolute', left: '16px', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }} size={20} />
                <input
                  type="email"
                  id="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock style={{ position: 'absolute', left: '16px', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'white',
                    color: '#1f2937'
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    zIndex: 1
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ width: '18px', height: '18px', borderRadius: '6px', cursor: 'pointer', accentColor: '#667eea' }}
                />
                <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Remember me</span>
              </label>
              <NavLink 
                to="/forgot-password" 
                className="forgot-link"
                style={{
                  fontSize: '14px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                Forgot password?
              </NavLink>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                letterSpacing: '0.3px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2.5px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }}></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: 400, margin: 0 }}>
              Don't have an account?{' '}
              <NavLink 
                to="/register" 
                className="signup-link"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                Create Account
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
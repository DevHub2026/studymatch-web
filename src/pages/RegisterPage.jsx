import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { saveAuth } from '../store/authStore'
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, Target, TrendingUp } from 'lucide-react'
import logo from '../assets/logo.png'
import bgImage from '../assets/background.png' // ← Save the second image as background.png

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'student'
})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await register(formData)
      saveAuth(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .register-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .feature-item {
          animation: fadeIn 0.6s ease-out;
        }

        .feature-item:nth-child(1) { animation-delay: 0.1s; }
        .feature-item:nth-child(2) { animation-delay: 0.2s; }
        .feature-item:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* LEFT SIDE - Marketing Content with Background */}
        <div style={{
          flex: '0 0 55%',
          background: `linear-gradient(rgba(102, 126, 234, 0.85), rgba(118, 75, 162, 0.85)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Logo */}
          <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <img 
              src={logo} 
              alt="StudyMatch" 
              style={{ width: '60px', height: '60px', filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* Main Content */}
          <div style={{ animation: 'fadeIn 0.8s ease-out 0.2s backwards' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '1.2',
              margin: '0 0 20px 0',
              letterSpacing: '-1px'
            }}>
              Find your tutor.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Achieve more together.
              </span>
            </h1>
            <p style={{
              fontSize: '18px',
              opacity: 0.95,
              lineHeight: '1.6',
              margin: '0 0 50px 0',
              maxWidth: '450px'
            }}>
              StudyMatch connects you with qualified instructors who provide personalized guidance and expert support.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600 }}>Find qualified tutors</h3>
                  <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>Connect with verified instructors and Dean's List students.</p>
                </div>
              </div>

              <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600 }}>Get personalized help</h3>
                  <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>Receive one-on-one guidance tailored to your learning needs.</p>
                </div>
              </div>

              <div className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600 }}>Achieve academic goals</h3>
                  <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>Improve grades and master difficult subjects with expert support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty space for balance */}
          <div></div>
        </div>

        {/* RIGHT SIDE - Registration Form */}
        <div style={{
          flex: '0 0 45%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          animation: 'slideInRight 0.8s ease-out'
        }}>
          
          <div style={{ width: '100%', maxWidth: '480px' }}>
            
            {/* Top Right - Already have account */}
            <div style={{
              textAlign: 'right',
              marginBottom: '40px'
            }}>
              <span style={{ fontSize: '15px', color: '#6b7280', marginRight: '8px' }}>Already have an account?</span>
              <NavLink 
                to="/login"
                style={{
                  fontSize: '15px',
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '8px 20px',
                  border: '1.5px solid #667eea',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.color = '#667eea'
                }}
              >
                Log in
              </NavLink>
            </div>

            {/* Logo & Heading */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <img 
                src={logo} 
                alt="StudyMatch" 
                style={{ width: '80px', height: '80px', marginBottom: '20px' }}
              />
              <h2 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#1f2937',
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px'
              }}>
                Create your account
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                Join StudyMatch and start connecting with tutors
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '24px'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Full Name */}
              <div>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <User size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af' }} />
                  <input
                    type="text"
                    name="name"
                    className="register-input"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Mail size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af' }} />
                  <input
                    type="email"
                    name="email"
                    className="register-input"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="register-input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 48px 16px 48px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
                <div>
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Lock
                      size={20}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        color: '#9ca3af'
                      }}
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password_confirmation"
                      className="register-input"
                      placeholder="Confirm password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '15px',
                        transition: 'all 0.2s ease',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

              {/* Role Dropdown */}
              <div>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <GraduationCap size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }} />
                  <select
                    name="role"
                    className="register-input"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '15px',
                      transition: 'all 0.2s ease',
                      background: 'white',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center'
                    }}
                  >
                    <option value="student">I'm a student</option>
                    <option value="tutor">I'm a tutor</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
              

            {/* Terms */}
            <p style={{
              fontSize: '13px',
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: '24px',
              lineHeight: '1.6'
            }}>
              By creating an account, you agree to our{' '}
              <a href="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


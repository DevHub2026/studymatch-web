import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as partnersApi from "../../api/partners";
import * as matchRequestsApi from "../../api/matchRequests";
import {
  Search, SlidersHorizontal, ArrowRight, MapPin, BookOpen,
  Calendar, Target, MoreVertical, RefreshCw, Lightbulb,
  User, Activity, Clock, X, ChevronDown
} from 'lucide-react'

const Avatar = ({ name, size = 48, online = false }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #7c5cfa, #5738d0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38, fontWeight: 700,
      border: '2px solid rgba(124,92,250,0.3)',
    }}>
      {name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
    {online && (
      <div style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 11, height: 11, borderRadius: '50%',
        background: '#22c55e', border: '2px solid #07061a',
      }} />
    )}
  </div>
)

const getMatchColor = (score) => {
  if (score >= 80) return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' }
  if (score >= 60) return { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' }
  if (score >= 40) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' }
  return { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' }
}

const DAY_LABELS = ['M','T','W','T','F','S','S']

export default function PartnersPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)
  const [filters, setFilters] = useState({
    subjects: '', availability: '', studyGoals: '', location: '', matchPct: '0'
  })

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnersApi.getPotentialPartners()
        setPartners(data.potential_partners || [])
      } catch (err) {
        console.error('Failed to fetch partners:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleResetFilters = () => {
    setFilters({ subjects: '', availability: '', studyGoals: '', location: '', matchPct: '0' })
  }

  const openRequestModal = (partner) => {
    setSelectedPartner(partner)
    setRequestMessage('')
    setShowRequestModal(true)
  }

  const closeRequestModal = () => {
    setShowRequestModal(false)
    setSelectedPartner(null)
    setRequestMessage('')
  }

  const handleSendRequest = async () => {
    if (!selectedPartner) return
    setSendingRequest(true)
    try {
      await matchRequestsApi.sendMatchRequest(selectedPartner.id, requestMessage)
      setPartners(prev => prev.filter(p => p.id !== selectedPartner.id))
      closeRequestModal()
    } catch (err) {
      console.error('Failed to send request:', err)
    } finally {
      setSendingRequest(false)
    }
  }

  const filteredPartners = partners.filter(partner => {
    const score = partner.match_score || 0
    if (score < parseInt(filters.matchPct)) return false
    if (filters.subjects) {
      const subs = partner.study_subjects ? JSON.parse(partner.study_subjects) : []
      if (!subs.some(s => s.toLowerCase().includes(filters.subjects.toLowerCase()))) return false
    }
    if (filters.availability && partner.preferred_study_time !== filters.availability) return false
    if (filters.location && partner.study_location_preference !== filters.location) return false
    return true
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .pm-root { font-family:'Poppins',sans-serif; color:#ddd8ff; display:flex; gap:24px; }
        .pm-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:20px; }
        .pm-sidebar { width:260px; flex-shrink:0; display:flex; flex-direction:column; gap:16px; }

        /* Hero */
        .pm-hero {
          background:linear-gradient(135deg,rgba(124,92,250,0.35) 0%,rgba(87,56,208,0.2) 60%,rgba(124,92,250,0.05) 100%);
          border:1px solid rgba(124,92,250,0.25); border-radius:20px; padding:28px 32px;
          position:relative; overflow:hidden; min-height:140px; display:flex; align-items:center;
        }
        .pm-hero-content { position:relative; z-index:1; }
        .pm-hero-title { font-size:24px; font-weight:700; color:#fff; line-height:1.2; margin-bottom:4px; }
        .pm-hero-title span { color:#a78bfa; display:block; }
        .pm-hero-sub { font-size:13px; color:rgba(255,255,255,0.45); margin-bottom:18px; max-width:300px; }
        .pm-hero-btn {
          display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
          border-radius:10px; background:#7c5cfa; color:#fff;
          font-size:13px; font-weight:600; font-family:'Poppins',sans-serif;
          border:none; cursor:pointer; transition:opacity 0.2s,transform 0.15s; text-decoration:none;
        }
        .pm-hero-btn:hover { opacity:0.9; transform:translateY(-1px); }
        .pm-hero-glow { position:absolute; right:-40px; top:-40px; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(124,92,250,0.25) 0%,transparent 70%); pointer-events:none; }

        /* Section header */
        .pm-section-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .pm-section-title { font-size:15px; font-weight:700; color:#eae6ff; }
        .pm-section-sub { font-size:12px; color:rgba(255,255,255,0.28); margin-top:2px; }

        /* Sort */
        .pm-sort {
          display:flex; align-items:center; gap:8px;
          font-size:12px; color:rgba(255,255,255,0.4);
        }
        .pm-sort-select {
          background:rgba(255,255,255,0.04); border:1px solid rgba(120,90,240,0.2);
          border-radius:8px; color:#ddd8ff; font-size:12px;
          font-family:'Poppins',sans-serif; padding:6px 28px 6px 10px;
          outline:none; cursor:pointer; -webkit-appearance:none; appearance:none;
        }

        /* Partner card */
        .pm-card {
          background:rgba(255,255,255,0.03); border:1px solid rgba(120,90,240,0.14);
          border-radius:16px; padding:20px; display:flex; align-items:flex-start;
          gap:16px; transition:all 0.2s; position:relative;
        }
        .pm-card:hover { border-color:rgba(124,92,250,0.3); background:rgba(124,92,250,0.04); }

        .pm-card-info { flex:1; min-width:0; }

        .pm-card-name-row { display:flex; align-items:center; gap:10px; margin-bottom:4px; }
        .pm-card-name { font-size:15px; font-weight:700; color:#eae6ff; }

        .pm-match-badge {
          display:inline-flex; align-items:center; gap:4px;
          padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;
        }

        .pm-card-meta { display:flex; align-items:center; gap:12px; font-size:12px; color:rgba(255,255,255,0.35); margin-bottom:10px; flex-wrap:wrap; }
        .pm-card-meta-item { display:flex; align-items:center; gap:4px; }

        .pm-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
        .pm-tag { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; background:rgba(124,92,250,0.1); border:1px solid rgba(124,92,250,0.2); color:#a78bfa; }

        .pm-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; flex-shrink:0; }

        .pm-avail { display:flex; flex-direction:column; gap:6px; align-items:flex-end; }
        .pm-avail-label { font-size:11px; color:rgba(255,255,255,0.3); display:flex; align-items:center; gap:4px; }
        .pm-days { display:flex; gap:4px; }
        .pm-day {
          width:22px; height:22px; border-radius:50%; font-size:9px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
        }
        .pm-day.on { background:#7c5cfa; color:#fff; }
        .pm-day.off { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.08); }

        .pm-goal { font-size:11px; color:rgba(255,255,255,0.3); display:flex; align-items:center; gap:4px; }
        .pm-goal strong { color:rgba(255,255,255,0.55); }

        .pm-btn-row { display:flex; gap:8px; }
        .pm-btn-primary {
          padding:8px 18px; border-radius:8px; background:#7c5cfa; border:none;
          color:#fff; font-size:12px; font-weight:600; font-family:'Poppins',sans-serif;
          cursor:pointer; transition:opacity 0.2s,transform 0.15s;
        }
        .pm-btn-primary:hover { opacity:0.88; transform:translateY(-1px); }
        .pm-btn-outline {
          padding:8px 18px; border-radius:8px;
          background:rgba(124,92,250,0.1); border:1px solid rgba(124,92,250,0.25);
          color:#a78bfa; font-size:12px; font-weight:600; font-family:'Poppins',sans-serif;
          cursor:pointer; transition:all 0.2s;
        }
        .pm-btn-outline:hover { background:rgba(124,92,250,0.2); }

        .pm-more-btn { background:none; border:none; color:rgba(255,255,255,0.2); cursor:pointer; padding:4px; border-radius:6px; display:flex; align-items:center; transition:color 0.2s; position:absolute; top:16px; right:16px; }
        .pm-more-btn:hover { color:rgba(255,255,255,0.5); }

        /* Empty state */
        .pm-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px 20px; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed rgba(120,90,240,0.15); border-radius:16px; }
        .pm-empty-icon { width:56px; height:56px; border-radius:16px; background:rgba(124,92,250,0.08); display:flex; align-items:center; justify-content:center; color:rgba(124,92,250,0.4); }
        .pm-empty-title { font-size:15px; font-weight:600; color:rgba(255,255,255,0.35); }
        .pm-empty-sub { font-size:13px; color:rgba(255,255,255,0.2); }

        /* CTA banner */
        .pm-cta { background:rgba(124,92,250,0.07); border:1px solid rgba(124,92,250,0.18); border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .pm-cta-icon { width:40px; height:40px; border-radius:12px; background:rgba(124,92,250,0.15); display:flex; align-items:center; justify-content:center; color:#a78bfa; flex-shrink:0; }
        .pm-cta-text { flex:1; }
        .pm-cta-title { font-size:13px; font-weight:600; color:#ddd8ff; margin-bottom:2px; }
        .pm-cta-sub { font-size:12px; color:rgba(255,255,255,0.3); }
        .pm-cta-btn { padding:9px 18px; border-radius:8px; background:#7c5cfa; border:none; color:#fff; font-size:12px; font-weight:600; font-family:'Poppins',sans-serif; cursor:pointer; white-space:nowrap; display:flex; align-items:center; gap:6px; text-decoration:none; transition:opacity 0.2s; }
        .pm-cta-btn:hover { opacity:0.88; }

        /* Sidebar */
        .pm-sidebar-card { background:rgba(255,255,255,0.03); border:1px solid rgba(120,90,240,0.14); border-radius:16px; padding:18px; }
        .pm-sidebar-title { font-size:13px; font-weight:700; color:#eae6ff; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

        .pm-filter-group { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
        .pm-filter-label { font-size:11px; color:rgba(255,255,255,0.3); font-weight:500; letter-spacing:0.3px; }
        .pm-filter-select, .pm-filter-input {
          width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(120,90,240,0.18);
          border-radius:9px; color:#ddd8ff; font-size:12px; font-family:'Poppins',sans-serif;
          padding:9px 12px; outline:none; -webkit-appearance:none; appearance:none;
          transition:border-color 0.2s,background 0.2s;
        }
        .pm-filter-select:focus, .pm-filter-input:focus { border-color:rgba(124,92,250,0.5); background:rgba(124,92,250,0.06); }
        .pm-filter-select option { background:#120f2e; }
        .pm-filter-input::placeholder { color:rgba(255,255,255,0.15); }

        .pm-apply-btn { width:100%; padding:11px; border-radius:9px; background:#7c5cfa; border:none; color:#fff; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; cursor:pointer; transition:opacity 0.2s; margin-bottom:8px; }
        .pm-apply-btn:hover { opacity:0.88; }
        .pm-reset-btn { width:100%; padding:9px; border-radius:9px; background:none; border:none; color:rgba(255,255,255,0.3); font-size:12px; font-weight:500; font-family:'Poppins',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:color 0.2s; }
        .pm-reset-btn:hover { color:#7c5cfa; }

        /* Tips */
        .pm-tip { display:flex; align-items:flex-start; gap:10px; padding:10px; border-radius:10px; transition:background 0.2s; }
        .pm-tip:hover { background:rgba(124,92,250,0.06); }
        .pm-tip-icon { width:32px; height:32px; border-radius:9px; background:rgba(124,92,250,0.12); display:flex; align-items:center; justify-content:center; color:#a78bfa; flex-shrink:0; }
        .pm-tip-title { font-size:12px; font-weight:600; color:#ddd8ff; margin-bottom:2px; }
        .pm-tip-sub { font-size:11px; color:rgba(255,255,255,0.28); line-height:1.4; }

        .pm-learn-more { display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#7c5cfa; font-weight:500; cursor:pointer; margin-top:12px; padding-top:12px; border-top:1px solid rgba(120,90,240,0.1); }

        /* Modal */
        .pm-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:200; }
        .pm-modal { background:rgba(10,8,28,0.97); border:1px solid rgba(120,90,240,0.25); border-radius:20px; padding:28px; width:100%; max-width:440px; box-shadow:0 24px 64px rgba(0,0,0,0.5); animation:modalIn 0.2s cubic-bezier(0.22,1,0.36,1); }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .pm-modal-title { font-size:18px; font-weight:700; color:#eae6ff; margin-bottom:16px; }
        .pm-modal-partner { display:flex; align-items:center; gap:12px; padding:12px 14px; background:rgba(124,92,250,0.07); border:1px solid rgba(124,92,250,0.15); border-radius:12px; margin-bottom:16px; }
        .pm-modal-partner-name { font-size:14px; font-weight:600; color:#ddd8ff; }
        .pm-modal-partner-user { font-size:12px; color:rgba(255,255,255,0.3); }
        .pm-modal-label { font-size:12px; color:rgba(255,255,255,0.35); margin-bottom:6px; font-weight:500; }
        .pm-modal-textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(120,90,240,0.2); border-radius:11px; color:#ddd8ff; font-size:13px; font-family:'Poppins',sans-serif; padding:12px 14px; outline:none; resize:none; height:100px; margin-bottom:16px; transition:border-color 0.2s,background 0.2s; }
        .pm-modal-textarea::placeholder { color:rgba(255,255,255,0.15); }
        .pm-modal-textarea:focus { border-color:rgba(124,92,250,0.5); background:rgba(124,92,250,0.06); }
        .pm-modal-btns { display:flex; gap:10px; }
        .pm-modal-cancel { flex:0 0 auto; padding:12px 20px; border-radius:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); font-size:14px; font-weight:600; font-family:'Poppins',sans-serif; cursor:pointer; transition:all 0.2s; }
        .pm-modal-cancel:hover { background:rgba(255,255,255,0.09); color:rgba(255,255,255,0.7); }
        .pm-modal-send { flex:1; padding:12px; border-radius:10px; background:#7c5cfa; border:none; color:#fff; font-size:14px; font-weight:600; font-family:'Poppins',sans-serif; cursor:pointer; transition:opacity 0.2s; }
        .pm-modal-send:hover:not(:disabled) { opacity:0.88; }
        .pm-modal-send:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#eae6ff', marginBottom: 4 }}>Find Matches</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Connect with the right study partners</p>
      </div>

      <div className="pm-root">

        {/* ── Main ── */}
        <div className="pm-main">

          {/* Hero */}
          <div className="pm-hero">
            <div className="pm-hero-content">
              <div className="pm-hero-title">
                Find your perfect
                <span>study partner</span>
              </div>
              <div className="pm-hero-sub">
                Match based on your subjects, schedule and study goals.
              </div>
              <Link to="/profile-setup" className="pm-hero-btn">
                Update Preferences <SlidersHorizontal size={14} />
              </Link>
            </div>
            <div className="pm-hero-glow" />
          </div>

          {/* Top Matches header */}
          <div className="pm-section-header">
            <div>
              <div className="pm-section-title">⚡ Top Matches For You</div>
              <div className="pm-section-sub">Based on your profile, subjects and goals</div>
            </div>
            <div className="pm-sort">
              Sort by:
              <div style={{ position: 'relative' }}>
                <select className="pm-sort-select" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                }}>
                  <option>Best Match</option>
                  <option>Newest</option>
                  <option>Most Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Partners list */}
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Loading partners...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="pm-empty">
              <div className="pm-empty-icon"><Search size={24} /></div>
              <div className="pm-empty-title">No partners found</div>
              <div className="pm-empty-sub">Try adjusting your filters or complete your profile for better matches.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredPartners.map(partner => {
                const score = partner.match_score || 0
                const mc = getMatchColor(score)
                const subjects = partner.study_subjects ? JSON.parse(partner.study_subjects) : []
                const availability = partner.preferred_study_time || ''
                const availLabel = availability
                  ? availability.charAt(0).toUpperCase() + availability.slice(1) + 's'
                  : ''

                // Mock day availability based on preferred_study_time
                const activeDays = [true, true, true, true, true, false, false]

                return (
                  <div key={partner.id} className="pm-card">
                    <Avatar name={partner.name} size={52} online />

                    <div className="pm-card-info">
                      <div className="pm-card-name-row">
                        <span className="pm-card-name">{partner.name || 'User'}</span>
                        <span className="pm-match-badge" style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                          {score}% Match
                        </span>
                      </div>

                      <div className="pm-card-meta">
                        {partner.institution && (
                          <span className="pm-card-meta-item">
                            <BookOpen size={11} /> {partner.institution}
                          </span>
                        )}
                        {partner.study_location_preference && (
                          <span className="pm-card-meta-item">
                            <MapPin size={11} /> {partner.study_location_preference}
                          </span>
                        )}
                      </div>

                      {subjects.length > 0 && (
                        <div className="pm-tags">
                          {subjects.slice(0, 3).map((s, i) => (
                            <span key={i} className="pm-tag">{s}</span>
                          ))}
                          {subjects.length > 3 && (
                            <span className="pm-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              +{subjects.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pm-card-right">
                      <div className="pm-avail">
                        {availLabel && (
                          <div className="pm-avail-label">
                            <Calendar size={11} /> {availLabel}
                          </div>
                        )}
                        <div className="pm-days">
                          {DAY_LABELS.map((d, i) => (
                            <div key={i} className={`pm-day ${activeDays[i] ? 'on' : 'off'}`}>{d}</div>
                          ))}
                        </div>
                        {partner.study_goal && (
                          <div className="pm-goal">
                            <Target size={11} />
                            Study Goal: <strong>{partner.study_goal}</strong>
                          </div>
                        )}
                      </div>

                      <div className="pm-btn-row">
                        <button className="pm-btn-outline">View Profile</button>
                        <button className="pm-btn-primary" onClick={() => openRequestModal(partner)}>Connect</button>
                      </div>
                    </div>

                    <button className="pm-more-btn"><MoreVertical size={15} /></button>
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA banner */}
          <div className="pm-cta">
            <div className="pm-cta-icon"><User size={18} /></div>
            <div className="pm-cta-text">
              <div className="pm-cta-title">Want more matches?</div>
              <div className="pm-cta-sub">Complete your profile and add more subjects to get better recommendations.</div>
            </div>
            <Link to="/profile-setup" className="pm-cta-btn">
              Edit Profile <ArrowRight size={13} />
            </Link>
          </div>

        </div>

        {/* ── Sidebar ── */}
        <div className="pm-sidebar">

          {/* Refine filters */}
          <div className="pm-sidebar-card">
            <div className="pm-sidebar-title">
              <SlidersHorizontal size={14} color="#7c5cfa" /> Refine Your Search
            </div>

            <div className="pm-filter-group">
              <label className="pm-filter-label">Subjects</label>
              <select className="pm-filter-select" name="subjects" value={filters.subjects} onChange={handleFilterChange}
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Programming">Programming</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label className="pm-filter-label">Availability</label>
              <select className="pm-filter-select" name="availability" value={filters.availability} onChange={handleFilterChange}
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="">All Times</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label className="pm-filter-label">Study Goals</label>
              <select className="pm-filter-select" name="studyGoals" value={filters.studyGoals} onChange={handleFilterChange}
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="">All Goals</option>
                <option value="ace_exams">Ace Exams</option>
                <option value="improve_understanding">Improve Understanding</option>
                <option value="project_help">Project Help</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label className="pm-filter-label">Location</label>
              <select className="pm-filter-select" name="location" value={filters.location} onChange={handleFilterChange}
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="">All Locations</option>
                <option value="online">Online</option>
                <option value="in_person">In-Person</option>
                <option value="either">Either</option>
              </select>
            </div>

            <div className="pm-filter-group">
              <label className="pm-filter-label">Match Percentage</label>
              <select className="pm-filter-select" name="matchPct" value={filters.matchPct} onChange={handleFilterChange}
                style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23ffffff44' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="0">Any percentage</option>
                <option value="40">40% and above</option>
                <option value="60">60% and above</option>
                <option value="70">70% and above</option>
                <option value="80">80% and above</option>
              </select>
            </div>

            <button className="pm-apply-btn">Apply Filters</button>
            <button className="pm-reset-btn" onClick={handleResetFilters}>
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>

          {/* Matching Tips */}
          <div className="pm-sidebar-card">
            <div className="pm-sidebar-title">
              <Lightbulb size={14} color="#7c5cfa" /> Matching Tips
            </div>

            {[
              { icon: User,     title: 'Complete your profile',  sub: 'Add more subjects and goals' },
              { icon: Activity, title: 'Be active',              sub: 'Respond to messages and join sessions' },
              { icon: Clock,    title: 'Stay consistent',        sub: 'Regular study builds better connections' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="pm-tip">
                <div className="pm-tip-icon"><Icon size={14} /></div>
                <div>
                  <div className="pm-tip-title">{title}</div>
                  <div className="pm-tip-sub">{sub}</div>
                </div>
              </div>
            ))}

            <div className="pm-learn-more">
              Learn more about matching <ArrowRight size={13} />
            </div>
          </div>

        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedPartner && (
        <div className="pm-modal-overlay" onClick={closeRequestModal}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div className="pm-modal-title">Send Match Request</div>
              <button onClick={closeRequestModal} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center' }}>
                <X size={18} />
              </button>
            </div>

            <div className="pm-modal-partner">
              <Avatar name={selectedPartner.name} size={40} />
              <div>
                <div className="pm-modal-partner-name">{selectedPartner.name}</div>
                <div className="pm-modal-partner-user">@{selectedPartner.username}</div>
              </div>
            </div>

            <div className="pm-modal-label">Add a message (optional)</div>
            <textarea
              className="pm-modal-textarea"
              placeholder="Hi! I'd love to study together..."
              value={requestMessage}
              onChange={e => setRequestMessage(e.target.value)}
            />

            <div className="pm-modal-btns">
              <button className="pm-modal-cancel" onClick={closeRequestModal} disabled={sendingRequest}>
                Cancel
              </button>
              <button className="pm-modal-send" onClick={handleSendRequest} disabled={sendingRequest}>
                {sendingRequest ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
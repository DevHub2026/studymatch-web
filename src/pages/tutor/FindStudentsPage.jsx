import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPotentialPartners } from '../../api/partners'
import { sendMatchRequest } from '../../api/matchRequests'
import {
  ChevronDown, Clock, Bookmark, SlidersHorizontal,
  Users, ArrowRight, Trophy, Shield, Calendar,
  Target, GraduationCap, Loader2, RefreshCw,
} from 'lucide-react'

/* ─── constants ──────────────────────────────────────────────── */

const SUBJECTS_OPTIONS = ['All Subjects', 'Calculus', 'Physics', 'Statistics', 'Linear Algebra', 'Biology', 'Chemistry', 'Data Structures', 'Algorithms']
const AVAIL_OPTIONS    = ['Any Time', 'Weekdays', 'Weekends', 'Evenings (After 5PM)', 'Mornings (Before 12PM)']
const GOAL_OPTIONS     = ['All Goals', 'Exam Prep', 'Concept Understanding', 'Skill Building', 'Improve Grades', 'Project Help']
const GRADE_OPTIONS    = ['All Grades', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
const SORT_OPTIONS     = ['Best Match', 'Most Recent', 'Highest Need', 'Alphabetical']
const COLORS           = ['#EC4899','#7C3AED','#10B981','#6366F1','#F59E0B','#EF4444']

const TAG_COLORS = {
  'Calculus':               { c: '#7C3AED', b: '#F3F0FF' },
  'Linear Algebra':         { c: '#F59E0B', b: '#FFFBEB' },
  'Data Structures':        { c: '#6366F1', b: '#EEF2FF' },
  'Algorithms':             { c: '#EC4899', b: '#FDF2F8' },
  'Biology':                { c: '#10B981', b: '#F0FDF4' },
  'Chemistry':              { c: '#F59E0B', b: '#FFFBEB' },
  'Statistics':             { c: '#14B8A6', b: '#F0FDFA' },
  'Probability':            { c: '#8B5CF6', b: '#F5F3FF' },
  'Differential Equations': { c: '#EF4444', b: '#FEF2F2' },
  'Physics':                { c: '#3B82F6', b: '#EFF6FF' },
}

const getColor    = (i) => COLORS[i % COLORS.length]
const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

/* ─── helpers ────────────────────────────────────────────────── */

function Avatar({ name = '', color = '#7C3AED', size = 64, online }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.3, color, fontFamily: 'inherit' }}>
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 2, right: 2, width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: online ? '#22C55E' : '#D1D5DB', border: '2px solid white' }} />
      )}
    </div>
  )
}

function SubjectTag({ label }) {
  const { c, b } = TAG_COLORS[label] || { c: '#7C3AED', b: '#F3F0FF' }
  return <span style={{ padding: '3px 10px', borderRadius: 20, background: b, color: c, fontSize: 12, fontWeight: 600, border: `1px solid ${c}25` }}>{label}</span>
}

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ flex: 1, minWidth: 140 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>{label}</div>}
      <div style={{ position: 'relative' }}>
        <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#374151', userSelect: 'none' }}>
          <span style={{ flex: 1 }}>{value}</span>
          <ChevronDown size={13} color="#9CA3AF" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.2s', flexShrink: 0 }} />
        </div>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <div style={{ position: 'absolute', top: '110%', left: 0, background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.10)', zIndex: 50, minWidth: '100%', overflow: 'hidden' }}>
              {options.map(opt => (
                <div key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                  style={{ padding: '9px 14px', fontSize: 13.5, color: opt === value ? '#7C3AED' : '#374151', fontWeight: opt === value ? 600 : 400, cursor: 'pointer', background: opt === value ? '#F3F0FF' : 'white' }}
                  onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = '#F8F9FB' }}
                  onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = 'white' }}
                >{opt}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── student card ───────────────────────────────────────────── */

function StudentCard({ student, index, saved, onSave, onConnect, connected }) {
  const color    = getColor(index)
  const name     = student.name || student.user?.name || 'Student'
  const year     = student.year_level || ''
  const field    = student.department || student.course || ''
  const subjects = student.subjects || student.help_subjects || []
  const goal     = student.study_goals || student.goal || ''
  const avail    = student.availability ? [student.availability] : []
  const match    = student.match_percentage

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderBottom: '1px solid #F8F9FB', transition: 'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Avatar name={name} color={color} size={62} online={student.is_online} />
        {match && (
          <>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10B981', background: '#F0FDF4', borderRadius: 20, padding: '2px 9px' }}>{match}%</span>
            <span style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500 }}>Match</span>
          </>
        )}
      </div>

      <div style={{ width: 210, flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1E1B4B', marginBottom: 3 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 12 }}>{year}{year && field ? ' · ' : ''}{field}</div>
        {subjects.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 7 }}>Needs help with</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {subjects.slice(0, 3).map((s, i) => <SubjectTag key={i} label={typeof s === 'object' ? s.name || s.subject : s} />)}
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {goal && (
          <>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 5 }}>Goal</div>
            <div style={{ fontSize: 13.5, color: '#374151', fontWeight: 500, lineHeight: 1.45, marginBottom: 14 }}>{goal}</div>
          </>
        )}
        {avail.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>Availability</div>
            {avail.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', marginBottom: 3 }}>
                <Clock size={12} color="#7C3AED" /> {a}
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
        <button onClick={() => onSave(student.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Bookmark size={16} color={saved ? '#7C3AED' : '#D1D5DB'} fill={saved ? '#7C3AED' : 'none'} />
        </button>
        <Link to="/tutor/find-students" style={{ padding: '9px 20px', background: 'white', border: '1.5px solid #7C3AED', borderRadius: 9, color: '#7C3AED', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F3F0FF'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >View Profile</Link>
        <button onClick={() => onConnect(student.id)} disabled={connected} style={{ padding: '9px 20px', background: connected ? '#F3F0FF' : '#7C3AED', border: connected ? '1.5px solid #DDD6FE' : 'none', borderRadius: 9, color: connected ? '#7C3AED' : 'white', fontSize: 13.5, fontWeight: 600, cursor: connected ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {connected ? 'Requested' : 'Connect'}
        </button>
      </div>
    </div>
  )
}

/* ─── main page ──────────────────────────────────────────────── */

export default function FindStudentsPage() {
  const [subject,      setSubject]      = useState('All Subjects')
  const [avail,        setAvail]        = useState('Any Time')
  const [goal,         setGoal]         = useState('All Goals')
  const [grade,        setGrade]        = useState('All Grades')
  const [sortBy,       setSortBy]       = useState('Best Match')
  const [savedIds,     setSavedIds]     = useState([])
  const [connectedIds, setConnectedIds] = useState([])
  const [visible,      setVisible]      = useState(4)
  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [stats,        setStats]        = useState({ found: 0, newThisWeek: 0, connected: 0, sessions: 0 })

  const fetchStudents = async () => {
    setLoading(true); setError('')
    try {
      const res  = await getPotentialPartners()
      const data = res?.data || res || []
      const list = Array.isArray(data) ? data : []
      setStudents(list)
      setStats(p => ({ ...p, found: list.length }))
    } catch {
      setError('Failed to load students. Please try again.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [])

  const toggleSave    = id => setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const handleConnect = async (id) => {
    if (connectedIds.includes(id)) return
    try {
      await sendMatchRequest(id)
      setConnectedIds(p => [...p, id])
      setStats(p => ({ ...p, connected: p.connected + 1 }))
    } catch {}
  }

  const filtered = students.filter(s => {
    const subs = (s.subjects || s.help_subjects || []).map(x => typeof x === 'object' ? x.name || x.subject : x)
    if (subject !== 'All Subjects' && !subs.includes(subject)) return false
    if (grade   !== 'All Grades'   && s.year_level !== grade)  return false
    return true
  })

  const MATCH_PREFS = [
    { icon: SlidersHorizontal, color: '#7C3AED', bg: '#F3F0FF', label: 'Subjects',       value: subject },
    { icon: Clock,             color: '#6366F1', bg: '#EEF2FF', label: 'Availability',   value: avail   },
    { icon: Target,            color: '#F59E0B', bg: '#FFFBEB', label: 'Learning Goals', value: goal    },
    { icon: GraduationCap,     color: '#10B981', bg: '#F0FDF4', label: 'Grade Level',    value: grade   },
  ]

  const QUICK_STATS = [
    { icon: Users,      color: '#7C3AED', bg: '#F3F0FF', value: stats.found,       label: 'Students Found'     },
    { icon: ArrowRight, color: '#6366F1', bg: '#EEF2FF', value: stats.newThisWeek, label: 'New This Week'      },
    { icon: Shield,     color: '#10B981', bg: '#F0FDF4', value: stats.connected,   label: 'Connected'          },
    { icon: Calendar,   color: '#F59E0B', bg: '#FFFBEB', value: stats.sessions,    label: 'Sessions Scheduled' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .fs-wrap * { box-sizing: border-box; }
        .fs-wrap { font-family: 'DM Sans', sans-serif; color: #1E1B4B; display: flex; gap: 24px; align-items: flex-start; }
        .fs-main { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .fs-right { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
        .pref-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F8F9FB; }
        .pref-row:last-child { border-bottom: none; }
        .stat-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #F8F9FB; }
        .stat-row:last-child { border-bottom: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="fs-wrap">
        <div className="fs-main">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Find Students</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Connect with students who need help in your areas of expertise.</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #F0F0F4', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <Dropdown label="Subjects"       value={subject} options={SUBJECTS_OPTIONS} onChange={setSubject} />
              <Dropdown label="Availability"   value={avail}   options={AVAIL_OPTIONS}    onChange={setAvail}   />
              <Dropdown label="Learning Goals" value={goal}    options={GOAL_OPTIONS}     onChange={setGoal}    />
              <Dropdown label="Grade Level"    value={grade}   options={GRADE_OPTIONS}    onChange={setGrade}   />
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', color: '#374151', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-end' }}>
                <SlidersHorizontal size={14} color="#7C3AED" /> More Filters
              </button>
            </div>
          </div>

          {!loading && !error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#1E1B4B', flex: 1 }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Sort by:</span>
                <Dropdown value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 size={28} color="#7C3AED" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {error && !loading && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13.5, color: '#EF4444', flex: 1 }}>{error}</span>
              <button onClick={fetchStudents} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'white', border: '1px solid #FECACA', borderRadius: 8, color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ background: 'white', border: '1px solid #F0F0F4', borderRadius: 16, overflow: 'hidden' }}>
              {filtered.slice(0, visible).length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <Users size={32} color="#DDD6FE" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#374151', marginBottom: 6 }}>No students found</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>Try adjusting your filters.</div>
                </div>
              ) : (
                filtered.slice(0, visible).map((s, i) => (
                  <StudentCard key={s.id || i} student={s} index={i}
                    saved={savedIds.includes(s.id)} onSave={toggleSave}
                    onConnect={handleConnect} connected={connectedIds.includes(s.id)}
                  />
                ))
              )}
            </div>
          )}

          {!loading && visible < filtered.length && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setVisible(v => v + 4)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 28px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, color: '#374151', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Load more students <ChevronDown size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="fs-right">
          <div style={{ background: 'white', border: '1px solid #F0F0F4', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B' }}>Match Preferences</span>
              <button style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
            </div>
            {MATCH_PREFS.map(({ icon: Icon, color, bg, label, value }) => (
              <div key={label} className="pref-row">
                <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12.5, color: '#1E1B4B', fontWeight: 500, lineHeight: 1.5 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #F0F0F4', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1E1B4B', marginBottom: 14 }}>Quick Stats</div>
            {QUICK_STATS.map(({ icon: Icon, color, bg, value, label }) => (
              <div key={label} className="stat-row">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#1E1B4B', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>{label}</div>
                </div>
              </div>
            ))}
            <Link to="/tutor/messages" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '10px 14px', background: '#F3F0FF', border: '1px solid #DDD6FE', borderRadius: 10, color: '#7C3AED', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <span style={{ flex: 1 }}>View All Connections</span><ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', borderRadius: 16, padding: '20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Trophy size={20} color="white" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'white', marginBottom: 8 }}>Become a Top Tutor</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 16 }}>Help more students, build connections, and grow your impact.</div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'white', color: '#7C3AED', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              View Progress <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  GraduationCap,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const authHeader = (token) => ({ headers: { authorization: `Bearer ${token}` } });

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Secure access',
    description: 'JWT-powered authentication with a protected gateway and role-based routes for students and companies.',
  },
  {
    icon: TrendingUp,
    title: 'Performance-first',
    description: 'Fast frontend interactions backed by microservices designed for scalable search and data throughput.',
  },
  {
    icon: Rocket,
    title: 'Future-ready',
    description: 'Built with expandable backend services and analytics endpoints for ongoing growth and insight.',
  },
];

// ─── Skill Badge Component ───────────────────────────────────────────────────
const SkillBadge = ({ skill }) => (
  <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
    {skill}
  </span>
);

// ─── Status Banner ───────────────────────────────────────────────────────────
const StatusBanner = ({ apiStatus, errorMessage }) => {
  const statusConfig = {
    online: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', label: '🟢 All services online' },
    checking: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-500', label: '⏳ Connecting to backend...' },
    offline: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', label: `🔴 ${errorMessage}` },
  };
  const cfg = statusConfig[apiStatus] || statusConfig.checking;
  return (
    <div className={`mb-6 rounded-2xl border ${cfg.border} ${cfg.bg} px-5 py-3 text-sm font-medium ${cfg.text}`}>
      {cfg.label}
    </div>
  );
};

const App = () => {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'applications'
  const [metrics, setMetrics] = useState({
    totalInternships: 0,
    openSlots: 0,
    activeCompanies: 0,
    totalApplications: 0,
    totalStudents: 0,
  });

  const fetchInternships = async () => {
    const res = await axios.get(`${API_BASE}/internships`);
    setInternships(res.data);
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/metrics`);
      setMetrics(res.data);
    } catch (err) {
      console.warn('Unable to retrieve platform metrics:', err.message || err);
    }
  };

  const fetchUserData = async (tkn) => {
    if (!tkn) return;
    const [appRes, notifRes] = await Promise.all([
      axios.get(`${API_BASE}/bookings`, authHeader(tkn)),
      axios.get(`${API_BASE}/notifications`, authHeader(tkn)),
    ]);
    setApplications(appRes.data);
    setNotifications(notifRes.data);
  };

  const refreshDashboard = async (tkn = token) => {
    try {
      setErrorMessage('');
      await fetchInternships();
      await fetchMetrics();

      if (tkn) {
        try {
          await fetchUserData(tkn);
        } catch (authErr) {
          // If token is expired or invalid, silently clear it and continue as a guest
          if (authErr.response?.status === 401) {
            setToken(null);
            setCurrentUser(null);
            setApplications([]);
            setNotifications([]);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            throw authErr; // Re-throw non-auth errors
          }
        }
      }
      setApiStatus('online');
    } catch (err) {
      setApiStatus('offline');
      setErrorMessage(err.response?.data?.error || 'Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage('');
      const cleanEmail = email.trim().toLowerCase();

      if (isRegisterMode) {
        await axios.post(`${API_BASE}/auth/register`, { email: cleanEmail, password, role });
        alert(`Account created as ${role}! Please log in.`);
        setIsRegisterMode(false);
        return;
      }

      const res = await axios.post(`${API_BASE}/auth/login`, { email: cleanEmail, password });
      const newToken = res.data.token;

      setToken(newToken);
      setCurrentUser(res.data.user);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setShowAuthModal(false);
      await fetchUserData(newToken);
    } catch (err) {
      setErrorMessage(`Authentication failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setApplications([]);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveTab('browse');
  };

  const handleApply = async (internshipId) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (currentUser?.role === 'company') {
      alert('Company accounts cannot apply for internships. Switch to a student account.');
      return;
    }
    try {
      setApplyingId(internshipId);
      setErrorMessage('');
      await axios.post(
        `${API_BASE}/bookings`,
        {
          eventId: internshipId,
          quantity: 1,
          paymentDetails: { cardNumber: '4111-1111-1111-1111', expiry: '12/28', cvv: '123' },
        },
        authHeader(token)
      );
      await refreshDashboard(token);
      setActiveTab('applications');
    } catch (err) {
      setErrorMessage(`Application failed: ${err.response?.data?.details || err.response?.data?.error || err.message}`);
    } finally {
      setApplyingId(null);
    }
  };

  const categories = useMemo(
    () => ['All', ...new Set(internships.map((i) => i.category).filter(Boolean))],
    [internships]
  );

  const filteredInternships = useMemo(() => {
    return internships.filter((i) => {
      const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
      const searchable = `${i.title} ${i.company} ${i.location} ${i.category} ${(i.skills || []).join(' ')}`.toLowerCase();
      return matchesCategory && searchable.includes(searchTerm.toLowerCase());
    });
  }, [internships, searchTerm, selectedCategory]);

  const isStudent = currentUser?.role === 'student' || !currentUser;
  const isCompany = currentUser?.role === 'company';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ─── Navigation ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Zap size={22} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            SkillBridge
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <button onClick={() => setActiveTab('browse')} className={`hover:text-indigo-600 transition-colors ${activeTab === 'browse' ? 'text-indigo-600 font-bold' : ''}`}>Browse</button>
          {token && (
            <button onClick={() => setActiveTab('applications')} className={`hover:text-indigo-600 transition-colors ${activeTab === 'applications' ? 'text-indigo-600 font-bold' : ''}`}>
              My Applications
              {applications.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{applications.length}</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-sm">
                {isCompany ? <Building2 size={16} className="text-violet-500" /> : <GraduationCap size={16} className="text-indigo-500" />}
                <span className="font-medium text-slate-600">{currentUser?.email}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCompany ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {currentUser?.role}
                </span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-semibold hover:bg-slate-300 transition-all active:scale-95 text-sm">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm">
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      {activeTab === 'browse' && (
        <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} />
            Find your next software engineering internship
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Launch Your{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Career
            </span>{' '}
            in Tech
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            SkillBridge connects ambitious software engineering students with top-tier companies offering real, paid internship opportunities.
          </p>

          <div className="flex flex-col gap-6 items-center justify-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-5xl">
              <div className="rounded-3xl bg-white/95 border border-slate-200 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl w-full">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-[0.24em] mb-3">Platform performance</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Internships</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.totalInternships}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open slots</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.openSlots}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Companies</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.activeCompanies}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-indigo-950/95 border border-indigo-800 p-6 text-white shadow-2xl shadow-indigo-500/20 w-full">
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-300 mb-3">Live platform signal</p>
                <p className="text-2xl sm:text-3xl font-extrabold leading-tight">High-performance intern matching powered by microservices.</p>
                <p className="mt-4 text-slate-200 text-sm leading-relaxed">Search faster, apply instantly, and track applications through a secure gateway with distributed backend services.</p>
              </div>
            </div>

            <div className="flex items-center justify-center w-full max-w-md">
              <div className="flex items-center justify-between w-full bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                <Search className="ml-3 text-slate-400 flex-shrink-0" size={20} />
                <input
                  id="internship-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search roles, companies, skills..."
                  className="w-full p-3 outline-none bg-transparent text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ─── Main Content ───────────────────────────────────────────────────── */}
      <main className="px-6 pb-20 max-w-7xl mx-auto">
        <StatusBanner apiStatus={apiStatus} errorMessage={errorMessage} />

        {errorMessage && apiStatus !== 'offline' && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700">
            ⚠️ {errorMessage}
          </div>
        )}

        {activeTab === 'browse' && (
          <section className="mb-10 grid gap-4 lg:grid-cols-3">
            {PLATFORM_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-3xl bg-indigo-50 text-indigo-600 mb-5 shadow-sm shadow-indigo-100">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-6">{benefit.description}</p>
                </div>
              );
            })}
          </section>
        )}

        {/* Dashboard Stats */}
        {token && (
          <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest mb-1">Applications</span>
              <strong className="text-3xl text-slate-900">{applications.length}</strong>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest mb-1">Notifications</span>
              <strong className="text-3xl text-slate-900">{notifications.length}</strong>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest mb-1">Account Type</span>
              <strong className={`text-lg capitalize ${isCompany ? 'text-violet-600' : 'text-indigo-600'}`}>{currentUser?.role}</strong>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest mb-1">Latest Application</span>
              <strong className="block truncate text-sm text-slate-900">{applications[applications.length - 1]?.eventTitle || 'None yet'}</strong>
            </div>
          </section>
        )}

        {/* ── Browse Tab ── */}
        {activeTab === 'browse' && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-800">
                Open Internships
                <span className="ml-3 text-base font-normal text-slate-400">({filteredInternships.length} listings)</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedCategory === cat
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200'
                        : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600 bg-white text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <Loader2 className="animate-spin mr-2" />
                Loading internships from backend...
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Briefcase size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No internships found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((internship) => {
                  const alreadyApplied = applications.some((a) => a.eventId === internship.id);
                  return (
                    <div key={internship.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                      {/* Card Header */}
                      <div className="h-36 bg-gradient-to-br from-indigo-500 to-violet-600 relative p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                            {internship.category}
                          </span>
                          <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded-lg">
                            {internship.available} slots left
                          </span>
                        </div>
                        <div>
                          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{internship.company}</p>
                          <h3 className="text-white text-lg font-bold leading-tight mt-0.5 group-hover:underline">
                            {internship.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex flex-col gap-1.5 text-slate-500 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="flex-shrink-0" />
                            {internship.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="flex-shrink-0" />
                            Start: {internship.date}
                          </div>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                          {internship.description}
                        </p>

                        {/* Skills */}
                        {internship.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {internship.skills.map((skill) => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Verification Fee</span>
                            <span className="text-xl font-black text-slate-900">${internship.price}</span>
                          </div>
                          <button
                            id={`apply-btn-${internship.id}`}
                            onClick={() => handleApply(internship.id)}
                            disabled={applyingId === internship.id || internship.available < 1 || alreadyApplied || isCompany}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                              alreadyApplied
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : isCompany
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : internship.available < 1
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-md shadow-indigo-200'
                            }`}
                            aria-label={`Apply for ${internship.title}`}
                          >
                            {applyingId === internship.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : alreadyApplied ? (
                              '✓ Applied'
                            ) : internship.available < 1 ? (
                              'Closed'
                            ) : (
                              <>Apply <ChevronRight size={16} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && token && (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-8">My Applications</h2>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <GraduationCap size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No applications yet</p>
                <button onClick={() => setActiveTab('browse')} className="mt-4 text-indigo-600 font-semibold hover:underline text-sm">
                  Browse open internships →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{app.company}</p>
                        <h3 className="text-lg font-bold text-slate-900">{app.eventTitle}</h3>
                        <p className="text-sm text-slate-500 mt-1">Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="flex-shrink-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        {app.status}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm text-slate-500">
                      <span>Fee paid: <strong className="text-slate-700">${app.totalAmount}</strong></span>
                      <span>Ref: <strong className="text-slate-700 font-mono text-xs">{app.transactionId?.slice(0, 12)}…</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-lg text-white">
            <Zap size={14} />
          </div>
          <span className="font-bold text-slate-600">SkillBridge</span>
        </div>
        <p>© 2026 SkillBridge. Microservices-based career platform for software engineering students.</p>
      </footer>

      {/* ─── Auth Modal ─────────────────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
              aria-label="Close auth modal"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Zap className="text-white" size={28} />
              </div>
              <h2 id="auth-modal-title" className="text-3xl font-bold text-slate-900">
                {isRegisterMode ? 'Join SkillBridge' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {isRegisterMode ? 'Create your free account to get started' : 'Log in to manage your applications'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              {/* Role selector — only shown during registration */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="role-student"
                      onClick={() => setRole('student')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        role === 'student'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                      }`}
                    >
                      <GraduationCap size={18} />
                      Student
                    </button>
                    <button
                      type="button"
                      id="role-company"
                      onClick={() => setRole('company')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        role === 'company'
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 text-slate-500 hover:border-violet-300'
                      }`}
                    >
                      <Building2 size={18} />
                      Company
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{errorMessage}</p>
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all mt-2"
              >
                {isRegisterMode ? 'Create Account' : 'Log In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMessage(''); }}
                className="ml-2 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                {isRegisterMode ? 'Log in here' : 'Sign up free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

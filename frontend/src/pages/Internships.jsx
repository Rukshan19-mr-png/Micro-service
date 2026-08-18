import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, Loader2, Zap, BadgeCheck, CheckCircle2, Globe, Building2, DollarSign, Laptop, Users, Filter } from 'lucide-react';
import StatusBanner from '../components/StatusBanner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SkillBadge = ({ skill }) => (
  <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
    {skill}
  </span>
);

const Internships = ({ onOpenAuth }) => {
  const { token, currentUser, authHeader } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [applicantOrigin, setApplicantOrigin] = useState('all'); // 'all', 'local', 'foreign'
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/internships`);
        setInternships(res.data);
        setApiStatus('online');

        if (token) {
          const appRes = await axios.get(`${API_BASE}/bookings`, authHeader());
          setApplications(appRes.data);
        }
      } catch (err) {
        setApiStatus('offline');
        setErrorMessage(err.response?.data?.error || 'Failed to fetch internships');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleOpenApplicationModal = (internship) => {
    if (!token) {
      onOpenAuth();
      return;
    }
    if (currentUser?.role === 'company') {
      alert('Company accounts cannot apply for internships. Switch to a student account.');
      return;
    }
    navigate(`/apply/${internship.id}`);
  };

  const categories = useMemo(
    () => ['All', ...new Set(internships.map((i) => i.category).filter(Boolean))],
    [internships]
  );

  const filteredInternships = useMemo(() => {
    return internships.filter((i) => {
      const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
      const matchesWorkMode = selectedWorkMode === 'All' || (i.workMode && i.workMode.toLowerCase().includes(selectedWorkMode.toLowerCase()));
      
      let matchesOrigin = true;
      if (applicantOrigin === 'foreign') {
        matchesOrigin = i.workMode?.includes('Online') || i.eligibleApplicants?.includes('Global');
      } else if (applicantOrigin === 'local') {
        matchesOrigin = true; // Local candidates can apply for any role
      }

      const searchable = `${i.title} ${i.company} ${i.location} ${i.category} ${i.workMode || ''} ${i.stipend || ''} ${(i.skills || []).join(' ')}`.toLowerCase();
      return matchesCategory && matchesWorkMode && matchesOrigin && searchable.includes(searchTerm.toLowerCase());
    });
  }, [internships, searchTerm, selectedCategory, selectedWorkMode, applicantOrigin]);

  const isStudent = currentUser?.role === 'student' || !currentUser;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatusBanner apiStatus={apiStatus} errorMessage={errorMessage} />

        {/* Header & Controls Panel */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10 mt-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  🇱🇰 Sri Lanka & Global Opportunities
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  🌐 Foreign Remote Friendly
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Explore Tech Internships</h1>
              <p className="text-slate-500 mt-1">Discover opportunities from top Sri Lankan tech companies and global remote platforms.</p>
            </div>
            
            {/* Search bar */}
            <div className="flex items-center w-full lg:w-96 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Search className="ml-3 text-slate-400 flex-shrink-0" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search WSO2, Virtusa, React, Colombo..."
                className="w-full p-1.5 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          {/* Advanced Multi-Criteria Filter Bar */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Candidate Origin Filter */}
            <div className="md:col-span-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex items-center">
              <span className="text-xs font-bold text-slate-500 px-3 uppercase tracking-wider flex items-center gap-1">
                <Globe size={14} /> Origin:
              </span>
              <button
                onClick={() => setApplicantOrigin('all')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  applicantOrigin === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setApplicantOrigin('local')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  applicantOrigin === 'local' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🇱🇰 Local SL
              </button>
              <button
                onClick={() => setApplicantOrigin('foreign')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  applicantOrigin === 'foreign' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✈️ Foreign (Online)
              </button>
            </div>

            {/* Work Mode Filter */}
            <div className="md:col-span-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Laptop size={14} /> Mode:
              </span>
              {['All', 'Online', 'Onsite', 'Hybrid'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedWorkMode(mode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedWorkMode === mode
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {mode === 'Online' ? '🌐 Online (Remote)' : mode === 'Onsite' ? '🏢 Onsite' : mode === 'Hybrid' ? '🔀 Hybrid' : 'All Modes'}
                </button>
              ))}
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  selectedCategory === cat
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600 bg-white text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 px-2">
          <p className="text-sm font-semibold text-slate-600">
            Showing <span className="text-indigo-600 font-bold">{filteredInternships.length}</span> opportunities
            {applicantOrigin === 'foreign' && ' (Filtered for Foreign Remote Applicants)'}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
            <p className="font-medium">Loading Sri Lanka & Global opportunities...</p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Briefcase size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-bold text-slate-700">No matching internships found</p>
            <p className="text-sm mt-1 text-slate-500">Try adjusting your origin filter, work mode, or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => {
              const alreadyApplied = applications.some((a) => a.eventId === internship.id);
              const isOnline = internship.workMode?.includes('Online') || internship.location?.includes('Remote');
              const isSriLankaCompany = internship.company.includes('Sri Lanka') || internship.location.includes('Sri Lanka') || internship.country === 'Sri Lanka';
              
              return (
                <div key={internship.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                  
                  {/* Card Header */}
                  <div className="h-40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-white/15 backdrop-blur text-white text-xs font-extrabold px-3 py-1 rounded-full border border-white/20">
                        {internship.category}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {isOnline ? (
                          <span className="bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Globe size={11} /> Online Remote
                          </span>
                        ) : (
                          <span className="bg-indigo-500/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Building2 size={11} /> {internship.workMode || 'Onsite'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isSriLankaCompany && (
                        <span className="text-amber-300 text-[11px] font-extrabold uppercase tracking-wider mb-1 block">
                          🇱🇰 Sri Lanka HQ
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-2 leading-tight">
                        {internship.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {internship.company.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block leading-none">{internship.company}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">{internship.duration || '6 Months'} Internship</span>
                        </div>
                      </div>
                      {internship.verified && <BadgeCheck size={18} className="text-indigo-500 flex-shrink-0" />}
                    </div>

                    {/* Stipend Banner */}
                    <div className="mb-4 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Stipend</span>
                      <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {internship.stipend || 'Competitive'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mb-5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-slate-400 flex-shrink-0" /> 
                        <span className="truncate">{internship.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={15} className="text-slate-400 flex-shrink-0" />
                        <span className={internship.available < 4 ? 'text-amber-600 font-semibold' : ''}>
                          {internship.available} slots remaining
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-600 font-medium">
                        <Globe size={15} className="flex-shrink-0" />
                        <span>{internship.eligibleApplicants || 'Open to all candidates'}</span>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-1.5">
                      {(internship.skills || []).slice(0, 3).map(skill => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                      {(internship.skills?.length > 3) && (
                        <span className="text-xs text-slate-400 font-medium py-1">+{internship.skills.length - 3} more</span>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Fee</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            🇱🇰 SL: FREE
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            ✈️ Foreign: $15
                          </span>
                        </div>
                      </div>

                      {alreadyApplied ? (
                        <button disabled className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs border border-emerald-200">
                          <CheckCircle2 size={16} />
                          Applied
                        </button>
                      ) : isStudent && internship.available > 0 ? (
                        <button
                          onClick={() => handleOpenApplicationModal(internship)}
                          className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          Apply Now
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;


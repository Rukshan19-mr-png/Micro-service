import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { Search, Briefcase, MapPin, Loader2, Zap, BadgeCheck, CheckCircle2, User, Mail, Phone, FileText, X, Send } from 'lucide-react';
=======
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, Loader2, Zap, BadgeCheck, CheckCircle2, Globe, Building2, DollarSign, Laptop, Users, Filter, ExternalLink, ShieldCheck, Phone } from 'lucide-react';
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
import StatusBanner from '../components/StatusBanner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SkillBadge = ({ skill }) => (
  <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
    {skill}
  </span>
);

const Internships = ({ onOpenAuth }) => {
  const { token, currentUser, authHeader } = useAuth();
<<<<<<< HEAD
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [appForm, setAppForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    experience: '',
    coverLetter: ''
  });
  const [cvName, setCvName] = useState('');
  const [cvBase64, setCvBase64] = useState('');
  const [submittingApplication, setSubmittingApplication] = useState(false);
=======
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
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

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
<<<<<<< HEAD
      alert('Company accounts cannot apply for internships. Switch to a student account.');
      return;
    }

    setSelectedInternship(internship);
    setAppForm({
      fullName: currentUser?.name || currentUser?.email?.split('@')[0] || '',
      email: currentUser?.email || '',
      phone: '',
      location: '',
      skills: '',
      experience: '',
      coverLetter: ''
    });
    setCvName('');
    setCvBase64('');
    setErrorMessage('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCvBase64(reader.result);
      setCvName(file.name);
    };
    reader.onerror = () => {
      alert('Unable to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const updateApplicantField = (field) => (event) => {
    setAppForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    if (!selectedInternship) return;
    if (!cvBase64) {
      alert('Please upload your CV before submitting your application.');
      return;
    }

    const requiredFields = [appForm.fullName, appForm.email, appForm.phone, appForm.location, appForm.experience, appForm.coverLetter];
    if (requiredFields.some((value) => String(value).trim() === '')) {
      alert('Please complete all applicant details before submitting.');
      return;
    }

    try {
      setSubmittingApplication(true);
      await axios.post(
        `${API_BASE}/bookings`,
        {
          eventId: selectedInternship.id,
          quantity: 1,
          paymentDetails: { cardNumber: '4111-1111-1111-1111', expiry: '12/28', cvv: '123' },
          applicant: {
            fullName: appForm.fullName.trim(),
            email: appForm.email.trim(),
            phone: appForm.phone.trim(),
            location: appForm.location.trim(),
            skills: appForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
            experience: appForm.experience.trim(),
            coverLetter: appForm.coverLetter.trim(),
            cvName,
            cvData: cvBase64
          }
        },
        authHeader()
      );

      const appRes = await axios.get(`${API_BASE}/bookings`, authHeader());
      setApplications(appRes.data);
      setSelectedInternship(null);
      alert('Application submitted successfully.');
    } catch (err) {
      alert(`Application failed: ${err.response?.data?.details || err.response?.data?.error || err.message}`);
    } finally {
      setSubmittingApplication(false);
    }
=======
      alert('Company accounts cannot apply for internships. Please sign in with an Internship Candidate account.');
      return;
    }
    navigate(`/apply/${internship.id}`);
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
  };

  const categories = useMemo(
    () => ['All', ...new Set(internships.map((i) => i.category).filter(Boolean))],
    [internships]
  );

  const filteredInternships = useMemo(() => {
    return internships.filter((i) => {
      const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
<<<<<<< HEAD
      const searchable = `${i.title} ${i.company} ${i.location} ${i.category} ${(i.skills || []).join(' ')}`.toLowerCase();
      return matchesCategory && searchable.includes(searchTerm.toLowerCase());
    });
  }, [internships, searchTerm, selectedCategory]);

  const isStudent = currentUser?.role === 'student' || !currentUser;
=======
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

  const isCandidate = currentUser?.role === 'candidate' || !currentUser;
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatusBanner apiStatus={apiStatus} errorMessage={errorMessage} />

<<<<<<< HEAD
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10 mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Browse Internships</h1>
              <p className="text-slate-500">Discover your next opportunity from {internships.length} active postings.</p>
            </div>
            
            <div className="flex items-center w-full md:w-96 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
=======
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
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
              <Search className="ml-3 text-slate-400 flex-shrink-0" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD
                placeholder="Search roles, companies, skills..."
                className="w-full p-2 outline-none bg-transparent text-slate-800 placeholder-slate-400"
=======
                placeholder="Search WSO2, Virtusa, React, Colombo..."
                className="w-full p-1.5 outline-none bg-transparent text-slate-800 placeholder-slate-400 text-sm"
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
              />
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
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
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
            <p className="font-medium">Loading opportunities...</p>
=======
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
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
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
            <p className="font-medium">Loading verified opportunities...</p>
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Briefcase size={48} className="mb-4 opacity-30" />
<<<<<<< HEAD
            <p className="text-lg font-medium">No internships found</p>
            <p className="text-sm mt-1">Try adjusting your search or category filter</p>
=======
            <p className="text-lg font-bold text-slate-700">No matching internships found</p>
            <p className="text-sm mt-1 text-slate-500">Try adjusting your origin filter, work mode, or search terms.</p>
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => {
              const alreadyApplied = applications.some((a) => a.eventId === internship.id);
<<<<<<< HEAD
              
              return (
                <div key={internship.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                  {/* Card Header */}
                  <div className="h-36 bg-gradient-to-br from-indigo-500 to-violet-600 relative p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                        {internship.category}
                      </span>
                      {internship.featured && (
                        <span className="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap size={12} className="fill-amber-950" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white drop-shadow-sm line-clamp-2 leading-tight">
=======
              const isOnline = internship.workMode?.includes('Online') || internship.location?.includes('Remote');
              
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

                    <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-2 leading-tight">
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
                      {internship.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
<<<<<<< HEAD
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {internship.company.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{internship.company}</span>
                      {internship.verified && <BadgeCheck size={16} className="text-indigo-500" />}
                    </div>

                    <div className="flex flex-col gap-2.5 mb-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" /> {internship.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400" />
                        <span className={internship.available < 5 ? 'text-amber-600 font-semibold' : ''}>
                          {internship.available} slots available
                        </span>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
=======
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm flex-shrink-0">
                          {internship.company.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-sm block leading-tight truncate">{internship.company}</span>
                          {internship.website ? (
                            <a
                              href={internship.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 transition-colors"
                              title="Visit official company website to verify authenticity"
                            >
                              <Globe size={11} />
                              <span className="truncate max-w-[150px]">{internship.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                              <ExternalLink size={10} className="flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{internship.duration || '6 Months'} Internship</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0" title="Authenticity verified employer with official domain">
                        <BadgeCheck size={13} className="text-emerald-600" />
                        <span>Verified</span>
                      </div>
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
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
                      {(internship.skills || []).slice(0, 3).map(skill => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                      {(internship.skills?.length > 3) && (
                        <span className="text-xs text-slate-400 font-medium py-1">+{internship.skills.length - 3} more</span>
                      )}
                    </div>

<<<<<<< HEAD
                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Fee</span>
                        <span className="text-lg font-bold text-slate-900">${internship.price}</span>
                      </div>

                      {alreadyApplied ? (
                        <button disabled className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-emerald-200">
                          <CheckCircle2 size={18} />
                          Applied
                        </button>
                      ) : isStudent && internship.available > 0 ? (
                        <button
                          onClick={() => handleOpenApplicationModal(internship)}
                          disabled={applyingId === internship.id}
                          className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
                        >
                          {applyingId === internship.id ? <Loader2 size={18} className="animate-spin" /> : 'Apply Now'}
=======
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
                      ) : isCandidate && internship.available > 0 ? (
                        <button
                          onClick={() => handleOpenApplicationModal(internship)}
                          className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          Apply Now
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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
<<<<<<< HEAD

      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Application Form</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Apply for {selectedInternship.title}</h2>
                <p className="mt-2 text-sm text-slate-500">Share details that help the team evaluate your fit for this role and upload your CV.</p>
              </div>
              <button type="button" onClick={() => setSelectedInternship(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 flex items-center gap-2"><User size={16} /> Full name</span>
                  <input required value={appForm.fullName} onChange={updateApplicantField('fullName')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Enter your full name" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 flex items-center gap-2"><Mail size={16} /> Email</span>
                  <input required type="email" value={appForm.email} onChange={updateApplicantField('email')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="your@email.com" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 flex items-center gap-2"><Phone size={16} /> Phone</span>
                  <input required value={appForm.phone} onChange={updateApplicantField('phone')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Phone number" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 flex items-center gap-2"><MapPin size={16} /> Location</span>
                  <input required value={appForm.location} onChange={updateApplicantField('location')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="City / Country" />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><Briefcase size={16} /> Skills</span>
                <input value={appForm.skills} onChange={updateApplicantField('skills')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="React, Node.js, UI/UX" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><FileText size={16} /> Relevant experience</span>
                <textarea required rows="3" value={appForm.experience} onChange={updateApplicantField('experience')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Briefly describe your experience and achievements" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><Send size={16} /> Motivation / cover letter</span>
                <textarea required rows="4" value={appForm.coverLetter} onChange={updateApplicantField('coverLetter')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Tell us why you're a strong fit for this opportunity" />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><FileText size={16} /> Upload CV</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="mt-2 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600" />
                <p className="mt-2 text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX</p>
                {cvName && <p className="mt-2 text-sm font-medium text-emerald-600">Selected file: {cvName}</p>}
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setSelectedInternship(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submittingApplication} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70">
                  {submittingApplication ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                  {submittingApplication ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
=======
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
    </div>
  );
};

export default Internships;
<<<<<<< HEAD
=======

>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b

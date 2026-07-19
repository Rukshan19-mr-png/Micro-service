import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, MapPin, Loader2, Zap, BadgeCheck, CheckCircle2, User, Mail, Phone, FileText, X, Send } from 'lucide-react';
import StatusBanner from '../components/StatusBanner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SkillBadge = ({ skill }) => (
  <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
    {skill}
  </span>
);

const Internships = ({ onOpenAuth }) => {
  const { token, currentUser, authHeader } = useAuth();
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

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatusBanner apiStatus={apiStatus} errorMessage={errorMessage} />

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10 mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Browse Internships</h1>
              <p className="text-slate-500">Discover your next opportunity from {internships.length} active postings.</p>
            </div>
            
            <div className="flex items-center w-full md:w-96 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Search className="ml-3 text-slate-400 flex-shrink-0" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roles, companies, skills..."
                className="w-full p-2 outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

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
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
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
                      {internship.featured && (
                        <span className="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Zap size={12} className="fill-amber-950" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white drop-shadow-sm line-clamp-2 leading-tight">
                      {internship.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
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
                      {(internship.skills || []).slice(0, 3).map(skill => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                      {(internship.skills?.length > 3) && (
                        <span className="text-xs text-slate-400 font-medium py-1">+{internship.skills.length - 3} more</span>
                      )}
                    </div>

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
    </div>
  );
};

export default Internships;

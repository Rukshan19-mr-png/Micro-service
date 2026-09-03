import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, FileText, Send, ArrowLeft, 
  CheckCircle2, ShieldCheck, Upload, CreditCard, Building2, 
  BadgeCheck, AlertCircle, Loader2, FileCheck
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const isLocalPhone = (phoneStr) => {
  if (!phoneStr) return true;
  const clean = String(phoneStr).replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+94') || clean.startsWith('94') || clean.startsWith('07') || clean.startsWith('011') || clean.startsWith('01') || clean.startsWith('03') || clean.startsWith('08') || clean.startsWith('09')) {
    return true;
  }
  if (clean.startsWith('+') || (clean.length >= 10 && !clean.startsWith('0'))) {
    return false;
  }
  return true;
};

const ApplyNow = ({ onOpenAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, currentUser, authHeader } = useAuth();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Info & CV, 2: Cover Letter, 3: Verification & Submit
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    countryOfOrigin: 'Sri Lanka',
    workArrangement: 'Online Remote',
    timezoneAvailability: 'IST (UTC+5:30) / Flexible',
    skills: '',
    experience: '',
    coverLetter: '',
    cardNumber: '4111 1111 1111 1111',
    cardExpiry: '12/28',
    cardCvv: '123'
  });

  const [cvName, setCvName] = useState('');
  const [cvBase64, setCvBase64] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        fullName: currentUser.name || currentUser.email?.split('@')[0] || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/internships/${id}`);
        setInternship(res.data);
        if (res.data?.workMode) {
          setForm(prev => ({ ...prev, workArrangement: res.data.workMode }));
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'Failed to load internship details');
      } finally {
        setLoading(false);
      }
    };
    fetchInternship();
  }, [id]);

  const handleInputChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please select a smaller PDF or Word document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCvBase64(reader.result);
      setCvName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) return 'Full Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid Email address is required';
    if (!form.phone.trim()) return 'Phone Number is required';
    if (!form.location.trim()) return 'Location is required';
    if (!form.countryOfOrigin.trim()) return 'Country of Origin / Nationality is required';
    if (!cvBase64) return 'Please upload your CV before proceeding';
    return null;
  };

  const validateStep2 = () => {
    if (!form.experience.trim()) return 'Please describe your relevant experience';
    if (!form.coverLetter.trim() || form.coverLetter.trim().length < 20) return 'Cover letter / motivation must be at least 20 characters';
    return null;
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      onOpenAuth();
      return;
    }
    if (currentUser?.role === 'company') {
      alert('Company accounts cannot apply for internships.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      await axios.post(
        `${API_BASE}/bookings`,
        {
          eventId: internship.id,
          quantity: 1,
          paymentDetails: {
            cardNumber: form.cardNumber.replace(/\s/g, ''),
            expiry: form.cardExpiry,
            cvv: form.cardCvv
          },
          applicant: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            location: form.location.trim(),
            countryOfOrigin: form.countryOfOrigin,
            workArrangement: form.workArrangement,
            timezoneAvailability: form.timezoneAvailability,
            skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
            experience: form.experience.trim(),
            coverLetter: form.coverLetter.trim(),
            cvName,
            cvData: cvBase64
          }
        },
        authHeader()
      );

      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.details || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="font-semibold text-slate-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Your application for <span className="font-bold text-slate-800">{internship.title}</span> at <span className="font-bold text-slate-800">{internship.company}</span> has been received and verified.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left mb-6 text-sm text-slate-600 space-y-1">
            <p><span className="font-semibold text-slate-800">Applicant:</span> {form.fullName}</p>
            <p><span className="font-semibold text-slate-800">CV File:</span> {cvName}</p>
            <p><span className="font-semibold text-slate-800">Status:</span> Verified & Applied</p>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate('/internships')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Opportunities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Summary Banner */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                {internship?.category}
              </span>

              <h1 className="text-2xl font-black leading-tight mb-2">{internship?.title}</h1>
              
              <div className="flex items-center gap-2 text-indigo-100 font-semibold mb-6">
                <Building2 size={18} />
                <span>{internship?.company}</span>
                {internship?.verified && <BadgeCheck size={18} className="text-amber-300" />}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/20 text-sm text-indigo-100">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-indigo-300" />
                  <span>{internship?.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-indigo-300" />
                  <span>{internship?.available} slots available</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-indigo-300" />
                  <span>
                    {!isLocalPhone(form.phone) ? (
                      <>Foreign Worker Fee: <strong className="text-amber-300">$15 USD</strong></>
                    ) : (
                      <>Local Candidate Fee: <strong className="text-emerald-300">FREE ($0)</strong></>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(internship?.skills || []).map((skill) => (
                    <span key={skill} className="bg-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" /> Why apply through NexusEvent?
              </h4>
              <ul className="text-sm text-slate-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  Direct routing to company hiring managers
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  Instant payment protection & verification receipt
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  Real-time notification updates on your application status
                </li>
              </ul>
            </div>
          </div>

          {/* Right Main Stepped Application Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              
              {/* Stepper Header */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Apply Now</h2>
                  <p className="text-slate-400 text-sm mt-1">Complete step {step} of 3 to finish your application</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
                  <div className="w-4 h-0.5 bg-slate-800"></div>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
                  <div className="w-4 h-0.5 bg-slate-800"></div>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                
                {errorMessage && (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 font-medium text-sm flex items-center gap-3">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Step 1: Personal Info & CV */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Step 1: Contact Details & Resume</h3>
                      <p className="text-slate-500 text-sm">Fill in your information so the employer can reach you.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={form.fullName}
                            onChange={handleInputChange('fullName')}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={handleInputChange('email')}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-semibold text-slate-700">Phone Number *</label>
                          {form.phone && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isLocalPhone(form.phone)
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {isLocalPhone(form.phone) ? '🇱🇰 Local Candidate (FREE)' : '✈️ Foreign Candidate ($15 USD Fee)'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={form.phone}
                            onChange={handleInputChange('phone')}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                            placeholder="+94 77 123 4567 or +1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current City & Residence *</label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={form.location}
                            onChange={handleInputChange('location')}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800"
                            placeholder="Colombo, Sri Lanka or London, UK"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country of Origin / Citizenship *</label>
                        <select
                          value={form.countryOfOrigin}
                          onChange={handleInputChange('countryOfOrigin')}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-white font-medium"
                        >
                          <option value="Sri Lanka">🇱🇰 Sri Lanka (Local Citizen)</option>
                          <option value="India">🇮🇳 India</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="Germany">🇩🇪 Germany</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="Singapore">🇸🇬 Singapore</option>
                          <option value="Other Foreign Country">🌍 Other International Worker</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Work Arrangement *</label>
                        <select
                          value={form.workArrangement}
                          onChange={handleInputChange('workArrangement')}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-white font-medium"
                        >
                          <option value="Online (Remote)">🌐 Online Remote (Foreign & Local)</option>
                          <option value="Onsite">🏢 Onsite (Sri Lanka Office)</option>
                          <option value="Hybrid">🔀 Hybrid (3 Days Office / 2 Days Remote)</option>
                        </select>
                      </div>
                    </div>

                    {/* Upload CV */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Resume / CV *</label>
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-all group">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {cvName ? <FileCheck size={24} className="text-emerald-600" /> : <Upload size={24} />}
                          </div>
                          {cvName ? (
                            <div>
                              <p className="font-bold text-emerald-600 text-sm mb-1">Attached: {cvName}</p>
                              <p className="text-xs text-slate-400">Click or drag to replace document</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-bold text-slate-700 text-sm mb-1">Click to upload or drag & drop</p>
                              <p className="text-xs text-slate-400">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        Continue to Step 2
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience & Motivation */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Step 2: Experience & Cover Letter</h3>
                      <p className="text-slate-500 text-sm">Tell the employer about your skills and why you're a great fit.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Key Technical / Soft Skills</label>
                      <input
                        type="text"
                        value={form.skills}
                        onChange={handleInputChange('skills')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        placeholder="React, Node.js, TypeScript, UI/UX (comma-separated)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relevant Experience & Projects *</label>
                      <textarea
                        rows="3"
                        required
                        value={form.experience}
                        onChange={handleInputChange('experience')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        placeholder="Summarize your past work, internship projects, or hackathon contributions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Letter / Statement of Purpose *</label>
                      <textarea
                        rows="5"
                        required
                        value={form.coverLetter}
                        onChange={handleInputChange('coverLetter')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        placeholder="Why do you want to join this company? What makes you stand out?"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        Continue to Step 3
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Verification & Submit */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">Step 3: Free Application Confirmation</h3>
                      <p className="text-slate-500 text-sm">Review your application details before final submission.</p>
                    </div>

                    {/* Application Summary Box */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm space-y-2">
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-3 text-indigo-600">Application Summary</p>
                      <p><span className="font-semibold text-slate-700">Role:</span> {internship?.title} ({internship?.company})</p>
                      <p><span className="font-semibold text-slate-700">Applicant Name:</span> {form.fullName}</p>
                      <p><span className="font-semibold text-slate-700">Contact Phone:</span> {form.phone} ({isLocalPhone(form.phone) ? '🇱🇰 Local Candidate' : '✈️ Foreign Candidate'})</p>
                      <p><span className="font-semibold text-slate-700">Work Arrangement:</span> {form.workArrangement}</p>
                      <p><span className="font-semibold text-slate-700">Attached Resume:</span> {cvName}</p>
                    </div>

                    {/* Conditional Payment / Free Notice Banner based on Applicant Phone Identification */}
                    {!isLocalPhone(form.phone) ? (
                      <div className="border border-amber-200 bg-amber-50/70 p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-amber-950 font-bold">
                            <CreditCard className="text-amber-600" size={20} />
                            <span>Foreign Applicant International Verification Fee</span>
                          </div>
                          <span className="text-xl font-black text-amber-700">$15 USD</span>
                        </div>
                        <p className="text-xs text-amber-800">
                          Identified as an international foreign candidate ({form.phone}). Foreign applicant processing includes international identity check and platform verification. Local Sri Lankan candidate applications (+94 / 07...) remain 100% free across all companies.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1">Test Card Number</label>
                            <input
                              type="text"
                              value={form.cardNumber}
                              onChange={handleInputChange('cardNumber')}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Expiry</label>
                              <input
                                type="text"
                                value={form.cardExpiry}
                                onChange={handleInputChange('cardExpiry')}
                                className="w-full px-2 py-2 rounded-lg border border-slate-200 font-mono text-sm bg-white text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CVV</label>
                              <input
                                type="text"
                                value={form.cardCvv}
                                onChange={handleInputChange('cardCvv')}
                                className="w-full px-2 py-2 rounded-lg border border-slate-200 font-mono text-sm bg-white text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-emerald-200 bg-emerald-50/70 p-5 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                          🇱🇰
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-900 text-base">100% Free Application for Local Candidates</h4>
                          <p className="text-emerald-700 text-sm mt-0.5">
                            Local Sri Lankan applicant phone number identified ({form.phone}). Your application to {internship?.company} is completely free of charge!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 ${
                          !isLocalPhone(form.phone) ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                      >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        {submitting ? 'Processing Application...' : (!isLocalPhone(form.phone) ? 'Pay $15 USD & Submit' : 'Submit Application (Free)')}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ApplyNow;

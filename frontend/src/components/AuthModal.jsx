import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Loader2, User, Building2, Globe, Phone, Mail, Lock, GraduationCap, ShieldCheck, MapPin } from 'lucide-react';

const AuthModal = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Candidate Specific Fields
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('Software Engineering');
  const [university, setUniversity] = useState('');

  // Company Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyLocation, setCompanyLocation] = useState('Colombo, Sri Lanka');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        if (role === 'candidate') {
          await register({
            email,
            password,
            role: 'candidate',
            name: candidateName,
            phone: candidatePhone,
            fieldOfStudy,
            university
          });
        } else {
          // Company validation
          let formattedWebsite = officialWebsite.trim();
          if (!formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
            formattedWebsite = 'https://' + formattedWebsite;
          }

          await register({
            email,
            password,
            role: 'company',
            name: companyName,
            website: formattedWebsite,
            phone: companyPhone,
            location: companyLocation
          });
        }

        // Automatically log user in after successful registration
        await login(email, password);
        onClose();
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${isRegisterMode ? 'max-w-xl' : 'max-w-md'} max-h-[92vh] flex flex-col overflow-hidden relative slide-in-bottom-4 duration-300`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isRegisterMode ? 'Create an Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegisterMode 
                ? 'Join as an Internship Candidate or Verified Company' 
                : 'Sign in to access opportunities and applications'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start space-x-2">
              <span>{error}</span>
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all ${
                    role === 'candidate' 
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <User className="w-6 h-6 mb-1.5 text-indigo-600" />
                  <span className="font-bold text-sm">Internship Candidate</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Apply for internships</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all ${
                    role === 'company' 
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <Building2 className="w-6 h-6 mb-1.5 text-indigo-600" />
                  <span className="font-bold text-sm">Company</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Post & hire talent</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ─── CANDIDATE REGISTRATION FIELDS ─── */}
            {isRegisterMode && role === 'candidate' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Candidate Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                      placeholder="e.g. Kasun Perera"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                        placeholder="077 123 4567 / +94..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Field of Study
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                        placeholder="Software Engineering"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University / Institute
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                    placeholder="e.g. University of Moratuwa, SLIIT, IIT"
                  />
                </div>
              </>
            )}

            {/* ─── COMPANY REGISTRATION FIELDS ─── */}
            {isRegisterMode && role === 'company' && (
              <>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Verified Company Trust:</strong> Your official website link and phone number will be displayed on all your internship listings so candidates can independently verify that your company is real.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                      placeholder="e.g. WSO2 Sri Lanka, Virtusa, Sysco LABS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Website Link * <span className="text-indigo-600 font-normal">(Shown to candidates)</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={officialWebsite}
                      onChange={(e) => setOfficialWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Candidates will use this link to verify your authenticity.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                        placeholder="+94 11 214 5340"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Headquarters Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                        placeholder="Colombo, Sri Lanka"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Common Credentials */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isRegisterMode && role === 'company' ? 'Official Corporate Email *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  placeholder={isRegisterMode && role === 'company' ? 'careers@yourcompany.com' : 'you@example.com'}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password * (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegisterMode ? (
                role === 'company' ? 'Register Verified Company Account' : 'Create Candidate Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

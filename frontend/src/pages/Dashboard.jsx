import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bell, Briefcase, Users, FileText, Globe, Phone, Mail, BadgeCheck, ShieldCheck, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Dashboard = () => {
  const { token, currentUser, authHeader } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    company: currentUser?.name || currentUser?.email?.split('@')[0] || '',
    website: currentUser?.website || '',
    companyEmail: currentUser?.email || '',
    companyPhone: currentUser?.phone || '',
    category: 'Engineering',
    price: 0,
    location: currentUser?.location || 'Colombo, Sri Lanka',
    capacity: 5,
    skills: '',
    description: ''
  });

  if (!currentUser || currentUser.role !== 'company') {
    return <Navigate to="/" />;
  }

  const fetchDashboardData = async () => {
    try {
      const [notifRes, internRes] = await Promise.all([
        axios.get(`${API_BASE}/notifications`, authHeader()),
        axios.get(`${API_BASE}/internships`)
      ]);
      setNotifications(notifRes.data);
      setInternships(internRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post(
        `${API_BASE}/internships`,
        {
          ...postForm,
          company: postForm.company || currentUser?.name || currentUser?.email?.split('@')[0],
          website: postForm.website || currentUser?.website || '',
          companyEmail: postForm.companyEmail || currentUser?.email || '',
          companyPhone: postForm.companyPhone || currentUser?.phone || '',
          skills: postForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        },
        authHeader()
      );
      alert('Internship posted successfully!');
      setShowPostModal(false);
      setPostForm({
        title: '',
        company: currentUser?.name || currentUser?.email?.split('@')[0] || '',
        website: currentUser?.website || '',
        companyEmail: currentUser?.email || '',
        companyPhone: currentUser?.phone || '',
        category: 'Engineering',
        price: 0,
        location: currentUser?.location || 'Colombo, Sri Lanka',
        capacity: 5,
        skills: '',
        description: ''
      });
      fetchDashboardData();
    } catch (err) {
      alert(`Failed to post internship: ${err.response?.data?.error || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name || 'Company Dashboard'}</h1>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BadgeCheck size={14} className="text-emerald-600" /> Verified Company
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span>{currentUser.email}</span>
              {currentUser.website && (
                <a href={currentUser.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-semibold">
                  <Globe size={13} /> {currentUser.website}
                  <ExternalLink size={11} />
                </a>
              )}
              {currentUser.phone && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone size={13} /> {currentUser.phone}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Briefcase size={20} />
            Post New Opportunity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Postings</p>
              <p className="text-3xl font-extrabold text-slate-900">{internships.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Slots</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {internships.reduce((sum, item) => sum + (item.capacity || 0), 0)}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Notifications</p>
              <p className="text-3xl font-extrabold text-slate-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-indigo-500" /> Active Postings
            </h2>
            {internships.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p>No postings created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {internships.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.company} • {item.location}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">
                      {item.available}/{item.capacity} Slots
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Bell className="text-indigo-500" /> Recent Notifications
            </h2>
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-slate-800 font-medium">{notif.message}</span>
                    <span className="text-xs text-slate-400 font-mono">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Post Internship Opportunity</h3>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role Title</label>
                <input required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Frontend Intern" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                  <input value={postForm.company} onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. WSO2 Sri Lanka" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <input required value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Backend" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Official Website Link (Shown to candidates) *</label>
                  <input required value={postForm.website} onChange={(e) => setPostForm({ ...postForm, website: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://yourcompany.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input value={postForm.companyPhone} onChange={(e) => setPostForm({ ...postForm, companyPhone: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+94 11 214 5340" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                  <input required value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Colombo / Remote" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity Slots</label>
                  <input type="number" required min="1" max="50" value={postForm.capacity} onChange={(e) => setPostForm({ ...postForm, capacity: Number(e.target.value) })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Required Skills (comma separated)</label>
                <input value={postForm.skills} onChange={(e) => setPostForm({ ...postForm, skills: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="React, JavaScript, Tailwind" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea required rows="3" value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Describe role requirements..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md">
                  {submitting ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

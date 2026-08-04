import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Briefcase, ExternalLink, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Applications = () => {
  const { token, currentUser, authHeader } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!currentUser || currentUser.role !== 'student') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${API_BASE}/bookings`, authHeader());
        setApplications(res.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchApplications();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Applications</h1>
        
        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-500">
            <Loader2 className="animate-spin mb-2 w-8 h-8 text-indigo-500" />
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-500 mb-6">You haven't applied to any internships yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {app.company?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{app.eventTitle}</h3>
                      <p className="text-slate-600 font-medium">{app.company}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 font-mono text-xs">TXID: {app.transactionId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {app.status}
                    </div>
                    <span className="text-slate-900 font-bold">${app.totalAmount} Paid</span>
                    {app.applicant?.cvName && <span className="mt-2 text-sm font-medium text-indigo-600">CV: {app.applicant.cvName}</span>}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-900">Applicant details</p>
                      <p className="mt-1">Name: {app.applicant?.fullName || 'Not provided'}</p>
                      <p>Email: {app.applicant?.email || 'Not provided'}</p>
                      <p>Phone: {app.applicant?.phone || 'Not provided'}</p>
                      <p>Location: {app.applicant?.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Interview notes</p>
                      <p className="mt-1">Skills: {app.applicant?.skills?.join(', ') || 'Not provided'}</p>
                      <p>Experience: {app.applicant?.experience || 'Not provided'}</p>
                      <p className="mt-2 text-slate-500">{app.applicant?.coverLetter || 'No cover letter provided.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bell, Briefcase, Users, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Dashboard = () => {
  const { token, currentUser, authHeader } = useAuth();
  const [notifications, setNotifications] = useState([]);

  if (!currentUser || currentUser.role !== 'company') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const notifRes = await axios.get(`${API_BASE}/notifications`, authHeader());
        setNotifications(notifRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    if (token) fetchDashboardData();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Company Dashboard</h1>
        <p className="text-slate-500 mb-8">Welcome back, {currentUser.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Postings</p>
              <p className="text-3xl font-extrabold text-slate-900">Manage</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Applicants</p>
              <p className="text-3xl font-extrabold text-slate-900">Review</p>
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

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="text-indigo-500" /> Recent Activity
          </h2>
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notif => (
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
  );
};

export default Dashboard;

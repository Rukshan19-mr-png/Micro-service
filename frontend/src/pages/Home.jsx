import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, TrendingUp, Rocket, ArrowRight, Zap, BadgeCheck } from 'lucide-react';
import StatusBanner from '../components/StatusBanner';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Secure access',
<<<<<<< HEAD
    description: 'JWT-powered authentication with a protected gateway and role-based routes for students and companies.',
=======
    description: 'JWT-powered authentication with a protected gateway and role-based routes for internship candidates and verified companies.',
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
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

const Home = () => {
  const [metrics, setMetrics] = useState({
    totalInternships: 0,
    openSlots: 0,
    activeCompanies: 0,
    totalApplications: 0,
    totalStudents: 0,
  });
  const [apiStatus, setApiStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/metrics`);
        setMetrics(res.data);
        setApiStatus('online');
      } catch (err) {
        setApiStatus('offline');
        setErrorMessage(err.response?.data?.error || 'Backend connection failed');
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm mb-6 border border-indigo-100">
            <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
<<<<<<< HEAD
            <span>v2.0 Beta Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            The next generation of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
              Event Management
=======
            <span>🇱🇰 Sri Lanka Tech & Global Remote Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
            Empowering Global & Local <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
              Tech Internships
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto mb-10">
<<<<<<< HEAD
            Connect students and companies instantly with our scalable microservices platform. Build, browse, and book with complete confidence.
=======
            Discover opportunities at top Sri Lankan companies (WSO2, Virtusa, Sysco LABS, IFS, Dialog, PickMe) and global tech giants. Apply locally onsite or work remotely from anywhere worldwide.
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/internships" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-95 text-lg">
<<<<<<< HEAD
              <span>Browse Internships</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#architecture" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-slate-700 hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 text-lg">
              Explore Architecture
=======
              <span>Explore Opportunities</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#architecture" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-slate-700 hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 text-lg">
              Explore Platform Architecture
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
            </a>
          </div>
          
          <div className="mt-12 max-w-sm mx-auto">
             <StatusBanner apiStatus={apiStatus} errorMessage={errorMessage} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">{metrics.totalInternships || 0}</div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Postings</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{metrics.activeCompanies || 0}</div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Companies</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{metrics.openSlots || 0}</div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Slots</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">{metrics.totalStudents || 0}</div>
<<<<<<< HEAD
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Students Applied</div>
=======
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Candidates Applied</div>
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
          </div>
        </div>

        <div id="architecture" className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise-Grade Architecture</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Our platform is composed of specialized microservices designed to handle high loads and provide seamless user experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLATFORM_BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;

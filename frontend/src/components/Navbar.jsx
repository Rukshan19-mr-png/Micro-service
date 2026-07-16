import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, LogOut, LogIn, Menu, X, User } from 'lucide-react';

const Navbar = ({ onOpenAuth }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Rocket className="w-8 h-8 text-indigo-600" />
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              NexusEvent
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/internships" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Browse</Link>
            
            {currentUser?.role === 'student' && (
              <Link to="/applications" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">My Applications</Link>
            )}
            
            {currentUser?.role === 'company' && (
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Dashboard</Link>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">{currentUser.email}</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <Link to="/internships" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50">Browse</Link>
          
          {currentUser?.role === 'student' && (
            <Link to="/applications" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50">My Applications</Link>
          )}
          
          {currentUser?.role === 'company' && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50">Dashboard</Link>
          )}
          
          {currentUser ? (
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
              Logout
            </button>
          ) : (
            <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

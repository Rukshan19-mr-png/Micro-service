import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Internships from './pages/Internships';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/internships" element={<Internships onOpenAuth={() => setShowAuthModal(true)} />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;

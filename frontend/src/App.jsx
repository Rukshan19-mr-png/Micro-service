import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bell,
  Calendar,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Search,
  Ticket,
  User,
  X,
} from 'lucide-react';

const API_BASE = '/api';
const authHeader = (token) => ({ headers: { authorization: `Bearer ${token}` } });

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingEventId, setBookingEventId] = useState(null);
  const [user, setUser] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEvents = async () => {
    const res = await axios.get(`${API_BASE}/events`);
    setEvents(res.data);
  };

  const fetchUserData = async (token) => {
    if (!token) return;

    const [bookingRes, notificationRes] = await Promise.all([
      axios.get(`${API_BASE}/bookings`, authHeader(token)),
      axios.get(`${API_BASE}/notifications`, authHeader(token)),
    ]);

    setBookings(bookingRes.data);
    setNotifications(notificationRes.data);
  };

  const refreshDashboard = async (token = user) => {
    try {
      setErrorMessage('');
      await fetchEvents();
      if (token) {
        await fetchUserData(token);
      }
      setApiStatus('online');
    } catch (err) {
      setApiStatus('offline');
      setErrorMessage(err.response?.data?.error || 'Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage('');
      const cleanEmail = email.trim().toLowerCase();

      if (isRegisterMode) {
        await axios.post(`${API_BASE}/auth/register`, { email: cleanEmail, password });
        alert('Registration successful! Please log in.');
        setIsRegisterMode(false);
        return;
      }

      const res = await axios.post(`${API_BASE}/auth/login`, { email: cleanEmail, password });
      const token = res.data.token;

      setUser(token);
      setCurrentUser(res.data.user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setShowAuthModal(false);
      await fetchUserData(token);
    } catch (err) {
      setErrorMessage(`Authentication failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setBookings([]);
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleBook = async (eventId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setBookingEventId(eventId);
      setErrorMessage('');
      await axios.post(
        `${API_BASE}/bookings`,
        {
          eventId,
          quantity: 1,
          paymentDetails: {
            cardNumber: '4111-1111-1111-1111',
            expiry: '12/28',
            cvv: '123',
          },
        },
        authHeader(user)
      );
      await refreshDashboard(user);
      alert('Booking successful!');
    } catch (err) {
      setErrorMessage(`Booking failed: ${err.response?.data?.details || err.response?.data?.error || err.message}`);
    } finally {
      setBookingEventId(null);
    }
  };

  const categories = useMemo(
    () => ['All', ...new Set(events.map((event) => event.category).filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const searchable = `${event.title} ${event.location} ${event.category}`.toLowerCase();
      return matchesCategory && searchable.includes(searchTerm.toLowerCase());
    });
  }, [events, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-2 rounded-xl text-white">
            <Ticket size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-900">NexusEvent</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#" className="hover:text-brand-500 transition-colors">Browse</a>
          <a href="#" className="hover:text-brand-500 transition-colors">Organize</a>
          <a href="#" className="hover:text-brand-500 transition-colors">Help</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all" aria-label="Search">
            <Search size={20} />
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-sm font-medium text-slate-500">{currentUser?.email}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-300 transition-all active:scale-95">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand-600 shadow-lg shadow-brand-200 transition-all active:scale-95">
              <LogIn size={18} />
              Login
            </button>
          )}
        </div>
      </nav>

      <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Experience <span className="text-brand-500">Unforgettable</span> Events
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The next generation of event management. Discover, book, and enjoy the world's most exclusive gatherings.
        </p>

        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
            <Search className="ml-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for conferences, concerts..."
              className="w-full p-3 outline-none bg-transparent"
            />
          </div>
        </div>
      </header>

      <main className="px-6 pb-20 max-w-7xl mx-auto">
        <div className={`mb-8 rounded-2xl border px-5 py-4 text-sm font-medium ${
          apiStatus === 'online'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : apiStatus === 'checking'
              ? 'border-slate-200 bg-white text-slate-500'
              : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          Backend status: {apiStatus === 'online' ? 'Connected successfully' : apiStatus === 'checking' ? 'Checking connection...' : errorMessage}
        </div>

        {errorMessage && apiStatus !== 'offline' && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
            {errorMessage}
          </div>
        )}

        {user && (
          <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Bookings</span>
              <strong className="text-3xl text-slate-900">{bookings.length}</strong>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Notifications</span>
              <strong className="text-3xl text-slate-900">{notifications.length}</strong>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Latest Booking</span>
              <strong className="block truncate text-lg text-slate-900">{bookings[bookings.length - 1]?.eventTitle || 'None yet'}</strong>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Featured Events</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-slate-200 hover:border-brand-500 hover:text-brand-500 bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="animate-spin mr-2" />
            Loading events from backend...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-brand-600 uppercase tracking-wider">
                    {event.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-brand-600 transition-colors">{event.title}</h3>

                  <div className="flex items-center gap-2 text-slate-500 mb-4 text-sm">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 mb-4 text-sm">
                    <Calendar size={16} />
                    {event.date}
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Price</span>
                      <span className="text-2xl font-black text-slate-900">${event.price}</span>
                      <span className="text-slate-400 text-xs block mt-1">{event.available} tickets left</span>
                    </div>
                    <button
                      onClick={() => handleBook(event.id)}
                      disabled={bookingEventId === event.id || event.available < 1}
                      className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-brand-500 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Book ${event.title}`}
                    >
                      {bookingEventId === event.id ? <Loader2 className="animate-spin" size={24} /> : <Ticket size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <p>&copy; 2026 NexusEvent. Built for Software Engineering Internship Portfolio.</p>
      </footer>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-brand-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {isRegisterMode ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-500 mt-2">
                {isRegisterMode ? 'Sign up to book exclusive events' : 'Log in to manage your bookings'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-[0.98] transition-all mt-4"
              >
                {isRegisterMode ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                {isRegisterMode ? 'Log in here' : 'Sign up now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

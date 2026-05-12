import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Ticket, Search, User, LogIn, Bell } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const App = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Tech Conference 2026', price: 150, location: 'San Francisco', available: 100, category: 'Tech' },
    { id: 2, title: 'Neon Music Festival', price: 75, location: 'Austin', available: 500, category: 'Music' },
    { id: 3, title: 'AI & Robotics Workshop', price: 0, location: 'London', available: 1000, category: 'Tech' },
    { id: 4, title: 'Gourmet Food Expo', price: 45, location: 'Paris', available: 250, category: 'Food' }
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // In a real app, you would fetch from the API Gateway
  // useEffect(() => {
  //   axios.get(`${API_BASE}/events`).then(res => setEvents(res.data));
  // }, []);

  const handleBook = async (eventId) => {
    alert('Requesting booking for event ID: ' + eventId + '\n(Make sure your microservices are running!)');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
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
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
            <Search size={20} />
          </button>
          <button className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand-600 shadow-lg shadow-brand-200 transition-all active:scale-95">
            <LogIn size={18} />
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Experience <span className="text-brand-500">Unforgettable</span> Events
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The next generation of event management. Discover, book, and enjoy the world's most exclusive gatherings.
        </p>
        
        <div className="flex flex-col md:row items-center justify-center gap-4">
          <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
            <Search className="ml-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for conferences, concerts..." 
              className="w-full p-3 outline-none bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* Event Grid */}
      <main className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Featured Events</h2>
          <div className="flex gap-2">
            {['All', 'Music', 'Tech', 'Food'].map(cat => (
              <button key={cat} className="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 hover:border-brand-500 hover:text-brand-500 transition-all bg-white">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
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

                <div className="flex items-center justify-between mt-6">
                  <div>
                    <span className="text-slate-400 text-xs block uppercase font-bold tracking-widest">Price</span>
                    <span className="text-2xl font-black text-slate-900">${event.price}</span>
                  </div>
                  <button 
                    onClick={() => handleBook(event.id)}
                    className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-brand-500 transition-all active:scale-90"
                  >
                    <Ticket size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <p>&copy; 2026 NexusEvent. Built for Software Engineering Internship Portfolio.</p>
      </footer>
    </div>
  );
};

export default App;

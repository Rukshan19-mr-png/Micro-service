import React from 'react';
import { Rocket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Rocket className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">NexusEvent</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern, distributed event management and ticketing platform built with a microservices architecture.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Gateway</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Auth Service</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Events & Bookings</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Payments</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} NexusEvent. Developed for Software Engineering Internship Portfolio.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

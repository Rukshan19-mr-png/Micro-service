import React from 'react';

const StatusBanner = ({ apiStatus, errorMessage }) => {
  const statusConfig = {
    online: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', label: '🟢 All services online' },
    checking: { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-500', label: '⏳ Connecting to backend...' },
    offline: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', label: `🔴 ${errorMessage}` },
  };
  
  const cfg = statusConfig[apiStatus] || statusConfig.checking;
  
  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} px-5 py-3 text-sm font-medium ${cfg.text} shadow-sm transition-all`}>
      {cfg.label}
    </div>
  );
};

export default StatusBanner;

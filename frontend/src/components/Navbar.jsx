import React, { useState, useEffect } from 'react';
import { Leaf, Scan, History, BookOpen, BarChart3, Info, Menu, X, Activity } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then(res => setApiStatus((res.status === 'ok' || res.status === 'online') ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'));
  }, []);


  const navItems = [
    { id: 'home', label: 'Home', icon: Leaf },
    { id: 'detect', label: 'Detect Disease', icon: Scan },
    { id: 'history', label: 'History', icon: History },
    { id: 'diseases', label: 'Diseases', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'about', label: 'About ML', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">ASPIDA</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Bitter Gourd ML
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Backend Status & CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              <span>{apiStatus === 'online' ? 'Backend Ready' : 'Server Disconnected'}</span>
            </div>

            <button
              onClick={() => setActiveTab('detect')}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold text-xs px-4 py-2 rounded-lg glow-button transition-all flex items-center space-x-1.5"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan Leaf</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-b border-emerald-900/50 px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}

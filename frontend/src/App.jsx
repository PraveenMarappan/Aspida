import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detection from './pages/Detection';
import HistoryPage from './pages/History';
import Dashboard from './pages/Dashboard';
import DiseasesPage from './pages/Diseases';
import About from './pages/About';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'detect':
        return <Detection />;
      case 'history':
        return <HistoryPage />;
      case 'diseases':
        return <DiseasesPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'about':
        return <About />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

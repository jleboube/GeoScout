import React, { useState } from 'react';
import Header from './components/Header';
import GeoGuesser from './components/GeoGuesser';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.GEO_GUESSER);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <Header currentView={currentView} setView={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GeoGuesser />
      </main>
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-0 left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent opacity-50"></div>
         <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

export default App;
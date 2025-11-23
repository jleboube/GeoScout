import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2">
              <i className="fa-solid fa-radar text-blue-400 text-xl animate-pulse"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wider">
                GEOSCOUT <span className="text-blue-500">OSINT</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Global Intelligence & Reconnaissance</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM ONLINE
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
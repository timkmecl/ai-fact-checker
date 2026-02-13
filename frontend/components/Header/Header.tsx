import React from 'react';
import { VerifyIcon, LogoutIcon, HistoryIcon } from '../../utils/icons';

interface HeaderProps {
  onLogout: () => void;
  onOpenHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, onOpenHistory }) => {
  return (
    <header className="mb-8 flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 sticky top-4 z-30">
      <div className="flex items-center gap-3">
         <VerifyIcon className="hidden sm:block" />
         <h1 className="text-2xl sm:text-3xl font-serif text-[#2D2D2D]">AI Fact Checker</h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onLogout}
          className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] transition-all rounded-xl"
          title="Odjava"
        >
          <LogoutIcon />
        </button>
        <button 
          onClick={onOpenHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-[#FAF9F6] text-gray-600 hover:text-[#BC5A41] transition-all rounded-xl border border-[#D1D1D1] shadow-sm text-sm font-medium"
        >
          <HistoryIcon />
          <span className="hidden sm:inline">Zgodovina</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
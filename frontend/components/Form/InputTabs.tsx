import React from 'react';
import { InputMode } from '../../types';

interface InputTabsProps {
  currentMode: InputMode;
  onChange: (mode: InputMode) => void;
}

const InputTabs: React.FC<InputTabsProps> = ({ currentMode, onChange }) => {
  const tabs = [
    { id: InputMode.TEXT, label: 'Besedilo' },
    { id: InputMode.URL, label: 'Spletna povezava' },
    { id: InputMode.FILE, label: 'Datoteka' },
  ];

  return (
    <div className="flex space-x-1 bg-white/60 p-1 rounded-lg border border-[#D1D1D1] mb-4 w-full md:w-max">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            currentMode === tab.id
              ? 'bg-[#E8E4D9] text-[#2D2D2D] shadow-sm ring-1 ring-[#D1D1D1]/50'
              : 'text-gray-500 hover:text-[#2D2D2D] hover:bg-white/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default InputTabs;
import React, { useState, useEffect } from 'react';
import { HistoryItem, InputMode } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear, onDelete }) => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity duration-300" 
          onClick={onClose}
        />
      )}
      
      {/* Panel - Acrylic/Glassmorphism Effect */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-[#F3F0E7]/80 backdrop-blur-xl shadow-2xl z-50 border-l border-white/30 
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
          ${isReady ? 'transition-transform duration-500 ease-in-out' : ''} 
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#D1D1D1]/40 flex justify-between items-center bg-white/20">
            <h2 className="text-xl font-serif text-[#2D2D2D] tracking-tight">Zgodovina</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-[#BC5A41] transition-all p-1 hover:bg-white/30 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p className="text-center text-sm font-serif italic">Ni shranjenih zahtevkov.</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelect(item)}
                    className="w-full text-left bg-white/50 hover:bg-white/80 p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all pr-12 group/btn"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                         {new Date(item.timestamp).toLocaleDateString()}
                       </span>
                       <span className="text-[9px] bg-[#4A4A4A] text-white px-2 py-0.5 rounded-full font-bold">
                         {item.model === 'gemini-flash-lite-latest' ? 'Manjši AI' : 'Večji AI'}
                       </span>
                    </div>
                    
                    <h3 className="font-serif text-base text-[#2D2D2D] line-clamp-2 leading-snug mb-2 group-hover/btn:text-[#BC5A41] transition-colors">
                      {item.instruction}
                    </h3>
                    
                     <div className="bg-white/30 p-2 rounded-lg mb-2">
                       <p className="text-[11px] text-gray-500 italic line-clamp-2 leading-relaxed">
                          {item.contents.length === 1 ? (
                            // Single content - display as before
                            <>
                              {item.contents[0].type === InputMode.TEXT && (
                                <span>"{(item.contents[0].content as string)?.substring(0, 80)}..."</span>
                              )}
                              {item.contents[0].type === InputMode.URL && (
                                <span className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                  {item.contents[0].content as string}
                                </span>
                              )}
                              {item.contents[0].type === InputMode.FILE && (
                                <span className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                  {item.fileNames?.[0]}
                                </span>
                              )}
                            </>
                          ) : (
                            // Multiple contents - show summary
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                              {item.contents.length} vsebin
                            </span>
                          )}
                       </p>
                     </div>

                     <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>
                          {item.contents.length === 1
                            ? (item.contents[0].type === InputMode.TEXT ? 'Besedilo' : item.contents[0].type === InputMode.URL ? 'URL' : 'Datoteka')
                            : 'Več virov'
                          }
                        </span>
                     </div>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="absolute right-3 top-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50/50 rounded-lg"
                    title="Izbriši"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {history.length > 0 && (
             <div className="p-6 border-t border-[#D1D1D1]/40 bg-white/20">
                <button 
                  onClick={onClear}
                  className="w-full py-3 text-xs text-red-600/70 hover:text-red-600 hover:bg-white/40 rounded-xl transition-all border border-transparent hover:border-red-100 font-bold tracking-widest uppercase"
                >
                  Počisti zgodovino
                </button>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
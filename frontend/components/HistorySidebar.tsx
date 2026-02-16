import React, { useState, useEffect } from 'react';
import { HistoryItem, InputMode } from '../types';
import { CloseIcon, ClockIcon, LinkIcon, FileIcon, FilesIcon, TrashIcon } from '../utils/icons';

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
              <CloseIcon />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-40">
                <ClockIcon />
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
                                  <LinkIcon className="w-2.5 h-2.5" />
                                  {item.contents[0].content as string}
                                </span>
                              )}
                              {item.contents[0].type === InputMode.FILE && (
                                <span className="flex items-center gap-1">
                                  <FileIcon />
                                  {item.fileNames?.[0]}
                                </span>
                              )}
                            </>
                          ) : (
                            // Multiple contents - show summary
                            <span className="flex items-center gap-1">
                              <FilesIcon />
                              {item.contents.length} vira/viri
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
                    <TrashIcon />
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
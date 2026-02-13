import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { DownloadIcon, WordIcon, CopyIcon, BackIcon, ExternalLinkIcon } from '../../utils/icons';
import { handleCopy, handleDownloadMarkdown, handleDownloadDocx } from '../../utils/helpers';
import { GroundingSource } from '../../types';

interface ResponseDisplayProps {
  response: string;
  isStreaming: boolean;
  error: string | null;
  responseEndRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  onReset: () => void;
  sources: GroundingSource[];
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isStreaming,
  error,
  responseEndRef,
  contentRef,
  onReset,
  sources,
}) => {
  return (
    <div className="animate-fade-in-up">
      <div className="bg-white border border-[#D1D1D1] rounded-3xl shadow-xl overflow-hidden border-t-4 border-t-[#BC5A41]">
         <div className="bg-[#FAF9F6]/80 backdrop-blur-sm border-b border-[#D1D1D1] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
               <div className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`}></div>
               <span className="text-sm font-serif italic text-gray-400">
                 {isStreaming ? 'Analiziram vsebino...' : 'Rezultat analize'}
               </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownloadMarkdown(response)}
                className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                title="Prenesi Markdown (.md)"
              >
                <DownloadIcon />
              </button>
              <button 
                onClick={() => handleDownloadDocx(response)}
                className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                title="Prenesi Word (.docx)"
              >
                <WordIcon />
              </button>
              <button 
                onClick={() => handleCopy(response, contentRef)}
                className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                title="Kopiraj (Gmail/Word format)"
              >
                <CopyIcon />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
              <button 
                onClick={onReset}
                className="px-4 py-2 text-sm border border-[#D1D1D1] rounded-xl text-gray-600 hover:bg-[#F3F0E7] hover:border-[#BC5A41] hover:text-[#BC5A41] transition-all flex items-center gap-2 font-medium"
              >
                <BackIcon />
                <span>Nazaj</span>
              </button>
            </div>
         </div>
         
          <div className="p-8 md:p-14 pt-6 md:pt-10 min-h-[400px]">
             {error ? (
               <div className="text-red-500 text-center p-8 bg-red-50/50 rounded-2xl border border-red-100 font-serif text-xl italic">
                 {error}
               </div>
             ) : (
               <div ref={contentRef} className="animate-fade-in">
                 <MarkdownRenderer content={response} />
                 {isStreaming && <span className="inline-block w-2 h-5 ml-2 bg-[#BC5A41]/30 animate-pulse align-middle rounded"></span>}
                 <div ref={responseEndRef} />
               </div>
             )}

             {/* Sources Section */}
             {!isStreaming && sources.length > 0 && (
               <div className="pt-12 border-t border-[#D1D1D1]/40 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-6">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BC5A41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                     <h3 className="text-xl font-serif text-[#2D2D2D]">Viri in reference</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {sources.map((src, idx) => (
                       <a
                         key={idx}
                         href={src.uri}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="group flex flex-col p-4 bg-[#F9F8F4] hover:bg-white border border-[#D1D1D1]/50 hover:border-[#BC5A41] rounded-2xl transition-all shadow-sm hover:shadow-md"
                       >
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-[#BC5A41] uppercase tracking-wider">Vir {idx + 1}</span>
                            <ExternalLinkIcon />
                         </div>
                         <h4 className="text-sm font-medium text-[#2D2D2D] line-clamp-2 mb-1 group-hover:text-[#BC5A41] transition-colors">{src.title}</h4>
                         <p className="text-[10px] text-gray-400 truncate">{src.uri}</p>
                       </a>
                     ))}
                  </div>
               </div>
             )}
          </div>
       </div>
      {!isStreaming && (
         <div className="mt-8 text-center animate-fade-in">
           <p className="text-xs text-gray-400 font-light">
             AI Fact Checker — AI lahko dela napake, vedno preverite odgovor.
           </p>
         </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
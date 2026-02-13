import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { DownloadIcon, WordIcon, CopyIcon, BackIcon } from '../../utils/icons';
import { handleCopy, handleDownloadMarkdown, handleDownloadDocx } from '../../utils/helpers';

interface ResponseDisplayProps {
  response: string;
  isStreaming: boolean;
  error: string | null;
  responseEndRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  onReset: () => void;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  isStreaming,
  error,
  responseEndRef,
  contentRef,
  onReset,
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
         </div>
      </div>
      {!isStreaming && (
         <div className="mt-8 text-center animate-fade-in">
           <p className="text-xs text-gray-400 font-light">
             AI Fact Checker — AI lahko dela napake, vedno preveri odgovor.
           </p>
         </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
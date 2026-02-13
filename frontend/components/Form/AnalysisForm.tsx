import React from 'react';
import { ModelType, InputMode, ContentInput } from '../../types';
import InputTabs from './InputTabs';
import { TrashIcon } from '../../utils/icons';

interface AnalysisFormProps {
  instruction: string;
  setInstruction: (value: string) => void;
  contents: ContentInput[];
  setContents: (contents: ContentInput[]) => void;
  model: ModelType;
  setModel: (model: ModelType) => void;
  useRag: boolean;
  setUseRag: (value: boolean) => void;
  onClearInputs: () => void;
  onSubmit: () => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  instruction,
  setInstruction,
  contents,
  setContents,
  model,
  setModel,
  useRag,
  setUseRag,
  onClearInputs,
  onSubmit,
}) => {
  // For now, work with the first content item
  const content = contents[0] || { type: InputMode.TEXT, content: '' };
  const setContent = (newContent: ContentInput) => {
    setContents([newContent]);
  };
  return (
    <div className="bg-white border border-[#D1D1D1] rounded-3xl p-6 md:p-10 mb-6 card-shadow">
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xl font-serif text-[#2D2D2D]">Navodilo</label>
          {(instruction || contents.some(c => c.content)) && (
            <button 
              onClick={onClearInputs}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <TrashIcon /> Počisti
            </button>
          )}
        </div>
        <textarea
          className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] min-h-[100px] text-base resize-none transition-all placeholder:text-gray-300"
          placeholder="Npr. Preveri trditve v tem članku glede na zakonodajo..."
          lang="sl-SI"
          spellCheck={false}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        
        <div className="mt-4 flex items-center gap-3 px-2">
           <label className="relative inline-flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={useRag}
                onChange={(e) => setUseRag(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC5A41]"></div>
              <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-[#2D2D2D] transition-colors">Širše iskanje po bazi znanja</span>
           </label>
        </div>
      </div>

      <div className="mb-4">
         <label className="block text-xl font-serif mb-4 text-[#2D2D2D]">Vsebina</label>
         <InputTabs currentMode={content.type} onChange={(type) => setContent({ ...content, type, content: '' })} />
      </div>

      <div className="mb-10">
         {content.type === InputMode.TEXT && (
          <textarea
            className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] min-h-[220px] text-base font-light leading-relaxed transition-all placeholder:text-gray-300"
            placeholder="Prilepite besedilo članka ali posamezne trditve tukaj..."
            lang="sl-SI"
            spellCheck={false}
            value={content.content as string}
            onChange={(e) => setContent({ ...content, content: e.target.value })}
          />
        )}

        {content.type === InputMode.URL && (
          <div className="animate-fade-in">
             <input
              type="url"
              className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] text-lg transition-all"
              placeholder="https://..."
              value={content.content as string}
              onChange={(e) => setContent({ ...content, content: e.target.value })}
            />
            <p className="mt-3 text-xs text-gray-400 px-2 italic">Model bo analiziral vsebino na tej povezavi.</p>
          </div>
        )}

        {content.type === InputMode.FILE && (
          <div className="border-2 border-dashed border-[#D1D1D1] rounded-2xl p-12 text-center bg-[#FAFAFA] hover:bg-[#F3F0E7] hover:border-[#BC5A41] transition-all relative group overflow-hidden">
             <input 
                type="file" 
                onChange={(e) => setContent({ ...content, content: e.target.files ? e.target.files[0] : null })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".txt,.md,.html,.pdf,image/*"
             />
             <div className="pointer-events-none transition-transform group-hover:scale-105">
                <div className="mb-4 flex justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-300 group-hover:text-[#BC5A41] transition-colors" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <p className="text-gray-500 font-medium mb-1">{content.content ? (content.content as File).name : "Povlecite datoteko sem"}</p>
                <p className="text-xs text-gray-400">{content.content ? "Datoteka pripravljena" : "PDF, slika, TXT"}</p>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#D1D1D1]/40 gap-6">
         <div className="flex items-center space-x-4 bg-[#F3F0E7] rounded-2xl p-1.5 shadow-inner border border-[#D1D1D1]/30">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-4">Model</span>
            <div className="flex bg-white/80 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setModel(ModelType.FLASH_LITE)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  model === ModelType.FLASH_LITE ? 'bg-[#4A4A4A] text-white' : 'text-gray-400 hover:text-[#2D2D2D]'
                }`}
              >
                Manjši
              </button>
              <button
                onClick={() => setModel(ModelType.GEMINI_3_FLASH)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  model === ModelType.GEMINI_3_FLASH ? 'bg-[#4A4A4A] text-white' : 'text-gray-400 hover:text-[#2D2D2D]'
                }`}
              >
                Večji
              </button>
            </div>
         </div>

         <button
            onClick={onSubmit}
             disabled={!instruction || (content.type === InputMode.TEXT && !content.content) || (content.type === InputMode.URL && !content.content) || (content.type === InputMode.FILE && !content.content)}
            className="w-full sm:w-auto bg-[#BC5A41] hover:bg-[#A04832] disabled:bg-[#D1D1D1] disabled:text-gray-400 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 disabled:transform-none"
         >
           <span>Analiziraj</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
         </button>
      </div>

    </div>
  );
};

export default AnalysisForm;
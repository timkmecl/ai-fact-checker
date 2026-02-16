import React, { useState, useEffect } from 'react';
import { ModelType, InputMode, ContentInput } from '../../types';
import InputTabs from './InputTabs';
import { TrashIcon, UploadIcon, PlusIcon, SendIcon } from '../../utils/icons';

interface InputItem {
  id: string;
  type: InputMode;
  content: string | File | null;
}

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
  // Local state for inputs with IDs
  const [inputs, setInputs] = useState<InputItem[]>(() => {
    return contents.map((c, index) => ({
      id: `input-${index}-${Date.now()}`,
      type: c.type,
      content: c.content,
    }));
  });

  // Sync inputs to contents when inputs change
  useEffect(() => {
    const newContents: ContentInput[] = inputs.map(input => ({
      type: input.type,
      content: input.content,
    }));
    setContents(newContents);
  }, [inputs, setContents]);

  // Sync contents to inputs when contents change externally (e.g., history load)
  useEffect(() => {
    if (contents.length !== inputs.length) {
      setInputs(contents.map((c, index) => ({
        id: `input-${index}-${Date.now()}`,
        type: c.type,
        content: c.content,
      })));
    }
  }, [contents]);

  const addInput = () => {
    setInputs([...inputs, { id: `input-${Date.now()}`, type: InputMode.TEXT, content: '' }]);
  };

  const removeInput = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(input => input.id !== id));
    }
  };

  const updateInput = (id: string, updates: Partial<InputItem>) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, ...updates } : input
    ));
  };

  const hasAnyContent = inputs.some(input => input.content);

  const isSubmitDisabled = !instruction || !inputs.some(input => {
    if (input.type === InputMode.TEXT && input.content) return true;
    if (input.type === InputMode.URL && input.content) return true;
    if (input.type === InputMode.FILE && input.content) return true;
    return false;
  });

  return (
    <div className="bg-white border border-[#D1D1D1] rounded-3xl p-6 md:p-10 mb-6 card-shadow">
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xl font-serif text-[#2D2D2D]">Navodilo</label>
          {(instruction || hasAnyContent) && (
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

      {/* Render Multiple Contents */}
      {inputs.map((input, index) => (
        <div key={input.id} className="mt-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xl font-serif text-[#2D2D2D]">
              Vsebina{inputs.length > 1 ? ' ' + (index + 1) : ''}
            </label>
            {inputs.length > 1 && (
              <button 
                onClick={() => removeInput(input.id)}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50"
              >
                <TrashIcon /> Izbriši
              </button>
            )}
          </div>
          
          <InputTabs currentMode={input.type} onChange={(type) => updateInput(input.id, { type, content: '' })} />

          <div className="mt-4">
            {input.type === InputMode.TEXT && (
              <textarea
                className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] min-h-[180px] text-base font-light leading-relaxed transition-all placeholder:text-gray-300"
                placeholder="Prilepite besedilo članka ali posamezne trditve tukaj..."
                lang="sl-SI"
                spellCheck={false}
                value={input.content as string}
                onChange={(e) => updateInput(input.id, { content: e.target.value })}
              />
            )}

            {input.type === InputMode.URL && (
              <div className="animate-fade-in">
                 <input
                  type="url"
                  className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] text-lg transition-all"
                  placeholder="https://..."
                  value={input.content as string}
                  onChange={(e) => updateInput(input.id, { content: e.target.value })}
                />
                <p className="mt-3 mb-3 text-xs text-gray-400 px-2 italic">Model bo analiziral vsebino na tej povezavi.</p>
              </div>
            )}

            {input.type === InputMode.FILE && (
              <div className="border-2 border-dashed border-[#D1D1D1] rounded-2xl p-8 text-center bg-[#FAFAFA] hover:bg-[#F3F0E7] hover:border-[#BC5A41] transition-all relative group overflow-hidden">
                 <input 
                    type="file" 
                    onChange={(e) => updateInput(input.id, { content: e.target.files ? e.target.files[0] : null })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".txt,.md,.html,.pdf,image/*"
                 />
                 <div className="pointer-events-none transition-transform group-hover:scale-105">
                    <div className="mb-4 flex justify-center">
                       <UploadIcon className="text-gray-300 group-hover:text-[#BC5A41] transition-colors" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1 truncate px-4">{input.content ? (input.content as File).name : "Povlecite datoteko sem"}</p>
                    <p className="text-xs text-gray-400">{input.content ? "Datoteka pripravljena" : "PDF, slika, TXT"}</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="mb-4 text-center sm:text-left">
        <button
          onClick={addInput}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#BC5A41]/30 rounded-xl text-[#BC5A41] hover:bg-[#BC5A41]/5 transition-all text-sm font-medium"
        >
          <PlusIcon />
          <span>Dodaj vsebino</span>
        </button>
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
            disabled={isSubmitDisabled}
            className="w-full sm:w-auto bg-[#BC5A41] hover:bg-[#A04832] disabled:bg-[#D1D1D1] disabled:text-gray-400 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 disabled:transform-none"
         >
           <span>Analiziraj</span>
           <SendIcon />
         </button>
      </div>

    </div>
  );
};

export default AnalysisForm;

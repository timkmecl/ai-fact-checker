import React, { useState, useRef, useEffect } from 'react';
import { streamAnalysis } from './services/geminiService';
import { ModelType, InputMode, HistoryItem } from './types';
import InputTabs from './components/InputTabs';
import MarkdownRenderer from './components/MarkdownRenderer';
import HistorySidebar from './components/HistorySidebar';
import { marked } from 'marked';
import { asBlob } from 'html-docx-js-typescript';


const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const WordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 15l2 2 4-4"></path></svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const VerifyIcon = ({ className = "", ...props }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BC5A41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [instruction, setInstruction] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<ModelType>(ModelType.FLASH_LITE);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [includeLaw, setIncludeLaw] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('gemini_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse history:", e);
        return [];
      }
    }
    return [];
  });
  
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responseEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    localStorage.setItem('gemini_history', JSON.stringify(history));
  }, [history]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'password') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(false);
  };

  const handleReset = () => {
    setResponse('');
    setHasStarted(false);
    setError(null);
    setIsStreaming(false);
  };

  const handleClearInputs = () => {
    setInstruction('');
    setTextContent('');
    setUrl('');
    setFile(null);
  };

  const handleCopy = async () => {
    if (!contentRef.current) {
      navigator.clipboard.writeText(response);
      return;
    }
    try {
      const html = contentRef.current.innerHTML;
      const text = contentRef.current.innerText;
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      await navigator.clipboard.write(data);
    } catch (err) {
      navigator.clipboard.writeText(response);
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const blob = new Blob([response], {type: 'text/markdown'});
    element.href = URL.createObjectURL(blob);
    element.download = `analiza-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadDocx = async () => {
    try {
      const htmlContent = await marked.parse(response);
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="sl-SI">
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Calibri', sans-serif; }
              h1 { font-size: 24pt; color: #2E74B5; }
              h2 { font-size: 18pt; color: #2E74B5; }
              p { font-size: 11pt; margin-bottom: 10pt; }
              li { font-size: 11pt; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;
      const data = await asBlob(fullHtml);
      const blob = new Blob([data as any], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      const url = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = `analiza-${new Date().toISOString().slice(0,10)}.docx`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      alert("Napaka pri generiranju Word dokumenta.");
    }
  };


  const handleSubmit = async () => {
    if (!instruction) return;
    if (inputMode === InputMode.TEXT && !textContent) return;
    if (inputMode === InputMode.URL && !url) return;
    if (inputMode === InputMode.FILE && !file) return;

    setIsStreaming(true);
    setHasStarted(true);
    setResponse('');
    setError(null);

    let fullResponse = "";
    try {
      await streamAnalysis({
        instruction, inputMode, textContent, url, 
        file: file || undefined, model, includeLaw
      }, (chunk) => {
        fullResponse += chunk;
        setResponse((prev) => prev + chunk);
      });

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        instruction, inputMode,
        textContent: inputMode === InputMode.TEXT ? textContent : undefined,
        url: inputMode === InputMode.URL ? url : undefined,
        fileName: file?.name,
        model, response: fullResponse
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (err: any) {
      setError("Prišlo je do napake pri komunikaciji z modelom. Poskusite ponovno.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setInstruction(item.instruction);
    setInputMode(item.inputMode);
    if (item.textContent) setTextContent(item.textContent);
    if (item.url) setUrl(item.url);
    setFile(null); 
    setModel(item.model);
    setResponse(item.response);
    setHasStarted(true);
    setIsStreaming(false);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (isStreaming && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, isStreaming]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F0E7] p-4">
        <div className="w-full max-w-md bg-white border border-[#D1D1D1] rounded-2xl p-10 card-shadow">
          <div className="flex justify-center mb-6">
            <VerifyIcon />
          </div>
          <h1 className="text-4xl font-serif text-center mb-2 text-[#2D2D2D]">AI Fact Checker</h1>
          <p className="text-center text-gray-400 mb-10 font-light">Vnesite geslo za dostop.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                className="w-full px-5 py-3 rounded-xl border border-[#D1D1D1] focus:outline-none focus:ring-2 focus:ring-[#BC5A41]/20 focus:border-[#BC5A41] bg-[#FAFAFA] transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Geslo"
              />
            </div>
            {authError && <p className="text-red-500 text-sm text-center">Napačno geslo.</p>}
            <button
              type="submit"
              className="w-full bg-[#2D2D2D] hover:bg-black text-white font-medium py-3 rounded-xl transition-all duration-300 transform active:scale-[0.98]"
            >
              Vstopi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F0E7] text-[#2D2D2D] py-8 px-4 md:px-8 relative selection:bg-[#BC5A41]/20">
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onSelect={handleSelectHistory}
        onClear={() => setHistory([])}
        onDelete={handleDeleteHistoryItem}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 sticky top-4 z-30">
          <div className="flex items-center gap-3">
             <VerifyIcon className="hidden sm:block" />
             <h1 className="text-2xl sm:text-3xl font-serif text-[#2D2D2D]">AI Fact Checker</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] transition-all rounded-xl"
              title="Odjava"
            >
              <LogoutIcon />
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-[#FAF9F6] text-gray-600 hover:text-[#BC5A41] transition-all rounded-xl border border-[#D1D1D1] shadow-sm text-sm font-medium"
            >
              <HistoryIcon />
              <span className="hidden sm:inline">Zgodovina</span>
            </button>
          </div>
        </header>

        {!hasStarted ? (
          <div className="bg-white border border-[#D1D1D1] rounded-3xl p-6 md:p-10 card-shadow transition-all duration-500">
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xl font-serif text-[#2D2D2D]">Navodilo</label>
                {(instruction || textContent || url || file) && (
                  <button 
                    onClick={handleClearInputs}
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
                      checked={includeLaw}
                      onChange={(e) => setIncludeLaw(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BC5A41]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-[#2D2D2D] transition-colors">Širše iskanje po bazi znanja</span>
                 </label>
              </div>
            </div>

            <div className="mb-4">
               <label className="block text-xl font-serif mb-4 text-[#2D2D2D]">Vsebina</label>
               <InputTabs currentMode={inputMode} onChange={setInputMode} />
            </div>

            <div className="mb-10">
              {inputMode === InputMode.TEXT && (
                <textarea
                  className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] min-h-[220px] text-base font-light leading-relaxed transition-all placeholder:text-gray-300"
                  placeholder="Prilepite besedilo članka ali posamezne trditve tukaj..."
                  lang="sl-SI"
                  spellCheck={false}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              )}

              {inputMode === InputMode.URL && (
                <div className="animate-fade-in">
                   <input
                    type="url"
                    className="w-full p-5 rounded-2xl border border-[#D1D1D1] focus:ring-2 focus:ring-[#BC5A41]/10 focus:border-[#BC5A41] focus:outline-none bg-[#FAFAFA] text-lg transition-all"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="mt-3 text-xs text-gray-400 px-2 italic">Model bo analiziral vsebino na tej povezavi.</p>
                </div>
              )}

              {inputMode === InputMode.FILE && (
                <div className="border-2 border-dashed border-[#D1D1D1] rounded-2xl p-12 text-center bg-[#FAFAFA] hover:bg-[#F3F0E7] hover:border-[#BC5A41] transition-all relative group overflow-hidden">
                   <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".txt,.md,.html,.pdf,image/*"
                   />
                   <div className="pointer-events-none transition-transform group-hover:scale-105">
                      <div className="mb-4 flex justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-300 group-hover:text-[#BC5A41] transition-colors" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </div>
                      <p className="text-gray-500 font-medium mb-1">{file ? file.name : "Povlecite datoteko sem"}</p>
                      <p className="text-xs text-gray-400">{file ? "Datoteka pripravljena" : "PDF, slika, TXT"}</p>
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
                  onClick={handleSubmit}
                  disabled={!instruction || (inputMode === InputMode.TEXT && !textContent) || (inputMode === InputMode.URL && !url) || (inputMode === InputMode.FILE && !file)}
                  className="w-full sm:w-auto bg-[#BC5A41] hover:bg-[#A04832] disabled:bg-[#D1D1D1] disabled:text-gray-400 text-white font-semibold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 disabled:transform-none"
               >
                 <span>Analiziraj</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
               </button>
            </div>

          </div>
        ) : (
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
                      onClick={handleDownloadMarkdown}
                      className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                      title="Prenesi Markdown (.md)"
                    >
                      <DownloadIcon />
                    </button>
                    <button 
                      onClick={handleDownloadDocx}
                      className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                      title="Prenesi Word (.docx)"
                    >
                      <WordIcon />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="p-2.5 text-gray-400 hover:text-[#BC5A41] hover:bg-[#F3F0E7] rounded-xl transition-all"
                      title="Kopiraj (Gmail/Word format)"
                    >
                      <CopyIcon />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1 self-center"></div>
                    <button 
                      onClick={handleReset}
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
        )}
      </div>
      <p className="text-center text-xs text-gray-400 font-light mt-3 tracking-widest uppercase">
        Built by{' '}
        <a href="https://kmecl.eu" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#BC5A41]"><i>Tim Kmecl</i></a> 2026
      </p>
    </div>
  );
};

export default App;
import React, { useState, useRef } from 'react';
import { ModelType, InputMode, ContentInput, HistoryItem } from '../types';
import Header from '../components/Header/Header';
import AnalysisForm from '../components/Form/AnalysisForm';
import ResponseDisplay from '../components/Response/ResponseDisplay';
import HistorySidebar from '../components/HistorySidebar';
import { useStreaming } from '../hooks/useStreaming';

interface MainPageProps {
  onLogout: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  addToHistory: (item: HistoryItem) => void;
}

const MainPage: React.FC<MainPageProps> = ({
  onLogout,
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
  addToHistory,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [contents, setContents] = useState<ContentInput[]>([{ type: InputMode.TEXT, content: '' }]);
  const [model, setModel] = useState<ModelType>(ModelType.FLASH_LITE);
  const [useRag, setUseRag] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { response, setResponse, isStreaming, setIsStreaming, hasStarted, setHasStarted, error, sources, setSources, responseEndRef, handleSubmit, handleReset } = useStreaming(addToHistory);

  const handleClearInputs = () => {
    setInstruction('');
    setContents([{ type: InputMode.TEXT, content: '' }]);
  };

  const onSubmit = () => {
    handleSubmit(instruction, contents, model, useRag);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInstruction(item.instruction);
    // if item.contents.type is FILE, set content to empty string to avoid issues with file inputs
    const parsedContents = item.contents.map(c => {
      if (c.type === InputMode.FILE) {
        return { type: InputMode.FILE, content: '' };
      }
      return c;
    });
    setContents(parsedContents);
    setModel(item.model);
    setResponse(item.response);
    setSources(item.sources || []);
    setUseRag(item.useRag || false);
    setHasStarted(true);
    setIsStreaming(false);
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] text-[#2D2D2D] py-8 px-4 md:px-8 relative selection:bg-[#BC5A41]/20">
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onSelect={handleSelectHistoryItem}
        onClear={onClearHistory}
        onDelete={onDeleteHistoryItem}
      />

      <div className="max-w-4xl mx-auto">
        <Header onLogout={onLogout} onOpenHistory={() => setIsHistoryOpen(true)} />

        {!hasStarted ? (
          <AnalysisForm
            instruction={instruction}
            setInstruction={setInstruction}
            contents={contents}
            setContents={setContents}
            model={model}
            setModel={setModel}
            useRag={useRag}
            setUseRag={setUseRag}
            onClearInputs={handleClearInputs}
            onSubmit={onSubmit}
          />
        ) : (
          <ResponseDisplay
            response={response}
            isStreaming={isStreaming}
            error={error}
            responseEndRef={responseEndRef}
            contentRef={contentRef}
            onReset={handleReset}
            sources={sources}
          />
        )}
      </div>
      <div className="mt-6 text-center animate-fade-in">
        <p className="text-xs text-gray-400 font-light">
          AI lahko dela napake, vedno preverite odgovor.
        </p>
      </div>
      <p className="text-center text-xs text-gray-400 font-light mt-3 tracking-widest uppercase">
        Built by{' '}
        <a href="https://kmecl.eu" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#BC5A41]">Tim Kmecl</a> 2026
      </p>
    </div>
  );
};

export default MainPage;
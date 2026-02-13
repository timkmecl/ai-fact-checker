import React, { useState, useRef } from 'react';
import { ModelType, InputMode, HistoryItem } from '../types';
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
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<ModelType>(ModelType.FLASH_LITE);
  const [includeLaw, setIncludeLaw] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { response, setResponse, isStreaming, setIsStreaming, hasStarted, setHasStarted, error, responseEndRef, handleSubmit, handleReset } = useStreaming(addToHistory);

  const handleClearInputs = () => {
    setInstruction('');
    setTextContent('');
    setUrl('');
    setFile(null);
  };

  const onSubmit = () => {
    handleSubmit(instruction, inputMode, textContent, url, file, model, includeLaw);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
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
            inputMode={inputMode}
            setInputMode={setInputMode}
            textContent={textContent}
            setTextContent={setTextContent}
            url={url}
            setUrl={setUrl}
            file={file}
            setFile={setFile}
            model={model}
            setModel={setModel}
            includeLaw={includeLaw}
            setIncludeLaw={setIncludeLaw}
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
          />
        )}
      </div>
      <p className="text-center text-xs text-gray-400 font-light mt-3 tracking-widest uppercase">
        Built by{' '}
        <a href="https://kmecl.eu" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#BC5A41]"><i>Tim Kmecl</i></a> 2026
      </p>
    </div>
  );
};

export default MainPage;
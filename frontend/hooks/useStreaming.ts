import { useState, useRef, useEffect } from 'react';
import { streamAnalysis } from '../services/geminiService';
import { ModelType, InputMode, HistoryItem, GroundingSource } from '../types';

export const useStreaming = (addToHistory: (item: HistoryItem) => void) => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const sourcesRef = useRef<GroundingSource[]>([]);
  const responseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response, isStreaming]);

  const handleSubmit = async (
    instruction: string,
    inputMode: InputMode,
    textContent: string,
    url: string,
    file: File | null,
    model: ModelType,
    useRag: boolean
  ) => {
    if (!instruction) return;
    if (inputMode === InputMode.TEXT && !textContent) return;
    if (inputMode === InputMode.URL && !url) return;
    if (inputMode === InputMode.FILE && !file) return;

    setIsStreaming(true);
    setHasStarted(true);
    setResponse('');
    setError(null);
    setSources([]);
    sourcesRef.current = [];

    let fullResponse = "";
    try {
      await streamAnalysis({
        instruction, inputMode, textContent, url,
        file: file || undefined, model, useRag
      }, (chunk) => {
        fullResponse += chunk;
        setResponse((prev) => prev + chunk);
      }, (metadata) => {
        setSources(metadata);
        sourcesRef.current = metadata;
      });

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        instruction, inputMode,
        textContent: inputMode === InputMode.TEXT ? textContent : undefined,
        url: inputMode === InputMode.URL ? url : undefined,
        fileName: file?.name,
        model, response: fullResponse,
        sources: sourcesRef.current.length > 0 ? sourcesRef.current : undefined,
        useRag
      };
      addToHistory(newItem);
    } catch (err: any) {
      setError("Prišlo je do napake pri komunikaciji z modelom. Poskusite ponovno.");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setResponse('');
    setHasStarted(false);
    setError(null);
    setIsStreaming(false);
    setSources([]);
  };

  return {
    response,
    setResponse,
    isStreaming,
    setIsStreaming,
    hasStarted,
    setHasStarted,
    error,
    sources,
    setSources,
    responseEndRef,
    handleSubmit,
    handleReset,
  };
};
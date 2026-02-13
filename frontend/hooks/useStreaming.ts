import { useState, useRef, useEffect } from 'react';
import { streamAnalysis } from '../services/geminiService';
import { ModelType, InputMode, HistoryItem } from '../types';

export const useStreaming = (addToHistory: (item: HistoryItem) => void) => {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    let fullResponse = "";
    try {
      await streamAnalysis({
        instruction, inputMode, textContent, url, 
        file: file || undefined, model, useRag
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
  };

  return {
    response,
    setResponse,
    isStreaming,
    setIsStreaming,
    hasStarted,
    setHasStarted,
    error,
    responseEndRef,
    handleSubmit,
    handleReset,
  };
};
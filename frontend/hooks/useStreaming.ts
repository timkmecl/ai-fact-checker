import { useState, useRef, useEffect } from 'react';
import { streamAnalysis } from '../services/geminiService';
import { ModelType, InputMode, ContentInput, HistoryItem, GroundingSource } from '../types';

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
    contents: ContentInput[],
    model: ModelType,
    useRag: boolean
  ) => {
    if (!instruction) return;
    if (contents.length === 0) return;
    // Validate that at least one content has data
    const hasValidContent = contents.some(c => {
      if (c.type === InputMode.TEXT && c.content) return true;
      if (c.type === InputMode.URL && c.content) return true;
      if (c.type === InputMode.FILE && c.content) return true;
      return false;
    });
    if (!hasValidContent) return;

    setIsStreaming(true);
    setHasStarted(true);
    setResponse('');
    setError(null);
    setSources([]);
    sourcesRef.current = [];

    let fullResponse = "";
    try {
      await streamAnalysis({
        instruction, contents, model, useRag
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
        instruction,
        contents,
        fileNames: contents
          .filter(c => c.type === InputMode.FILE && c.content instanceof File)
          .map(c => (c.content as File).name),
        model,
        response: fullResponse,
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
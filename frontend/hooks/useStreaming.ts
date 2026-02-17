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

  const cleanResponse = (text: string): string => {
    return text
      // 1. Remove [kontekst], [context], [cite: Context], [General information], etc.
      // This regex looks for optional "cite: " followed by the blacklisted words
      .replace(/ \[(?:cite:\s*)?(kontekst|context|general information|splošne informacije|general|splošno|podatki za analizo|general info|info|informacije)\]/gi, '')
      
      // 2. Replace [cite: X] with [X]
      .replace(/\[cite:\s*(.*?)\]/gi, '[$1]')
  };

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

    let rawResponse = "";
    try {
      await streamAnalysis({
        instruction, contents, model, useRag
      }, (chunk) => {
        rawResponse += chunk;
        setResponse(cleanResponse(rawResponse));
      }, (metadata) => {
        setSources(metadata);
        sourcesRef.current = metadata;
      });

      const finalCleanedResponse = cleanResponse(rawResponse);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        instruction,
        contents,
        fileNames: contents
          .filter(c => c.type === InputMode.FILE && c.content instanceof File)
          .map(c => (c.content as File).name),
        model,
        response: finalCleanedResponse,
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
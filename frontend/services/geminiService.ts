import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { ModelType, AnalysisRequest, InputMode, GroundingSource } from '../types';
import { ZPPKZ_LAW_TEXT, ZPPKZ_INFO_TEXT } from '../constants/lawText';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Function that fetches url content and returns it as a string
const fetchUrlContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`https://urltomarkdown.herokuapp.com/?url=${encodeURIComponent(url)}&title=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL content: ${response.statusText}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error fetching URL content from API:", error);
    throw error;
  }
};

export const streamAnalysis = async (
  request: AnalysisRequest,
  onChunk: (text: string) => void,
  onMetadata?: (sources: GroundingSource[]) => void
): Promise<void> => {
  const { instruction, inputMode, textContent, url, file, model, useRag } = request;

  let contents: any = [];
  
  let systemContext = "Si AI Fact Checker. Tvoj cilj je na osnovi podanega gradiva za analizo (besedilo, datoteke) in uporabnikovega navodila ter morebitnega dodatnega gradiva pomagati uporabniku pri zadani nalogi (ki je lahko širša kot zgolj fact-checking). V odgovoru uporabi markdown oblikovanje, smiselno uporabljaj naslove (#), podnaslove (##) (po potrebi podpodnaslove...) in bodi jedrnat, a vseeno dovolj informativen - razen če uporabnik zahteva drugače. Ne izpisuj markdown tabel - BREZ TABEL. V tvojem odgovoru naj bo, kar zahteva uporabnik, pri čemer naj bo kakovost odgovora taka, da bo z minimalno recenzijo primeren za objavo.\n\n";
  systemContext += `Nekaj informacij o evtanaziji in zakonu: \n\n${ZPPKZ_INFO_TEXT}\n\n`
  systemContext += `Uporabi naslednje besedilo zakona (ZPPKŽ) kot glavno referenco za preverjanje dejstev:\n\n${ZPPKZ_LAW_TEXT}\n\n---\n\n`;
  
  if (useRag) {
    systemContext += "Uporabi tudi širše iskanje po bazi znanja prek File Search API orodja, za več informacij, ki bi pomagale pri odgovoru. Vrnjene informacije niso vedno relevantne, uporabi smo, če so."
  }


  let promptText = `${systemContext}Navodilo: ${instruction}\n\n`;

  if (inputMode === InputMode.TEXT && textContent) {
    promptText += `Vsebina za analizo:\n${textContent}`;
    contents.push({ text: promptText });
  } else if (inputMode === InputMode.URL && url) {
    promptText += `Prosim, analiziraj vsebino na tej povezavi: ${url}`;
    const urlContent = await fetchUrlContent(url);
    promptText += `\nVsebina spletnega vira:\n${urlContent}`;
    contents.push({ text: promptText });
    // console.log(urlContent);
  } else if (inputMode === InputMode.FILE && file) {
    promptText += `Prosim, analiziraj priloženo datoteko.`;
    const filePart = await fileToPart(file);
    contents.push({ text: promptText });
    contents.push(filePart);
  } else {
    contents.push({ text: promptText });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: { parts: contents },
      config: {
        temperature: 0.5,
        thinkingConfig: model === ModelType.GEMINI_3_FLASH ? { thinkingLevel: ThinkingLevel.LOW } : { thinkingBudget: 4096 },
        ...(useRag && {
          tools: [{ googleSearch: {} }]
        })
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }

      // Extract grounding metadata if present in chunk
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks && onMetadata) {
        const sources: GroundingSource[] = metadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title || 'Vir',
            uri: c.web.uri
          }));
        if (sources.length > 0) {
          onMetadata(sources);
        }
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
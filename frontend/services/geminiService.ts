import { AnalysisRequest, InputMode, GroundingSource } from '../types';
import { ZPPKZ_LAW_TEXT, ZPPKZ_INFO_TEXT } from '../constants/lawText';

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
  // Service 1: urltomarkdown (Heroku)
  const primaryApi = `https://urltomarkdown.herokuapp.com/?url=${encodeURIComponent(url)}&title=true`;
  
  // Service 2: markdown.new (Fallback)
  const fallbackApi = `https://r.jina.ai/${url}`;

  try {
    // Attempt 1
    const response = await fetch(primaryApi);
    if (!response.ok) throw new Error(`Primary service failed: ${response.status}`);
    
    return await response.text();
  } catch (primaryError) {
    console.warn("Primary markdown service failed, attempting fallback...", primaryError);

    try {
      // Attempt 2 (Fallback)
      const fallbackResponse = await fetch(fallbackApi);
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service failed: ${fallbackResponse.statusText}`);
      }
      
      return await fallbackResponse.text();
    } catch (fallbackError) {
      console.error("Both markdown conversion services failed.");
      throw fallbackError;
    }
  }
};

export const streamAnalysis = async (
  request: AnalysisRequest,
  onChunk: (text: string) => void,
  onMetadata?: (sources: GroundingSource[]) => void
): Promise<void> => {
  const { instruction, contents: contentInputs, model, useRag } = request;

  let parts: any = [];

  let systemContext = "Si AI Fact Checker. Tvoj cilj je na osnovi podanega gradiva za analizo (besedilo, datoteke) in uporabnikovega navodila ter morebitnega dodatnega gradiva pomagati uporabniku (iz kampanje podpornikov zakona) pri zadani nalogi (ki je lahko širša kot zgolj fact-checking). V odgovoru uporabi markdown oblikovanje, smiselno uporabljaj naslove (#), podnaslove (##) (po potrebi podpodnaslove...) in bodi jedrnat, a vseeno dovolj informativen - razen če uporabnik zahteva drugače. Ne izpisuj markdown tabel - BREZ TABEL. V tvojem odgovoru naj bo, kar zahteva uporabnik, pri čemer naj bo kakovost odgovora taka, da bo z minimalno recenzijo primeren za objavo.\n\n";
  systemContext += `Nekaj informacij o evtanaziji in zakonu za pomoč pri pisanju odgovora (no need to quote literally, you can paraphrase and use just what you need. And don't cite this explicitly as a source - THIS IS IMPORTANT! : when using info from here, NEVER say "Splošne informacije navajajo XYZ" or "XYZ [Splošne informacije]" or "XYZ [anything]" - don't do this, but rather just say "XYZ" without [...], paraphrase XYZ or optionally cite the relevant part of the law): \n\n${ZPPKZ_INFO_TEXT}\n\n`
  systemContext += `Uporabi naslednje besedilo zakona (ZPPKŽ) kot glavno referenco za preverjanje dejstev:\n\n${ZPPKZ_LAW_TEXT}\n\n---\n\n`;

  if (useRag) {
    systemContext += "Uporabi tudi širše iskanje po bazi znanja (use File Search tool for RAG document search - baza različnih člankov, mnenj podpornikov, intervjujev in drugega utemeljevanja) prek File Search API orodja - za več informacij, ki bi pomagale pri odgovoru - predvsem se da tu najti informacije, ki ne sledijo neposredno iz besedila zakona, pa tudi druge. Vrnjene informacije niso vedno relevantne, uporabi samo, če so. Nekatere tudi navajajo mnenja nasprotnikov, ki niso resnična. Bodi pozoren, kaj uporabiš.\n\n"
  }


  let promptText = `${systemContext}Navodilo: ${instruction}\n\n`;

  // Process all content inputs
  if (contentInputs.length === 1) {
    const content = contentInputs[0];
    if (content.type === InputMode.TEXT && content.content) {
      promptText += `Vsebina za analizo:\n${content.content}`;
      parts.push({ text: promptText });
    } else if (content.type === InputMode.URL && content.content) {
      promptText += `Prosim, analiziraj vsebino na tej povezavi: ${content.content}`;
      const urlContent = await fetchUrlContent(content.content as string);
      promptText += `\nVsebina spletnega vira:\n${urlContent}`;
      parts.push({ text: promptText });
    } else if (content.type === InputMode.FILE && content.content) {
      promptText += `Prosim, analiziraj priloženo datoteko.`;
      const filePart = await fileToPart(content.content as File);
      parts.push({ text: promptText });
      parts.push(filePart);
    } else {
      parts.push({ text: promptText });
    }
  } else {
    // Multiple contents
    promptText += `Prosim, analiziraj naslednje vsebine:\n\n`;

    const fileParts: any[] = [];

    for (let i = 0; i < contentInputs.length; i++) {
      const content = contentInputs[i];
      const index = i + 1;

      if (content.type === InputMode.TEXT && content.content) {
        promptText += `--- Vsebina ${index} (Besedilo) ---\n${content.content}\n\n`;
      } else if (content.type === InputMode.URL && content.content) {
        promptText += `--- Vsebina ${index} (URL: ${content.content}) ---\n`;
        const urlContent = await fetchUrlContent(content.content as string);
        promptText += `${urlContent}\n\n`;
      } else if (content.type === InputMode.FILE && content.content) {
        promptText += `--- Vsebina ${index} (Datoteka: ${(content.content as File).name}) ---\n`;
        const filePart = await fileToPart(content.content as File);
        fileParts.push(filePart);
      }
    }

    promptText += ` \n\n---\n\nNavodilo: ${instruction}`;

    // Add the accumulated text first
    parts.push({ text: promptText });
    // Then add all file parts
    parts.push(...fileParts);
  }

  console.log("Final prompt parts:", parts);
  console.log("model:", model);
  // return;

  try {
    const response = await fetch(`${process.env.API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, parts, useRag }),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.text) {
              onChunk(data.text);
            }
            
            if (data.sources && data.sources.length > 0 && onMetadata) {
              onMetadata(data.sources);
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Backend Communication Error:", error);
    throw error;
  }
};
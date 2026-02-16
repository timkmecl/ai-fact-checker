import { marked } from 'marked';
import { asBlob } from 'html-docx-js-typescript';
import { GroundingSource } from '../types';

// Helper to copy text to clipboard with fallback
const copyToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers or insecure contexts
    console.warn('Clipboard API not available, using fallback method.');
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

// Helper to copy HTML content to clipboard
const copyHtmlToClipboard = async (html: string, text: string): Promise<void> => {
  if (navigator.clipboard?.write) {
    const blobHtml = new Blob([html], { type: 'text/html' });
    const blobText = new Blob([text], { type: 'text/plain' });
    const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
    await navigator.clipboard.write(data);
  } else {
    // Fallback to plain text
    console.warn('Clipboard API with HTML support not available, copying as plain text.');
    await copyToClipboard(text);
  }
};

export const handleCopy = async (response: string, contentRef: React.RefObject<HTMLDivElement>) => {
  if (!contentRef.current) {
    await copyToClipboard(response);
    return;
  }

  const html = contentRef.current.innerHTML;
  const text = contentRef.current.innerText;

  try {
    await copyHtmlToClipboard(html, text);
  } catch (err) {
    console.error('Failed to copy with formatting, falling back to text:', err);
    await copyToClipboard(text);
  }
};

export const handleDownloadMarkdown = (response: string) => {
  const element = document.createElement("a");
  const blob = new Blob([response], {type: 'text/markdown'});
  element.href = URL.createObjectURL(blob);
  element.download = `analiza-${new Date().toISOString().slice(0,10)}.md`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const handleDownloadDocx = async (response: string) => {
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

export const handleSourceClick = async (src: GroundingSource, idx: number) => {
  const htmlContent = await marked.parse("... " + src.text + " ...");
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vir ${idx + 1}: ${src.title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=Inter:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
        h1 { font-family: 'Instrument Serif', serif; }
      </style>
    </head>
    <body class="bg-[#F3F0E7] selection:bg-[#BC5A41]/20 p-8">
      <div class="p-8 md:p-14 pt-6 md:pt-10 min-h-[400px] bg-white border border-[#D1D1D1] rounded-3xl shadow-xl overflow-hidden max-w-4xl mx-auto">
        <h1 class="text-3xl text-charcoal-800 mb-4">${src.title}</h1>
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  URL.revokeObjectURL(url);
};
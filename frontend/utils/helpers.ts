import { marked } from 'marked';
import { asBlob } from 'html-docx-js-typescript';

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
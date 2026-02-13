import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:text-[#2D2D2D] prose-p:leading-relaxed prose-li:text-[#2D2D2D]">
      <ReactMarkdown
        components={{
            h1: ({node, ...props}) => <h1 className="text-5xl mt-6 mb-5 text-charcoal-900" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-4xl mt-6 mb-4 text-charcoal-800" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-3xl mt-5 mb-3 text-charcoal-800" {...props} />,
            h4: ({node, ...props}) => <h3 className="text-2xl mt-4 mb-3 text-charcoal-800" {...props} />,
            h5: ({node, ...props}) => <h3 className="text-xl mt-4 mb-3 text-charcoal-800" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#BC5A41] pl-4 italic my-4 bg-white/50 p-2 rounded-r" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-pink-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
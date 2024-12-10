// src/components/MarkdownMessage/index.tsx
import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { MarkdownMessageProps } from '../types';

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser = false }) => {
  marked.setOptions({
    breaks: true,
    gfm: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
  });

  const createMarkdown = (text: string) => {
    const processedText = text
      .replace(/^(\d+\.\s+\*\*[^*]+\*\*:)\s*$/gm, '$1')
      .replace(/(?:^|\n)(\d+\.|\-|\*)/g, '\n\n$1')
      .replace(/^(\s*)-\s/gm, '$1* ');

    const rawHtml = marked(processedText);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    return cleanHtml;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-[#fe6f00] to-[#ff8534] text-white prose-invert'
            : 'bg-white text-gray-800'
        }`}
      >
        {!isUser && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-[#fe6f00] rounded-full flex items-center justify-center">
              <img
                src="/assets/images/icon-pb.png"
                alt="Qper Construction Logo"
                className="rounded-full"
                style={{
                  maxWidth: '42px',
                  maxHeight: '42px',
                  background: 'transparent'
                }}
              />
            </div>
            <span className="font-medium text-sm font-bold">Qper</span>
          </div>
        )}
        <div 
          className={`prose prose-sm max-w-none ${
            isUser ? 'prose-invert' : 'prose-slate'
          } markdown-content`}
          dangerouslySetInnerHTML={{ __html: createMarkdown(content) }}
        />
      </div>
    </div>
  );
};

export default MarkdownMessage;
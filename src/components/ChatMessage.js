// components/ChatMessage.js
import React from 'react';

const QperAvatar = () => (
  <div className="flex items-center space-x-2 mb-2">
    <div className="w-6 h-6 bg-[#fe6f00] rounded-full flex items-center justify-center">
    <img 
              src="/assets/images/icon-pb.png" 
              alt="Qper Construction Logo"
              width="32"
              height="32"
              style={{
                maxWidth: '37px',
                maxHeight: '37px',
                background: 'transparent'
              }}
            />
    </div>
    <span className="font-medium text-sm">Qper</span>
  </div>
);

const ChatMessage = ({ message, isLastMessage }) => {
  const isUser = message.role === 'user';
  const messageText = typeof message.content === 'string' ? message.content : 'Kein Inhalt verfügbar';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-[#fe6f00] to-[#ff8534] text-white'
            : 'bg-white text-gray-800'
        }`}
      >
        {!isUser && <QperAvatar />}
        <div className={`${message.file_ids?.length ? 'mb-2' : ''}`}>
          {messageText}
        </div>
        {message.file_ids?.length > 0 && (
          <div className="text-xs text-gray-500">
            {message.file_ids.length} {message.file_ids.length === 1 ? 'Datei' : 'Dateien'} angehängt
          </div>
        )}
      </div>
    </div>
  );
};


export const WelcomeMessage = () => (
  <div className="flex justify-start">
    <div className="max-w-[80%] rounded-lg p-3 shadow-sm bg-white text-gray-800">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-[#fe6f00] rounded-full flex items-center justify-center">
        <img 
              src="/assets/images/icon-pb.png" 
              alt="Qper Construction Logo"
              width="32"
              height="32"
              style={{
                maxWidth: '42px',
                maxHeight: '42px',
                background: 'transparent'
              }}
            />
        </div>
        <span className="font-medium">Qper</span>
      </div>
      Hallo! Ich bin Qper, Ihr Bauassistent direkt vor Ort. Wie kann ich Ihnen helfen?
    </div>
  </div>
);

export default ChatMessage;

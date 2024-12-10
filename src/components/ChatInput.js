// components/ChatInput.js
import React, { useRef } from 'react';
import { Send, Paperclip, Camera } from 'lucide-react';
import VoiceMessageHandler from './VoiceMessageHandler';

const ChatInput = ({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onFileSelect,
  onCameraOpen,
  uploadingFiles
}) => {
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || uploadingFiles) return;
    onSubmit(e);
  };

  const handleTranscription = (text) => {
    onInputChange(text);
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-[#fe6f00] hover:bg-gray-100 transition-colors"
          disabled={isLoading || uploadingFiles}
        >
          <Paperclip className="w-6 h-6" />
        </button>
        
        <button
          type="button"
          onClick={onCameraOpen}
          className="p-2 rounded-lg text-[#fe6f00] hover:bg-gray-100 transition-colors"
          disabled={isLoading || uploadingFiles}
        >
          <Camera className="w-6 h-6" />
        </button>

        <VoiceMessageHandler 
          onTranscriptionComplete={handleTranscription}
          isLoading={isLoading}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => onFileSelect(Array.from(e.target.files || []))}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.csv"
        />

        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Fragen Sie Qper..."
          disabled={isLoading || uploadingFiles}
          className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe6f00] focus:border-transparent"
        />
        
        <button
          type="submit"
          disabled={isLoading || uploadingFiles || !input.trim()}
          className="p-3 rounded-lg text-white disabled:opacity-50 transition-opacity"
          style={{
            background: 'linear-gradient(180deg, #fe6f00 0%, #ff8534 100%)'
          }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Bell, Camera, Paperclip, X, Loader2, Mic } from 'lucide-react';
import type { Message } from './types';
import * as api from './services/api';
import VoiceMessageHandler from './components/VoiceMessageHandler';
import FileUploadHandler from './components/FileUploadHandler';
import FileUploadButton from './components/FileUploadButton';
import MarkdownMessage from './components/MarkdownMessage'; // Neuer Import


interface QperProps { }

interface MessageContent {
  type: 'text';
  text: string;
}

const formatMessageContent = (content: any): string => {
  // Debug-Ausgabe
  console.log('Formatting content:', content);

  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('');
  }

  // Einzelnes Content-Objekt
  if (content && content.type === 'text') {
    return content.text;
  }

  console.warn('Unhandled message content:', content);
  return '';
};

const Qper: React.FC<QperProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTranscriptionComplete = (text: string) => {
    console.log('Transcription received:', text); // Debug-Log
    if (text && typeof text === 'string') {
      setInput(text);
    }
  };


  useEffect(() => {
    initializeThread();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedResponse]);

  const initializeThread = async () => {
    try {
      const thread = await api.createThread();
      setThreadId(thread.id);
    } catch (error) {
      console.error('Failed to initialize thread:', error);
    }
  };

  const setupCamera = async () => {
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setShowCamera(false);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFileSelection([file]);
        }
        setShowCamera(false);
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }, 'image/jpeg');
    }
  };

  const handleFileSelection = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setUploadingFiles(true);
    try {
      const uploadedFiles = await Promise.all(
        selectedFiles.map(file => api.uploadFile(file))
      );

      const fileIds = uploadedFiles.map(file => file.id);
      setSelectedFiles([]);
      return fileIds;
    } catch (error) {
      console.error('Upload error:', error);
      return [];
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || uploadingFiles || !threadId) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage
      }]);

      let fileIds: string[] = [];
      if (selectedFiles.length > 0) {
        fileIds = await handleUploadFiles();
      }

      await api.sendMessage(threadId, userMessage, fileIds);
      const runData = await api.createRun(threadId);

      let complete = false;
      while (!complete) {
        const runStatus = await api.checkRunStatus(threadId, runData.id);
        if (runStatus.status === 'completed') {
          complete = true;
          const messages = await api.getMessages(threadId);
          const lastMessage = messages[0];
          if (lastMessage) {
            const formattedContent = formatMessageContent(lastMessage.content);
            console.log('Formatted content:', formattedContent);

            setMessages(prev => [...prev, {
              role: lastMessage.role as 'assistant',
              content: formattedContent
            }]);
          }
        } else if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es erneut.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      <div className="flex flex-col h-full bg-primary-transparent mx-0 lg:mx-[275px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fe6f00] to-[#ff8534]">
          <div className="flex items-center">
            <Menu className="w-6 h-6 mr-4" color="#ffffff" />
            <div className="flex items-center justify-center rounded-lg">
              <img
                src="/assets/images/icon-transparent.png"
                alt="Qper Construction Logo"
                width="32"
                height="32"
                style={{
                  maxWidth: '42px',
                  maxHeight: '42px'
                }}
              />
            </div>
            <h1 className="ml-3 font-bold text-xl text-white">Qper - CONSTRUCTION</h1>
          </div>
          <Bell className="w-6 h-6" color="#ffffff" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 shadow-sm bg-white text-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <img
                      src="/assets/images/icon-pb.png"
                      alt="Qper Construction Logo"
                      width="37"
                      height="37"
                      className="rounded-full"
                      style={{
                        maxWidth: '37px',
                        maxHeight: '37px',
                        background: 'transparent'
                      }}
                    />
                  </div>
                  <span className="font-medium font-bold">Qper</span>
                </div>
                Hallo! Ich bin Qper, Ihr Bauassistent direkt vor Ort. Wie kann ich Ihnen helfen?
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
  <MarkdownMessage
    key={idx}
    content={typeof msg.content === 'string' ? msg.content : formatMessageContent(msg.content)}
    isUser={msg.role === 'user'}
  />
))}

          {/* File Upload Handler */}
          <FileUploadHandler
            files={selectedFiles}
            onRemove={(index) => {
              setSelectedFiles(files => files.filter((_, i) => i !== index));
            }}
            uploading={uploadingFiles}
            onUpload={handleUploadFiles}
          />

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="rounded-lg"
                    onLoadedMetadata={() => setupCamera()}
                  />
                  <button
                    onClick={takePhoto}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#fe6f00] text-white p-3 rounded-full"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => {
                      setShowCamera(false);
                      const stream = videoRef.current?.srcObject as MediaStream;
                      if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                      }
                    }}
                    className="absolute top-2 right-2 text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-2 sm:p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <FileUploadButton
              onFileSelect={handleFileSelection}
              onCameraOpen={() => setShowCamera(true)}
              isLoading={uploadingFiles}
              disabled={isLoading}
            />

            <input
              type="text"
              value={input || ''}
              onChange={handleInputChange}
              placeholder="Frage Qper..."
              disabled={isLoading}
              className="flex-1 p-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe6f00] focus:border-transparent text-sm sm:text-base"
            />

            <div className="flex gap-1">
              <VoiceMessageHandler
                onTranscriptionComplete={handleTranscriptionComplete}
                isLoading={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || uploadingFiles || !input?.trim()}
                className="p-2 rounded-lg text-white disabled:opacity-50 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #fe6f00 0%, #ff8534 100%)'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Qper;
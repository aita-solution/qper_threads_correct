import React, { useState, useCallback, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import audioRecorderService from '../services/audioRecorderService';

interface VoiceMessageHandlerProps {
  onTranscriptionComplete: (text: string) => void;
  isLoading: boolean;
}

const VoiceMessageHandler: React.FC<VoiceMessageHandlerProps> = ({
  onTranscriptionComplete,
  isLoading
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    const timeout = setTimeout(() => setError(''), 5000);
    setErrorTimeout(timeout);
  }, [errorTimeout]);

  const handleTranscriptionError = (error: any) => {
    let errorMessage = 'Fehler bei der Spracherkennung';
    
    if (error?.code === 'NETWORK_ERROR') {
      errorMessage = 'Bitte überprüfen Sie Ihre Internetverbindung';
    } else if (error?.code === 'FILE_TOO_LARGE') {
      errorMessage = 'Aufnahme zu lang (max. 25MB)';
    } else if (error?.code === 'NO_AUDIO_DATA') {
      errorMessage = 'Keine Sprache erkannt';
    } else if (error?.code === 'MIC_ACCESS_ERROR') {
      errorMessage = 'Mikrofonzugriff nicht möglich';
    }

    showError(errorMessage);
    console.error('Transcription error:', error);
  };

  const startRecording = async () => {
    try {
      await audioRecorderService.startRecording();
      setIsRecording(true);
      setError('');
    } catch (error) {
      handleTranscriptionError(error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    
    setIsProcessing(true);
    try {
      const audioBlob = await audioRecorderService.stopRecording();
      const transcribedText = await audioRecorderService.transcribeAudio(audioBlob);
      
      if (transcribedText.trim()) {
        onTranscriptionComplete(transcribedText);
      } else {
        showError('Keine Sprache erkannt');
      }
    } catch (error) {
      handleTranscriptionError(error);
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isLoading && isRecording) {
      stopRecording().catch(console.error);
    }
  }, [isLoading]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading || isProcessing}
        className={`p-2 rounded-lg transition-colors ${
          isRecording 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'text-[#fe6f00] hover:bg-gray-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isRecording ? 'Aufnahme beenden' : 'Sprachnachricht aufnehmen'}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
      
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-red-500 text-white text-sm px-2 py-1 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceMessageHandler;
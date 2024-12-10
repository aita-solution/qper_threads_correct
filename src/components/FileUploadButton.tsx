import React, { useState, useRef } from 'react';
import { Paperclip, Camera, X, Loader2 } from 'lucide-react';
import { validateFile, compressImage } from '../utils/helpers';

interface FileUploadButtonProps {
  onFileSelect: (files: File[]) => void;
  onCameraOpen: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  onCameraOpen,
  isLoading = false,
  disabled = false
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      try {
        validateFile(file);
        // Komprimiere Bilder vor dem Upload
        const processedFile = await compressImage(file);
        validFiles.push(processedFile);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Hier könnte eine Benutzerbenachrichtigung eingebaut werden
      }
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
    setShowOptions(false);
  };

  const handleOptionClick = (option: 'file' | 'camera') => {
    if (option === 'camera') {
      onCameraOpen();
    } else {
      fileInputRef.current?.click();
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || isLoading}
        className="p-2 rounded-lg text-[#fe6f00] hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Paperclip className="w-5 h-5" />
        )}
      </button>

      {showOptions && (
        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50">
          <button
            type="button"
            onClick={() => handleOptionClick('file')}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-sm">Datei anhängen</span>
          </button>
          <button
            type="button"
            onClick={() => handleOptionClick('camera')}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Foto aufnehmen</span>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.csv"
      />
    </div>
  );
};

export default FileUploadButton;
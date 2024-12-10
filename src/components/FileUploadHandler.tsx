import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

interface FileUploadHandlerProps {
  files: File[];
  onRemove: (index: number) => void;
  uploading?: boolean;
  onUpload?: () => void;
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  files,
  onRemove,
  uploading = false,
  onUpload
}) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg shadow-sm">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <span className="text-xs text-gray-600">{formatFileSize(file.size)}</span>
          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
          <button
            onClick={() => onRemove(index)}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            disabled={uploading}
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      {files.length > 0 && onUpload && (
        uploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#fe6f00]" />
            <span className="text-sm text-gray-500">Wird hochgeladen...</span>
          </div>
        ) : (
          <button
            onClick={onUpload}
            className="bg-[#fe6f00] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#ff8534] transition-colors"
            type="button"
          >
            Hochladen
          </button>
        )
      )}
    </div>
  );
};

export default FileUploadHandler;
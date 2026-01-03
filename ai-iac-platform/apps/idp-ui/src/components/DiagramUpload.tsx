import { useState, useRef } from 'react';
import { Upload as UploadIcon, X, Image, FileText } from 'lucide-react';

interface DiagramUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function DiagramUpload({ onUpload, disabled }: DiagramUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Image className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upload Architecture Diagram</h3>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {!preview ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="bg-primary-100 p-4 rounded-full">
              <UploadIcon className="h-10 w-10 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drop your diagram here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PNG, JPG, JPEG (Max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={preview}
                alt="Diagram preview"
                className="w-full h-auto rounded-lg shadow-md max-h-96 object-contain bg-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? 'Processing...' : 'Generate Infrastructure Code'}
        </button>
      )}
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface PDFUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  accept?: string;
  label?: string;
}

export default function PDFUploadZone({
  onFileSelect,
  selectedFile,
  accept = '.pdf',
  label = 'PDF or eBook',
}: PDFUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5'
            : selectedFile
            ? 'border-accent bg-accent/5 cursor-default'
            : 'border-border hover:border-primary hover:bg-muted/50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload size={22} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop your {label} here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or <span className="text-primary underline">click to browse</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

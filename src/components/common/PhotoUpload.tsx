import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  placeholder?: React.ReactNode;
  className?: string;
}

export function PhotoUpload({
  value,
  onChange,
  onFileSelect,
  isUploading = false,
  size = 'md',
  shape = 'circle',
  placeholder,
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || value;

  return (
    <div
      className={cn(
        'relative cursor-pointer group',
        sizeClasses[size],
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        'bg-muted/20 border-2 border-dashed border-muted-foreground/30',
        'flex items-center justify-center overflow-hidden',
        'transition-all hover:border-primary/50 hover:bg-muted/30',
        className
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center gap-1">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Uploading...</span>
        </div>
      ) : displayUrl ? (
        <>
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              'absolute top-1 right-1 p-1 rounded-full',
              'bg-destructive text-destructive-foreground',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:bg-destructive/90'
            )}
          >
            <X className="w-3 h-3" />
          </button>
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'
            )}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
          {placeholder || (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs">Upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

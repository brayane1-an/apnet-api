
import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  currentImage?: string;
  className?: string;
  variant?: 'circle' | 'rectangle'; // Nouveau prop pour le style
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, onChange, currentImage, className, variant = 'circle' }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validation 1: Format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError("Format invalide. Utilisez JPG ou PNG.");
      return;
    }

    // Validation 2: Taille (5 Mo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("L'image dépasse 5 Mo.");
      return;
    }

    // Create Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const containerClasses = variant === 'circle' 
    ? "w-32 h-32 rounded-full" 
    : "w-full h-40 rounded-xl";

  return (
    <div className={`flex flex-col items-center ${className} w-full`}>
      <label className="block text-sm font-medium text-gray-700 mb-2 self-start">{label}</label>
      
      <div className="relative group w-full flex justify-center">
        {preview ? (
          <div className={`relative ${containerClasses} overflow-hidden border-4 border-white shadow-md bg-gray-100`}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera className="text-white" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`${containerClasses} bg-gray-100 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-brand-orange transition`}
          >
            <ImageIcon size={32} />
            <span className="text-xs mt-2 font-medium text-center px-2">{variant === 'circle' ? "Ajouter photo" : "Cliquer pour ajouter"}</span>
            <span className="text-[10px] text-gray-400 mt-1">Max 5 Mo</span>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-2 self-start">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

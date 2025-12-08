"use client";

import { useState, useRef } from "react";
import { FiUpload, FiImage, FiX } from "react-icons/fi";
import Image from "next/image";

interface ImageUploaderProps {
    currentImage?: string | null;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
    label?: string;
    aspectRatio?: string; // e.g. "video" | "square" | "wide"
}

export default function ImageUploader({
    currentImage,
    onUpload,
    uploading = false,
    label = "Upload Image",
    aspectRatio = "wide"
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                await onUpload(file);
            }
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-xs font-bold uppercase text-foreground/50 mb-2">{label}</label>

            <div
                className={`relative group border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/50 hover:bg-secondary/5'}
                    ${uploading ? 'opacity-70 pointer-events-none' : ''}
                    ${aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'min-h-[200px]'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={uploading}
                />

                {currentImage ? (
                    <div className="absolute inset-0 z-10">
                        <img
                            src={currentImage}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <FiUpload className="w-8 h-8 mb-2" />
                            <span className="font-bold">Replace Image</span>
                            <span className="text-sm opacity-70 mt-1">Drag & Drop or Click</span>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/50 p-6 text-center">
                        <div className={`p-4 rounded-full bg-primary/5 mb-4 group-hover:scale-110 transition-transform duration-300 ${isDragging ? 'bg-primary/20 text-primary' : ''}`}>
                            <FiImage className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">
                            {isDragging ? 'Drop Image Here' : 'Click or Drag Image'}
                        </h3>
                        <p className="text-xs opacity-70 max-w-[200px]">
                            Supports JPG, PNG, WEBP (Auto-compressed)
                        </p>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="font-bold text-sm animate-pulse">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

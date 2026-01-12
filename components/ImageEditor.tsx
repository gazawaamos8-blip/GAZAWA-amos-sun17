import React, { useState, useRef, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import { Upload, Wand2, Download, Loader2, X, ZoomIn, ZoomOut, RefreshCcw, Move } from 'lucide-react';

// Internal component for handling Image Zoom & Pan interactions
const ImageCanvas = ({ 
  src, 
  alt, 
  onClear,
  children
}: { 
  src: string; 
  alt: string; 
  onClear?: () => void;
  children?: React.ReactNode;
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset view when src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if we are hovering the container
    if (containerRef.current?.contains(e.target as Node)) {
        e.stopPropagation(); 
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(0.1, scale + delta), 5);
        setScale(newScale);
    }
  };

  const zoom = (factor: number) => {
    setScale(prev => Math.min(Math.max(0.1, prev + factor), 5));
  };

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700 group select-none flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg p-1 shadow-xl flex flex-col">
            <button onClick={() => zoom(0.1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300" title="Zoom In"><ZoomIn size={18} /></button>
            <button onClick={() => zoom(-0.1)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300" title="Zoom Out"><ZoomOut size={18} /></button>
            <button onClick={reset} className="p-2 hover:bg-slate-700 rounded-md text-slate-300" title="Reset View"><RefreshCcw size={18} /></button>
        </div>
        {onClear && (
            <button 
                onClick={onClear} 
                className="bg-red-500/90 hover:bg-red-600 backdrop-blur text-white rounded-lg p-3 shadow-xl transition-colors"
                title="Clear Image"
            >
                <X size={18} />
            </button>
        )}
      </div>

      {/* Viewport Info (Scale) */}
      <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded flex items-center gap-2">
           <Move size={12} />
           <span>{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5`}
        onMouseDown={handleMouseDown}
      >
        <div 
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="origin-center"
        >
            <img 
                src={src} 
                alt={alt} 
                className="max-w-none shadow-2xl rounded-sm pointer-events-none"
                style={{ maxHeight: '80vh', maxWidth: '80vw' }}
                draggable={false}
            />
        </div>
      </div>

      {/* Bottom Overlay for Children (Download button etc) */}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent z-10 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
                {children}
            </div>
        </div>
      )}
    </div>
  );
};

const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please upload an image under 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // Remove data URL prefix for API call
        const base64Data = base64String.split(',')[1];
        setSourceImage(base64Data);
        setMimeType(file.type);
        setResultImage(null); // Clear previous result
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await editImage(sourceImage, mimeType, prompt);
      if (result) {
        setResultImage(result);
      } else {
        setError("Could not edit image. The model might not have returned an image.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to edit image.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSource = () => {
    setSourceImage(null);
    setResultImage(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Magic Editor</h2>
        <p className="text-slate-400">
          Edit your photos using natural language commands with <span className="text-indigo-400 font-mono">gemini-2.5-flash-image</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="relative">
            {sourceImage ? (
                <ImageCanvas 
                    src={`data:${mimeType};base64,${sourceImage}`} 
                    alt="Source"
                    onClear={clearSource}
                />
            ) : (
                <div 
                    className="border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer rounded-2xl transition-all duration-200 h-[400px] flex flex-col items-center justify-center p-4 group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Upload size={32} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xl font-medium text-white">Upload an image</p>
                        <p className="text-sm text-slate-400">JPG or PNG up to 5MB</p>
                    </div>
                </div>
            )}
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
            />
          </div>

          <div className="space-y-3">
             <label className="text-sm font-medium text-slate-300">Instructions</label>
             <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='E.g., "Add a retro filter", "Make the sky purple"'
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                />
                <button
                    onClick={handleEdit}
                    disabled={!sourceImage || !prompt.trim() || isLoading}
                    className="px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium shadow-lg transition-colors flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                    Edit
                </button>
             </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="relative">
          {resultImage ? (
             <div className="h-[400px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Result
                </div>
                <ImageCanvas src={resultImage} alt="Edited Result">
                     <a 
                        href={resultImage} 
                        download={`omnigen-edit-${Date.now()}.png`}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download size={20} />
                        Download Result
                    </a>
                </ImageCanvas>
             </div>
          ) : (
             <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 h-[400px] flex items-center justify-center">
                 <div className="text-slate-600 text-center">
                     {isLoading ? (
                         <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                                <Loader2 size={48} className="animate-spin text-indigo-500 relative z-10" />
                            </div>
                            <p className="animate-pulse font-medium text-slate-400">Applying magic edits...</p>
                         </div>
                     ) : (
                        <div className="space-y-2">
                            <Wand2 size={48} className="mx-auto opacity-20" />
                            <p>The edited image will appear here</p>
                        </div>
                     )}
                 </div>
             </div>
          )}

          {error && (
            <div className="absolute inset-x-4 bottom-4 p-4 bg-red-900/90 text-red-100 rounded-xl text-sm border border-red-700/50 backdrop-blur-md z-30">
                {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
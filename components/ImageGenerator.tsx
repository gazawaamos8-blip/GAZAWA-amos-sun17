import React, { useState, useEffect } from 'react';
import { generateImagePro } from '../services/geminiService';
import { AspectRatio } from '../types';
import { 
  Download, 
  Loader2, 
  Image as ImageIcon, 
  Settings, 
  Key, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const STORAGE_KEY = 'omnigen_api_key';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Key Management State
  const [hasKey, setHasKey] = useState(false);
  const [keySource, setKeySource] = useState<'custom' | 'studio' | 'env' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    // 1. Check Local Storage
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setHasKey(true);
      setKeySource('custom');
      setApiKeyInput(storedKey);
      return;
    }

    // 2. Check AI Studio
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const selected = await aistudio.hasSelectedApiKey();
      if (selected) {
        setHasKey(true);
        setKeySource('studio');
        return;
      }
    } 
    
    // 3. Check Env
    if (process.env.API_KEY) {
      setHasKey(true);
      setKeySource('env');
    } else {
      setHasKey(false);
      setKeySource(null);
    }
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(STORAGE_KEY, apiKeyInput.trim());
      setError(null);
      checkKey();
      setShowSettings(false);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyInput('');
    checkKey();
  };

  const handleSelectKeyFromStudio = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // After selection, we re-check. Note: The promise resolves when dialog closes, 
        // but 'hasSelectedApiKey' might need a moment or just work immediately.
        // We assume it works.
        checkKey();
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const storedKey = localStorage.getItem(STORAGE_KEY);
    const aistudio = (window as any).aistudio;

    // Double check key availability before running
    if (!storedKey && !process.env.API_KEY) {
       if (aistudio) {
         const selected = await aistudio.hasSelectedApiKey();
         if (!selected) {
             setError("Please configure an API Key.");
             setShowSettings(true);
             return;
         }
       } else {
           setError("Please enter an API Key in settings.");
           setShowSettings(true);
           return;
       }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImagePro(prompt, aspectRatio, storedKey || undefined);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("No image generated. Please try a different prompt.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Pro Image Generator</h2>
          <p className="text-slate-400">
            Create high-fidelity images using <span className="text-indigo-400 font-mono">gemini-3-pro-image-preview</span>.
          </p>
        </div>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border
            ${showSettings 
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50' 
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}
          `}
        >
          <Settings size={18} />
          <span>API Key</span>
          {hasKey && <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">API Key Configuration</h3>
              <p className="text-sm text-slate-400">Manage your Gemini API key for this session.</p>
            </div>
          </div>

          <div className="space-y-4">
             {/* Custom Key Input */}
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-300">Custom API Key</label>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeyText ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter your Gemini API Key..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showKeyText ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {keySource === 'custom' ? (
                     <button
                       onClick={handleClearKey}
                       className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors flex items-center gap-2"
                     >
                        <Trash2 size={18} />
                        Clear
                     </button>
                  ) : (
                     <button
                       onClick={handleSaveKey}
                       disabled={!apiKeyInput.trim()}
                       className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 font-medium shadow-lg shadow-indigo-900/20"
                     >
                        <Save size={18} />
                        Save
                     </button>
                  )}
               </div>
               <p className="text-xs text-slate-500">
                 Your key is stored locally in your browser and used only for API requests.
               </p>
             </div>

             {/* AI Studio Integration (Conditional) */}
             {(window as any).aistudio && (
               <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Project IDX / AI Studio</h4>
                      <p className="text-xs text-slate-400 mt-1">Select a key associated with your Google Cloud Project.</p>
                    </div>
                    <button 
                      onClick={handleSelectKeyFromStudio}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm border border-slate-700 transition-colors"
                    >
                      Select Project Key
                    </button>
                  </div>
               </div>
             )}
          </div>

          {/* Status Indicator inside settings */}
          <div className="flex items-center gap-2 text-sm pt-2">
            <span className="text-slate-500">Current Source:</span>
            {keySource === 'custom' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14} /> Custom Key (Local Storage)</span>}
            {keySource === 'studio' && <span className="text-blue-400 flex items-center gap-1"><CheckCircle2 size={14} /> AI Studio / IDX</span>}
            {keySource === 'env' && <span className="text-purple-400 flex items-center gap-1"><CheckCircle2 size={14} /> Environment Variable</span>}
            {!keySource && <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={14} /> No Key Configured</span>}
          </div>
        </div>
      )}

      {!hasKey && !showSettings && (
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between animate-pulse">
          <div className="flex items-center gap-3 text-amber-200">
            <AlertTriangle className="shrink-0" />
            <p>A paid API key is required to use the Pro model.</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
          >
            Configure Key
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars, neon lights, cinematic lighting..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AspectRatio).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setAspectRatio(value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    aspectRatio === value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !hasKey}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
            Generate Image
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
            {generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full max-h-[600px] rounded-lg shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a 
                            href={generatedImage} 
                            download={`omnigen-${Date.now()}.png`}
                            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm"
                        >
                            <Download size={20} />
                         </a>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-600 p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="animate-pulse">Dreaming up your image...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>Enter a prompt and hit generate</p>
                        </div>
                    )}
                </div>
            )}
            
            {error && (
                <div className="absolute inset-x-4 bottom-4 p-4 bg-red-900/90 text-red-100 rounded-xl text-sm border border-red-700/50 backdrop-blur-md">
                    {error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
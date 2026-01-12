import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { AspectRatio } from '../types';
import { 
  Download, 
  Loader2, 
  Video as VideoIcon, 
  Settings, 
  Key, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clapperboard,
  Repeat,
  PlayCircle
} from 'lucide-react';

const STORAGE_KEY = 'omnigen_api_key';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  // Veo mainly supports 16:9 and 9:16
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE_16_9);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Playback settings
  const [autoPlay, setAutoPlay] = useState(true);
  const [loop, setLoop] = useState(true);
  
  // Key Management State (Duplicated logic for standalone consistency)
  const [hasKey, setHasKey] = useState(false);
  const [keySource, setKeySource] = useState<'custom' | 'studio' | 'env' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setHasKey(true);
      setKeySource('custom');
      setApiKeyInput(storedKey);
      return;
    }

    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const selected = await aistudio.hasSelectedApiKey();
      if (selected) {
        setHasKey(true);
        setKeySource('studio');
        return;
      }
    } 
    
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
    setLoadingStep('Initializing generation...');
    setError(null);
    setGeneratedVideo(null);

    // Simulate progress updates for UX since Veo takes time
    const progressInterval = setInterval(() => {
        setLoadingStep(prev => {
            if (prev.includes('Initializing')) return 'Dreaming up scenes...';
            if (prev.includes('Dreaming')) return 'Rendering frames...';
            if (prev.includes('Rendering')) return 'Polishing pixels...';
            return prev;
        });
    }, 4000);

    try {
      const result = await generateVideo(prompt, aspectRatio, storedKey || undefined);
      if (result) {
        setGeneratedVideo(result);
      } else {
        setError("No video generated. Please try a different prompt.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate video.");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Veo Video Generator</h2>
          <p className="text-slate-400">
            Generate high-quality videos using <span className="text-indigo-400 font-mono">veo-3.1-fast-generate-preview</span>.
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
           {/* Same Settings UI as ImageGenerator for consistency */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">API Key Configuration</h3>
              <p className="text-sm text-slate-400">Veo requires a paid API Key.</p>
            </div>
          </div>

          <div className="space-y-4">
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
                     <button onClick={handleClearKey} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl flex items-center gap-2"><Trash2 size={18} /> Clear</button>
                  ) : (
                     <button onClick={handleSaveKey} disabled={!apiKeyInput.trim()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 font-medium"><Save size={18} /> Save</button>
                  )}
               </div>
             </div>

             {(window as any).aistudio && (
               <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Project IDX / AI Studio</h4>
                    </div>
                    <button onClick={handleSelectKeyFromStudio} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm border border-slate-700">Select Project Key</button>
                  </div>
               </div>
             )}
          </div>
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
              placeholder="A cinematic drone shot of a futuristic cyberpunk city at night, rain falling..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAspectRatio(AspectRatio.LANDSCAPE_16_9)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  aspectRatio === AspectRatio.LANDSCAPE_16_9
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                onClick={() => setAspectRatio(AspectRatio.PORTRAIT_9_16)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  aspectRatio === AspectRatio.PORTRAIT_9_16
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Playback Options</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                  autoPlay
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <PlayCircle size={16} />
                Auto-play
              </button>
              <button
                onClick={() => setLoop(!loop)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${
                  loop
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Repeat size={16} />
                Loop
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !hasKey}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Clapperboard size={20} />}
            Generate Video
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
            {generatedVideo ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                    <video 
                        src={generatedVideo} 
                        controls 
                        autoPlay={autoPlay} 
                        loop={loop}
                        className="max-w-full max-h-[600px]"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a 
                            href={generatedVideo} 
                            download={`omnigen-video-${Date.now()}.mp4`}
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
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            <div className="space-y-1">
                                <p className="animate-pulse text-purple-300 font-medium">Generating Video...</p>
                                <p className="text-xs text-slate-500">{loadingStep}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <VideoIcon size={48} className="opacity-20" />
                            <p>Enter a prompt to create a video</p>
                            <p className="text-xs text-slate-500">Note: Generation takes ~1-2 minutes</p>
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

export default VideoGenerator;
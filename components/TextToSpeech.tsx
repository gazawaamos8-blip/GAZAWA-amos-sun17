import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, decodeAudioData } from '../services/geminiService';
import { VOICES, VoiceConfig } from '../types';
import { Mic, Play, Pause, Square, Loader2, Volume2 } from 'lucide-react';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(VOICES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 // Match Gemini TTS
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;
    
    // Reset state
    stopAudio();
    setIsLoading(true);
    setError(null);

    try {
      initAudioContext();
      
      const base64Audio = await generateSpeech(text, selectedVoice.name);
      
      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      if (audioContextRef.current) {
         const buffer = await decodeAudioData(base64Audio, audioContextRef.current);
         audioBufferRef.current = buffer;
         playBuffer(buffer);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate speech");
      setIsLoading(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      sourceNodeRef.current = null;
    };

    sourceNodeRef.current = source;
    source.start(0);
    setIsPlaying(true);
    setIsLoading(false);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore if already stopped */ }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Text to Speech</h2>
        <p className="text-slate-400">
          Lifelike speech synthesis with <span className="text-indigo-400 font-mono">gemini-2.5-flash-preview-tts</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to speak..."
            className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
          />
          
          {error && (
             <div className="p-4 bg-red-900/50 border border-red-700/50 text-red-200 rounded-xl text-sm">
                {error}
             </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-medium text-slate-300 flex items-center gap-2">
              <Volume2 size={18} />
              Voice Selection
            </h3>
            <div className="space-y-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.name}
                  onClick={() => setSelectedVoice(voice)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all
                    ${selectedVoice.name === voice.name 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                  `}
                >
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs opacity-60 uppercase tracking-wide">{voice.gender}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
             {!isPlaying ? (
               <button
                 onClick={handleGenerateAndPlay}
                 disabled={isLoading || !text.trim()}
                 className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
               >
                 {isLoading ? <Loader2 className="animate-spin" /> : <Play size={24} fill="currentColor" />}
                 Generate & Play
               </button>
             ) : (
                <button
                 onClick={stopAudio}
                 className="w-full py-4 bg-red-500 hover:bg-red-400 rounded-xl text-white font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
               >
                 <Square size={24} fill="currentColor" />
                 Stop Playback
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
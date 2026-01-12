import React, { useState, useRef, useEffect } from 'react';
import { chatWithSearch } from '../services/geminiService';
import { getChatHistory, saveChatHistory, clearChatHistory } from '../services/storageService';
import { ChatMessage, GroundingMetadata } from '../types';
import { Send, Search, Bot, User, Loader2, Globe, Paperclip, X, Trash2, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const GeneralChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from DB on mount
  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
        setMessages(history);
    }
  }, []);

  // Save history to DB whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
        saveChatHistory(messages);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearHistory = () => {
      if (window.confirm("Effacer l'historique de chat ?")) {
          clearChatHistory();
          setMessages([]);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // Strip prefix for API, keep full string for display
        const base64Data = base64String.split(',')[1];
        setSelectedImage({
            data: base64Data,
            mimeType: file.type
        });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.data}` : undefined,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage; 
    setSelectedImage(null); 
    setIsLoading(true);

    try {
      // Prepare history for context (simplified for API)
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }] 
      }));

      const response = await chatWithSearch(userMsg.text, history, imageToSend ? imageToSend : undefined);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "J'ai traité votre demande.",
        timestamp: Date.now(),
        groundingMetadata: response.groundingMetadata
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrounding = (metadata: GroundingMetadata) => {
    if (!metadata.groundingChunks?.length) return null;

    const webChunks = metadata.groundingChunks.filter(c => c.web);
    if (webChunks.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
            <Globe size={12} /> Sources
        </h4>
        <div className="grid grid-cols-1 gap-2">
        {webChunks.map((chunk, idx) => {
           if (!chunk.web) return null;
           const { web } = chunk;
           return (
             <a 
                key={idx} 
                href={web.uri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs text-indigo-300 truncate"
             >
                <div className="min-w-0 truncate flex-1">
                    {web.title}
                </div>
                <div className="text-slate-600 text-[10px] shrink-0">
                    {new URL(web.uri).hostname}
                </div>
             </a>
           );
        })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Search className="text-indigo-400" /> 
                Chat & Vision
            </h2>
            <p className="text-sm text-slate-400">Gemini 3 Flash • Web Search • Images</p>
        </div>
        {messages.length > 0 && (
            <button onClick={handleClearHistory} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Effacer l'historique">
                <Trash2 size={18} />
            </button>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
             <Bot size={48} />
             <p>Posez des questions ou envoyez des images.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[85%] rounded-2xl p-4 flex flex-col gap-2
              ${msg.role === 'user' 
                ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none'}
            `}>
              {msg.image && (
                  <div className="mb-2">
                      <img src={msg.image} alt="Upload" className="max-w-full rounded-lg max-h-60 object-cover border border-white/10" />
                  </div>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown components={{
                    img: ({node, ...props}) => <img {...props} className="rounded-lg max-h-60 border border-slate-600 my-2" />
                }}>
                    {msg.text}
                </ReactMarkdown>
              </div>
              {msg.groundingMetadata && renderGrounding(msg.groundingMetadata)}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                    <span className="text-slate-400 text-sm">Analyse en cours...</span>
                </div>
            </div>
        )}
      </div>

      <div className="relative">
        {selectedImage && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} className="w-12 h-12 rounded object-cover" />
                <span className="text-xs text-slate-300">Image jointe</span>
                <button onClick={() => setSelectedImage(null)} className="p-1 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors">
                    <X size={14} />
                </button>
            </div>
        )}
        
        <div className="flex gap-2">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl border border-slate-700 transition-colors"
                title="Joindre une image"
            >
                <ImageIcon size={20} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
            />

            <div className="relative flex-1">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message à Gemini..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
                />
                <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                <Send size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralChat;
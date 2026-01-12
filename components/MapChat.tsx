import React, { useState, useRef, useEffect } from 'react';
import { queryMaps } from '../services/geminiService';
import { ChatMessage, GroundingMetadata } from '../types';
import { Send, MapPin, Navigation, Bot, User, Loader2, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MapChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          console.error("Geo error:", error);
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await queryMaps(userMsg.text, location);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I found some info but couldn't get the text.",
        timestamp: Date.now(),
        groundingMetadata: response.groundingMetadata
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error checking the map.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrounding = (metadata: GroundingMetadata) => {
    if (!metadata.groundingChunks?.length) return null;

    // Filter chunks that have map data
    const mapChunks = metadata.groundingChunks.filter(c => c.maps);
    
    if (mapChunks.length === 0) return null;

    return (
      <div className="mt-4 grid grid-cols-1 gap-3">
        {mapChunks.map((chunk, idx) => {
           if (!chunk.maps) return null;
           const { maps } = chunk;
           return (
             <a 
                key={idx} 
                href={maps.uri} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-3 transition-colors group"
             >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-900/50 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-200 truncate">{maps.title}</h4>
                    {maps.placeAnswerSources?.reviewSnippets?.map((review, rIdx) => (
                        <div key={rIdx} className="mt-2 text-sm text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                            <div className="flex gap-1 mb-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-amber-500 text-amber-500"/>)}
                            </div>
                            <p className="line-clamp-2 italic">"{review.snippet}"</p>
                            <p className="text-xs text-slate-500 mt-1 text-right">- {review.author}</p>
                        </div>
                    ))}
                  </div>
                </div>
             </a>
           );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Maps Chat</h2>
          <p className="text-sm text-slate-400">Ask about places using real-time Google Maps data.</p>
        </div>
        
        <button 
          onClick={getLocation}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            location 
            ? 'bg-green-900/30 border-green-700/50 text-green-400' 
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          {location ? "Location Active" : "Use My Location"}
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
             <MapPin size={48} />
             <p>Try asking "Where is the best pizza nearby?"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl p-4 
              ${msg.role === 'user' 
                ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none'}
            `}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.groundingMetadata && renderGrounding(msg.groundingMetadata)}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-slate-400" />
                    <span className="text-slate-400 text-sm">Searching maps...</span>
                </div>
            </div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about places, restaurants, or directions..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MapChat;
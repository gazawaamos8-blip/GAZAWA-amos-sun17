import React, { useState, useRef, useEffect } from 'react';
import { Cloud, Lock, Smartphone, Upload, File, Image, Video, Trash2, Download, Play, Share2, X, Music, Copy, Facebook, Twitter, MessageSquare, Youtube } from 'lucide-react';
import { getCloudFiles, saveCloudFile } from '../services/storageService';
import { CloudFile } from '../types';

const SunAmosCloud: React.FC = () => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [showShare, setShowShare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles(getCloudFiles());
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { 
          alert("Fichier trop volumineux pour la démo (Max 5MB).");
          return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
          const base64 = event.target?.result as string;
          
          let type: 'image' | 'video' | 'document' = 'document';
          if (file.type.startsWith('image/')) type = 'image';
          else if (file.type.startsWith('video/')) type = 'video';

          const newFile: CloudFile = {
              id: Date.now().toString(),
              name: file.name,
              type: type,
              url: base64,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              date: Date.now()
          };
          
          try {
             saveCloudFile(newFile);
             setFiles(getCloudFiles());
          } catch(err) {
              console.error(err);
              alert("Erreur de stockage (LocalStorage plein).");
          } finally {
              setIsUploading(false);
          }
      };

      reader.readAsDataURL(file);
  };

  const openMedia = (file: CloudFile) => {
      setSelectedFile(file);
      setShowShare(false);
  };

  const closeMedia = () => {
      setSelectedFile(null);
      setShowShare(false);
  };

  const shareFile = (platform: string) => {
      if (!selectedFile) return;
      
      // In a real app, you'd upload the file to a public bucket and get a real URL.
      // Here we simulate the link.
      const fakeLink = `https://sun-amos-cloud.com/share/${selectedFile.id}`;
      const text = `Regarde ce fichier sur Sun-Amos Cloud: ${fakeLink}`;

      switch(platform) {
          case 'whatsapp':
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              break;
          case 'facebook':
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fakeLink)}`, '_blank');
              break;
          case 'twitter':
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fakeLink)}&text=${encodeURIComponent("Sun-Amos Cloud Share")}`, '_blank');
              break;
          case 'sms':
              window.open(`sms:?body=${encodeURIComponent(text)}`, '_self');
              break;
          case 'youtube':
              window.open(`https://youtube.com`, '_blank'); // Placeholder redirection
              break;
          case 'copy':
              navigator.clipboard.writeText(fakeLink);
              alert("Lien copié !");
              break;
      }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
        {/* Media Viewer Modal */}
        {selectedFile && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                <div className="absolute top-4 right-4 flex gap-4">
                    <button onClick={() => setShowShare(!showShare)} className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors">
                        <Share2 size={24} />
                    </button>
                    <button onClick={closeMedia} className="p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center">
                    {selectedFile.type === 'image' && (
                        <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    )}
                    {selectedFile.type === 'video' && (
                        <video src={selectedFile.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                    )}
                    {selectedFile.type === 'document' && (
                        <div className="text-center p-10 bg-white rounded-xl">
                            <File size={64} className="text-slate-900 mx-auto mb-4" />
                            <p className="text-black font-bold text-xl">{selectedFile.name}</p>
                            <a href={selectedFile.url} download={selectedFile.name} className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg">Télécharger pour voir</a>
                        </div>
                    )}
                </div>

                {/* Share Sheet Overlay */}
                {showShare && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-6 animate-in slide-in-from-bottom duration-300 rounded-t-3xl">
                        <h4 className="text-center text-white font-bold mb-6">Partager via</h4>
                        <div className="flex justify-center gap-6 flex-wrap">
                            <button onClick={() => shareFile('whatsapp')} className="flex flex-col items-center gap-2 text-white">
                                <div className="p-4 bg-green-500 rounded-full"><MessageSquare size={24} /></div>
                                <span className="text-xs">WhatsApp</span>
                            </button>
                            <button onClick={() => shareFile('facebook')} className="flex flex-col items-center gap-2 text-white">
                                <div className="p-4 bg-blue-600 rounded-full"><Facebook size={24} /></div>
                                <span className="text-xs">Facebook</span>
                            </button>
                            <button onClick={() => shareFile('twitter')} className="flex flex-col items-center gap-2 text-white">
                                <div className="p-4 bg-sky-500 rounded-full"><Twitter size={24} /></div>
                                <span className="text-xs">Twitter</span>
                            </button>
                             <button onClick={() => shareFile('youtube')} className="flex flex-col items-center gap-2 text-white">
                                <div className="p-4 bg-red-600 rounded-full"><Youtube size={24} /></div>
                                <span className="text-xs">YouTube</span>
                            </button>
                            <button onClick={() => shareFile('copy')} className="flex flex-col items-center gap-2 text-white">
                                <div className="p-4 bg-slate-700 rounded-full"><Copy size={24} /></div>
                                <span className="text-xs">Copier</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Cloud className="text-sky-400"/> Sun-Amos Cloud</h2>
                <p className="text-slate-400">Musique, Vidéo, Documents - Partagez instantanément.</p>
            </div>
            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*,video/*,audio/*,.pdf,.doc"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium flex items-center gap-2"
                >
                    {isUploading ? 'Upload...' : <><Upload size={18} /> Uploader</>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                    <Cloud size={48} className="mx-auto mb-4 opacity-20"/>
                    <p>Aucun fichier. Uploadez des médias.</p>
                </div>
            ) : files.map((file) => (
                <div 
                    key={file.id} 
                    onClick={() => openMedia(file)}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-xl hover:border-sky-500/50 transition-colors cursor-pointer group relative flex flex-col"
                >
                    <div className="aspect-square bg-slate-950 rounded-lg mb-3 flex items-center justify-center text-slate-500 overflow-hidden relative">
                        {file.type === 'image' ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="flex flex-col items-center">
                                {file.type === 'video' && <Play size={32} className="text-sky-400 mb-2" />}
                                {file.type === 'document' && <File size={32} className="text-indigo-400 mb-2" />}
                                {file.name.endsWith('.mp3') && <Music size={32} className="text-pink-400 mb-2" />}
                            </div>
                        )}
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="text-white drop-shadow-lg" size={32} fill="currentColor" />
                        </div>
                    </div>
                    <p className="font-medium text-white truncate text-xs mb-1">{file.name}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{file.size}</span>
                        <span>{new Date(file.date).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default SunAmosCloud;
import React, { useState, useEffect } from 'react';
import { Search, Download, History, ArrowRight, Zap, Image, Video, Wand2, MapPin, CheckCircle2 } from 'lucide-react';
import { AppMode } from '../types';

interface HomeProps {
  onNavigate: (mode: AppMode) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);

  // Mock carousel images
  const slides = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop"
  ];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Check if running standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if(outcome === 'accepted') setIsInstalled(true);
      setInstallPrompt(null);
    } else {
      if(isInstalled) {
          alert("Application déjà installée.");
      } else {
          alert("Pour installer: Tapez sur le menu de votre navigateur (3 points) et sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Hero Carousel */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
            <img src={slide} alt="Showcase" className="w-full h-full object-cover" />
          </div>
        ))}
        
        <div className="absolute bottom-6 left-6 z-20 space-y-2">
           <div className="flex items-center gap-2 mb-2">
               <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded font-bold">V 17.0</span>
               <span className="flex items-center text-xs text-slate-300"><MapPin size={10} className="mr-1"/> Mokolo, CMR</span>
           </div>
           <h1 className="text-4xl font-bold text-white tracking-tighter">Gazawa Amos sun17</h1>
           <p className="text-indigo-200">Giecole, Soulede, Roua, Mokolo</p>
           
           {!isInstalled ? (
               <button 
                 onClick={handleInstall}
                 className="mt-4 px-5 py-2 bg-white text-slate-900 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-lg animate-pulse"
               >
                 <Download size={18} />
                 Installation Complète
               </button>
           ) : (
               <div className="mt-4 px-5 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full font-bold flex items-center gap-2 w-fit">
                   <CheckCircle2 size={18}/> App Installée
               </div>
           )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 -mt-8 relative z-30">
        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-xl flex items-center gap-3 mb-8">
            <Search className="text-slate-500 ml-2" />
            <input 
                type="text" 
                placeholder="Rechercher outils, projets, factures..." 
                className="bg-transparent border-none outline-none text-white flex-1 h-10"
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium">
                Rechercher
            </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div onClick={() => onNavigate(AppMode.IMAGE_GENERATION)} className="cursor-pointer bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-3 transition-all group">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-full group-hover:scale-110 transition-transform"><Image size={24}/></div>
                <span className="font-medium text-slate-200">Créer Images</span>
            </div>
            <div onClick={() => onNavigate(AppMode.VIDEO_GENERATION)} className="cursor-pointer bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-3 transition-all group">
                <div className="p-3 bg-pink-500/20 text-pink-400 rounded-full group-hover:scale-110 transition-transform"><Video size={24}/></div>
                <span className="font-medium text-slate-200">Créer Vidéo</span>
            </div>
            <div onClick={() => onNavigate(AppMode.WALLET)} className="cursor-pointer bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-3 transition-all group">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full group-hover:scale-110 transition-transform"><Zap size={24}/></div>
                <span className="font-medium text-slate-200">Factures & Pay</span>
            </div>
             <div onClick={() => onNavigate(AppMode.IMAGE_EDITING)} className="cursor-pointer bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center gap-3 transition-all group">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full group-hover:scale-110 transition-transform"><Wand2 size={24}/></div>
                <span className="font-medium text-slate-200">Magic Edit</span>
            </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History size={20} className="text-indigo-400" />
                    Activités Récentes
                </h3>
                <button className="text-sm text-slate-400 hover:text-white">Tout Voir</button>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-500">
                <p>Vos activités récentes apparaîtront ici.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React from 'react';
import { AppMode } from '../types';
import { 
  Image as ImageIcon, 
  Wand2, 
  MapPin, 
  Mic, 
  Menu,
  Video,
  MessageSquare,
  Home,
  Wallet,
  Briefcase,
  FileText,
  Cloud,
  Calendar,
  Flag,
  X,
  LogOut,
  Share2
} from 'lucide-react';

interface NavigationProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentMode, onModeChange, isMobileOpen, setIsMobileOpen, onLogout }) => {
  const navItems = [
    { mode: AppMode.HOME, label: 'Accueil', icon: <Home size={20} /> },
    { mode: AppMode.WALLET, label: 'Portefeuille', icon: <Wallet size={20} /> },
    { mode: AppMode.GENERAL_CHAT, label: 'Chat IA', icon: <MessageSquare size={20} /> },
    { mode: AppMode.SUN_AMOS_CLOUD, label: 'Cloud', icon: <Cloud size={20} /> },
    { mode: AppMode.PROJECT_MANAGER, label: 'Projets', icon: <Briefcase size={20} /> },
    { mode: AppMode.DOCUMENT_EDITOR, label: 'Docs', icon: <FileText size={20} /> },
    { mode: AppMode.AGENDA, label: 'Agenda', icon: <Calendar size={20} /> },
    { mode: AppMode.IMAGE_GENERATION, label: 'Images', icon: <ImageIcon size={20} /> },
    { mode: AppMode.VIDEO_GENERATION, label: 'Vidéo', icon: <Video size={20} /> },
    { mode: AppMode.LOCATION, label: 'Giecole', icon: <Flag size={20} /> },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gazawa Amos sun17',
          text: 'Découvrez la Super App Gazawa Amos: IA, Finance et Cloud!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert("Lien copié: " + window.location.href);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-slate-800 rounded-lg text-white shadow-lg border border-slate-700"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col h-full
      `}>
          <div className="p-6 border-b border-slate-800 pl-20 md:pl-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
              Gazawa Amos
            </h1>
            <p className="text-xs text-indigo-300 font-mono mt-1">sun17 Studio</p>
          </div>

          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.mode}
                onClick={() => {
                  onModeChange(item.mode);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                  ${currentMode === item.mode 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                `}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <button 
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
            >
                <Share2 size={18} />
                Partager l'App
            </button>
            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
            >
                <LogOut size={18} />
                Déconnexion
            </button>
            
            <div className="text-xs text-slate-600 text-center mt-4">
              &copy; 2025 Gazawa Amos sun17<br/>Extreme Nord, CMR
            </div>
          </div>
      </nav>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
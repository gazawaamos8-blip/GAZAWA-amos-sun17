import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import GeneralChat from './components/GeneralChat';
import MapChat from './components/MapChat';
import TextToSpeech from './components/TextToSpeech';
import Wallet from './components/Wallet';
import ProjectManager from './components/ProjectManager';
import DocumentEditor from './components/DocumentEditor';
import SunAmosCloud from './components/SunAmosCloud';
import Agenda from './components/Agenda';
import LocationMap from './components/LocationMap';
import Auth from './components/Auth';
import { AppMode } from './types';
import { getUserProfile, logoutUser, initializeDatabase } from './services/storageService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize DB (seed data if needed)
    initializeDatabase();

    // Check auth on load
    const profile = getUserProfile();
    if (profile) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setMode(AppMode.HOME);
  };

  const handleLogout = () => {
      if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
          logoutUser();
          setIsAuthenticated(false);
          setMode(AppMode.HOME);
      }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.HOME:
        return <Home onNavigate={setMode} />;
      case AppMode.WALLET:
        return <Wallet />;
      case AppMode.PROJECT_MANAGER:
        return <ProjectManager />;
      case AppMode.DOCUMENT_EDITOR:
        return <DocumentEditor />;
      case AppMode.SUN_AMOS_CLOUD:
        return <SunAmosCloud />;
      case AppMode.AGENDA:
        return <Agenda />;
      case AppMode.GENERAL_CHAT:
        return <GeneralChat />;
      case AppMode.IMAGE_GENERATION:
        return <ImageGenerator />;
      case AppMode.IMAGE_EDITING:
        return <ImageEditor />;
      case AppMode.VIDEO_GENERATION:
        return <VideoGenerator />;
      case AppMode.MAPS_CHAT:
        return <MapChat />;
      case AppMode.TEXT_TO_SPEECH:
        return <TextToSpeech />;
      case AppMode.LOCATION:
        return <LocationMap />;
      default:
        return <Home onNavigate={setMode} />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Navigation 
        currentMode={mode} 
        onModeChange={setMode}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 md:ml-64 h-full overflow-y-auto bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="h-full pt-16 md:pt-0">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
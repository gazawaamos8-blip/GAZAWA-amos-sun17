import React from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';

const LocationMap: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col">
       <div className="mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-orange-500" />
              Localisation
          </h2>
          <p className="text-slate-400">Giecole, Soulede, Roua, Mokolo, Extreme Nord, Cameroun</p>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex-1 flex flex-col">
            {/* Embed Google Maps for Mokolo region */}
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 relative">
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src="https://maps.google.com/maps?q=Mokolo%2C%20Extreme%20North%2C%20Cameroon&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    className="absolute inset-0 filter grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                ></iframe>
                
                <div className="absolute bottom-4 left-4 bg-slate-900/90 p-4 rounded-xl border border-slate-700 backdrop-blur-md max-w-xs">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Navigation size={16}/> Gazawa Amos sun17</h3>
                    <p className="text-sm text-slate-300">Siège: Giecole, Route de Roua.</p>
                    <button 
                        onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Mokolo+Extreme+North+Cameroon', '_blank')}
                        className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg"
                    >
                        Ouvrir dans Google Maps
                    </button>
                </div>
            </div>
       </div>
    </div>
  );
};

export default LocationMap;
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storageService';
import { Smartphone, Mail, Fingerprint, MapPin, ArrowRight, Scan, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');

  // Biometric Simulation Function
  const requestBiometricAccess = (onSuccess: () => void) => {
    setShowBiometric(true);
    setBiometricStatus('scanning');
    
    // Simulate scan delay
    setTimeout(() => {
        setBiometricStatus('success');
        setTimeout(() => {
            setShowBiometric(false);
            onSuccess();
        }, 800);
    }, 1500);
  };

  const handleAuth = () => {
    setError('');
    
    // Validation for Cameroon Number: 9 digits
    const cmRegex = /^[0-9]{9}$/;
    if (!cmRegex.test(phone)) {
        setError('Le numéro doit comporter exactement 9 chiffres.');
        return;
    }

    if (!isLogin && !name.trim()) {
        setError('Veuillez entrer votre nom.');
        return;
    }

    // Trigger Biometric Check
    requestBiometricAccess(() => {
        const profile: UserProfile = {
            name: name || 'Utilisateur',
            phone: phone,
            isBiometricEnabled: true
        };
        
        saveUserProfile(profile);
        onLogin();
    });
  };

  const handleGoogleLogin = () => {
      // Trigger Biometric Check even for Google
      requestBiometricAccess(() => {
        saveUserProfile({ name: 'Google User', phone: '000000000', isBiometricEnabled: true });
        onLogin();
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Biometric Overlay */}
        {showBiometric && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold text-white">Sécurité Gazawa</h3>
                    
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${biometricStatus === 'success' ? 'border-green-500 bg-green-500/20' : 'border-indigo-500 bg-indigo-500/20 animate-pulse'}`}>
                        {biometricStatus === 'success' ? (
                            <ShieldCheck size={48} className="text-green-500" />
                        ) : (
                            <Fingerprint size={48} className="text-indigo-500" />
                        )}
                    </div>
                    
                    <div className="text-center">
                        <p className="text-white font-medium">Authentification</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {biometricStatus === 'scanning' ? 'Veuillez scanner votre empreinte...' : 'Identité Confirmée'}
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                    Gazawa Amos sun17
                </h1>
                <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
                    <MapPin size={12} /> Giecole, Soulede, Roua, Mokolo
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        Connexion
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        Inscription
                    </button>
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Nom Complet</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Entrez votre nom"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Numéro Mobile (9 Chiffres)</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            placeholder="6XXXXXXXX"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest font-mono"
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                    <Scan className="text-indigo-400" size={24} />
                    <p className="text-xs text-slate-400 leading-tight">
                        L'accès sécurisé par <strong>Amprint Digital</strong> est requis pour continuer.
                    </p>
                </div>

                <button 
                    onClick={handleAuth}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                >
                    {isLogin ? 'Connexion Sécurisée' : 'S\'inscrire'} <Fingerprint size={18} />
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-xs">OU</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button onClick={handleGoogleLogin} className="py-2 px-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                        <Mail size={18} /> Continuer avec Google
                    </button>
                </div>
            </div>
            
            <p className="mt-6 text-center text-xs text-slate-500">
                Application sécurisée par Gazawa Amos sun17.
            </p>
        </div>
    </div>
  );
};

export default Auth;
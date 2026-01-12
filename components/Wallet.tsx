import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Settings, Lightbulb, Wifi, Droplets, Smartphone, Flag, FileDigit, ShieldCheck, Fingerprint, Lock, Upload, Camera, Eye, EyeOff, ScanFace, RefreshCw } from 'lucide-react';
import { getBalance, updateBalance, getTransactions, addTransaction, getSettings, saveSettings } from '../services/storageService';
import { Transaction } from '../types';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(false); // For masking balance
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'bills' | 'cards' | 'settings'>('overview');
  
  // Inputs
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ORANGE_MONEY' | 'MTN_MOMO' | 'CARD'>('ORANGE_MONEY');
  
  // Settings & Verification
  const [flutterwaveKey, setFlutterwaveKey] = useState('FLWPUBK-b13f71d6b6c2d0d7642fcb0df026c4ca-X');
  const [isVerified, setIsVerified] = useState(false);
  
  // Identity Fields
  const [verifyName, setVerifyName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  // Biometric UI State
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');
  const [biometricMessage, setBiometricMessage] = useState('Veuillez scanner votre empreinte...');

  // Virtual Card State
  const [virtualCard, setVirtualCard] = useState<{number: string, cvv: string, exp: string} | null>(null);

  useEffect(() => {
    refreshData();
    const settings = getSettings();
    if (settings.flutterwaveKey) setFlutterwaveKey(settings.flutterwaveKey);
    
    // Check if verification details were saved
    if (settings.verified) {
        setIsVerified(true);
        setVerifyName(settings.verifyName || '');
    }
  }, []);

  const refreshData = () => {
    setBalance(getBalance());
    setTransactions(getTransactions());
  };

  // --- Security Functions ---

  const performSecureAction = (action: () => void, message: string = "Validation Empreinte Requise") => {
      setShowBiometric(true);
      setBiometricStatus('scanning');
      setBiometricMessage(message);

      // Simulate Scan
      setTimeout(() => {
          setBiometricStatus('success');
          setBiometricMessage("Empreinte Reconnue");
          setTimeout(() => {
              setShowBiometric(false);
              action();
          }, 800);
      }, 1500);
  };

  const checkVerification = () => {
      if (!isVerified) {
          alert("Action Bloquée. Veuillez vérifier votre identité dans les Paramètres.");
          setActiveTab('settings');
          return false;
      }
      return true;
  };

  // --- Transaction Handlers ---

  const handleDeposit = () => {
    if (!amount || !phoneNumber) { alert("Remplir tous les champs"); return; }
    if (!checkVerification()) return;

    performSecureAction(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        updateBalance(val);
        const tx: Transaction = {
            id: Date.now().toString(),
            type: 'DEPOSIT',
            amount: val,
            currency: 'XAF',
            method: paymentMethod,
            date: Date.now(),
            status: 'SUCCESS',
            description: `Dépôt via ${paymentMethod}`
        };
        addTransaction(tx);
        refreshData();
        setActiveTab('overview');
        setAmount('');
        alert("Dépôt sécurisé réussi!");
    });
  };

  const handleWithdraw = () => {
    if (!amount || !phoneNumber) return;
    if (!checkVerification()) return;

    performSecureAction(() => {
        const val = parseFloat(amount);
        const fee = Math.ceil(val * 0.01); // 1% fee
        
        if (balance < (val + fee)) {
            alert("Solde insuffisant");
            return;
        }

        updateBalance(-(val + fee));
        const tx: Transaction = {
            id: Date.now().toString(),
            type: 'WITHDRAWAL',
            amount: val,
            currency: 'XAF',
            method: paymentMethod,
            date: Date.now(),
            status: 'SUCCESS',
            description: `Retrait vers ${phoneNumber}`
        };
        addTransaction(tx);
        refreshData();
        setActiveTab('overview');
        setAmount('');
        alert(`Retrait de ${val} CFA validé. Frais: ${fee} CFA.`);
    });
  };

  const toggleBalanceVisibility = () => {
      if (showBalance) {
          setShowBalance(false);
      } else {
          performSecureAction(() => {
              setShowBalance(true);
          }, "Scan pour Voir Solde");
      }
  };

  const verifyIdentityMock = () => {
      if (!verifyName || !idNumber) {
          alert("Veuillez remplir les informations");
          return;
      }
      performSecureAction(() => {
          setIsVerified(true);
          const settings = getSettings();
          saveSettings({ ...settings, verified: true, verifyName, idNumber });
          alert("Identité vérifiée (Simulé)");
      }, "Vérification en cours...");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative mb-20">
       {/* Biometric Modal */}
       {showBiometric && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-xl font-bold text-white">Sécurité Gazawa</h3>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${biometricStatus === 'success' ? 'border-green-500 bg-green-500/20' : 'border-indigo-500 bg-indigo-500/20 animate-pulse'}`}>
                        {biometricStatus === 'success' ? <ShieldCheck size={48} className="text-green-500" /> : <Fingerprint size={48} className="text-indigo-500" />}
                    </div>
                    <p className="text-white text-center">{biometricMessage}</p>
                </div>
            </div>
        )}

      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white">Portefeuille</h2>
            <p className="text-slate-400">Gérez vos finances sécurisées.</p>
        </div>
        <div 
            onClick={toggleBalanceVisibility}
            className="cursor-pointer bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-xl text-indigo-300 font-mono text-xl flex items-center gap-3 hover:bg-indigo-900/50 transition-colors"
        >
            {showBalance ? `${balance.toLocaleString()} CFA` : '•••••••• CFA'}
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2 hidden md:block">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Aperçu</button>
            <button onClick={() => setActiveTab('deposit')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'deposit' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Dépôt</button>
            <button onClick={() => setActiveTab('withdraw')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'withdraw' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Retrait</button>
            <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Paramètres / KYC</button>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
            <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Aperçu</button>
            <button onClick={() => setActiveTab('deposit')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm ${activeTab === 'deposit' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Dépôt</button>
             <button onClick={() => setActiveTab('withdraw')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm ${activeTab === 'withdraw' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Retrait</button>
            <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>KYC</button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
            
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Transactions Récentes</h3>
                        <button onClick={refreshData} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400"><RefreshCw size={16}/></button>
                    </div>
                    <div className="space-y-3">
                        {transactions.length === 0 ? <p className="text-slate-500">Aucune transaction.</p> : transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in fade-in">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-white'}`}>
                                    {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(activeTab === 'deposit' || activeTab === 'withdraw') && (
                <div className="space-y-6 max-w-md">
                    <h3 className="text-xl font-bold text-white">{activeTab === 'deposit' ? 'Ajouter des Fonds' : 'Retirer des Fonds'}</h3>
                    <div className="space-y-4">
                         <div>
                             <label className="text-sm text-slate-400 block mb-1">Méthode</label>
                             <div className="grid grid-cols-2 gap-2">
                                 <button onClick={() => setPaymentMethod('ORANGE_MONEY')} className={`p-2 rounded-lg border ${paymentMethod === 'ORANGE_MONEY' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Orange Money</button>
                                 <button onClick={() => setPaymentMethod('MTN_MOMO')} className={`p-2 rounded-lg border ${paymentMethod === 'MTN_MOMO' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>MTN MoMo</button>
                             </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Numéro Mobile</label>
                            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="6XXXXXXXX" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Montant (CFA)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" />
                         </div>
                         <button 
                            onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                            className={`w-full py-3 font-bold rounded-xl mt-4 flex items-center justify-center gap-2 text-white ${activeTab === 'deposit' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                         >
                            <Fingerprint size={20}/> {activeTab === 'deposit' ? 'Confirmer Dépôt' : 'Confirmer Retrait'}
                         </button>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6 max-w-md">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className={isVerified ? "text-green-500" : "text-amber-500"} /> 
                        KYC & Identité
                    </h3>
                    
                    {isVerified ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                             <p className="text-green-400 font-bold mb-1">Compte Vérifié</p>
                             <p className="text-sm text-slate-400">Nom: {verifyName}</p>
                             <p className="text-sm text-slate-400">Status: Actif</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400">Veuillez vérifier votre identité pour débloquer toutes les fonctionnalités.</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nom Complet</label>
                                <input type="text" value={verifyName} onChange={(e) => setVerifyName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Numéro CNI</label>
                                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" />
                            </div>
                            <button onClick={verifyIdentityMock} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
                                Soumettre Vérification
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Wallet;
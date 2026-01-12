import { Transaction, CloudFile, Invoice, UserProfile, ChatMessage, AgendaEvent } from "../types";

// Keys
const USER_PROFILE_KEY = 'gazawa_user_profile';
const WALLET_BALANCE_KEY = 'gazawa_wallet_balance';
const TRANSACTIONS_KEY = 'gazawa_transactions';
const CLOUD_FILES_KEY = 'gazawa_sun_amos_files';
const INVOICES_KEY = 'gazawa_invoices';
const APP_SETTINGS_KEY = 'gazawa_settings';
const CHAT_HISTORY_KEY = 'gazawa_chat_history';
const AGENDA_KEY = 'gazawa_agenda_events';
const DOCUMENT_DRAFT_KEY = 'gazawa_doc_draft';

// --- Database Initialization ---
export const initializeDatabase = () => {
    // Seed Wallet if empty (Welcome Bonus)
    if (!localStorage.getItem(WALLET_BALANCE_KEY)) {
        localStorage.setItem(WALLET_BALANCE_KEY, '5000'); 
        const initialTx: Transaction = {
            id: 'init-bonus',
            type: 'DEPOSIT',
            amount: 5000,
            currency: 'XAF',
            method: 'BALANCE',
            date: Date.now(),
            status: 'SUCCESS',
            description: 'Bonus de Bienvenue Gazawa'
        };
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([initialTx]));
    }

    // Seed Cloud if empty
    if (!localStorage.getItem(CLOUD_FILES_KEY)) {
        localStorage.setItem(CLOUD_FILES_KEY, JSON.stringify([]));
    }
};

// --- Auth ---
export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(USER_PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

export const logoutUser = () => {
  localStorage.removeItem(USER_PROFILE_KEY);
  // Optional: Clear other sensitive session data if needed
};

// --- Wallet (The "DB" for Finance) ---
export const getBalance = (): number => {
  return parseFloat(localStorage.getItem(WALLET_BALANCE_KEY) || '0');
};

export const updateBalance = (amount: number): number => {
  const current = getBalance();
  const newBalance = current + amount;
  localStorage.setItem(WALLET_BALANCE_KEY, newBalance.toString());
  return newBalance;
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addTransaction = (tx: Transaction) => {
  const list = getTransactions();
  list.unshift(tx);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
};

// --- Chat History (Persistence) ---
export const getChatHistory = (): ChatMessage[] => {
    try {
        const data = localStorage.getItem(CHAT_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const saveChatHistory = (messages: ChatMessage[]) => {
    try {
        // Limit history to last 50 messages to prevent storage overflow
        const recentMessages = messages.slice(-50);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(recentMessages));
    } catch (e) {
        console.error("Chat history storage full", e);
    }
};

export const clearChatHistory = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
};

// --- Cloud ---
export const getCloudFiles = (): CloudFile[] => {
  const data = localStorage.getItem(CLOUD_FILES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCloudFile = (file: CloudFile) => {
  const list = getCloudFiles();
  list.unshift(file);
  try {
    localStorage.setItem(CLOUD_FILES_KEY, JSON.stringify(list));
  } catch (e) {
    alert("Mémoire pleine ! Veuillez supprimer des fichiers.");
  }
};

export const deleteCloudFile = (id: string) => {
    let list = getCloudFiles();
    list = list.filter(f => f.id !== id);
    localStorage.setItem(CLOUD_FILES_KEY, JSON.stringify(list));
};

// --- Invoices ---
export const getInvoices = (): Invoice[] => {
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveInvoice = (invoice: Invoice) => {
  const list = getInvoices();
  const existingIndex = list.findIndex(i => i.id === invoice.id);
  if (existingIndex >= 0) {
    list[existingIndex] = invoice;
  } else {
    list.unshift(invoice);
  }
  localStorage.setItem(INVOICES_KEY, JSON.stringify(list));
};

// --- Settings ---
export const getSettings = () => {
  const data = localStorage.getItem(APP_SETTINGS_KEY);
  return data ? JSON.parse(data) : { flutterwaveKey: '', isPro: false, cameroonBonus: false };
};

export const saveSettings = (settings: any) => {
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
};

// --- Agenda ---
export const getAgendaEvents = (): AgendaEvent[] => {
    const data = localStorage.getItem(AGENDA_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveAgendaEvent = (event: AgendaEvent) => {
    const list = getAgendaEvents();
    list.push(event);
    localStorage.setItem(AGENDA_KEY, JSON.stringify(list));
};

export const deleteAgendaEvent = (id: string) => {
    const list = getAgendaEvents().filter(e => e.id !== id);
    localStorage.setItem(AGENDA_KEY, JSON.stringify(list));
};

// --- Document Draft ---
export const getSavedDocument = (): string => {
    return localStorage.getItem(DOCUMENT_DRAFT_KEY) || '<p>Commencez à rédiger votre document...</p>';
};

export const saveDocumentContent = (html: string) => {
    localStorage.setItem(DOCUMENT_DRAFT_KEY, html);
};

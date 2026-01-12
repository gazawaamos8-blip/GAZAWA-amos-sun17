
export enum AppMode {
  AUTH = 'AUTH',
  HOME = 'HOME',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  IMAGE_EDITING = 'IMAGE_EDITING',
  VIDEO_GENERATION = 'VIDEO_GENERATION',
  GENERAL_CHAT = 'GENERAL_CHAT',
  MAPS_CHAT = 'MAPS_CHAT',
  TEXT_TO_SPEECH = 'TEXT_TO_SPEECH',
  WALLET = 'WALLET',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DOCUMENT_EDITOR = 'DOCUMENT_EDITOR',
  SUN_AMOS_CLOUD = 'SUN_AMOS_CLOUD',
  AGENDA = 'AGENDA',
  LOCATION = 'LOCATION'
}

export interface UserProfile {
  name: string;
  phone: string; // 9 digits
  isBiometricEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 data
  mimeType?: string;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            snippet: string;
            author: string;
        }[]
    }
  };
}

export interface ImageGenerationConfig {
  aspectRatio: string;
  imageSize: '1K' | '2K' | '4K'; // Only for pro model
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_3_4 = "3:4",
  LANDSCAPE_4_3 = "4:3",
  PORTRAIT_9_16 = "9:16",
  LANDSCAPE_16_9 = "16:9"
}

export interface VoiceConfig {
  name: string;
  gender: string;
}

export const VOICES: VoiceConfig[] = [
  { name: 'Puck', gender: 'Male' },
  { name: 'Charon', gender: 'Male' },
  { name: 'Kore', gender: 'Female' },
  { name: 'Fenrir', gender: 'Male' },
  { name: 'Zephyr', gender: 'Female' },
];

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BILL_PAYMENT' | 'SUBSCRIPTION';
  amount: number;
  currency: 'XAF' | 'USD';
  method: 'ORANGE_MONEY' | 'MTN_MOMO' | 'CARD' | 'BALANCE';
  date: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  invoiceId?: string; // Added for Bill Payments
}

export interface Invoice {
  id: string;
  clientName: string;
  items: { description: string; quantity: number; price: number }[];
  total: number;
  status: 'PAID' | 'UNPAID';
  date: string;
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string; // base64 or URL
  size: string;
  date: number;
}

export interface AgendaEvent {
  id: string;
  title: string;
  time: string;
  type: 'Work' | 'Finance' | 'Personal' | 'Health';
  date: number;
}

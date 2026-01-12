import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio } from "../types";

// Helper to decode base64 audio to AudioBuffer
export const decodeAudioData = async (
  base64Data: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert 16-bit PCM to float [-1.0, 1.0]
  const dataInt16 = new Int16Array(bytes.buffer);
  const float32Data = new Float32Array(dataInt16.length);
  for (let i = 0; i < dataInt16.length; i++) {
    float32Data[i] = dataInt16[i] / 32768.0;
  }

  const buffer = audioContext.createBuffer(1, float32Data.length, 24000); // 24kHz is standard for Gemini TTS
  buffer.copyToChannel(float32Data, 0);
  
  return buffer;
};

// --- API FUNCTIONS ---

// 1. Text to Speech
export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// 2. Image Editing (Nano Banana)
export const editImage = async (
  base64Image: string, 
  mimeType: string, 
  prompt: string
): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// 3. Image Generation (Pro Image)
export const generateImagePro = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  customKey?: string
): Promise<string | null> => {
  const apiKey = customKey || process.env.API_KEY; 
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K" // Defaulting to 1K for speed/stability
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// 4. Video Generation (Veo)
export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  customKey?: string
): Promise<string | null> => {
    const apiKey = customKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio === AspectRatio.PORTRAIT_9_16 ? '9:16' : '16:9'
            }
        });

        // Polling loop
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) return null;

        // Fetch the actual video bytes using the URI + Key
        const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
        if (!videoResponse.ok) throw new Error("Failed to download video");
        
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Video Gen Error:", error);
        throw error;
    }
};

// 5. General Chat with Search (Multimodal)
export const chatWithSearch = async (
  prompt: string, 
  history: any[],
  image?: { data: string; mimeType: string }
): Promise<{ text: string; groundingMetadata?: any }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Construct current turn parts
    const currentParts: any[] = [{ text: prompt }];
    if (image) {
        currentParts.unshift({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType
            }
        });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Supports text + images + search
      contents: [
        ...history, // Past turns
        { role: 'user', parts: currentParts } // Current turn
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

// 6. Maps Chat
export const queryMaps = async (
    prompt: string, 
    userLocation?: { lat: number; lng: number }
): Promise<{ text: string; groundingMetadata?: any }> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
  
    try {
      const config: any = {
          tools: [{ googleMaps: {} }],
      };

      if (userLocation) {
          config.toolConfig = {
              googleMapsToolConfig: {
                  location: {
                      latitude: userLocation.lat,
                      longitude: userLocation.lng
                  }
              }
          }
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config
      });
  
      return {
        text: response.text || "",
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      };
    } catch (error) {
      console.error("Maps Chat Error:", error);
      throw error;
    }
};

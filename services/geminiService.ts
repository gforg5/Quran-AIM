
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

// Use gemini-3-flash-preview for high speed and reliable Islamic scholarship tasks.
export const getIslamicGuidance = async (query: string, history: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Incorporate history into the contents for context-aware conversation
    const contents = history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: query }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "You are 'Al-Malik AI', a world-class Islamic scholar assistant. Provide highly accurate, professional, and cited information based on the Quran, Sahih Bukhari, Sahih Muslim, and major Madhahib. Be concise and fast. If the user asks in English, provide English response but include relevant Urdu translations or verses where beneficial. If the user asks in Urdu, respond in Urdu. Always maintain a respectful and sacred tone. Use Google Search for news or recent context.",
        tools: [{ googleSearch: {} }]
      }
    });

    // Always extract grounding URLs when using googleSearch tool
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    })).filter(u => u.uri);

    return {
      text: response.text || '',
      urls: urls
    };
  } catch (err) {
    console.error("Gemini Text Error:", err);
    throw err;
  }
};

export const generateIslamicArt = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High-quality Islamic professional artwork: ${prompt}. Majestic, sacred, elegant composition.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

  // Find the image part in the response
  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate art");
};

export const editIslamicImage = async (base64Image: string, prompt: string, aspectRatio: string = "1:1") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  const mimeType = base64Image.includes('data:') ? base64Image.split(':')[1].split(';')[0] : 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: `Edit this Islamic artwork based on this prompt: ${prompt}. Maintain sacred aesthetic.` }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

  // Find the image part in the response
  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to edit art");
};

// Voice synthesis for the Scholar
export const speakGuidance = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Explain clearly as a scholar: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Voice synthesis failed");
  return base64Audio;
};

// Custom manual decode function following guidelines
export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom manual decode function following guidelines for raw PCM streaming
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

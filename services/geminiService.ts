
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

// Enhanced instruction to remove markdown formatting (asterisks, bolding)
const SCHOLAR_INSTRUCTION = `You are 'Al-Malik AI', a world-class Islamic scholar assistant. 
Provide highly accurate, professional, and clear answers.

STRICT FORMATTING RULES:
1. ALWAYS respond in plain text only. 
2. NEVER use markdown symbols like asterisks (*) or double asterisks (**).
3. DO NOT use hashtags (#) for headings.
4. Use standard capitalization and clear paragraphs for structure.
5. Use plain numbers (1. 2. 3.) for lists, not bullets.
6. If referring to Quran or Hadith, cite them clearly in plain text (e.g., Surah Al-Baqarah, Verse 255).
7. Be compassionate, authoritative, and thorough. Avoid being terse; provide complete explanations.`;

export const getIslamicGuidance = async (query: string, history: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: query }] }],
      config: {
        systemInstruction: SCHOLAR_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });

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
        { text: `Edit this Islamic artwork based on this prompt: ${prompt}. Maintain sacred and professional aesthetic.` }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

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
    contents: [{ parts: [{ text: `Read this Islamic guidance clearly: ${text}` }] }],
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

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

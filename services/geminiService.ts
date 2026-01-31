
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

/**
 * Creates a fresh instance of the AI client.
 * Using a function ensures we always check for the most current API_KEY.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("AL-MALIK: API_KEY environment variable is missing. Check Vercel settings.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const getIslamicGuidance = async (query: string, history: any[]) => {
  const ai = getAIInstance();
  
  try {
    // Map history to the format expected by the Gemini API
    const contents = history.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "You are 'Al-Malik AI', a professional male Islamic scholar. Provide accurate, cited information. Avoid heavy markdown like # or * symbols. Keep text clear and simple. Use paragraphs. Respond in the language used by the user (English/Urdu/Pashto). Use Google Search ONLY when necessary for current events.",
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    })).filter(u => u.uri);

    // Clean response text from heavy symbols
    let cleanedText = response.text || '';
    cleanedText = cleanedText.replace(/[#*]/g, '').trim();

    return {
      text: cleanedText,
      urls: urls
    };
  } catch (err: any) {
    console.error("AL-MALIK: Guidance Error", err);
    throw new Error(err?.message || "Connection failed");
  }
};

export const speakGuidance = async (text: string, forceUrdu: boolean = false) => {
  const ai = getAIInstance();
  const promptText = forceUrdu 
    ? `Read this Urdu text clearly in a professional male voice: ${text}`
    : `Read this English text clearly in a professional male voice: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep professional male voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Voice synthesis failed - No data");
    return base64Audio;
  } catch (err: any) {
    console.error("AL-MALIK: TTS Error", err);
    throw new Error(err?.message || "TTS failed");
  }
};

export const generateIslamicArt = async (prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAIInstance();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality Sacred Islamic Art: ${prompt}` }]
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data");
  } catch (err) {
    console.error("AL-MALIK: Image Gen Error", err);
    throw err;
  }
};

export const editIslamicImage = async (base64Image: string, prompt: string, aspectRatio: string = "1:1") => {
  const ai = getAIInstance();
  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/png' } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No edited data");
  } catch (err) {
    console.error("AL-MALIK: Image Edit Error", err);
    throw err;
  }
};

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
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

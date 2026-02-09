
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

/**
 * Validates and retrieves the AI instance.
 * Exclusively uses process.env.API_KEY as per requirements.
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("AL-MALIK: API_KEY is missing. Please add 'API_KEY' to your Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getIslamicGuidance = async (query: string, history: any[]) => {
  try {
    const ai = getAIInstance();
    
    // Map history to the format expected by the Gemini API
    const contents = history.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // If history is empty, initialize with current query
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: query }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: "You are 'Al-Malik AI', a professional male Islamic scholar. IMPORTANT: You MUST always provide your full response in BOTH English and Urdu. Provide accurate, cited information. Do not use symbols like # or * for headers. Use simple paragraphs. First provide the English response, then provide the full Urdu translation (اردو ترجمہ) below it.",
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    })).filter(u => u.uri);

    let cleanedText = response.text || '';
    cleanedText = cleanedText.replace(/[#*]/g, '').trim();

    return {
      text: cleanedText,
      urls: urls
    };
  } catch (err: any) {
    console.error("AL-MALIK: Guidance Error", err);
    throw err;
  }
};

export const speakGuidance = async (text: string, forceUrdu: boolean = false) => {
  try {
    const ai = getAIInstance();
    const promptText = forceUrdu 
      ? `Read this Urdu text clearly: ${text}`
      : `Read this English text clearly: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Professional male voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Voice synthesis failed - No data returned.");
    return base64Audio;
  } catch (err: any) {
    console.error("AL-MALIK: TTS Error", err);
    throw err;
  }
};

export const generateIslamicArt = async (prompt: string, aspectRatio: string = "1:1") => {
  try {
    const ai = getAIInstance();
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
    throw new Error("No image data returned.");
  } catch (err) {
    console.error("AL-MALIK: Image Gen Error", err);
    throw err;
  }
};

export const editIslamicImage = async (base64Image: string, prompt: string, aspectRatio: string = "1:1") => {
  try {
    const ai = getAIInstance();
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
    throw new Error("No edited data returned.");
  } catch (err) {
    console.error("AL-MALIK: Image Edit Error", err);
    throw err;
  }
};

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
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

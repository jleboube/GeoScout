
import { GoogleGenAI, GenerateContentResponse, Blob } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
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

/**
 * Identify location from image using gemini-2.5-flash with Search and Maps tools.
 * Returns a structured JSON response via manual parsing since schema is not supported with tools.
 */
export const identifyLocation = async (base64Image: string, mimeType: string): Promise<{ result: any, groundingMetadata: any }> => {
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        {
          text: `You are an expert OSINT (Open Source Intelligence) investigator. Your mission is to geolocate this image with maximum precision.
          
          Execute the following analysis protocols:
          1. **Metadata & Visual Markers**: Scan for visible text, license plates, street signs, or timestamps.
          2. **Biometric & Social Cross-Reference**: Identify any public figures using Google Search. Analyze clothing styles, crowd demographics, and social behaviors to infer region. 
          3. **Topographic & Structural Triangulation**: Analyze architecture, vegetation, weather patterns, utility infrastructure (poles, plugs), and road markings.
          4. **Digital Footprint Search**: Use Google Search to find similar images, news events, or social media trends associated with this scene.
          5. **Verification**: Use Google Maps to verify the existence of identified businesses or landmarks.

          RETURN ONLY RAW JSON. Do not use markdown code blocks.
          
          Expected JSON Structure:
          {
            "location": "Best estimated address, city, or landmark name.",
            "coordinates": { "lat": 0.00, "lng": 0.00 },
            "confidence": 85,
            "analysis_log": ["Step 1 details...", "Step 2 details..."],
            "social_context": "Analysis of social cues...",
            "biometric_analysis": "Demographic analysis..."
          }`
        }
      ]
    },
    config: {
      tools: [
        { googleSearch: {} },
        { googleMaps: {} }
      ]
    }
  });

  let parsedResult;
  try {
    let text = response.text || "{}";
    // Clean potential markdown code blocks often returned by LLMs
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    parsedResult = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    // Return a partial valid object to avoid crashing UI
    parsedResult = {
        location: "Analysis Inconclusive",
        confidence: 0,
        analysis_log: ["Raw output could not be parsed as JSON.", "Check console for details."],
        social_context: "N/A",
        biometric_analysis: "N/A"
    };
  }

  return {
    result: parsedResult,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

export const analyzeImageDeeply = async (base64Image: string, mimeType: string, prompt: string): Promise<GenerateContentResponse> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: prompt }
            ]
        }
    });
    return response;
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<GenerateContentResponse> => {
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history as any
    });
    const response = await chat.sendMessage({ message: message });
    return response;
};

export const submitFeedback = async (feedback: any): Promise<void> => {
  console.log("[SYSTEM] Sending feedback to training pipeline...", feedback);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
  console.log("[SYSTEM] Feedback archived successfully.");
};

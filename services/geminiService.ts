import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Vite exposes GEMINI_API_KEY via define (see vite.config.ts). Prefer GEMINI_API_KEY.
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY (or API_KEY) environment variable not set. Gemini features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `आप 'Sakhi Connect' की AI सहायक हैं, राजस्थान की ग्रामीण महिला उद्यमियों के लिए एक सहायक AI।
    आपको कृषि, पशुपालन, और सरकारी योजनाओं पर सरल और स्पष्ट हिंदी में सलाह देनी है।
    आपका लहजा हमेशा सहायक, सकारात्मक और सम्मानजनक होना चाहिए।
    संक्षिप्त और समझने में आसान उत्तर दें।`;

export async function* streamSakhiResponse(history: ChatMessage[], newMessage: string) {
  try {
    if (!ai) {
      throw new Error('Gemini API is not configured. Set GEMINI_API_KEY in environment.');
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of responseStream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error streaming response from Gemini:", error);
    yield "माफ़ कीजिए, मुझे जवाब देने में कुछ समस्या आ रही है। कृपया थोड़ी देर बाद फिर प्रयास करें।";
  }
}

const LANGUAGE_MAP: { [key: string]: string } = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
    mr: 'Marathi',
    te: 'Telugu',
    ta: 'Tamil',
    gu: 'Gujarati',
    kn: 'Kannada',
    pa: 'Punjabi',
};

export async function translateText(text: string, targetLanguageCode: string): Promise<string> {
    if (!text || !targetLanguageCode || targetLanguageCode === 'hi') {
        return text;
    }
    try {
        const targetLanguageName = LANGUAGE_MAP[targetLanguageCode] || 'English';
        const prompt = `Translate the following text to ${targetLanguageName}. Respond with only the translated text, without any additional formatting or explanation. Text to translate: "${text}"`;
        
    if (!ai) {
      throw new Error('Gemini API is not configured. Set GEMINI_API_KEY in environment.');
    }

    const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Disable thinking for faster, direct translations
                thinkingConfig: { thinkingBudget: 0 },
                // Low temperature for more predictable, literal translations
                temperature: 0.2,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error(`Error translating text to ${targetLanguageCode}:`, error);
        return text; // Fallback to original text on error
    }
}
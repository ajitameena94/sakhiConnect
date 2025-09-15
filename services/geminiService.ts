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

// Helper: build a clear system + user prompt for translation
function buildTranslationPrompt(text: string, targetLanguageName: string) {
  return `You are a professional translator for a simple app used by rural women in India. Translate the following Hindi text into ${targetLanguageName}. Use the native script for the target language (do NOT transliterate to Latin script). Keep the translation natural, concise, and appropriate for non-technical audiences. For labels or headings, prefer short natural phrases. Return only the translated text with no extra explanation. Text: "${text}"`;
}

export async function translateText(text: string, targetLanguageCode: string): Promise<string> {
  if (!text || !targetLanguageCode || targetLanguageCode === 'hi') {
    return text;
  }

  if (!ai) {
    console.warn('Gemini API is not configured; falling back to original text for translation.');
    return text;
  }

  // If we're under a cooldown because of rate limiting, skip calls
  if (lastRateLimitReset > Date.now()) {
    return text;
  }

  const targetLanguageName = LANGUAGE_MAP[targetLanguageCode] || 'English';

  // Try up to 2 attempts with slightly different prompts if the model returns the original text
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const prompt = buildTranslationPrompt(text, targetLanguageName);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          temperature: 0.0,
        }
      });

      const translated = response.text.trim();
      // If the model returned the exact input (or empty), retry with an explicit instruction to force translation
      if (!translated) throw new Error('Empty translation');
      if (translated === text && attempt === 0) {
        // retry with stronger instruction
        const retryPrompt = `Translate the following text into ${targetLanguageName} using the native script. Do not return the original Hindi text; provide a proper translation. Text: "${text}"`;
        const retryResp = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ text: retryPrompt }],
          config: { temperature: 0.0 }
        });
        const retryTranslated = retryResp.text.trim();
        if (retryTranslated && retryTranslated !== text) return retryTranslated;
      }

      return translated;
    } catch (error: any) {
      const msg = error?.message || JSON.stringify(error);
      console.warn(`Translation attempt ${attempt + 1} failed for ${targetLanguageCode}:`, msg);
      // If this is a rate-limit / quota error, set a cooldown to avoid repeated failing calls
      try {
        const errObj = typeof error === 'string' ? JSON.parse(error) : error;
        const details = errObj?.error || errObj;
        if (details?.code === 429 || details?.status === 'RESOURCE_EXHAUSTED') {
          // look for retryDelay in details
          const retryInfo = details?.details?.find((d: any) => d['@type'] && d['@type'].includes('RetryInfo'));
          let delaySec = 30;
          if (retryInfo && retryInfo.retryDelay) {
            // retryDelay often is like "37s"
            const m = String(retryInfo.retryDelay).match(/(\d+)s/);
            if (m) delaySec = parseInt(m[1], 10);
          }
          lastRateLimitReset = Date.now() + delaySec * 1000;
          console.warn(`Gemini rate limit encountered. Pausing translations for ${delaySec}s.`);
          return text;
        }
      } catch (parseErr) {
        // ignore parsing errors
      }
      // continue to next attempt
    }
  }

  // Final fallback: return original text so UI remains usable
  return text;
}

// Internal cooldown timestamp (ms) to avoid calling Gemini while rate-limited
let lastRateLimitReset = 0;

// Translate multiple texts in one call, returning an array of translated strings in the same order.
export async function translateBatch(texts: string[], targetLanguageCode: string): Promise<string[]> {
  if (!texts || texts.length === 0 || !targetLanguageCode || targetLanguageCode === 'hi') return texts;
  if (!ai) {
    console.warn('Gemini API is not configured; falling back to original texts for batch translation.');
    return texts;
  }

  const targetLanguageName = LANGUAGE_MAP[targetLanguageCode] || 'English';
  // Helper: try to extract JSON array from model text (handles ```json fences or stray text)
  const extractJsonArray = (s: string): any[] | null => {
    if (!s) return null;
    // Remove common markdown fences
    const cleaned = s.replace(/```json\n?|```/g, '\n');
    // Try to find the first [...] substring that is valid JSON
    const firstBracket = cleaned.indexOf('[');
    if (firstBracket >= 0) {
      // try progressively longer substrings to find valid JSON
      for (let end = cleaned.indexOf(']', firstBracket); end !== -1; end = cleaned.indexOf(']', end + 1)) {
        const candidate = cleaned.slice(firstBracket, end + 1);
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // continue
        }
      }
    }
    // As a last resort, try to parse the whole string
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return null;
  };

  // Chunk texts to avoid large or many requests; smaller batches reduce quota pressure
  const CHUNK_SIZE = 3;
  const results: string[] = [];

  const callWithRetries = async (promptText: string): Promise<string> => {
    // Exponential backoff with jitter
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      try {
        const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: [{ text: promptText }], config: { temperature: 0.0 } });
        return resp.text || '';
      } catch (err: any) {
        attempt++;
        const wait = Math.min(1000 * 2 ** attempt + Math.floor(Math.random() * 300), 10000);
        // If rate-limited, set cooldown and abort
        try {
          const details = err?.error || err;
          if (details?.code === 429 || details?.status === 'RESOURCE_EXHAUSTED') {
            const retryInfo = details?.details?.find((d: any) => d['@type'] && d['@type'].includes('RetryInfo'));
            let delaySec = 30;
            if (retryInfo && retryInfo.retryDelay) {
              const m = String(retryInfo.retryDelay).match(/(\d+)s/);
              if (m) delaySec = parseInt(m[1], 10);
            }
            lastRateLimitReset = Date.now() + delaySec * 1000;
            console.warn(`Gemini rate limit in batch. Pausing translations for ${delaySec}s.`);
            throw err;
          }
        } catch (parseErr) {
          // ignore
        }
        if (attempt >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, wait));
      }
    }
    return '';
  };

  for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
    const chunk = texts.slice(i, i + CHUNK_SIZE);
    const prompt = `You are a professional translator. Translate the following array of Hindi strings into ${targetLanguageName}. Return a JSON array of translated strings in the same order, and return only valid JSON with no extra text. Input: ${JSON.stringify(chunk)}`;
    try {
      const raw = await callWithRetries(prompt);
      const extracted = extractJsonArray(raw);
      if (extracted && Array.isArray(extracted) && extracted.length === chunk.length) {
        results.push(...extracted.map((s) => (typeof s === 'string' ? s : String(s))));
        continue;
      }
      // if extraction failed or count mismatch, fallback to individual translations for this chunk
      for (const t of chunk) {
        results.push(await translateText(t, targetLanguageCode));
      }
    } catch (e) {
      console.warn('Batch chunk failed, falling back to individual translations for chunk:', e?.message || e);
      for (const t of chunk) {
        results.push(await translateText(t, targetLanguageCode));
      }
    }
  }

  return results;
}
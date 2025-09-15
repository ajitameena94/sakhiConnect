// Script to fetch knowledge articles and update Firestore
// Usage: node fetchArticles.js


import admin from 'firebase-admin';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync(new URL('../firebase/serviceAccountKey.json', import.meta.url)));
// Optional Gemini for generating articles if NewsAPI is not provided
let genai = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('Could not load @google/genai. Gemini fallback will be disabled for articles.', e.message || e);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function fetchArticlesFromAPI() {
  // Try NewsAPI if API key provided, otherwise fallback to static curated articles
  const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
  if (NEWSAPI_KEY) {
    const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${NEWSAPI_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NewsAPI fetch failed: ${res.status}`);
      const data = await res.json();
      if (data.articles && data.articles.length) {
        return data.articles.slice(0, 20).map((item, idx) => ({
          title: item.title || `Article ${idx+1}`,
          summary: item.description || item.content || '',
          imageUrl: item.urlToImage || '',
        }));
      }
    } catch (e) {
      console.error('Error fetching from NewsAPI:', e.message || e);
    }
  }

  console.warn('NewsAPI not configured or returned no data — attempting Gemini fallback then static fallback.');
  if (genai) {
    try {
      const prompt = `Generate 6 short, helpful agricultural articles aimed at rural women farmers in India. For each article return a JSON object with keys: title, summary, imageUrl (may be empty). Return a JSON array only.`;
      const resp = await genai.models.generateContent({
        model: 'gemini-1.5',
        contents: prompt,
        config: { temperature: 0.2 }
      });
      const parsed = JSON.parse(resp.text);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((item, idx) => ({
          title: item.title || `Article ${idx+1}`,
          summary: item.summary || '',
          imageUrl: item.imageUrl || '',
        }));
      }
    } catch (e) {
      console.warn('Gemini fallback for articles failed:', e.message || e);
    }
  }

  return [
    {
      title: 'सही फसल को चुनना: बीज और मौसम का महत्व',
      summary: 'यह लेख बताता है कि किस प्रकार खेत की मिट्टी और मौसमी परिस्थितियों के अनुसार उपयुक्त फसल चुनी जाये।',
      imageUrl: '',
    },
    {
      title: 'पोषण प्रबंधन: सस्ती उर्वरक तकनीक',
      summary: 'कम लागत में मिट्टी की उर्वरकता बढाने के कुछ सरल तरीके।',
      imageUrl: '',
    },
    {
      title: 'खरपतवार नियंत्रण: जैविक उपाय',
      summary: 'रासायनिक उपयोग कम करने वाले कुछ प्रभावी जैविक तरीके।',
      imageUrl: '',
    },
  ];
}

async function updateFirestoreArticles(articles) {
  const batch = db.batch();
  const articlesRef = db.collection('knowledge_articles');
  // Delete old
  const snapshot = await articlesRef.get();
  snapshot.forEach(doc => batch.delete(doc.ref));
  // Add new
  articles.forEach(article => {
    const docRef = articlesRef.doc();
    batch.set(docRef, article);
  });
  await batch.commit();
  console.log('Firestore articles updated:', articles.length);
}

(async () => {
  const articles = await fetchArticlesFromAPI();
  if (articles.length) {
    await updateFirestoreArticles(articles);
  } else {
    console.log('No articles fetched.');
  }
  process.exit(0);
})();

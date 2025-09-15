// Script to fetch government schemes and update Firestore
// Usage: node fetchSchemes.js


import admin from 'firebase-admin';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync(new URL('../firebase/serviceAccountKey.json', import.meta.url)));
// Optional: Gemini (Google GenAI) for content generation when public APIs are unavailable
let genai = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('Could not load @google/genai. Gemini fallback will be disabled.', e.message || e);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function fetchSchemesFromAPI() {
  // Try data.gov.in (requires DATA_GOV_API_KEY and DATA_GOV_RESOURCE_ID env vars)
  const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
  const RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID;

  if (DATA_GOV_API_KEY && RESOURCE_ID) {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${DATA_GOV_API_KEY}&format=json&limit=200`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch schemes from data.gov.in: ${res.status}`);
      const data = await res.json();
      if (data.records && data.records.length) {
        return data.records.map((item, idx) => ({
          title: item.scheme_name || item.title || `Scheme ${idx+1}`,
          description: item.description || item.objective || '',
          eligibility: item.eligibility || item.eligibility_criteria || '',
          benefits: item.benefits || '',
        }));
      }
    } catch (e) {
      console.error('Error fetching schemes from data.gov.in:', e.message || e);
    }
  }

  // Fallback: return a curated static list so the app has content
  console.warn('Data.gov not configured or returned no data — attempting Gemini fallback then static fallback.');
  // If Gemini is available, ask it to generate several government schemes with fields
  if (genai) {
    try {
      const prompt = `Generate 5 government schemes relevant for rural women farmers in India. For each scheme return a JSON object with keys: title, description (short), eligibility, benefits. Return a JSON array only.`;
      const resp = await genai.models.generateContent({
        model: 'gemini-1.5',
        contents: prompt,
        config: { temperature: 0.2 }
      });
      const text = resp.text;
      // Try to parse JSON from response
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map((item, idx) => ({
          title: item.title || `Scheme ${idx+1}`,
          description: item.description || item.objective || '',
          eligibility: item.eligibility || '',
          benefits: item.benefits || '',
        }));
      }
    } catch (e) {
      console.warn('Gemini fallback for schemes failed:', e.message || e);
    }
  }

  return [
    {
      title: 'प्रधानमंत्री किसान सम्‍मान निधि (PM-KISAN)',
      description: 'सभी छोटे और सीमांत किसानों को आर्थिक सहायता प्रदान करने के लिए एक समर्पित योजना।',
      eligibility: 'पंजीकृत किसान जो भूमि के स्वामी हैं।',
      benefits: '₹6000 प्रति वर्ष सीधे बैंक खाते में।',
    },
    {
      title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      description: 'फसलों के नुकसान से किसानों को सुरक्षा प्रदान करने के लिए बीमा योजना।',
      eligibility: 'पंजीकृत किसान और उनकी योग्य फसलें।',
      benefits: 'प्राकृतिक आपदा के समय मुआवजा।',
    },
    {
      title: 'राष्ट्रीय कृषि बाजार (e-NAM)',
      description: 'किसानों को राष्ट्रीय स्तर पर बाजार उपलब्ध कराने का प्लेटफॉर्म।',
      eligibility: 'किसान बेचने के लिए पंजीकरण कर सकते हैं।',
      benefits: 'व्यापक बाजार, बेहतर मूल्य।',
    },
  ];
}

async function updateFirestoreSchemes(schemes) {
  const batch = db.batch();
  const schemesRef = db.collection('schemes');
  // Delete old
  const snapshot = await schemesRef.get();
  snapshot.forEach(doc => batch.delete(doc.ref));
  // Add new
  schemes.forEach(scheme => {
    const docRef = schemesRef.doc();
    batch.set(docRef, scheme);
  });
  await batch.commit();
  console.log('Firestore schemes updated:', schemes.length);
}

(async () => {
  const schemes = await fetchSchemesFromAPI();
  if (schemes.length) {
    await updateFirestoreSchemes(schemes);
  } else {
    console.log('No schemes fetched.');
  }
  process.exit(0);
})();

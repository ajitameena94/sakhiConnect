// Script to fetch important contacts and update Firestore
// Usage: node fetchContacts.js


import admin from 'firebase-admin';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync(new URL('../firebase/serviceAccountKey.json', import.meta.url)));
// Optional Gemini for generating contacts if no public API available
let genai = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.warn('Could not load @google/genai. Gemini fallback will be disabled for contacts.', e.message || e);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function fetchContactsFromAPI() {
  // Try a public contacts list if available (placeholder). Otherwise return curated contacts
  console.warn('Public contacts API not configured — attempting Gemini fallback then static fallback.');
  if (genai) {
    try {
      const prompt = `Generate a list of 6 important local contacts for rural women farmers in India. For each contact return a JSON object with keys: name, role, phone (use plausible phone numbers). Return a JSON array only.`;
      const resp = await genai.models.generateContent({ model: 'gemini-1.5', contents: prompt, config: { temperature: 0.2 } });
      const parsed = JSON.parse(resp.text);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {
      console.warn('Gemini fallback for contacts failed:', e.message || e);
    }
  }

  return [
    { name: 'कृषि विभाग कार्यालय - जिला मुख्यालय', role: 'कृषि सलाहकार', phone: '+91-12345-67890' },
    { name: 'कृषि विज्ञान केंद्र (KVK)', role: 'टेक्निकल ऑफिसर', phone: '+91-98765-43210' },
    { name: 'स्थानीय सहकारी बैंक', role: 'बैंकर', phone: '+91-80000-11111' },
  ];
}

async function updateFirestoreContacts(contacts) {
  const batch = db.batch();
  const contactsRef = db.collection('contacts');
  // Delete old
  const snapshot = await contactsRef.get();
  snapshot.forEach(doc => batch.delete(doc.ref));
  // Add new
  contacts.forEach(contact => {
    const docRef = contactsRef.doc();
    batch.set(docRef, contact);
  });
  await batch.commit();
  console.log('Firestore contacts updated:', contacts.length);
}

(async () => {
  const contacts = await fetchContactsFromAPI();
  if (contacts.length) {
    await updateFirestoreContacts(contacts);
  } else {
    console.log('No contacts fetched.');
  }
  process.exit(0);
})();

import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync(new URL('../firebase/serviceAccountKey.json', import.meta.url)));

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Sample crop data (we'll replace this with API data once we have stable access)
const sampleCropData = {
  prices: [
    {
      crop: 'गेहूं',
      averagePrice: 2250 + Math.floor(Math.random() * 100),
      minPrice: 2150,
      maxPrice: 2350,
      markets: [
        {
          market: 'श्री गंगानगर मंडी',
          modalPrice: 2250,
          minPrice: 2150,
          maxPrice: 2350,
          unit: 'क्विंटल'
        }
      ],
      date: new Date().toISOString().split('T')[0]
    },
    {
      crop: 'चावल',
      averagePrice: 3100 + Math.floor(Math.random() * 100),
      minPrice: 2900,
      maxPrice: 3300,
      markets: [
        {
          market: 'अलवर मंडी',
          modalPrice: 3100,
          minPrice: 2900,
          maxPrice: 3300,
          unit: 'क्विंटल'
        }
      ],
      date: new Date().toISOString().split('T')[0]
    },
    {
      crop: 'मक्का',
      averagePrice: 1850 + Math.floor(Math.random() * 100),
      minPrice: 1750,
      maxPrice: 1950,
      markets: [
        {
          market: 'कोटा मंडी',
          modalPrice: 1850,
          minPrice: 1750,
          maxPrice: 1950,
          unit: 'क्विंटल'
        }
      ],
      date: new Date().toISOString().split('T')[0]
    },
    {
      crop: 'सरसों',
      averagePrice: 4500 + Math.floor(Math.random() * 200),
      minPrice: 4300,
      maxPrice: 4700,
      markets: [
        {
          market: 'भरतपुर मंडी',
          modalPrice: 4500,
          minPrice: 4300,
          maxPrice: 4700,
          unit: 'क्विंटल'
        }
      ],
      date: new Date().toISOString().split('T')[0]
    }
  ]
};

async function fetchCropPrices() {
  try {
    // Add timestamp to the data
    const priceData = {
      ...sampleCropData,
      lastUpdated: admin.firestore.Timestamp.now()
    };
    
    // Update Firestore
    // Update Firestore
    await db.collection('cropPrices').doc('current').set(priceData);
    console.log(`Crop prices updated for ${priceData.prices.length} crops`);
    return priceData;

  } catch (error) {
    console.error('Error fetching crop prices:', error);
    return null;
  }
}

// Run the update
fetchCropPrices().then(() => process.exit());
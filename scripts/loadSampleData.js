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

// Sample weather data
const sampleWeather = {
  location: 'जयपुर, राजस्थान',
  forecast: [
    {
      date: new Date().toISOString().split('T')[0],
      maxTemp: 32.5,
      minTemp: 24.8,
      description: 'आंशिक बादल',
      icon: '02d',
      humidity: 65,
      windSpeed: 3.2
    },
    // Add more days as needed
  ],
  lastUpdated: admin.firestore.Timestamp.now()
};

// Sample crop prices
const sampleCropPrices = {
  prices: [
    {
      crop: 'गेहूं',
      averagePrice: 2250,
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
      averagePrice: 3100,
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
      averagePrice: 1850,
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
    }
  ],
  lastUpdated: admin.firestore.Timestamp.now()
};

async function loadSampleData() {
  try {
    // Upload weather data
    await db.collection('weather').doc('current').set(sampleWeather);
    console.log('Sample weather data loaded');

    // Upload crop prices
    await db.collection('cropPrices').doc('current').set(sampleCropPrices);
    console.log('Sample crop prices loaded');

  } catch (error) {
    console.error('Error loading sample data:', error);
  }
}

// Run the update
loadSampleData().then(() => process.exit());
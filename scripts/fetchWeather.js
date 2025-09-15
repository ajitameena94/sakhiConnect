import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync(new URL('../firebase/serviceAccountKey.json', import.meta.url)));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Location coordinates for Jaipur, Rajasthan
const LAT = '26.9124';
const LON = '75.7873';

// Weather code mappings
const weatherCodes = {
  0: { description: 'साफ आसमान', icon: '01d' },
  1: { description: 'साफ', icon: '01d' },
  2: { description: 'आंशिक बादल', icon: '02d' },
  3: { description: 'बादल', icon: '03d' },
  45: { description: 'कोहरा', icon: '50d' },
  48: { description: 'घना कोहरा', icon: '50d' },
  51: { description: 'हल्की बूंदाबांदी', icon: '09d' },
  53: { description: 'बूंदाबांदी', icon: '09d' },
  55: { description: 'तेज बूंदाबांदी', icon: '09d' },
  61: { description: 'हल्की बारिश', icon: '10d' },
  63: { description: 'बारिश', icon: '10d' },
  65: { description: 'भारी बारिश', icon: '10d' },
  71: { description: 'हल्की बर्फबारी', icon: '13d' },
  73: { description: 'बर्फबारी', icon: '13d' },
  75: { description: 'भारी बर्फबारी', icon: '13d' },
  95: { description: 'तूफान', icon: '11d' }
};

const getWeather = async () => {
  try {
    // Using Open-Meteo API (free, no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,relative_humidity_2m_max&timezone=Asia/Kolkata`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!data.daily) throw new Error('Invalid API response');

    // Process forecast data
    const forecast = data.daily.time.map((date, i) => {
      const code = data.daily.weathercode[i];
      const weather = weatherCodes[code] || { description: 'सामान्य', icon: '03d' };

      return {
        date,
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        description: weather.description,
        icon: weather.icon,
        humidity: Math.round(data.daily.relative_humidity_2m_max[i]),
        windSpeed: Math.round(data.daily.windspeed_10m_max[i] * 10) / 10
      };
    });

    // Prepare data for Firestore
    const weatherData = {
      location: 'जयपुर, राजस्थान',
      forecast,
      lastUpdated: admin.firestore.Timestamp.now()
    };

    // Update Firestore
    await db.collection('weather').doc('current').set(weatherData);
    console.log(`Weather data updated for ${weatherData.location}, ${forecast.length} days forecast`);

  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// Run and exit
getWeather().then(() => process.exit());

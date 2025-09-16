import { collection, getDocs, doc, getDoc, query, orderBy, limit, addDoc, serverTimestamp, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Scheme, Article, Contact, ChatMessage, WeatherData, CropPriceData } from '../types';
import axios from 'axios';

// Generic function to fetch data from a collection
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

export const getSchemes = () => fetchCollection<Scheme>('schemes');
export const getKnowledgeArticles = () => fetchCollection<Article>('knowledge_articles');
export const getContacts = () => fetchCollection<Contact>('contacts');

export async function getDashboardData(): Promise<{ weather: string; marketPrice: string }> {
  const docRef = doc(db, 'dashboard', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as { weather: string; marketPrice: string };
  } else {
    // Return default or throw an error
    console.warn("Dashboard data not found in Firestore.");
    return { weather: '32°C, धूप', marketPrice: 'गेहूं: ₹2250/क्विं' };
  }
}

export async function getFeaturedScheme(): Promise<Scheme | null> {
    const q = query(collection(db, 'schemes'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Scheme;
    }
    return null;
}

// Chat History Functions
export async function getUserChatHistory(userId: string): Promise<ChatMessage[]> {
  const messagesRef = collection(db, 'chats', userId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          role: data.role,
          text: data.text,
      }
  });
}

export async function saveChatMessage(userId: string, message: Omit<ChatMessage, 'id'>) {
  const messagesRef = collection(db, 'chats', userId, 'messages');
  await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(),
  });
}

export async function getWeatherData(): Promise<WeatherData | null> {
  const docRef = doc(db, 'weather', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastUpdated: (data.lastUpdated as Timestamp).toDate()
    } as WeatherData;
  }
  return null;
}

export async function getCropPrices(): Promise<CropPriceData | null> {
  const docRef = doc(db, 'cropPrices', 'current');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastUpdated: (data.lastUpdated as Timestamp).toDate()
    } as CropPriceData;
  }
  return null;
}

export async function insertSampleData() {
  try {
    // Insert sample weather data
    await setDoc(doc(db, 'weather', 'current'), {
      location: 'Jaipur',
      forecast: [
        { time: '10:00 AM', maxTemp: 32, rainfall: 0, windSpeed: 5, humidity: 40 },
        { time: '11:00 AM', maxTemp: 34, rainfall: 0, windSpeed: 6, humidity: 38 },
      ],
      lastUpdated: serverTimestamp(),
    });

    // Insert sample crop prices
    await setDoc(doc(db, 'cropPrices', 'current'), {
      prices: [
        { crop: 'Wheat', averagePrice: 2250, trend: [2200, 2250, 2300] },
        { crop: 'Rice', averagePrice: 3000, trend: [2900, 2950, 3000] },
      ],
      lastUpdated: serverTimestamp(),
    });

    console.log('Sample data inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

export async function insertRealData() {
  try {
    // Fetch real weather data
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: 26.9124,
        longitude: 75.7873,
        hourly: 'temperature_2m,precipitation,wind_speed_10m,humidity_2m',
        current_weather: true,
      },
    });

    const weatherData = weatherResponse.data;
    const forecast = weatherData.hourly.time.map((time, index) => ({
      time,
      maxTemp: weatherData.hourly.temperature_2m[index],
      rainfall: weatherData.hourly.precipitation[index],
      windSpeed: weatherData.hourly.wind_speed_10m[index],
      humidity: weatherData.hourly.humidity_2m[index],
    }));

    await setDoc(doc(db, 'weather', 'current'), {
      location: 'Jaipur',
      forecast,
      lastUpdated: serverTimestamp(),
    });

    // Fetch real crop price data (example using Agmarknet API)
    const cropResponse = await axios.get('https://api.data.gov.in/resource/agmarknet', {
      params: {
        'api-key': 'YOUR_API_KEY',
        format: 'json',
        filters: JSON.stringify({ state: 'Rajasthan', district: 'Jaipur' }),
      },
    });

    const cropPrices = cropResponse.data.records.map(record => ({
      crop: record.commodity,
      averagePrice: parseFloat(record.modal_price),
      trend: [
        parseFloat(record.min_price),
        parseFloat(record.modal_price),
        parseFloat(record.max_price),
      ],
    }));

    await setDoc(doc(db, 'cropPrices', 'current'), {
      prices: cropPrices,
      lastUpdated: serverTimestamp(),
    });

    console.log('Real data inserted successfully.');
  } catch (error) {
    console.error('Error inserting real data:', error);
  }
}

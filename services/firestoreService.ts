import { collection, getDocs, doc, getDoc, query, orderBy, limit, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Scheme, Article, Contact, ChatMessage } from '../types';

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

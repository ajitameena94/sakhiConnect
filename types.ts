export enum View {
  DASHBOARD = 'DASHBOARD',
  SCHEMES = 'SCHEMES',
  CHAT = 'CHAT',
  KNOWLEDGE = 'KNOWLEDGE',
  CONTACTS = 'CONTACTS',
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export interface NavItem {
    id: View;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface WeatherForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
}

export interface WeatherData {
    location: string;
    forecast: WeatherForecast[];
    lastUpdated: Date;
}

export interface MarketData {
    market: string;
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    unit: string;
}

export interface CropPrice {
    crop: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    markets: MarketData[];
    date: string;
}

export interface CropPriceData {
    prices: CropPrice[];
    lastUpdated: Date;
}

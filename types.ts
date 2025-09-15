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

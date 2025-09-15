import { NavItem } from './types';
import { View } from './types';
import HomeIcon from './components/icons/HomeIcon';
import SchemeIcon from './components/icons/SchemeIcon';
import ChatIcon from './components/icons/ChatIcon';
import KnowledgeIcon from './components/icons/KnowledgeIcon';
import ContactIcon from './components/icons/ContactIcon';

export const NAV_ITEMS: NavItem[] = [
    { id: View.DASHBOARD, label: "होम", icon: HomeIcon },
    { id: View.SCHEMES, label: "योजनाएं", icon: SchemeIcon },
    { id: View.CHAT, label: "सखी", icon: ChatIcon },
    { id: View.KNOWLEDGE, label: "ज्ञान केंद्र", icon: KnowledgeIcon },
    { id: View.CONTACTS, label: "संपर्क", icon: ContactIcon },
];

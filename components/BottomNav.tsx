
import React from 'react';
import { View, NavItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavProps {
  navItems: NavItem[];
  currentView: View;
  setCurrentView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ navItems, currentView, setCurrentView }) => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/70 backdrop-blur-lg border-t border-gray-200/80 shadow-t-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 w-full text-sm transition-colors duration-200 ${
                isActive ? 'text-green-700' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{t(item.label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
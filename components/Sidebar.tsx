import React from 'react';
import { View, NavItem } from '../types';
import Logo from './Logo';
import CloseIcon from './icons/CloseIcon';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navItems: NavItem[];
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, navItems, currentView, setCurrentView }) => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  
  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Logo className="h-8" />
        <button onClick={() => setIsOpen(false)} className="p-2 text-gray-600 hover:text-gray-900" aria-label="Close menu">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 flex flex-col justify-between" style={{height: 'calc(100% - 65px)'}}>
        <ul>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center w-full text-left p-3 my-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-800 font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  <span>{t(item.label)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left p-3 my-1 rounded-lg text-red-700 hover:bg-red-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{t('लॉग आउट')}</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
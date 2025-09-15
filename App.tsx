import React, { useState } from 'react';
import { View } from './types';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import SchemesList from './components/SchemesList';
import KnowledgeCenter from './components/KnowledgeCenter';
import ContactsList from './components/ContactsList';
import ChatAssistant from './components/ChatAssistant';
import { NAV_ITEMS } from './constants';
import Sidebar from './components/Sidebar';
import MenuIcon from './components/icons/MenuIcon';
import Logo from './components/Logo';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Spinner from './components/Spinner';
import TranslateButton from './components/TranslateButton';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-amber-50 to-stone-100">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.SCHEMES:
        return <SchemesList />;
      case View.CHAT:
        return <ChatAssistant user={user} />;
      case View.KNOWLEDGE:
        return <KnowledgeCenter />;
      case View.CONTACTS:
        return <ContactsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-green-50 via-amber-50 to-stone-100">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        navItems={NAV_ITEMS}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          aria-hidden="true"
        />
      )}
      <div className="max-w-md mx-auto h-screen flex flex-col">
        <header className="p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-green-800 p-2 -ml-2" 
            aria-label="Open menu"
          >
            <MenuIcon className="h-7 w-7" />
          </button>
          <div className="flex-grow flex justify-center items-center">
            <Logo className="h-9" />
          </div>
          <TranslateButton />
        </header>
        
        <main className="flex-grow overflow-y-auto px-4 pb-24">
          {renderView()}
        </main>

        <BottomNav 
          navItems={NAV_ITEMS}
          currentView={currentView}
          setCurrentView={setCurrentView} 
        />
      </div>
    </div>
  );
};

export default App;
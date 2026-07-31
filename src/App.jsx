import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Replenishment from './views/Replenishment';
import DataImport from './views/DataImport';
import Assistant from './views/Assistant';
import Login from './views/Login';
import Welcome from './views/Welcome';
import Settings from './views/Settings';
import { DataProvider } from './contexts/DataContext';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authState, setAuthState] = useState(() => {
    return localStorage.getItem('smart_auth') || 'login'; // 'login', 'welcome', 'authenticated'
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smart_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('smart_auth', authState);
  }, [authState]);

  useEffect(() => {
    localStorage.setItem('smart_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = () => {
    setAuthState('welcome');
  };

  const handleStart = () => {
    setAuthState('authenticated');
  };

  if (authState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (authState === 'welcome') {
    return <Welcome onStart={handleStart} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'replenishment':
        return <Replenishment />;
      case 'import':
        return <DataImport />;
      case 'assistant':
        return <Assistant />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DataProvider>
      <div className="app-container animate-fade-in" data-theme={theme}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setAuthState('login')} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </DataProvider>
  );
}

export default App;

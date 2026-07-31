import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Replenishment from './views/Replenishment';
import DataImport from './views/DataImport';
import Assistant from './views/Assistant';
import { DataProvider } from './contexts/DataContext';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DataProvider>
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </DataProvider>
  );
}

export default App;

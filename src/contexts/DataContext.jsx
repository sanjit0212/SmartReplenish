import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [gridData, setGridData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [replenishments, setReplenishments] = useState([]);
  const [kpis, setKpis] = useState(null);
  
  // AI Assistant History State
  const [chatHistory, setChatHistory] = useState([
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed your dataset. How can I help you?" }] }
  ]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed your dataset. How can I help you?",
    }
  ]);

  useEffect(() => {
    // Fetch default data from public/static files if they exist or just fetch the root paths
    Promise.all([
      fetch('/product_grid.csv').then(res => res.text()),
      fetch('/weekly_sellout.csv').then(res => res.text())
    ]).then(([gridText, salesText]) => {
      fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridCsv: gridText, selloutCsv: salesText })
      }).then(res => res.json())
      .then(data => {
        setGridData(data.gridData || []);
        setSalesData(data.salesData || []);
        setReplenishments(data.replenishments || []);
        setKpis(data.kpis || null);
      }).catch(err => console.error('Failed to process default datasets on backend:', err));
    }).catch(err => console.error('Failed to load default datasets:', err));
  }, []);

  return (
    <DataContext.Provider value={{ 
      gridData, 
      setGridData, 
      salesData, 
      setSalesData,
      replenishments,
      setReplenishments,
      kpis,
      setKpis,
      chatHistory,
      setChatHistory,
      chatMessages,
      setChatMessages
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

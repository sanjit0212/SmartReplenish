import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import './Assistant.css';

const Assistant = () => {
  const { kpis, replenishments } = useData();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed your dataset. How can I help you?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [chatHistory, setChatHistory] = useState([
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed your dataset. How can I help you?" }] }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const newHistory = [...chatHistory, { role: "user", parts: [{ text: userText }] }];
    setChatHistory(newHistory);

    try {
      const dynamicPrompt = `You are the AI Assistant for the "SmartReplenish" platform, an automated AI system dedicated to replenishment management.
      
      Current Dataset Knowledge:
      - Total Weekly Sales: €${kpis?.totalSales || 0}
      - Active Stores: ${kpis?.activeStores || 0}
      - Replenishment Alerts: ${kpis?.alertsCount || 0}
      - Top Products: ${JSON.stringify(kpis?.topProducts || [])}
      - Total SKUs tracked: ${replenishments?.length || 0}
      
      Rules for your responses:
      1. Be helpful, professional, and act as an expert in retail replenishment.
      2. Use the live data provided above to answer specific questions. 
      3. Keep answers concise but informative (max 3-4 sentences).`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory, // Send previous history without the current message
          systemInstruction: dynamicPrompt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with AI');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.text
      }]);
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: data.text }] }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I encountered an error communicating with the API. Please ensure the GEMINI_API_KEY environment variable is configured in Vercel."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <div className="assistant-view animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>AI <span className="text-gradient">Assistant</span></h1>
          <p className="text-muted">Predictive suggestions and conversational interface (Milestone 4).</p>
        </div>
      </div>

      <div className="assistant-layout">
        <Card className="chat-card">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                  <div className="message-avatar">
                    {msg.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message-wrapper bot typing">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask about product performance, seasonality, or predictions..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="chat-input"
              />
              <button type="submit" className="chat-submit-btn" disabled={!inputValue.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </Card>

        <div className="suggestions-panel">
          <Card title={<><Sparkles size={18} className="text-accent" /> Suggested Queries</>}>
            <div className="suggestion-chips">
              <button className="suggestion-chip" onClick={() => handleSuggestionClick("How are the collectible cards doing this week?")}>
                "How are the collectible cards doing this week?"
              </button>
              <button className="suggestion-chip" onClick={() => handleSuggestionClick("Which products should I remove from Chain B?")}>
                "Which products should I remove from Chain B?"
              </button>
              <button className="suggestion-chip" onClick={() => handleSuggestionClick("Show me the top selling products.")}>
                "Show me the top selling products."
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assistant;

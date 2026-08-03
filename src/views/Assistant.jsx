import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import './Assistant.css';

const Assistant = () => {
  const { 
    kpis, 
    replenishments,
    chatHistory, 
    setChatHistory,
    chatMessages: messages,
    setChatMessages: setMessages
  } = useData();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
      
      Here is the detailed replenishments data (items requiring action or transfers):
      ${JSON.stringify(replenishments || [])}
      
      
      Rules for your responses:
      1. You are a versatile AI. You must answer ANY question the user asks, whether it is about retail replenishment, the provided dataset, or general knowledge (e.g. math, history, coding).
      2. If the user asks about the dataset, use the live data provided above.
      3. Format your answers CLEANLY. Use markdown bullet points, bolding for emphasis, and proper line breaks. DO NOT return a single block of text.
      4. Keep answers concise but highly informative.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          systemInstruction: dynamicPrompt
        })
      });
      
      const data = await response.json();

      if (!response.ok) {
        // Prioritize data.details to get the actual error message from the Gemini API
        const errorMessage = data.details || data.error || 'Unknown error occurred';
        throw new Error(errorMessage);
      }
      
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
        text: `Error: ${error.message}\n\n*If this says "API Key not valid", please double-check your GEMINI_API_KEY environment variable in Vercel.*`
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
                  <div className="message-bubble markdown-body">
                    {msg.sender === 'bot' ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <p>{msg.text}</p>
                    )}
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

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Settings } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Card from '../components/Card';
import Button from '../components/Button';
import ApiKeyModal from '../components/ApiKeyModal';
import './Assistant.css';

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed this week's data. How can I help you?",
  }
];

const systemPrompt = `You are the AI Assistant for the "SmartReplenish" platform, an automated AI system dedicated to replenishment management, sales performance analysis, and multi-chain management. 
You replace manual Excel processes. 
The system manages weekly orders, chain profiling, performance analysis across 29 grids and 200+ points of sale.
Features implemented:
- Milestone 1: Replenishment engine (sales velocity, min orders), Dashboard (sell-through, rankings).
- Milestone 2: Multi-chain parsers.
- Milestone 3: Inter-store transfers, Budget control, Period comparison.
- Milestone 4: Predictive suggestions, automatic seasonality, conversational AI.

Current Mock Data Knowledge:
- Total Weekly Sales: €124,500
- Active Stores: 203
- Replenishment Alerts: 14
- 'Pokémon Elite Trainer Box' (Chain A, Milano Centro): Hot product, +45% velocity, suggested reorder 12 units, increase cluster.
- 'Lego Star Wars Set' (Chain B, Roma Est): Hot, +32% velocity, reorder 8.
- 'Hot Wheels 50-Pack' (Chain A, Torino Nord): Slow, -12% velocity, suggested transfer because stock is 45 and min order is 5.
- 'Barbie Dreamhouse' (Chain C, Napoli Sud): Slow, -8% velocity.
- Category Sell-Through: Toys (85%), Cards (65%), Plush (45%), Games (90%).
- Seasonality: It's October, so Q4 'Holiday Seasonality' rules are applied to Toys (min orders raised 20%).

Rules for your responses:
1. Be helpful, professional, and act as an expert in retail replenishment.
2. Use the mock data provided above to answer specific questions. 
3. If asked a generic question, invent reasonable, realistic data that fits the context of toy/game retail.
4. Keep answers concise but informative (max 3-4 sentences unless explaining a complex process).`;

const Assistant = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const messagesEndRef = useRef(null);
  
  // Track chat history for Gemini
  const [chatSession, setChatSession] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize Gemini when API key is available
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemPrompt
        });
        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Hello" }],
            },
            {
              role: "model",
              parts: [{ text: "Hello! I'm your SmartReplenish AI Assistant. I have analyzed this week's data. How can I help you?" }],
            },
          ],
        });
        setChatSession(chat);
      } catch (error) {
        console.error("Error initializing Gemini API:", error);
      }
    } else {
      setChatSession(null);
    }
  }, [apiKey]);

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

    if (!apiKey || !chatSession) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I cannot connect to my intelligence core. Please click the Settings gear icon to provide a Gemini API Key to enable dynamic responses."
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const result = await chatSession.sendMessage(userText);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: text
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I encountered an error communicating with the API. Please check your API key and try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    // Auto-send suggestion if we wanted, but let user click send
  };

  return (
    <div className="assistant-view animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>AI <span className="text-gradient">Assistant</span></h1>
          <p className="text-muted">Predictive suggestions and conversational interface (Milestone 4).</p>
        </div>
        <Button variant="outline" icon={Settings} onClick={() => setIsModalOpen(true)}>
          Configure AI
        </Button>
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
              <button className="suggestion-chip" onClick={() => handleSuggestionClick("Have you applied Q4 seasonality rules?")}>
                "Have you applied Q4 seasonality rules?"
              </button>
              <button className="suggestion-chip" onClick={() => handleSuggestionClick("Which products should I remove from Chain B?")}>
                "Which products should I remove from Chain B?"
              </button>
            </div>
          </Card>
        </div>
      </div>

      <ApiKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(key) => setApiKey(key)} 
      />
    </div>
  );
};

export default Assistant;

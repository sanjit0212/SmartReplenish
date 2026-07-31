import React, { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';
import Button from './Button';
import './ApiKeyModal.css';

const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in">
        <div className="modal-header">
          <div className="modal-title">
            <Key size={20} className="text-accent" />
            <h3>Configure AI Provider</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="text-muted mb-2">
            To enable intelligent, dynamic responses, please provide a Google Gemini API Key. This key is stored locally in your browser and is never sent to our servers.
          </p>
          <div className="input-group">
            <label className="input-label">Gemini API Key</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="AIzaSy..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="help-text">
            Don't have a key? Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
          </p>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <span style={{ margin: '0 4px' }}></span>
          <Button variant="primary" onClick={handleSave}>Save Key</Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;

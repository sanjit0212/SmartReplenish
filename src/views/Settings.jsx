import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Save, Bell, Shield, Database, Moon } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoReplenish: false,
    alertThreshold: 20
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch mock settings
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>System <span className="text-gradient">Settings</span></h1>
          <p className="text-muted">Manage your preferences and automation rules.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        <Card title={<><Shield size={18} className="text-accent" /> Preferences</>}>
          <form onSubmit={handleSave}>
            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>
                  <Moon size={18} className="text-muted" /> Dark Mode
                </label>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Enable premium dark theme</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.theme === 'dark'}
                onChange={(e) => setSettings({...settings, theme: e.target.checked ? 'dark' : 'light'})}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>
                  <Bell size={18} className="text-muted" /> Push Notifications
                </label>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Receive alerts when stock is critically low</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>
                  <Database size={18} className="text-muted" /> Auto-Replenish System
                </label>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Allow AI to automatically place mock orders</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.autoReplenish}
                onChange={(e) => setSettings({...settings, autoReplenish: e.target.checked})}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)' }}
              />
            </div>
            
            <div className="input-group" style={{ padding: '1rem 0' }}>
              <label className="input-label" style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                Global Alert Threshold (%)
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={settings.alertThreshold}
                onChange={(e) => setSettings({...settings, alertThreshold: parseInt(e.target.value) || 0})}
              />
              <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Trigger alerts when stock falls below this percentage of MinOrder.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
              {message && <span className={message.includes('Error') ? 'text-danger' : 'text-success'}>{message}</span>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

import React from 'react';
import { Play, Sparkles, BarChart2, Database } from 'lucide-react';

const Welcome = ({ onStart }) => {
  return (
    <div className="auth-layout animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to SmartReplenish</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Your AI-powered retail analytics and replenishment engine. Upload any sales dataset and let our system automatically identify trends, generate KPIs, and optimize your inventory.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}><Database size={32} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Universal Data</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Upload Excel or CSV files. The AI maps columns automatically.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--info)', marginBottom: '1rem' }}><BarChart2 size={32} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>Smart Analytics</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Instantly generate interactive KPI dashboards.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}><Sparkles size={32} /></div>
            <h3 style={{ marginBottom: '0.5rem' }}>AI Assistant</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Ask Gemini any question about your data or retail strategy.</p>
          </div>
        </div>

        <button onClick={onStart} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
          Launch Dashboard <Play size={20} />
        </button>
      </div>
    </div>
  );
};

export default Welcome;

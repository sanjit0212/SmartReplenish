import React, { useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '../components/Card';
import Button from '../components/Button';
import { useData } from '../contexts/DataContext';
import './DataImport.css';

const DataImport = () => {
  const { setGridData, setSalesData, setReplenishments, setKpis } = useData();
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, complete
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploadStatus('uploading');
    setErrorMsg(null);

    setTimeout(async () => {
      setUploadStatus('processing');
      
      let gridJson = null;
      let selloutJson = null;
      let genericJson = null;

      try {
        const readPromises = files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                
                const name = file.name.toLowerCase();
                if (files.length === 1) {
                  genericJson = jsonData;
                } else if (name.includes('grid')) {
                  gridJson = jsonData;
                } else if (name.includes('sellout') || name.includes('sale')) {
                  selloutJson = jsonData;
                } else {
                  genericJson = jsonData;
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsArrayBuffer(file);
          });
        });

        await Promise.all(readPromises);
        
        const payload = {
          gridJson,
          selloutJson,
          genericJson
        };

        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const data = await res.json();
        
        setGridData(data.gridData || []);
        setSalesData(data.salesData || []);
        setReplenishments(data.replenishments || []);
        setKpis(data.kpis || null);
        
        setTimeout(() => {
          setUploadStatus('complete');
        }, 1000);
      } catch (err) {
        console.error(err);
        setErrorMsg('Error parsing files.');
        setUploadStatus('idle');
      }
    }, 800);
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload').click();
  };

  const renderUploadState = () => {
    switch (uploadStatus) {
      case 'idle':
        return (
          <div className="upload-dropzone" onClick={triggerFileInput}>
            <input 
              type="file" 
              id="file-upload" 
              multiple 
              accept=".csv, .xlsx, .xls" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <div className="upload-icon-wrapper">
              <UploadCloud size={48} className="text-accent" />
            </div>
            <h3>Drag & Drop Data Files</h3>
            <p className="text-muted mb-2">Upload any generic sales dataset (Excel or CSV). The AI will map columns automatically.</p>
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', textAlign: 'left', border: '1px solid rgba(99,102,241,0.2)' }}>
              <strong style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}>Advanced Replenishment Requirements:</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                To unlock AI Replenishment Alerts, your files must contain these exact column names:
                <br/>• <code style={{ color: 'var(--text-primary)' }}>ProductID</code>, <code style={{ color: 'var(--text-primary)' }}>QuantitySold</code>, <code style={{ color: 'var(--text-primary)' }}>CurrentStock</code>, <code style={{ color: 'var(--text-primary)' }}>MinOrder</code>
              </p>
            </div>
            {errorMsg && <p className="text-rose mt-4 text-sm">{errorMsg}</p>}
          </div>
        );
      case 'uploading':
        return (
          <div className="upload-dropzone active">
            <Loader size={48} className="text-accent spin" />
            <h3>Uploading Files...</h3>
            <div className="progress-bar-container">
              <div className="progress-bar animate-progress-1"></div>
            </div>
            <p className="text-muted">Reading data locally...</p>
          </div>
        );
      case 'processing':
        return (
          <div className="upload-dropzone active processing">
            <div className="processing-steps">
              <div className="step completed"><CheckCircle size={18} /> <span>Parsing file formats</span></div>
              <div className="step active"><Loader size={18} className="spin" /> <span>Applying Replenishment Rules</span></div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar animate-progress-2"></div>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="upload-dropzone success">
            <div className="success-icon">
              <CheckCircle size={64} className="text-emerald" />
            </div>
            <h3>Import Successful</h3>
            <p className="text-muted">Global dashboard and engine updated with new data.</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => setUploadStatus('idle')}>Upload More</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="import-view animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>Weekly <span className="text-gradient">Data Import</span></h1>
          <p className="text-muted">Client-side parsing of store formats without external database limits.</p>
        </div>
      </div>

      <div className="import-grid">
        <Card className="upload-card">
          {renderUploadState()}
        </Card>

        <div className="status-cards">
          <Card title="Active Parsers">
            <ul className="parser-list">
              <li>
                <div className="parser-info">
                  <FileSpreadsheet size={20} className="text-accent" />
                  <span>CSV Universal Parser</span>
                </div>
                <span className="badge badge-success">Active</span>
              </li>
            </ul>
          </Card>

          <Card title="Recent Imports">
            <div className="recent-imports">
              <div className="import-item">
                <div className="import-meta">
                  <span className="import-date">Today, Just now</span>
                  <span className="import-files">System Default Data</span>
                </div>
                <span className="text-emerald font-medium">Loaded</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataImport;

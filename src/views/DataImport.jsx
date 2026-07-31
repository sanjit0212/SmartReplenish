import React, { useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Papa from 'papaparse';
import Card from '../components/Card';
import Button from '../components/Button';
import { useData } from '../contexts/DataContext';
import './DataImport.css';

const DataImport = () => {
  const { setGridData, setSalesData } = useData();
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, complete
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploadStatus('uploading');
    setErrorMsg(null);

    // Simulate network delay for UX
    setTimeout(() => {
      setUploadStatus('processing');
      
      let grid = null;
      let sales = null;

      const parsePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (file.name.toLowerCase().includes('grid')) {
                grid = results.data;
              } else if (file.name.toLowerCase().includes('sellout') || file.name.toLowerCase().includes('sale')) {
                sales = results.data;
              }
              resolve();
            },
            error: (error) => {
              reject(error);
            }
          });
        });
      });

      Promise.all(parsePromises).then(() => {
        if (grid) setGridData(grid);
        if (sales) setSalesData(sales);
        
        if (!grid && !sales) {
          setErrorMsg('Could not recognize file types. Please name files with "grid" or "sellout".');
          setUploadStatus('idle');
          return;
        }

        setTimeout(() => {
          setUploadStatus('complete');
        }, 1000);
      }).catch(err => {
        console.error(err);
        setErrorMsg('Error parsing files.');
        setUploadStatus('idle');
      });

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
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <div className="upload-icon-wrapper">
              <UploadCloud size={48} className="text-accent" />
            </div>
            <h3>Drag & Drop Data Files</h3>
            <p className="text-muted mb-2">Select product_grid.csv and weekly_sellout.csv</p>
            <span className="file-formats">Supports CSV formats</span>
            {errorMsg && <p className="text-rose mt-2 text-sm">{errorMsg}</p>}
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

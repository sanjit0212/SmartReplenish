import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './DataImport.css';

const DataImport = () => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, complete

  const handleUploadClick = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('processing');
      setTimeout(() => {
        setUploadStatus('complete');
      }, 2000);
    }, 1500);
  };

  const renderUploadState = () => {
    switch (uploadStatus) {
      case 'idle':
        return (
          <div className="upload-dropzone" onClick={handleUploadClick}>
            <div className="upload-icon-wrapper">
              <UploadCloud size={48} className="text-accent" />
            </div>
            <h3>Drag & Drop Sellout Data</h3>
            <p className="text-muted mb-2">or click to browse files from your computer</p>
            <span className="file-formats">Supports CSV, Excel from all 3 Chains</span>
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
            <p className="text-muted">Transferring data securely...</p>
          </div>
        );
      case 'processing':
        return (
          <div className="upload-dropzone active processing">
            <div className="processing-steps">
              <div className="step completed"><CheckCircle size={18} /> <span>Parsing Chain A Format</span></div>
              <div className="step completed"><CheckCircle size={18} /> <span>Parsing Chain B Format</span></div>
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
            <p className="text-muted">All grids updated. 14 new alerts generated.</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => setUploadStatus('idle')}>Upload More</Button>
              <span style={{ margin: '0 8px' }}></span>
              <Button variant="primary">View Replenishment</Button>
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
          <p className="text-muted">Automated parsing of multiple chain formats without manual formatting.</p>
        </div>
      </div>

      <div className="import-grid">
        <Card className="upload-card">
          {renderUploadState()}
        </Card>

        <div className="status-cards">
          <Card title="Active Parsers (Milestone 2)">
            <ul className="parser-list">
              <li>
                <div className="parser-info">
                  <FileSpreadsheet size={20} className="text-accent" />
                  <span>Chain A (Primary)</span>
                </div>
                <span className="badge badge-success">Active</span>
              </li>
              <li>
                <div className="parser-info">
                  <FileSpreadsheet size={20} className="text-accent" />
                  <span>Chain B</span>
                </div>
                <span className="badge badge-success">Active</span>
              </li>
              <li>
                <div className="parser-info">
                  <FileSpreadsheet size={20} className="text-accent" />
                  <span>Chain C</span>
                </div>
                <span className="badge badge-success">Active</span>
              </li>
            </ul>
          </Card>

          <Card title="Recent Imports">
            <div className="recent-imports">
              <div className="import-item">
                <div className="import-meta">
                  <span className="import-date">Today, 09:41 AM</span>
                  <span className="import-files">3 files processed</span>
                </div>
                <span className="text-emerald font-medium">Success</span>
              </div>
              <div className="import-item">
                <div className="import-meta">
                  <span className="import-date">Last Week, 10:15 AM</span>
                  <span className="import-files">3 files processed</span>
                </div>
                <span className="text-emerald font-medium">Success</span>
              </div>
              <div className="import-item failed">
                <div className="import-meta">
                  <span className="import-date">Oct 12, 11:20 AM</span>
                  <span className="import-files">Chain B format error</span>
                </div>
                <span className="text-rose font-medium"><AlertCircle size={14} className="inline-icon"/> Failed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataImport;

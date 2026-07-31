import React, { useState, useMemo } from 'react';
import { Package, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Check } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useData } from '../contexts/DataContext';
import './Replenishment.css';

const Replenishment = () => {
  const { replenishments } = useData();
  const [filter, setFilter] = useState('All');

  const filteredData = useMemo(() => {
    if (!replenishments) return [];
    if (filter === 'All') return replenishments;
    if (filter === 'Alerts') return replenishments.filter(r => r.action !== 'None');
    if (filter === 'Transfers') return replenishments.filter(r => r.action === 'Transfer');
    return replenishments;
  }, [replenishments, filter]);

  const stats = useMemo(() => {
    if (!replenishments) return { total: 0, actionNeeded: 0, hotItems: 0 };
    const total = replenishments.length;
    const actionNeeded = replenishments.filter(r => r.action !== 'None').length;
    const hotItems = replenishments.filter(r => r.velocity === 'High').length;
    return { total, actionNeeded, hotItems };
  }, [replenishments]);

  return (
    <div className="replenishment-view animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>Replenishment <span className="text-gradient">Engine</span></h1>
          <p className="text-muted">Smart algorithms driving inventory distribution.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button variant="primary" icon={Check}>Execute All Actions</Button>
        </div>
      </div>

      <div className="stats-row mb-4">
        <Card className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="stat-label">Total SKUs Tracked</span>
          <span className="stat-value">{stats.total}</span>
        </Card>
        <Card className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <span className="stat-label">Action Required</span>
          <span className="stat-value text-rose">{stats.actionNeeded}</span>
        </Card>
        <Card className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <span className="stat-label">Hot Velocity Items</span>
          <span className="stat-value text-emerald">{stats.hotItems}</span>
        </Card>
      </div>

      <Card className="table-wrapper">
        <div className="table-controls mb-2">
          <div className="filter-tabs">
            {['All', 'Alerts', 'Transfers'].map(t => (
              <button 
                key={t}
                className={`tab-btn ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Name</th>
                <th>Store</th>
                <th>Stock</th>
                <th>Velocity</th>
                <th>Recommended Action</th>
                <th>Cluster Change</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!filteredData || filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No data available.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={`${row.id}-${row.store}`}>
                    <td className="text-muted font-mono">{row.id}</td>
                    <td className="font-medium">{row.name}</td>
                    <td><span className="badge badge-neutral">{row.store}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-muted" />
                        <span className={row.stock <= row.minOrder ? 'text-rose font-bold' : ''}>
                          {row.stock}
                        </span>
                      </div>
                    </td>
                    <td>
                      {row.velocity === 'High' ? (
                        <span className="flex items-center gap-1 text-emerald"><TrendingUp size={14}/> High</span>
                      ) : row.velocity === 'Low' ? (
                        <span className="flex items-center gap-1 text-rose"><TrendingDown size={14}/> Low</span>
                      ) : (
                        <span className="text-muted">Medium</span>
                      )}
                    </td>
                    <td>
                      {row.action === 'Reorder' ? (
                        <span className="action-pill reorder"><AlertCircle size={14} /> Reorder {row.suggested}</span>
                      ) : row.action === 'Transfer' ? (
                        <span className="action-pill transfer"><ArrowRight size={14} /> Transfer Overstock</span>
                      ) : row.action === 'Flag' ? (
                        <span className="text-rose font-medium text-sm">Flagged</span>
                      ) : (
                        <span className="text-muted text-sm">-</span>
                      )}
                    </td>
                    <td>
                      {row.clusterChange === 'Increase' ? (
                        <span className="text-emerald font-medium text-sm">↑ Upgrade Tier</span>
                      ) : row.clusterChange === 'Decrease' ? (
                        <span className="text-rose font-medium text-sm">↓ Downgrade Tier</span>
                      ) : (
                        <span className="text-muted text-sm">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      {row.action !== 'None' && <Button variant="outline">Review</Button>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Replenishment;

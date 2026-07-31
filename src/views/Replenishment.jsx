import React, { useState } from 'react';
import { Download, Filter, Search, ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import './Replenishment.css';

const replenishmentData = [
  { id: 'PRD-001', name: 'Pokémon Elite Trainer Box', chain: 'Chain A', store: 'Milano Centro', velocity: 'High', stock: 2, minOrder: 10, action: 'Reorder', suggested: 12, clusterChange: 'Increase' },
  { id: 'PRD-002', name: 'Lego Star Wars Set', chain: 'Chain B', store: 'Roma Est', velocity: 'High', stock: 1, minOrder: 5, action: 'Reorder', suggested: 8, clusterChange: 'None' },
  { id: 'PRD-003', name: 'Hot Wheels 50-Pack', chain: 'Chain A', store: 'Torino Nord', velocity: 'Low', stock: 45, minOrder: 5, action: 'Transfer', suggested: 0, clusterChange: 'Decrease' },
  { id: 'PRD-004', name: 'Barbie Dreamhouse', chain: 'Chain C', store: 'Napoli Sud', velocity: 'Low', stock: 12, minOrder: 2, action: 'Flag', suggested: 0, clusterChange: 'Decrease' },
  { id: 'PRD-005', name: 'Monopoly Classic', chain: 'Chain A', store: 'Milano Centro', velocity: 'Medium', stock: 4, minOrder: 6, action: 'Reorder', suggested: 6, clusterChange: 'None' },
];

const Replenishment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/replenishment')
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) {
          setData(d);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const renderActionBadge = (action) => {
    switch (action) {
      case 'Reorder': return <span className="badge badge-success"><TrendingUp size={12} className="mr-1"/> Reorder</span>;
      case 'Transfer': return <span className="badge badge-info"><ArrowRightLeft size={12} className="mr-1"/> Transfer</span>;
      case 'Flag': return <span className="badge badge-danger"><TrendingDown size={12} className="mr-1"/> Flagged</span>;
      default: return <span className="badge">{action}</span>;
    }
  };

  return (
    <div className="replenishment-view animate-fade-in">
      <div className="view-header mb-2">
        <div>
          <h1>Replenishment <span className="text-gradient">Engine</span></h1>
          <p className="text-muted">AI-driven reorder suggestions, inter-store transfers, and cluster optimizations.</p>
        </div>
        <Button variant="primary" icon={Download}>Export Orders (Excel)</Button>
      </div>

      <Card>
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search products, stores, or chains..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <Button variant="outline" icon={Filter}>Filters</Button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Location</th>
                <th>Velocity</th>
                <th>Stock</th>
                <th>Action</th>
                <th>Suggested Qty</th>
                <th>Cluster Adj.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading algorithm results...</td></tr>
              ) : data
                .filter(row => 
                  row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  row.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  row.chain.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((row) => (
                <tr key={`${row.id}-${row.store}`}>
                  <td>
                    <div className="product-info">
                      <span className="product-name">{row.name}</span>
                      <span className="product-id text-muted">{row.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="location-info">
                      <span className="store-name">{row.store}</span>
                      <span className="chain-name text-muted">{row.chain}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`velocity-indicator ${row.velocity.toLowerCase()}`}>
                      {row.velocity}
                    </span>
                  </td>
                  <td>
                    <span className={row.stock <= row.minOrder ? 'text-rose font-medium' : ''}>
                      {row.stock} <span className="text-muted text-xs">(Min: {row.minOrder})</span>
                    </span>
                  </td>
                  <td>{renderActionBadge(row.action)}</td>
                  <td className="font-medium text-emerald">{row.suggested > 0 ? `+${row.suggested}` : '-'}</td>
                  <td>
                    {row.clusterChange === 'Increase' && <span className="text-emerald text-sm">↑ Increase</span>}
                    {row.clusterChange === 'Decrease' && <span className="text-rose text-sm">↓ Decrease</span>}
                    {row.clusterChange === 'None' && <span className="text-muted text-sm">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Replenishment;

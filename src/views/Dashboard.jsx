import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, Store, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import './Dashboard.css';

const salesData = [
  { name: 'Week 1', sales: 4000 },
  { name: 'Week 2', sales: 3000 },
  { name: 'Week 3', sales: 2000 },
  { name: 'Week 4', sales: 2780 },
  { name: 'Week 5', sales: 1890 },
  { name: 'Week 6', sales: 2390 },
  { name: 'Week 7 (Current)', sales: 0 },
];

const Dashboard = ({ setActiveTab }) => {
  const { kpis } = useData();

  if (!kpis) return <div className="p-8">Loading dashboard metrics...</div>;

  // Insert the real sales total into our trend chart for this week
  const trendData = salesData.map((d, i) => 
    i === 6 ? { ...d, sales: kpis?.totalSales || 0 } : d
  );

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1>Overview <span className="text-gradient">Dashboard</span></h1>
          <p className="text-muted">Real-time performance across 29 grids and {kpis.activeStores} points of sale.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <Card className="kpi-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="kpi-icon bg-indigo"><DollarSign size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Sales (Weekly)</span>
            <span className="kpi-value">€{(kpis?.totalSales || 0).toLocaleString()}</span>
            <span className="kpi-trend positive"><ArrowUpRight size={16} /> Up this week</span>
          </div>
        </Card>
        <Card className="kpi-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="kpi-icon bg-emerald"><Store size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Active Stores</span>
            <span className="kpi-value">{kpis?.activeStores || 0}</span>
            <span className="kpi-trend neutral">All networks connected</span>
          </div>
        </Card>
        <Card 
          className="kpi-card clickable-card animate-slide-up" 
          style={{ animationDelay: '0.3s' }}
          onClick={() => setActiveTab && setActiveTab('replenishment')}
        >
          <div className="kpi-icon bg-rose"><AlertTriangle size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Replenishment Alerts</span>
            <span className="kpi-value">{kpis?.alertsCount || 0}</span>
            <span className="kpi-trend negative">Requires attention</span>
          </div>
        </Card>
        <Card className="kpi-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="kpi-icon bg-violet"><TrendingUp size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Avg. Sell-Through</span>
            <span className="kpi-value">{kpis?.avgSellThrough || 0}%</span>
            <span className="kpi-trend positive"><ArrowUpRight size={16} /> Good clearance</span>
          </div>
        </Card>
      </div>

      <div className="charts-grid animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <Card title="Sales Performance Trend" className="chart-card">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Category Sell-Through vs Stock" className="chart-card">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis?.categoryData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="sellThrough" name="Sold (%)" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stock" name="Stock (%)" fill="var(--bg-tertiary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="rankings-section">
        <Card title="Velocity Watchlist">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Sales Velocity</th>
                  <th>Status</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {kpis.topProducts?.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td className={product.trend === 'up' ? 'text-emerald' : 'text-rose'}>
                      {product.velocity}
                    </td>
                    <td>
                      <span className={`badge ${product.status === 'Hot' ? 'badge-success' : 'badge-warning'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      {product.trend === 'up' ? 
                        <ArrowUpRight size={18} className="text-emerald" /> : 
                        <ArrowDownRight size={18} className="text-rose" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

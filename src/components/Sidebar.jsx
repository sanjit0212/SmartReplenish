import React, { useState } from 'react';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  Package, 
  Upload, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronUp
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'replenishment', label: 'Replenishment', icon: Package },
    { id: 'import', label: 'Data Import', icon: Upload },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon"></div>
        <h2 className="logo-text">Smart<span className="text-gradient">Replenish</span></h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {showProfileMenu && (
          <div className="profile-menu">
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button className="nav-item text-danger" onClick={onLogout} style={{ color: 'var(--danger)' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
        <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer' }}>
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Manager</span>
          </div>
          <ChevronUp size={16} className="text-muted ml-auto" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText,
  HelpCircle, 
  BookOpen, 
  FileSpreadsheet,
  PieChart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu
} from 'lucide-react';

import { getAdminProfile } from '../utils/adminProfile';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile, onLogout, isLoggingOut }) {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Content Management', path: '/content', icon: FileText },
    { name: 'Question Bank', path: '/questions', icon: HelpCircle },
    { name: 'Quiz Management', path: '/quizzes', icon: BookOpen },
    { name: 'Assessment Management', path: '/assessment', icon: FileSpreadsheet },
    { name: 'Reports & Trends', path: '/reports', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const [adminUser, setAdminUser] = React.useState(getAdminProfile);

  React.useEffect(() => {
    const handleProfileChange = () => {
      setAdminUser(getAdminProfile());
    };
    window.addEventListener('adminProfileChange', handleProfileChange);
    window.addEventListener('storage', handleProfileChange);
    return () => {
      window.removeEventListener('adminProfileChange', handleProfileChange);
      window.removeEventListener('storage', handleProfileChange);
    };
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('questai_token');
      sessionStorage.removeItem('questai_user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="admin-modal-backdrop" 
          style={{ zIndex: 95 }} 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BookOpen size={24} color="var(--admin-primary)" />
            <span>Quest<span>AI</span> Admin</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={onToggleCollapse}>
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <NavLink 
                key={idx} 
                to={item.path} 
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <IconComponent size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <img 
              src={adminUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
              alt="Admin Profile" 
              className="sidebar-profile-avatar" 
            />
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{adminUser.name}</span>
              <span className="sidebar-profile-role">{adminUser.role === 'admin' ? 'Super Admin' : adminUser.role}</span>
            </div>
          </div>
          <button 
            className="sidebar-logout" 
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
          >
            <LogOut size={18} className={isLoggingOut ? "auth-icon-spin" : ""} />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

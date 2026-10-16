import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';

import { getAdminProfile } from '../utils/adminProfile';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed, onLogout, isLoggingOut }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const [adminUser, setAdminUser] = useState(getAdminProfile);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Admin Dashboard';
    if (path.startsWith('/users')) return 'User Management';
    if (path.startsWith('/content')) return 'Content Management';
    if (path.startsWith('/questions')) return 'Question Bank';
    if (path.startsWith('/quizzes')) return 'Quiz Management';
    if (path.startsWith('/assessment')) return 'Assessment Management';
    if (path.startsWith('/reports')) return 'Reports & Trends';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Admin Panel';
  };

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new Event('themeChange'));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
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
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.removeItem('questai_token');
      sessionStorage.removeItem('questai_user');
      navigate('/login', { replace: true });
    }
  };


  return (
    <header 
      className="admin-navbar" 
      style={{ 
        paddingLeft: window.innerWidth <= 767 ? '0' : (isSidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)') 
      }}
    >
      <div className="navbar-left">
        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
          id="admin-mobile-toggle"
        >
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">{getPageTitle()}</h2>
      </div>

      <div className="navbar-search-container">
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search users, quizzes, metrics..." 
          className="navbar-search-input" 
        />
      </div>

      <div className="navbar-right">
        <button 
          className="navbar-action-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>



        <div className="navbar-divider" />

        <div className="navbar-profile-dropdown-container" ref={dropdownRef}>
          <button className="navbar-profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <img 
              src={adminUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
              alt="Admin Avatar" 
              className="navbar-avatar" 
            />
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <User size={14} />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                <Settings size={14} />
                <span>System Settings</span>
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border-color)', margin: '4px 0' }} />
              <button 
                className="dropdown-item logout" 
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
              >
                <LogOut size={14} className={isLoggingOut ? "auth-icon-spin" : ""} />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

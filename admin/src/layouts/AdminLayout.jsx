import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { apiBaseUrl } from '../utils/api';
import '../admin.css';

export default function AdminLayout() {
  const token = sessionStorage.getItem('questai_token');
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState(
    location.state?.justLoggedIn ? (location.state?.adminName || 'Admin') : null
  );

  useEffect(() => {
    if (welcomeMsg) {
      const timer = setTimeout(() => {
        setWelcomeMsg(null);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [welcomeMsg]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    setTimeout(() => {
      sessionStorage.removeItem('questai_token');
      sessionStorage.removeItem('questai_user');
      navigate('/login', { replace: true });
    }, 280);
  };

  // Active validation: check if the session is still active and is an admin
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const headers = { 'Accept': 'application/json' };
        if (token && token.startsWith('ey')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${apiBaseUrl}/api/admin/stats`, { headers, credentials: 'include' });
        if (!res.ok) {
          sessionStorage.removeItem('questai_token');
          sessionStorage.removeItem('questai_user');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error("Admin session verification failed", err);
      }
    };
    verifyAdmin();
  }, [token]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 991) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
        setIsMobileSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 767) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const sidebarWidth = isSidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)';

  return (
    <div className={`admin-container ${isLoggingOut ? 'admin-page-exit' : 'admin-page-enter'}`}>
      {welcomeMsg && (
        <div className="admin-auth-toast toast-welcome" role="status" aria-live="polite">
          <CheckCircle2 size={16} color="var(--admin-primary)" />
          <span>Welcome back, {welcomeMsg}!</span>
        </div>
      )}
      {isLoggingOut && (
        <div className="admin-auth-toast toast-logout" role="status" aria-live="polite">
          <span className="auth-btn-spinner" style={{ width: '14px', height: '14px', borderTopColor: 'var(--text-primary)' }} />
          <span>Logging out...</span>
        </div>
      )}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={handleCloseMobileSidebar}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div 
        className="admin-main-wrapper" 
        style={{ 
          paddingLeft: window.innerWidth <= 767 ? '0' : sidebarWidth,
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        <Navbar 
          onToggleSidebar={handleToggleSidebar} 
          isSidebarCollapsed={window.innerWidth <= 767 ? true : isSidebarCollapsed}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

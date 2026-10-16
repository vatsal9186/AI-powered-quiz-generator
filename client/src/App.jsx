import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Features from './pages/Features/Features';
import Demo from './pages/Demo/Demo';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Analytics from './pages/Analytics/Analytics';
import FAQ from './pages/FAQ/FAQ';
import About from './pages/About/About';
import AptitudeTest from './pages/AptitudeTest/AptitudeTest';
import Dashboard from './pages/Dashboard/Dashboard';
import Footer from './components/Footer/Footer';
import AuthModal from './components/AuthModal/AuthModal';
import { apiBaseUrl } from './utils/api.js';

// Reset window scroll to top whenever the router pathname changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ user, openAuth, children }) {
  useEffect(() => {
    if (!user) {
      openAuth('signin');
    }
  }, [user, openAuth]);

  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('questai_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Normalize stale/old stored user objects on the fly
        if (parsed && !parsed.name && parsed.full_name) {
          parsed.name = parsed.full_name;
        }
        if (parsed && !parsed.avatar && parsed.profile_picture) {
          parsed.avatar = parsed.profile_picture;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("Error parsing saved user from sessionStorage", e);
      return null;
    }
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogoutCleanup = () => {
    sessionStorage.removeItem('questai_user');
    localStorage.removeItem('questai_token'); // Clean up any old persistent tokens
    localStorage.removeItem('questai_user');
    setUser(null);
  };

  // Verify if session cookie is still valid on application startup
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/users/me`);
        if (res.ok) {
          const rawData = await res.json();
          const userData = {
            name: rawData.full_name || "User",
            email: rawData.email,
            avatar: rawData.profile_picture
          };
          setUser(userData);
          sessionStorage.setItem('questai_user', JSON.stringify(userData));
        } else {
          // Token is expired, invalid, or browser cookie is missing
          handleLogoutCleanup();
        }
      } catch (err) {
        console.error("Session verification failed", err);
        handleLogoutCleanup();
      }
    };
    
    verifySession();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
    setJustLoggedIn(true);
    setWelcomeUser(userData?.name || "Learner");
    setTimeout(() => {
      setWelcomeUser(null);
    }, 2800);
    setTimeout(() => {
      setJustLoggedIn(false);
    }, 500);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // Smooth exit transition duration (280ms)
    await new Promise(resolve => setTimeout(resolve, 280));

    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, { method: "POST" });
    } catch (e) {
      console.error("Logout API call failed", e);
    }
    handleLogoutCleanup();
    setIsLoggingOut(false);
  };

  return (
    <>
      <ScrollToTop />
      {welcomeUser && (
        <div className="app-auth-toast toast-welcome" role="status" aria-live="polite">
          <CheckCircle2 size={16} color="var(--accent-green)" />
          <span>Welcome back, {welcomeUser}!</span>
        </div>
      )}
      {isLoggingOut && (
        <div className="app-auth-toast toast-logout" role="status" aria-live="polite">
          <span className="auth-btn-spinner" style={{ width: '14px', height: '14px', borderTopColor: 'var(--text-primary)' }} />
          <span>Logging out...</span>
        </div>
      )}
      <Navbar 
        user={user} 
        onOpenAuth={openAuth} 
        onLogout={handleLogout} 
        isLoggingOut={isLoggingOut}
        theme={theme} 
        onToggleTheme={toggleTheme}
      />
      <div className={`app-route-transition-wrapper ${justLoggedIn ? 'app-page-enter' : ''} ${isLoggingOut ? 'app-page-exit' : ''}`}>
        <Routes>
          <Route path="/" element={<Home user={user} onOpenAuth={openAuth} />} />
          <Route path="/features" element={<Features />} />
          <Route path="/demo" element={<Demo user={user} onOpenAuth={openAuth} />} />
          <Route path="/aptitude-test" element={<AptitudeTest user={user} onOpenAuth={openAuth} />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user} openAuth={openAuth}>
                <Dashboard user={user} onOpenAuth={openAuth} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <Footer />
      {isAuthOpen && (
        <AuthModal 
          isOpen={isAuthOpen} 
          initialMode={authMode} 
          onClose={() => setIsAuthOpen(false)} 
          onLoginSuccess={handleLogin}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

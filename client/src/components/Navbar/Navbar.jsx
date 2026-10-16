import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Brain,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  isLoggingOut,
  theme,
  onToggleTheme,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="logo-icon-wrapper">
            <Brain className="logo-icon" size={26} />
            <Sparkles className="logo-sparkle" size={12} />
          </div>
          <span className="logo-text">
            Quest<span className="logo-highlight">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link
            to="/features"
            className={`nav-item ${location.pathname === "/features" ? "active" : ""}`}
          >
            Features
          </Link>
          <Link
            to="/demo"
            className={`nav-item ${location.pathname === "/demo" ? "active" : ""}`}
          >
            Try Demo
          </Link>
          <Link
            to="/aptitude-test"
            className={`nav-item ${location.pathname === "/aptitude-test" ? "active" : ""}`}
          >
            Aptitude Test
          </Link>
          <Link
            to="/how-it-works"
            className={`nav-item ${location.pathname === "/how-it-works" ? "active" : ""}`}
          >
            How It Works
          </Link>
          <Link
            to="/analytics"
            className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}
          >
            Analytics
          </Link>
          <Link
            to="/faq"
            className={`nav-item ${location.pathname === "/faq" ? "active" : ""}`}
          >
            FAQs
          </Link>
          <Link
            to="/about"
            className={`nav-item ${location.pathname === "/about" ? "active" : ""}`}
          >
            About Us
          </Link>
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="user-profile-menu" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-initials">
                    {(user.name || "User")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                )}
                <span className="user-profile-name">
                  {(user.name || "User").split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`chevron-icon ${dropdownOpen ? "rotate" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-card">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/dashboard?tab=overview"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/dashboard?tab=quizzes"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <BookOpen size={16} />
                    <span>Saved Quizzes</span>
                  </Link>

                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item dropdown-logout-btn"
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                  >
                    <LogOut size={16} className={isLoggingOut ? "auth-icon-spin" : ""} />
                    <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="btn-signin"
                onClick={() => onOpenAuth("signin")}
              >
                Sign In
              </button>
              <button
                className="btn-getstarted"
                onClick={() => onOpenAuth("signup")}
              >
                Get Started
                <span className="btn-glow"></span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isOpen ? "active" : ""}`}>
        <div className="mobile-links">
          <Link
            to="/features"
            className={`mobile-nav-item ${location.pathname === "/features" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link
            to="/demo"
            className={`mobile-nav-item ${location.pathname === "/demo" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Try Demo
          </Link>
          <Link
            to="/aptitude-test"
            className={`mobile-nav-item ${location.pathname === "/aptitude-test" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Aptitude Test
          </Link>
          <Link
            to="/how-it-works"
            className={`mobile-nav-item ${location.pathname === "/how-it-works" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/analytics"
            className={`mobile-nav-item ${location.pathname === "/analytics" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Analytics
          </Link>
          <Link
            to="/faq"
            className={`mobile-nav-item ${location.pathname === "/faq" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            FAQs
          </Link>
          <Link
            to="/about"
            className={`mobile-nav-item ${location.pathname === "/about" ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          <div className="mobile-actions">
            <div className="mobile-theme-row">
              <span className="theme-label-text">
                Theme ({theme === "dark" ? "Dark" : "Light"})
              </span>
              <button
                className="theme-toggle-btn mobile"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            {user ? (
              <div className="mobile-user-info">
                <div className="mobile-user-header">
                  <div className="user-avatar-initials size-lg">
                    {(user.name || "User")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="mobile-user-name">{user.name || "User"}</h4>
                    <p className="mobile-user-email">{user.email}</p>
                  </div>
                </div>
                <button
                  className="btn-outline-glow w-full mt-4"
                  style={{
                    padding: "10px 0",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    opacity: isLoggingOut ? 0.6 : 1,
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                  }}
                  disabled={isLoggingOut}
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} className={isLoggingOut ? "auth-icon-spin" : ""} style={{ marginRight: "8px" }} />
                  {isLoggingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn-signin w-full"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth("signin");
                  }}
                >
                  Sign In
                </button>
                <button
                  className="btn-getstarted w-full"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth("signup");
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

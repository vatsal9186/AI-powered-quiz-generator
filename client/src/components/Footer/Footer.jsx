import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, Send, MessageSquare } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      <div className="footer-container">
        
        {/* Brand & Description Column */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo" onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <div className="logo-icon-wrapper-small">
              <Brain className="logo-icon-small" size={20} />
              <Sparkles className="logo-sparkle-small" size={10} />
            </div>
            <span className="logo-text-small">Quest<span className="logo-highlight">AI</span></span>
          </Link>
          <p className="footer-desc">
            Transforming educational content into intelligent, multi-level assessments instantly. Powered by advanced artificial intelligence to elevate student learning.
          </p>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Discord">
              <MessageSquare size={18} />
            </a>
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="footer-links-col">
          <h4 className="footer-title">Product</h4>
          <ul className="footer-list">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/demo">Interactive Quiz</Link></li>
            <li><Link to="/analytics">Analytics Reports</Link></li>
            <li><a href="#pricing">Pricing Plans</a></li>
            <li><a href="#admin">Admin Dashboard</a></li>
          </ul>
        </div>

        {/* Links Column 2: Resources */}
        <div className="footer-links-col">
          <h4 className="footer-title">Resources</h4>
          <ul className="footer-list">
            <li><Link to="/about">About Us</Link></li>
            <li><a href="#documentation">Documentation</a></li>
            <li><Link to="/faq">FAQ Help Center</Link></li>
            <li><a href="#api">API Integration</a></li>
            <li><a href="#privacy">Security Status</a></li>
          </ul>
        </div>

        {/* Links Column 3: Newsletter */}
        <div className="footer-newsletter-col">
          <h4 className="footer-title">Stay Updated</h4>
          <p className="newsletter-desc">Subscribe to our newsletter to receive the latest updates, tips, and AI learning insights.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </div>
            {subscribed && (
              <span className="newsletter-success">
                Thank you! You've been subscribed.
              </span>
            )}
          </form>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">&copy; {new Date().getFullYear()} QuestAI Technologies Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#terms">Terms of Service</a>
            <span className="bullet-separator">&bull;</span>
            <a href="#privacy">Privacy Policy</a>
            <span className="bullet-separator">&bull;</span>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

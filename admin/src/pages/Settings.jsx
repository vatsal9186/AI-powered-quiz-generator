import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Settings as SettingsIcon, Bell, Upload, CheckCircle2 } from 'lucide-react';
import { getAdminProfile, saveAdminProfile } from '../utils/adminProfile';

export default function Settings() {
  const initialProfile = getAdminProfile();
  const [adminName, setAdminName] = useState(initialProfile.name);
  const [adminEmail, setAdminEmail] = useState(initialProfile.email);
  const [adminPhone, setAdminPhone] = useState(initialProfile.phone);
  const [adminAvatar, setAdminAvatar] = useState(initialProfile.avatar);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const [appName, setAppName] = useState('QuestAI Learning Suite');
  const [defaultDifficulty, setDefaultDifficulty] = useState('medium');
  const [questionsPerQuiz, setQuestionsPerQuiz] = useState(10);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [signupAlerts, setSignupAlerts] = useState(true);
  const [warningAlerts, setWarningAlerts] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new Event('themeChange'));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    saveAdminProfile({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      avatar: adminAvatar
    });
    setSavedSuccessMsg('Admin profile saved successfully! Real-time changes applied to Navbar & Sidebar.');
    setTimeout(() => setSavedSuccessMsg(''), 4000);
  };

  const handleSave = (section) => {
    alert(`${section} saved successfully!`);
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-grid">
        <section className="section-card">
          <h3 className="settings-section-title">
            <User size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Profile Configuration
          </h3>

          {savedSuccessMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(0, 230, 118, 0.12)',
              border: '1px solid #00E676',
              borderRadius: '8px',
              color: '#00E676',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{savedSuccessMsg}</span>
            </div>
          )}
          
          <div className="profile-upload-container">
            <img 
              src={adminAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"} 
              alt="Admin Profile Preview" 
              className="profile-upload-preview" 
              style={{ objectFit: 'cover', width: '80px', height: '80px', borderRadius: '50%' }}
            />
            <div className="profile-upload-actions">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              <button 
                type="button"
                className="admin-btn" 
                style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Upload size={14} />
                <span>Upload New Image</span>
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allowed formats: PNG, JPG, WEBP (Max 5MB)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Admin User Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={adminName} 
                onChange={e => setAdminName(e.target.value)} 
                placeholder="e.g. Vatsal Kansara"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={adminEmail} 
                onChange={e => setAdminEmail(e.target.value)} 
                placeholder="e.g. vatsal.kansara@questai.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone (Indian Number)</label>
              <input 
                type="text" 
                className="form-input" 
                value={adminPhone} 
                onChange={e => setAdminPhone(e.target.value)} 
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="admin-btn" onClick={handleSaveProfile}>
              <Save size={14} />
              <span>Save Profile</span>
            </button>
          </div>
        </section>

        <section className="section-card">
          <h3 className="settings-section-title">
            <SettingsIcon size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Application & Quiz Engines Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Application Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={appName} 
                onChange={e => setAppName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Default Generated Difficulty</label>
              <select 
                className="admin-select" 
                value={defaultDifficulty} 
                onChange={e => setDefaultDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Question Count per Quiz</label>
              <input 
                type="number" 
                min="5" 
                max="50" 
                className="form-input" 
                value={questionsPerQuiz} 
                onChange={e => setQuestionsPerQuiz(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="admin-btn" onClick={() => handleSave("System engine settings")}>
              <Save size={14} />
              <span>Save System Config</span>
            </button>
          </div>
        </section>

        <section className="section-card">
          <h3 className="settings-section-title">
            <Bell size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Appearance & Live Alerts Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
            <div className="toggle-switch-container">
              <div className="toggle-switch-label">
                <span className="toggle-switch-title">Dark Mode Theme</span>
                <span className="toggle-switch-desc">Switch application color layout between dark carbon and soft sand</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={theme === 'dark'} 
                  onChange={handleThemeToggle}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-container">
              <div className="toggle-switch-label">
                <span className="toggle-switch-title">System Email Reports</span>
                <span className="toggle-switch-desc">Receive digest notifications summarizing daily student registrations</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={emailAlerts} 
                  onChange={e => setEmailAlerts(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-container">
              <div className="toggle-switch-label">
                <span className="toggle-switch-title">New User Registration Alerts</span>
                <span className="toggle-switch-desc">Receive push notices in header dropdown when new students register</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={signupAlerts} 
                  onChange={e => setSignupAlerts(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-container">
              <div className="toggle-switch-label">
                <span className="toggle-switch-title">Database System Warnings</span>
                <span className="toggle-switch-desc">Log diagnostic warnings regarding API query timeouts or connectivity delays</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={warningAlerts} 
                  onChange={e => setWarningAlerts(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="admin-btn" onClick={() => handleSave("Notifications & Appearance settings")}>
              <Save size={14} />
              <span>Save System Settings</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

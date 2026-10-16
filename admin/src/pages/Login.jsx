import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, BookOpen, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  
  // Forgot Password OTP Flow States (matching User Forgot Password flow)
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Registered Email, 2: OTP Verification, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpBoxes, setOtpBoxes] = useState(["", "", "", "", "", ""]);
  const [otpToken, setOtpToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min OTP expiry
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s resend cooldown

  const navigate = useNavigate();

  const maskEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes("@")) return emailStr;
    const [local, domain] = emailStr.split("@");
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // Countdown timer for OTP expiry & resend cooldown
  useEffect(() => {
    let interval = null;
    if (isForgotMode && resetStep === 2) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isForgotMode, resetStep]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpBoxChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpBoxes];
    newOtp[index] = value.slice(-1);
    setOtpBoxes(newOtp);
    setErrorMsg('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`admin-otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      const prevInput = document.getElementById(`admin-otp-digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otpBoxes];
        newOtp[index - 1] = "";
        setOtpBoxes(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtpBoxes(digits);
      setErrorMsg('');
      const lastInput = document.getElementById("admin-otp-digit-5");
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isLoginSuccess) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
      }

      const adminUser = {
        name: data.user_name || 'Vatsal Kansara',
        email: data.user_email || email || 'vatsal.kansara@questai.com',
        phone: data.user_phone || '+91 98765 43210',
        avatar: data.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        role: 'admin'
      };

      sessionStorage.setItem('questai_token', data.access_token || 'session_active');
      sessionStorage.setItem('questai_user', JSON.stringify(adminUser));

      setIsLoginSuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true, state: { justLoggedIn: true, adminName: adminUser.name } });
      }, 280);
    } catch (err) {
      console.error('Sign-in attempt failed:', err);
      setErrorMsg(err.message || 'Unable to connect to the backend server. Please make sure the server is running.');
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'email', email: trimmedEmail, identifier: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to send verification code.');
      }

      setOtpToken(data.reference_id || data.otp_token || '');
      setOtpBoxes(["", "", "", "", "", ""]);
      setTimerSeconds(data.expires_in_seconds || 300);
      setCooldownSeconds(data.resend_cooldown_seconds || 60);
      setResetStep(2);

      setTimeout(() => {
        const firstInput = document.getElementById("admin-otp-digit-0");
        if (firstInput) firstInput.focus();
      }, 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpBoxes.join("");
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (timerSeconds === 0) {
      setErrorMsg('Verification code has expired. Please request a new code.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_id: otpToken, otp_token: otpToken, otp_code: fullOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to verify OTP code.');
      }

      setResetToken(data.reset_token);
      setResetStep(3);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password.');
      }

      setSuccessMsg('Your Admin password has been reset successfully. You can now log in.');
      setIsForgotMode(false);
      setPassword('');
      setConfirmPassword('');
      setForgotEmail('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className={`login-card ${isLoginSuccess ? 'login-card-exit' : ''}`}>
        <div className="login-header">
          <div className="login-logo-icon">
            <BookOpen size={24} />
          </div>
          <h1 className="login-title">Quest<span>AI</span> Admin</h1>
          <span className="login-subtitle">
            {isForgotMode
              ? resetStep === 1
                ? 'Forgot Admin Password'
                : resetStep === 2
                ? 'OTP Verification Code'
                : 'Create New Admin Password'
              : 'Intelligent Quiz System Control Panel'}
          </span>
        </div>

        {errorMsg && (
          <div className="login-alert" style={{ backgroundColor: 'rgba(255, 56, 96, 0.12)', borderColor: '#FF3860', color: '#FF3860' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isForgotMode && resetStep === 2 && (
          <div className="login-alert" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>✉️</span>
            <div>
              <div style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: '700' }}>Email Verification Code Dispatched</div>
              <div style={{ fontSize: '13px', fontWeight: '500', marginTop: '2px' }}>We sent a verification code to <strong style={{ color: '#00E676' }}>{maskEmail(forgotEmail)}</strong></div>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="login-alert" style={{ backgroundColor: 'rgba(0, 230, 118, 0.12)', borderColor: '#00E676', color: '#00E676' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {isForgotMode ? (
          <form
            onSubmit={
              resetStep === 1
                ? handleSendOTP
                : resetStep === 2
                ? handleVerifyOTP
                : handleResetPassword
            }
            className="login-form"
          >
            {resetStep === 1 ? (
              <div className="login-field">
                <label className="login-label" htmlFor="forgot-email-input">Registered Email Address</label>
                <div className="login-input-wrapper">
                  <input
                    id="forgot-email-input"
                    type="email"
                    className="login-input"
                    placeholder="admin@questai.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Mail className="login-input-icon" size={16} />
                </div>
              </div>
            ) : resetStep === 2 ? (
              <div className="login-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="login-label">Enter 6-Digit Verification Code</label>
                  <span style={{ fontSize: '12px', color: timerSeconds > 0 ? '#a5b4fc' : '#FF3860', fontWeight: '600' }}>
                    Expires: {formatTime(timerSeconds)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '14px 0' }}>
                  {otpBoxes.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`admin-otp-digit-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      disabled={isLoading}
                      style={{
                        width: '42px',
                        height: '48px',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        borderRadius: '8px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        background: 'rgba(15, 23, 42, 0.7)',
                        color: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    disabled={cooldownSeconds > 0 || isLoading}
                    onClick={handleSendOTP}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: cooldownSeconds > 0 ? '#94a3b8' : '#6366f1',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cooldownSeconds > 0 ? `Resend OTP in ${cooldownSeconds}s` : 'Resend OTP via Email'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="login-field">
                  <label className="login-label" htmlFor="new-password-input">New Password</label>
                  <div className="login-input-wrapper">
                    <input
                      id="new-password-input"
                      type="password"
                      className="login-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Lock className="login-input-icon" size={16} />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="confirm-password-input">Confirm New Password</label>
                  <div className="login-input-wrapper">
                    <input
                      id="confirm-password-input"
                      type="password"
                      className="login-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Lock className="login-input-icon" size={16} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading
                ? 'Processing Request...'
                : resetStep === 1
                ? 'Send Verification OTP'
                : resetStep === 2
                ? 'Verify Code & Continue'
                : 'Update Admin Password'}
            </button>

            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '12px'
              }}
              onClick={() => {
                setIsForgotMode(false);
                setErrorMsg('');
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label className="login-label" htmlFor="email-input">Email Address</label>
              <div className="login-input-wrapper">
                <input
                  id="email-input"
                  type="email"
                  className="login-input"
                  placeholder="admin@questai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="login-input-icon" size={16} />
              </div>
            </div>

            <div className="login-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="login-label" htmlFor="password-input">Password</label>
                <a
                  href="#forgot"
                  style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotMode(true);
                    setResetStep(1);
                    setForgotEmail(email || '');
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              <div className="login-input-wrapper">
                <input
                  id="password-input"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Lock className="login-input-icon" size={16} />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading || isLoginSuccess}>
              {isLoading ? (
                <>
                  <span className="auth-btn-spinner" />
                  <span>Verifying Session...</span>
                </>
              ) : isLoginSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Welcome back!</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}




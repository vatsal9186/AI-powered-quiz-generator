import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Phone,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
} from "lucide-react";
import "./AuthModal.css";
import { apiBaseUrl } from "../../utils/api.js";

const GoogleIcon = () => (
  <svg
    style={{ marginRight: "10px", flexShrink: 0 }}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export default function AuthModal({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
}) {
  const [mode, setMode] = useState(initialMode || "signin"); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Input States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation / UI States
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Password Reset OTP Flow States
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP Verification, 3: New Password
  const [userEmail, setUserEmail] = useState("");
  const [otpBoxes, setOtpBoxes] = useState(["", "", "", "", "", ""]);
  const [refId, setRefId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min OTP expiry timer
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s resend cooldown timer


  const maskEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes("@")) return emailStr;
    const [local, domain] = emailStr.split("@");
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  
  // Dynamic Check for Real Google Auth Setup
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Prevent background page scrolling when Auth Modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load Google Identity Services script dynamically
  useEffect(() => {
    // Evaluate if Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const isPlaceholder = !clientId || clientId.startsWith("your-google-client-id");
    setIsGoogleConfigured(!isPlaceholder);

    const handleScriptLoad = () => {
      setIsScriptLoaded(true);
    };

    const existingScript = document.getElementById("google-gsi-client");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = handleScriptLoad;
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize Google Login and render button if configured
  useEffect(() => {
    if (isOpen && isGoogleConfigured && isScriptLoaded && window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          window.google.accounts.id.renderButton(container, { 
            theme: "outline", 
            size: "large", 
            width: "320", 
            text: "continue_with", // Renders "Continue with Google"
            shape: "rectangular"
          });
        }
      } catch (err) {
        console.error("Google SSO Button Rendering Error:", err);
      }
    }
  }, [isOpen, mode, isGoogleConfigured, isScriptLoaded]);

  // Handle Google Token response from Google popup callback
  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrors({});
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Google authentication failed.");
      }

      const data = await res.json();
      
      // Store credentials in sessionStorage
      sessionStorage.setItem("questai_user", JSON.stringify({
        name: data.user_name,
        email: data.user_email,
        avatar: data.user_avatar
      }));

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          name: data.user_name,
          email: data.user_email,
          avatar: data.user_avatar,
        });
      }, 1000);
    } catch (err) {
      setLoading(false);
      setErrors({ google: err.message });
    }
  };

  // Countdown timer for OTP expiry & resend cooldown
  useEffect(() => {
    let interval = null;
    if (mode === "forgot" && resetStep === 2) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, resetStep]);

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
    setErrors({});

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
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
      setErrors({});
      const lastInput = document.getElementById("otp-digit-5");
      if (lastInput) lastInput.focus();
    }
  };

  // Auto-fill test details or reset inputs when mode changes
  useEffect(() => {
    if (mode === "signin") {
      setEmail("user@questai.com");
      setPassword("password123");
    } else if (mode === "signup") {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } else if (mode === "forgot") {
      setEmail("");
      setUserEmail("");
      setOtpBoxes(["", "", "", "", "", ""]);
      setRefId("");
      setPassword("");
      setConfirmPassword("");
      setResetStep(1);
      setResetToken("");
      setResetSuccess(false);
      setTimerSeconds(300);
      setCooldownSeconds(60);
    }

    setErrors({});
  }, [mode]);


  if (!isOpen) return null;

  // Password strength checker helper
  const getPasswordStrength = () => {
    if (!password) return { label: "", percent: 0, color: "transparent" };
    let strength = 0;
    if (password.length >= 6) strength += 33;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 33;
    if (/[^A-Za-z0-9]/.test(password)) strength += 34;

    if (strength <= 33) return { label: "Weak", percent: 33, color: "#FF3860" };
    if (strength <= 66)
      return { label: "Medium", percent: 66, color: "#FFDD57" };
    return { label: "Strong", percent: 100, color: "#00E676" };
  };

  const passwordStrength = getPasswordStrength();

  // Validate form
  const validate = () => {
    let formErrors = {};
    if (!email) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!name.trim()) {
        formErrors.name = "Full Name is required";
      }
      if (password !== confirmPassword) {
        formErrors.confirmPassword = "Passwords do not match";
      }
      if (!agreeTerms) {
        formErrors.agreeTerms = "You must agree to the Terms & Conditions";
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Submit Handler for Email & Password authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || success) return;
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      let endpoint = `${apiBaseUrl}/api/auth/login`;
      let payload = { email, password };
      
      if (mode === "signup") {
        endpoint = `${apiBaseUrl}/api/auth/register`;
        payload = { email, password, full_name: name };
      }
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Authentication failed.");
      }
      
      const data = await res.json();
      
      if (mode === "signup") {
        // After signup, automatically log in
        const loginRes = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!loginRes.ok) {
          throw new Error("Registration succeeded but auto-login failed.");
        }
        
        const loginData = await loginRes.json();
        sessionStorage.setItem("questai_user", JSON.stringify({
          name: loginData.user_name,
          email: loginData.user_email
        }));
        
        setLoading(false);
        setSuccess(true);
        
        setTimeout(() => {
          onLoginSuccess({
            name: loginData.user_name,
            email: loginData.user_email,
            avatar: null,
          });
        }, 700);
      } else {
        sessionStorage.setItem("questai_user", JSON.stringify({
          name: data.user_name,
          email: data.user_email
        }));
        
        setLoading(false);
        setSuccess(true);
        
        setTimeout(() => {
          onLoginSuccess({
            name: data.user_name,
            email: data.user_email,
            avatar: null,
          });
        }, 700);
      }
    } catch (err) {
      setLoading(false);
      setErrors({ form: err.message });
    }
  };

  // Robust fetch helper to automatically fall back between localhost and 127.0.0.1 if network resolution differs
  const robustFetch = async (path, options = {}) => {
    const urlsToTry = [
      `${apiBaseUrl}${path}`,
      `http://127.0.0.1:8000${path}`,
      `http://localhost:8000${path}`
    ];
    const uniqueUrls = [...new Set(urlsToTry)];

    let lastError = null;
    for (const url of uniqueUrls) {
      try {
        const res = await fetch(url, options);
        return res;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Failed to fetch");
  };

  // Password Reset OTP Handler (Email Verification Only)
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setErrors({});

    const trimmedEmail = userEmail.trim();
    if (!trimmedEmail) {
      setErrors({ userEmail: "Please enter your registered email address." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrors({ userEmail: "Please enter a valid email address." });
      return;
    }

    const payload = { method: "email", email: trimmedEmail, identifier: trimmedEmail };
    setLoading(true);

    try {
      const res = await robustFetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server communication error. Please ensure the backend server is running.");
      }

      setLoading(false);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to send verification code.");
      }

      setRefId(data.reference_id || data.otp_token || "");
      setOtpBoxes(["", "", "", "", "", ""]);
      setTimerSeconds(data.expires_in_seconds || 300);
      setCooldownSeconds(data.resend_cooldown_seconds || 60);
      setResetStep(2);

      setTimeout(() => {
        const firstInput = document.getElementById("otp-digit-0");
        if (firstInput) firstInput.focus();
      }, 100);
    } catch (err) {
      setLoading(false);
      const msg = (err.message === "Failed to fetch" || err.name === "TypeError")
        ? "Unable to connect to the authentication server. Please ensure the backend FastAPI server is running on port 8000." 
        : err.message;
      setErrors({ form: msg });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otpBoxes.join("");
    if (fullOtp.length < 6) {
      setErrors({ otpCode: "Please enter the complete 6-digit verification code." });
      return;
    }

    if (timerSeconds === 0) {
      setErrors({ form: "Verification code has expired. Please request a new code." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await robustFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: refId, otp_code: fullOtp }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server communication error. Please try again.");
      }

      setLoading(false);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Invalid verification code.");
      }

      setResetToken(data.reset_token);
      setResetStep(3);
    } catch (err) {
      setLoading(false);
      const msg = (err.message === "Failed to fetch" || err.name === "TypeError")
        ? "Unable to connect to the authentication server." 
        : err.message;
      setErrors({ form: msg });
    }
  };


  const handleResetPassword = async (e) => {
    e.preventDefault();
    let formErrors = {};
    if (!password) {
      formErrors.password = "New password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await robustFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, new_password: password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server communication error. Please try again.");
      }

      setLoading(false);

      if (!res.ok) {
        throw new Error(data.detail || "Failed to reset password.");
      }

      setResetSuccess(true);
    } catch (err) {
      setLoading(false);
      const msg = (err.message === "Failed to fetch" || err.name === "TypeError")
        ? "Unable to connect to the authentication server." 
        : err.message;
      setErrors({ form: msg });
    }
  };


  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Loading Overlay */}
        {loading && (
          <div className="auth-loading-overlay animate-fade-in">
            <div className="loading-spinner-box">
              <div className="pulse-logo">
                <BrainCircuit className="spinner-logo-ico" size={40} />
              </div>
              <div className="loader-ring"></div>
            </div>
            <h3>Securing Authentication...</h3>
            <p>Connecting to backend authentication systems</p>
          </div>
        )}

        {/* Success Overlay */}
        {success && (
          <div className="auth-success-overlay animate-scale-up">
            <div className="success-check-wrapper">
              <CheckCircle2 className="success-check-icon" size={60} />
              <div className="check-glow-ring"></div>
            </div>
            <h3>Authentication Success!</h3>
            <p>Welcome to QuestAI assessment panels.</p>
          </div>
        )}

        {/* LEFT SIDE: Visual Brand Block (Desktop Only) */}
        <div className="auth-left-brand">
          <div className="mesh-gradient-orb"></div>
          <div className="brand-header">
            <BrainCircuit className="brand-header-icon" size={32} />
            <span className="brand-logo-text">
              Quest<span className="logo-highlight">AI</span>
            </span>
          </div>

          <div className="brand-pitch">
            <div className="pitch-badge">
              <Sparkles size={12} />
              <span>AI Powered Learning</span>
            </div>
            <h2>
              Prepare Smarter, <br />
              Learn Faster
            </h2>
            <p>
              Join over 15,000+ students analyzing notes, generating timed
              micro-quizzes, and studying with context-aware chat agents.
            </p>
          </div>

          <div className="brand-perks">
            <div className="perk-row">
              <div className="perk-dot"></div>
              <span>Instant textbook chunking & summarization</span>
            </div>
            <div className="perk-row">
              <div className="perk-dot"></div>
              <span>Adaptive difficulty test matrices</span>
            </div>
            <div className="perk-row">
              <div className="perk-dot"></div>
              <span>Semantic grading & feedback pipelines</span>
            </div>
          </div>

          <div className="brand-footer">
            <ShieldCheck size={16} />
            <span>Secure Backend JWT Authentication Active</span>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form Container */}
        <div className="auth-right-form">
          <div className="form-mode-header">
            <h2>
              {mode === "signin"
                ? "Welcome Back"
                : mode === "signup"
                ? "Create Account"
                : resetStep === 1
                ? "Forgot Password?"
                : "Reset Password"}
            </h2>
            <p>
              {mode === "signin"
                ? "Enter credentials to access your dashboard"
                : mode === "signup"
                ? "Unlock custom chapter quizzes in seconds"
                : resetStep === 1
                ? "Enter your registered email address to reset your password"
                : resetStep === 2
                ? "Enter the 6-digit verification code sent via Email"
                : "Enter your new password below"}
            </p>
          </div>

          {mode === "forgot" && resetSuccess ? (
            <div className="reset-success-box animate-scale-up" style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={48} style={{ color: "#00E676", margin: "0 auto 16px auto" }} />
              <h3 style={{ color: "var(--text-primary)", fontSize: "1.3rem", fontWeight: "700", marginBottom: "8px" }}>
                Password Reset Complete!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Your password has been reset successfully. You can now log into your account with your new credentials.
              </p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => {
                  setMode("signin");
                  setResetSuccess(false);
                }}
              >
                <span>Go to Login</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : mode === "forgot" ? (
            /* Forgot Password Form (Email Verification Only) */
            <form
              onSubmit={
                resetStep === 1
                  ? handleSendOTP
                  : resetStep === 2
                  ? handleVerifyOTP
                  : handleResetPassword
              }
              className="auth-inputs-form"
            >
              {errors.form && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(255, 56, 96, 0.12)",
                    border: "1px solid #FF3860",
                    borderRadius: "8px",
                    color: "#FF3860",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    marginBottom: "16px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errors.form}</span>
                </div>
              )}

              {resetStep === 2 && (
                <div className="real-sms-box" style={{ marginBottom: "16px" }}>
                  <span className="real-sms-icon">✉️</span>
                  <div>
                    <div className="real-sms-title">
                      EMAIL VERIFICATION DISPATCHED
                    </div>
                    <div className="real-sms-text">
                      We sent a verification code to{" "}
                      <strong style={{ color: "#00E676" }}>
                        {maskEmail(userEmail)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {resetStep === 1 ? (
                <div className={`input-group ${errors.userEmail ? "error" : ""}`}>
                  <label>Enter your registered email address</label>
                  <div className="input-field-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  {errors.userEmail && (
                    <span className="error-message">
                      <AlertCircle size={12} />
                      {errors.userEmail}
                    </span>
                  )}
                </div>
              ) : resetStep === 2 ? (

                <div className={`input-group ${errors.otpCode ? "error" : ""}`}>
                  {/* Step 2: 6-Digit OTP Code Verification UI */}
                  <label style={{ display: "block", textAlign: "center", marginBottom: "4px", fontSize: "0.95rem" }}>
                    Enter 6-Digit Verification Code
                  </label>

                  <div className="otp-boxes-container" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-digit-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpBoxes[index] || ""}
                        onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`otp-digit-box ${otpBoxes[index] ? "filled" : ""}`}
                        disabled={timerSeconds === 0 || loading}
                      />
                    ))}
                  </div>

                  <div className="otp-meta-info">
                    <span className={`otp-expiry-pill ${timerSeconds === 0 ? "expired" : ""}`}>
                      {timerSeconds > 0 ? `OTP expires in ${formatTime(timerSeconds)}` : "OTP Expired"}
                    </span>

                    <button
                      type="button"
                      className="otp-resend-btn"
                      disabled={cooldownSeconds > 0 || loading}
                      onClick={handleSendOTP}
                    >
                      {cooldownSeconds > 0
                        ? `Resend OTP in ${cooldownSeconds}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  {errors.otpCode && (
                    <span className="error-message" style={{ marginTop: "8px" }}>
                      <AlertCircle size={12} />
                      {errors.otpCode}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  {/* Step 3: Create New Password */}
                  <div className={`input-group ${errors.password ? "error" : ""}`}>
                    <label>New Password</label>
                    <div className="input-field-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="error-message">
                        <AlertCircle size={12} />
                        {errors.password}
                      </span>
                    )}

                    {password && (
                      <div className="password-strength-container animate-fade-in">
                        <div className="strength-bar-track">
                          <div
                            className="strength-bar-fill"
                            style={{
                              width: `${passwordStrength.percent}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          ></div>
                        </div>
                        <span
                          className="strength-label"
                          style={{ color: passwordStrength.color }}
                        >
                          Password Strength: {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`input-group ${errors.confirmPassword ? "error" : ""}`}>
                    <label>Confirm Password</label>
                    <div className="input-field-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        <AlertCircle size={12} />
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading || (resetStep === 2 && timerSeconds === 0)}>
                <span>
                  {resetStep === 1
                    ? "Send OTP"
                    : resetStep === 2
                    ? "Verify OTP"
                    : "Reset Password"}
                </span>
                <ArrowRight size={18} />
              </button>

              <div className="auth-footer-switcher" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="switcher-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => {
                    setMode("signin");
                    setErrors({});
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Conditional Google Login UI */}
              {!isGoogleConfigured ? (
                <div style={{
                  padding: "12px 14px",
                  backgroundColor: "rgba(255, 167, 38, 0.12)",
                  border: "1px dashed #FF9800",
                  borderRadius: "8px",
                  color: "#FF9800",
                  fontSize: "13px",
                  margin: "12px auto 6px auto",
                  textAlign: "center",
                  width: "100%",
                  maxWidth: "320px",
                  boxSizing: "border-box"
                }}>
                  <strong>Google client ID is not configured.</strong> Please set <code>VITE_GOOGLE_CLIENT_ID</code> in your client <code>.env</code> file.
                </div>
              ) : (
                <div 
                  id="google-signin-btn-container" 
                  style={{ 
                    margin: "12px 0 6px 0", 
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    minHeight: "44px"
                  }}
                ></div>
              )}

              <div className="form-separator">
                <div className="sep-line"></div>
                <span>or continue with email</span>
                <div className="sep-line"></div>
              </div>

              {/* Tabs Switch */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${mode === "signin" ? "active" : ""}`}
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
                <div
                  className={`tab-slider ${mode === "signup" ? "slide-right" : ""}`}
                ></div>
              </div>

              {/* Form elements */}
              <form onSubmit={handleSubmit} className="auth-inputs-form">
                {/* General form/google errors */}
                {(errors.form || errors.google) && (
                  <div style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(255, 56, 96, 0.12)",
                    border: "1px solid #FF3860",
                    borderRadius: "8px",
                    color: "#FF3860",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    marginBottom: "16px",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errors.form || errors.google}</span>
                  </div>
                )}

                {mode === "signup" && (
                  <div className={`input-group ${errors.name ? "error" : ""}`}>
                    <label>Full Name</label>
                    <div className="input-field-wrapper">
                      <User className="input-icon" size={18} />
                      <input
                        type="text"
                        placeholder="Alex Learner"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    {errors.name && (
                      <span className="error-message">
                        <AlertCircle size={12} />
                        {errors.name}
                      </span>
                    )}
                  </div>
                )}

                <div className={`input-group ${errors.email ? "error" : ""}`}>
                  <label>Email Address</label>
                  <div className="input-field-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      placeholder="user@questai.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">
                      <AlertCircle size={12} />
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className={`input-group ${errors.password ? "error" : ""}`}>
                  <div className="label-row">
                    <label>Password</label>
                    {mode === "signin" && (
                      <a
                        href="#forgot"
                        className="forgot-link-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setMode("forgot");
                        }}
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className="input-field-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">
                      <AlertCircle size={12} />
                      {errors.password}
                    </span>
                  )}

                  {/* Password Strength UI for Sign Up */}
                  {mode === "signup" && password && (
                    <div className="password-strength-container animate-fade-in">
                      <div className="strength-bar-track">
                        <div
                          className="strength-bar-fill"
                          style={{
                            width: `${passwordStrength.percent}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        ></div>
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: passwordStrength.color }}
                      >
                        Password Strength: {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {mode === "signup" && (
                  <div
                    className={`input-group ${errors.confirmPassword ? "error" : ""}`}
                  >
                    <label>Confirm Password</label>
                    <div className="input-field-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        <AlertCircle size={12} />
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                )}

                {/* Terms and Conditions (Signup) vs Remember Me (Signin) */}
                {mode === "signin" ? (
                  <div className="form-utility-row">
                    <label className="checkbox-label-wrapper">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <span className="custom-checkbox"></span>
                      <span className="checkbox-text">Keep me signed in</span>
                    </label>
                  </div>
                ) : (
                  <div
                    className={`form-utility-row ${errors.agreeTerms ? "error" : ""}`}
                  >
                    <label className="checkbox-label-wrapper">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms(!agreeTerms)}
                      />
                      <span className="custom-checkbox"></span>
                      <span className="checkbox-text">
                        I agree to the{" "}
                        <a
                          href="#terms"
                          className="accent-text"
                          onClick={(e) => e.preventDefault()}
                        >
                          Terms of Service
                        </a>{" "}
                        &{" "}
                        <a
                          href="#privacy"
                          className="accent-text"
                          onClick={(e) => e.preventDefault()}
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <span className="error-message inline">
                        <AlertCircle size={12} />
                        {errors.agreeTerms}
                      </span>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" className="auth-submit-btn" disabled={loading || success}>
                  {loading ? (
                    <>
                      <span className="auth-btn-spinner" />
                      <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Welcome back!</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === "signin"
                          ? "Sign Into Dashboard"
                          : "Compile Account"}
                      </span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom switcher text */}
              <div className="auth-footer-switcher">
                {mode === "signin" ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      className="switcher-btn"
                      onClick={() => setMode("signup")}
                    >
                      Sign Up Free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      className="switcher-btn"
                      onClick={() => setMode("signin")}
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

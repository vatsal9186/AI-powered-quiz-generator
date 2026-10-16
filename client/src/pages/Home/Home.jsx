import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Layers, Sparkles } from "lucide-react";
import "./Home.css";

export default function Home({ user, onOpenAuth }) {
  return (
    <div className="home-page" style={{ paddingBottom: "100px" }}>
      {/* Background Decor Gradients */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* --- HERO SECTION --- */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="hero-badge">
              <Sparkles className="badge-icon" size={14} />
              AI-Powered Assessment Engine v2.0
            </span>
          </div>
          <h1 className="hero-title">
            Transform Study Materials Into <br />
            <span className="title-gradient">Interactive Quizzes</span>{" "}
            Instantly
          </h1>
          <p className="hero-subtitle">
            Upload PDF, PPTX, or text documents. Our AI instantly parses
            chapters, extracts concepts, and constructs multi-level tests to
            turbocharge your learning.
          </p>

          <div className="hero-buttons">
            <Link
              to="/demo"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Generate Sample Quiz
              <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="btn-secondary">
              How It Works
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Page Books Supported</p>
            </div>
            <div className="stat-card">
              <h3>O(1)</h3>
              <p>Instant Test Compilation</p>
            </div>
            <div className="stat-card">
              <h3>98.7%</h3>
              <p>Concept Extraction Precision</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="hero-visual">
          <div className="visual-wrapper">
            <div className="mock-window-header">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="window-title">AI Processing Panel</span>
            </div>
            <div className="mock-window-body">
              <div className="processing-log">
                <p className="log-line green">
                  &gt; Ingesting study_guide_data_structures.pdf
                </p>
                <p className="log-line opacity-80">
                  &gt; Cleaned 12,482 text blocks
                </p>
                <p className="log-line cyan">
                  &gt; Chapter 1 detected: Arrays & Memory [O(1) lookups]
                </p>
                <p className="log-line cyan">
                  &gt; Chapter 2 detected: Dynamic Nodes [Linked Lists]
                </p>
                <p className="log-line purple">
                  &gt; AI model parsing conceptual summaries...
                </p>
                <p className="log-line success-flash">
                  &gt; Generating 15 chapter-wise questions [Easy, Med, Hard]
                </p>
              </div>
              <div className="visual-cards-stack">
                <div className="visual-card bg-purple">
                  <BrainCircuit className="card-ico" size={24} />
                  <div>
                    <h5>Multiple Choice</h5>
                    <p>Generated in 1.2s</p>
                  </div>
                </div>
                <div className="visual-card bg-cyan">
                  <Layers className="card-ico" size={24} />
                  <div>
                    <h5>Short Essay Evaluator</h5>
                    <p>Semantic scoring ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- REPUTATION BRAND BAR --- */}
      <section className="brand-bar">
        <p className="brand-title">
          TRUSTED BY STUDENTS AND EDUCATORS AT LEADING UNIVERSITIES
        </p>
        <div className="brand-logos">
          <span className="brand-logo-text">STANFORD</span>
          <span className="brand-logo-text">MIT</span>
          <span className="brand-logo-text">UC BERKELEY</span>
          <span className="brand-logo-text">OXFORD</span>
          <span className="brand-logo-text">HARVARD</span>
        </div>
      </section>

      {/* --- CALL TO ACTION PANEL --- */}
      <section className="cta-banner">
        <div className="cta-glow-ring"></div>
        <div className="cta-container">
          <h2>Elevate Your Study Experience Today</h2>
          <p>
            Instantly extract structures, assemble quiz questions, and study
            with our AI tutor.
          </p>
          <div className="cta-input-row">
            <input
              type="email"
              placeholder="Enter your email to start free"
              className="cta-input"
              id="cta-email-input"
            />
            <button
              className="btn-primary cta-btn"
              onClick={() => {
                if (!user) {
                  onOpenAuth("signup");
                } else {
                  alert(`You are already signed in as ${user.name}.`);
                }
              }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>
          <span className="cta-footnote">
            No credit card required. Free tier includes up to 5 large documents.
          </span>
        </div>
      </section>
    </div>
  );
}

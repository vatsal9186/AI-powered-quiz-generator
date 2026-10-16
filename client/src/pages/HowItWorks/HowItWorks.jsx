import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  BrainCircuit,
  Sliders,
  Zap,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileText,
  Layers,
  Cpu,
  Check,
  BarChart3,
  Clock
} from "lucide-react";
import "./HowItWorks.css";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  const stepsData = [
    {
      id: 1,
      number: "01",
      phase: "Phase 01 • Ingestion",
      title: "Upload Document",
      icon: <UploadCloud size={28} />,
      colorClass: "",
      desc: "Drag and drop your textbooks, slide presentations, or lecture notes. Our secure parsing engine extracts text, formulas, and structural layouts in seconds.",
      features: ["PDF, DOCX, PPTX, TXT", "Up to 50MB Files", "Fast Upload Mode"],
      preview: (
        <div className="hiw-preview-upload">
          <div className="hiw-upload-dropzone">
            <UploadCloud size={36} className="hiw-drop-icon" />
            <div className="hiw-drop-title">Drop your textbook or notes here</div>
            <div className="hiw-format-chips">
              <span className="hiw-chip active">PDF</span>
              <span className="hiw-chip">DOCX</span>
              <span className="hiw-chip">PPTX</span>
              <span className="hiw-chip">TXT</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      number: "02",
      phase: "Phase 02 • Intelligence",
      title: "AI Analyzes Content",
      icon: <BrainCircuit size={28} />,
      colorClass: "amber",
      desc: "Our neural AI engine scans document structure, identifies chapter boundaries, extracts core vocabulary, and organizes your material into a nested topic matrix.",
      features: ["Auto Module Detection", "Keyword Mapping", "Topic Clustering"],
      preview: (
        <div className="hiw-preview-matrix">
          <div className="hiw-matrix-header">
            <span>Detected Course Outline</span>
            <Sparkles size={14} />
          </div>
          <div className="hiw-tree-node">
            <Layers size={16} />
            <span>Module 1: Machine Learning Basics</span>
            <span className="hiw-node-badge">2 Chapters</span>
          </div>
          <div className="hiw-tree-node child">
            <FileText size={14} />
            <span>Chapter 1: Supervised Learning</span>
            <span className="hiw-node-badge">12 Topics</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      number: "03",
      phase: "Phase 03 • Personalization",
      title: "Customize Quiz",
      icon: <Sliders size={28} />,
      colorClass: "",
      desc: "Tailor your assessment by selecting targeted chapters, cognitive difficulty levels (Easy, Medium, Hard), question counts, and question formats.",
      features: ["Easy / Medium / Hard", "MCQ, Short Answer & Essay", "Targeted Chapters"],
      preview: (
        <div className="hiw-preview-custom">
          <div className="hiw-custom-row">
            <div className="hiw-custom-label">
              <span>Difficulty Level</span>
              <span style={{ color: "var(--accent-green)" }}>Medium</span>
            </div>
            <div className="hiw-diff-btns">
              <div className="hiw-diff-btn">Easy</div>
              <div className="hiw-diff-btn active">Medium</div>
              <div className="hiw-diff-btn">Hard</div>
            </div>
          </div>
          <div className="hiw-custom-row">
            <div className="hiw-custom-label">
              <span>Question Count</span>
              <span>15 Questions</span>
            </div>
            <div className="hiw-gen-bar-container">
              <div className="hiw-gen-bar-fill" style={{ width: "70%" }}></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      number: "04",
      phase: "Phase 04 • Generation",
      title: "Generate Quiz",
      icon: <Zap size={28} />,
      colorClass: "amber",
      desc: "With a single click, our AI constructs high-yield questions with detailed explanations, plausible distractor choices, and point weightings.",
      features: ["Sub-Second Creation", "AI Explanations", "Distractor Logic"],
      preview: (
        <div className="hiw-preview-gen">
          <div className="hiw-gen-sparkle-box">
            <Zap size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              Generating Quiz Assessment...
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Synthesizing 15 High-Yield Questions
            </div>
          </div>
          <div className="hiw-gen-bar-container">
            <div className="hiw-gen-bar-fill" style={{ width: "90%" }}></div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      number: "05",
      phase: "Phase 05 • Mastery",
      title: "Attempt Quiz & View Results",
      icon: <Trophy size={28} />,
      colorClass: "",
      desc: "Solve interactive timed quizzes, get immediate semantic feedback with answer notes, track your score graphs, and review weak subject areas.",
      features: ["Real-Time Scoring", "Semantic Feedback", "Weak Area Analytics"],
      preview: (
        <div className="hiw-preview-score">
          <div className="hiw-score-circle">94%</div>
          <div className="hiw-score-info">
            <h5>Quiz Mastered!</h5>
            <p>14 of 15 correct • 2m 45s time taken</p>
          </div>
        </div>
      )
    }
  ];

  const scrollToStep = (id) => {
    setActiveStep(id);
    const element = document.getElementById(`step-row-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="how-it-works-page">
      {/* Background Decor Gradients */}
      <div className="hiw-bg-orb hiw-orb-1"></div>
      <div className="hiw-bg-orb hiw-orb-2"></div>
      <div className="hiw-bg-orb hiw-orb-3"></div>

      <div className="hiw-container">
        {/* --- HEADER --- */}
        <header className="hiw-header">
          <div className="hiw-pill-badge">
            <Sparkles size={14} className="hiw-badge-icon" />
            <span>Interactive Learning Pipeline</span>
          </div>
          <h1 className="hiw-title">
            From Document to Mastery in <span className="hiw-title-gradient">5 Simple Steps</span>
          </h1>
          <p className="hiw-subtitle">
            Discover how QuestAI transforms raw study material into structured, adaptive quizzes and personalized study insights in seconds.
          </p>
        </header>

        {/* --- TOP STEPPER INDICATOR BAR (Desktop) --- */}
        <nav className="hiw-stepper-bar" aria-label="Step progress">
          <div className="hiw-stepper-track">
            <div
              className="hiw-stepper-track-progress"
              style={{ width: `${((activeStep - 1) / (stepsData.length - 1)) * 100}%` }}
            ></div>
          </div>
          {stepsData.map((s) => (
            <div
              key={s.id}
              className={`hiw-step-node ${activeStep === s.id ? "active" : ""}`}
              onClick={() => scrollToStep(s.id)}
            >
              <div className="hiw-node-num">{s.number}</div>
              <div className="hiw-node-label">{s.title}</div>
            </div>
          ))}
        </nav>

        {/* --- TIMELINE FLOW SECTION --- */}
        <section className="hiw-flow-section">
          {/* Animated Connecting Line */}
          <div className="hiw-flow-line">
            <div className="hiw-flow-line-glow"></div>
          </div>

          {stepsData.map((step, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <div
                key={step.id}
                id={`step-row-${step.id}`}
                className={`hiw-step-row ${isEven ? "reverse" : ""}`}
                onMouseEnter={() => setActiveStep(step.id)}
              >
                {/* Center Badge Node */}
                <div className="hiw-center-badge-wrapper">
                  <div className="hiw-center-badge">{step.number}</div>
                </div>

                {/* Left/Right Text Card */}
                <div className="hiw-card">
                  <div className="hiw-card-header">
                    <div className={`hiw-icon-container ${step.colorClass}`}>
                      {step.icon}
                    </div>
                    <span className="hiw-phase-tag">{step.phase}</span>
                  </div>
                  <h3 className="hiw-card-title">{step.title}</h3>
                  <p className="hiw-card-desc">{step.desc}</p>
                  <div className="hiw-feature-pills">
                    {step.features.map((feat, fIdx) => (
                      <span key={fIdx} className="hiw-pill">
                        <Check size={12} className="hiw-check-icon" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Graphic Visual Box */}
                <div className="hiw-visual-box">{step.preview}</div>
              </div>
            );
          })}
        </section>

        {/* --- ADVANTAGES SUMMARY GRID --- */}
        <section className="hiw-advantages-section">
          <h3 className="hiw-adv-title">Engineered for Academic Speed & Accuracy</h3>
          <div className="hiw-adv-grid">
            <div className="hiw-adv-card">
              <div className="hiw-adv-icon">
                <Cpu size={24} />
              </div>
              <h4>Sub-Second Processing</h4>
              <p>Converts 500+ page textbooks and slide decks into structured study modules in under 5 seconds.</p>
            </div>
            <div className="hiw-adv-card">
              <div className="hiw-adv-icon">
                <BrainCircuit size={24} />
              </div>
              <h4>Semantic AI Distractors</h4>
              <p>Generates plausible multiple-choice options with explanatory notes to test deep comprehension.</p>
            </div>
            <div className="hiw-adv-card">
              <div className="hiw-adv-icon">
                <BarChart3 size={24} />
              </div>
              <h4>Continuous Analytics</h4>
              <p>Tracks your score history, weak subject areas, and mastery growth across all study sessions.</p>
            </div>
          </div>
        </section>

        {/* --- CALL TO ACTION BANNER --- */}
        <section className="hiw-cta-section">
          <h2 className="hiw-cta-title">Ready to Create Your First AI Quiz?</h2>
          <p className="hiw-cta-desc">
            Upload your documents today and let QuestAI generate your personalized study companion in seconds.
          </p>
          <div className="hiw-cta-btns">
            <Link to="/dashboard" className="hiw-btn-primary">
              <span>Start Generating Quizzes</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="hiw-btn-secondary">
              <span>Explore Interactive Demo</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

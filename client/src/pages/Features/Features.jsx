import React from "react";
import { 
  Layers, 
  BrainCircuit, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";
import "../Home/Home.css";

export default function Features() {
  return (
    <div className="home-page" style={{ paddingBottom: "100px" }}>
      {/* Background Decor Gradients */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* --- FEATURES SECTION --- */}
      <section className="features-section" style={{ padding: "80px 24px" }}>
        <div className="section-header">
          <h2 className="section-title">Engineered for Advanced Learning</h2>
          <p className="section-subtitle">
            Say goodbye to manual study guides. Let our natural language engine
            extract logical units and compile performance assessments.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-purple">
              <Layers size={24} />
            </div>
            <h3>Chapter Detection System</h3>
            <p>
              Automatically segments massive documents (even textbooks exceeding
              1000 pages) into chapters, topics, and subtopics hierarchically.
            </p>
          </div>

          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-cyan">
              <BrainCircuit size={24} />
            </div>
            <h3>Adaptive Quiz Generator</h3>
            <p>
              Generates targeted assessments categorized into Easy (basic
              definitions), Medium (conceptual scenarios), and Hard
              (higher-order reasoning) difficulties.
            </p>
          </div>

          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-blue">
              <FileText size={24} />
            </div>
            <h3>Multi-Format Question Bank</h3>
            <p>
              Supports Multiple Choice (MCQs), True/False, Fill in the Blanks,
              Match the Following, and semantic Short Answer grading.
            </p>
          </div>

          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-green">
              <BarChart3 size={24} />
            </div>
            <h3>Intelligent Learning Analytics</h3>
            <p>
              Pinpoints precise topic weaknesses, calculates accuracy ratings,
              and suggests customized study schedules to address gaps.
            </p>
          </div>

          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-pink">
              <MessageSquare size={24} />
            </div>
            <h3>AI Study Companion Chat</h3>
            <p>
              Query your uploaded book directly inside the application. Ask for
              summaries, concept equations, or request detailed review paths.
            </p>
          </div>

          <div className="feature-card shimmer-card-glow">
            <div className="feature-icon-box box-orange">
              <ShieldCheck size={24} />
            </div>
            <h3>Academic Security Integrity</h3>
            <p>
              Validates question uniqueness to prevent duplicate patterns,
              exports print-ready PDFs, and protects testing parameters with JWT
              scopes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

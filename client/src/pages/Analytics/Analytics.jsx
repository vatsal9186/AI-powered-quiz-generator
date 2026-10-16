import React from "react";
import { TrendingUp, Award, Clock, BrainCircuit, AlertCircle, Award as Medal } from "lucide-react";
import "../Home/Home.css";

export default function Analytics() {
  // Get attempts and user from sessionStorage
  const attemptsData = sessionStorage.getItem("questai_attempts");
  const attempts = attemptsData ? JSON.parse(attemptsData) : [];
  const loggedInUser = sessionStorage.getItem("questai_user");
  const user = loggedInUser ? JSON.parse(loggedInUser) : null;

  // Verify if we have original test attempts
  const hasOriginalData = user && attempts.length > 0;

  // Sort attempts chronologically (most recent first) for display
  const displayAttempts = hasOriginalData
    ? [...attempts]
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 6) // Display up to 6 most recent attempts
    : [];

  const overallAccuracy = hasOriginalData
    ? Math.round(attempts.reduce((acc, att) => acc + att.score, 0) / attempts.length)
    : 0;

  // Calculate dynamic Grade
  let grade = "N/A";
  if (hasOriginalData) {
    if (overallAccuracy >= 90) grade = "A Average";
    else if (overallAccuracy >= 80) grade = "B+ Average";
    else if (overallAccuracy >= 70) grade = "B Average";
    else if (overallAccuracy >= 60) grade = "C+ Average";
    else if (overallAccuracy >= 50) grade = "C Average";
    else grade = "Needs Review";
  }

  // Dynamic AI Alert advice based on actual attempts
  let aiAdvice = "";
  if (!hasOriginalData) {
    aiAdvice = "Please log in and complete a quiz to generate performance alerts and study recommendations.";
  } else {
    // Find the attempt with the lowest score to give advice
    const weakestAttempt = [...attempts].reduce(
      (min, att) => (att.score < min.score ? att : min),
      attempts[0]
    );

    if (weakestAttempt.score < 70) {
      aiAdvice = `Your accuracy on "${weakestAttempt.quizTitle}" is weak (${weakestAttempt.score}%). We suggest starting an Easy quiz on this topic to improve mastery.`;
    } else {
      aiAdvice = `Great job! Your performance across all attempts is excellent (above 70% average). Keep taking quizzes to maintain your averages!`;
    }
  }

  return (
    <div className="home-page" style={{ paddingBottom: "100px" }}>
      {/* Background Decor Gradients */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* --- ANALYTICS SNEAK PEEK --- */}
      <section className="analytics-section" style={{ padding: "80px 24px" }}>
        <div className="analytics-container">
          <div className="analytics-text-col">
            <div className="badge-wrapper">
              <span className="hero-badge">
                <TrendingUp size={14} className="badge-icon" />
                Performance Intelligence
              </span>
            </div>
            <h2 className="analytics-title">
              Visualize Your Conceptual Blindspots
            </h2>
            <p className="analytics-desc">
              Don't guess what to revise. Our analytics dashboard maps your
              answers back to parent topics, compiling interactive radar logs
              and progress heat maps to guide you.
            </p>

            <ul className="analytics-list">
              <li>
                <div className="bullet-ico-box">
                  <Award size={18} />
                </div>
                <div>
                  <strong>Adaptive Difficulty Indexing</strong>
                  <p>
                    Tracks your accuracy threshold to dynamically serve harder
                    inquiries as you master base topics.
                  </p>
                </div>
              </li>
              <li>
                <div className="bullet-ico-box">
                  <Clock size={18} />
                </div>
                <div>
                  <strong>Temporal Speed Tracking</strong>
                  <p>
                    Records execution speed per question format to highlight
                    structural speed blocks during exams.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="analytics-card-col">
            <div className="analytics-mock-card">
              <div className="mock-card-header">
                <div>
                  <h4>Weekly Study Report</h4>
                  <p className="subtitle">
                    {hasOriginalData 
                      ? `Real Performance for ${user.name}` 
                      : "Topic-wise Concept Mastery (Original Data Only)"}
                  </p>
                </div>
                {hasOriginalData && (
                  <span className={`grade-pill ${overallAccuracy >= 70 ? "success" : "warning"}`}>
                    {grade}
                  </span>
                )}
              </div>

              {/* Graphical representation */}
              <div className="chart-grid">
                {/* Bar Graph */}
                <div className="chart-wrapper">
                  <span className="chart-title">Topic Strengths (Actual Tests)</span>
                  
                  {!hasOriginalData ? (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 20px",
                      textAlign: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px dashed rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "var(--text-secondary)"
                    }}>
                      <BrainCircuit size={40} style={{ marginBottom: "12px", opacity: 0.6 }} />
                      <h5 style={{ margin: 0, fontWeight: 600 }}>No Original Test Data</h5>
                      <p style={{ fontSize: "13px", marginTop: "6px", maxWidth: "250px" }}>
                        Please sign in and take quizzes in your dashboard to generate performance analytics.
                      </p>
                    </div>
                  ) : (
                    <div className="bar-chart">
                      {displayAttempts.map((attempt) => {
                        const isPassing = attempt.score >= 70;
                        const isExcellent = attempt.score >= 90;
                        
                        return (
                          <div key={attempt.id} className="chart-bar-row">
                            <span className="bar-label" title={attempt.quizTitle}>
                              {attempt.quizTitle}
                            </span>
                            <div className="bar-container">
                              <div
                                className="bar-fill"
                                style={{ 
                                  width: `${attempt.score}%`,
                                  backgroundColor: isExcellent ? "#00E676" : isPassing ? "#4285F4" : "#FF3860" 
                                }}
                              ></div>
                            </div>
                            <span className={`bar-value ${!isPassing ? "weak" : ""}`}>
                              {attempt.score}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accuracy Metrics */}
                <div className="metrics-side-panel">
                  <div className="metric-score-box">
                    <span className="score-val">
                      {hasOriginalData ? `${overallAccuracy}%` : "0%"}
                    </span>
                    <span className="score-lbl">Overall Accuracy</span>
                  </div>
                  <div className="ai-advice-bubble">
                    <span className="advice-badge">AI ALERT</span>
                    <p>{aiAdvice}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

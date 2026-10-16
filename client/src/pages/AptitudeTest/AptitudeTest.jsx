import React, { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Flag,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import "./AptitudeTest.css";

// Static mock questions database
const QUESTIONS = [
  {
    id: 1,
    category: "Quantitative Reasoning",
    question:
      "If a car travels at a speed of 60 km/h, how long does it take to travel a distance of 150 km?",
    options: ["1.5 hours", "2.0 hours", "2.5 hours", "3.0 hours"],
    correctIndex: 2,
    explanation:
      "Time is calculated by dividing Distance by Speed. Here, Distance = 150 km and Speed = 60 km/h. Therefore, Time = 150 / 60 = 2.5 hours.",
  },
  {
    id: 2,
    category: "Quantitative Reasoning",
    question:
      "What is the sum of the first 15 positive odd integers (1, 3, 5, ..., 29)?",
    options: ["120", "180", "225", "256"],
    correctIndex: 2,
    explanation:
      "The formula for the sum of the first 'n' positive odd integers is n². In this question, n = 15. Hence, Sum = 15² = 225.",
  },
  {
    id: 3,
    category: "Quantitative Reasoning",
    question:
      "A shirt is on sale for 20% off. The final sale price is $24. What was the original price of the shirt before the discount?",
    options: ["$28", "$30", "$32", "$36"],
    correctIndex: 1,
    explanation:
      "A 20% discount means the sale price is 80% of the original price. Let original price be 'X'. Thus, 0.8 * X = 24 => X = 24 / 0.8 = $30.",
  },
  {
    id: 4,
    category: "Logical Reasoning",
    question:
      "Determine the next number in the arithmetic/pattern sequence: 3, 6, 11, 18, 27, ...",
    options: ["36", "38", "40", "42"],
    correctIndex: 1,
    explanation:
      "Analyze the differences between successive terms: 6 - 3 = 3; 11 - 6 = 5; 18 - 11 = 7; 27 - 18 = 9. The differences are consecutive odd numbers (3, 5, 7, 9). The next odd number is 11. Therefore, the next term is 27 + 11 = 38.",
  },
  {
    id: 5,
    category: "Logical Reasoning",
    question:
      "Look closely at the number series: 72, 70, 66, 60, 52, ... What number should come next?",
    options: ["40", "42", "44", "46"],
    correctIndex: 1,
    explanation:
      "The pattern subtracts increasing even integers: 72 - 2 = 70; 70 - 4 = 66; 66 - 6 = 60; 60 - 8 = 52. The next value to subtract is 10. Thus, 52 - 10 = 42.",
  },
  {
    id: 6,
    category: "Logical Reasoning",
    question:
      "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Cousin", "Father"],
    correctIndex: 3,
    explanation:
      "Break it down logically: 'The only son of my mother' is Suresh himself (since Suresh is speaking). Therefore, the boy is Suresh's son. This makes Suresh the boy's Father.",
  },
  {
    id: 7,
    category: "Logical Reasoning",
    question:
      "If all glipglops are zumbas, and all zumbas are flimflams, is it logically true that all glipglops are flimflams?",
    options: [
      "Yes, always",
      "No, never",
      "Sometimes true",
      "Insufficient data to determine",
    ],
    correctIndex: 0,
    explanation:
      "According to syllogistic reasoning, if Set A (glipglops) is a subset of Set B (zumbas), and Set B is a subset of Set C (flimflams), then Set A must logically be a subset of Set C. Therefore, all glipglops are indeed flimflams.",
  },
  {
    id: 8,
    category: "Verbal Ability",
    question:
      "Which of the following words is most nearly the OPPOSITE in meaning to 'Candid'?",
    options: ["Sincere", "Bold", "Devious", "Playful"],
    correctIndex: 2,
    explanation:
      "'Candid' means truthful, open, frank, and straightforward. 'Devious' means deceitful, underhanded, and not straightforward, which is the direct opposite.",
  },
  {
    id: 9,
    category: "Verbal Ability",
    question:
      "Choose the option that best completes the analogy: 'Subtle is to Glaring' as:",
    options: [
      "Obvious is to Hidden",
      "Quiet is to Loud",
      "Soft is to Hard",
      "Weak is to Strong",
    ],
    correctIndex: 1,
    explanation:
      "'Subtle' and 'Glaring' are antonyms representing extremes in visibility/intensity. 'Quiet' and 'Loud' are antonyms representing extremes in sound/intensity, mirroring the same relationship.",
  },
  {
    id: 10,
    category: "Verbal Ability",
    question:
      "Identify the word or phrase containing a grammatical error: 'Neither the teacher nor the students was prepared for the sudden exam.'",
    options: ["Neither... nor", "the teacher", "was prepared", "prepared for"],
    correctIndex: 2,
    explanation:
      "Under subject-verb agreement rules for 'neither... nor' sentences, the verb agrees with the subject closest to it. Here, 'students' is plural, so 'was prepared' is incorrect and should be 'were prepared'.",
  },
];

// Static fallback questions helper that scales to requested number of questions and difficulty
const getFallbackQuestions = (targetCount, difficultyMode) => {
  const result = [];
  const basePool = [...QUESTIONS];
  
  // Extend pool dynamically if targetCount > QUESTIONS.length
  let i = 0;
  while (result.length < targetCount) {
    const original = basePool[i % basePool.length];
    const qCopy = { ...original, id: result.length + 1 };
    
    // Slight variation label for cloned items
    if (i >= basePool.length) {
      qCopy.question = `${qCopy.question} (Set ${Math.floor(i / basePool.length) + 1})`;
    }
    result.push(qCopy);
    i++;
  }
  return result;
};

export default function AptitudeTest({ user, onOpenAuth }) {
  const [testState, setTestState] = useState("config"); // config, running, results
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [numQuestions, setNumQuestions] = useState(15); // default to 15, range 15-30
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOptionIndex }
  const [flagged, setFlagged] = useState({}); // { [index]: boolean }
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins (900 seconds)
  const [expandedReviews, setExpandedReviews] = useState({}); // { [index]: boolean }
  const [timeTaken, setTimeTaken] = useState(0);
  const [questions, setQuestions] = useState(QUESTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tick timer while test is running
  useEffect(() => {
    let timer;
    if (testState === "running") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest(0); // force submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState]);

  const startTest = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth("signin");
      return;
    }

    setIsGenerating(true);
    
    // Determine timer duration based on difficulty and number of questions
    const secondsPerQuestion = difficulty === "easy" ? 90 : difficulty === "hard" ? 45 : 60;
    let baseSeconds = numQuestions * secondsPerQuestion;
    
    try {
      const apiBaseUrl = `http://${window.location.hostname}:8000`;
      const token = sessionStorage.getItem('questai_token');
      const headers = {
        'Accept': 'application/json',
      };
      if (token && token !== 'session_active') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `${apiBaseUrl}/api/quizzes/aptitude?difficulty=${difficulty}&num_questions=${numQuestions}`,
        {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('API response not ok');
      }
      
      const data = await response.json();
      if (data && data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        baseSeconds = data.questions.length * secondsPerQuestion;
        console.log("Loaded dynamic aptitude questions successfully.");
      } else {
        throw new Error('Invalid questions list');
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic aptitude questions. Falling back to dynamic local questions.", err);
      const fallbackList = getFallbackQuestions(numQuestions, difficulty);
      setQuestions(fallbackList);
      baseSeconds = fallbackList.length * secondsPerQuestion;
    } finally {
      setIsGenerating(false);
      setTimeLeft(baseSeconds);
      setAnswers({});
      setFlagged({});
      setCurrentIdx(0);
      setExpandedReviews({});
      setTestState("running");
    }
  };

  const submitTest = (overrideTimeLeft) => {
    const activeTimeLeft =
      overrideTimeLeft !== undefined ? overrideTimeLeft : timeLeft;
    
    const secondsPerQuestion = difficulty === "easy" ? 90 : difficulty === "hard" ? 45 : 60;
    const baseSeconds = questions.length * secondsPerQuestion;
    
    setTimeTaken(Math.max(0, baseSeconds - activeTimeLeft));
    setTestState("results");
  };

  const selectOption = (optIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIndex,
    }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx],
    }));
  };

  const clearResponse = () => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentIdx];
      return updated;
    });
  };

  const toggleReviewExpand = (idx) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Helper formats
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreDetails = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns === undefined) {
        unanswered++;
      } else if (userAns === q.correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const scorePct = Math.round((correct / questions.length) * 100);
    return { correct, incorrect, unanswered, scorePct };
  };

  const scoreDetails = getScoreDetails();
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.keys(flagged).filter((k) => flagged[k]).length;
  const remainingCount = questions.length - answeredCount;

  return (
    <div className="aptitude-page">
      {/* 1. INTRO / SETTINGS CONFIG STATE */}
      {testState === "config" && (
        <div className="aptitude-intro-container">
          <div className="aptitude-intro-header">
            <h1>General Aptitude Challenge</h1>
            <p>
              Assess and sharpen your verbal reasoning, logical evaluation, and
              mathematical analysis skills with our standard mock test.
            </p>
          </div>

          <div className="aptitude-config-grid">
            <div className="aptitude-card">
              <h2 className="config-section-title">
                <BookOpen size={20} className="text-green" />
                Guidelines
              </h2>
              <div className="rules-list">
                <div className="rule-item">
                  <div className="rule-icon-wrapper">
                    <Brain size={16} />
                  </div>
                  <p>
                    <strong>Balanced Focus:</strong> Test covers 3 domains
                    (Quantitative Analysis, Logical Deduction, and Verbal
                    Mechanics).
                  </p>
                </div>
                <div className="rule-item">
                  <div className="rule-icon-wrapper">
                    <Clock size={16} />
                  </div>
                  <p>
                    <strong>Timed Environment:</strong> The test runs with an
                    active countdown. Submitting or running out of time shows
                    results instantly.
                  </p>
                </div>
                <div className="rule-item">
                  <div className="rule-icon-wrapper">
                    <Flag size={16} />
                  </div>
                  <p>
                    <strong>Review Feature:</strong> Flag complex questions to
                    review them later using the Question Palette sidebar.
                  </p>
                </div>
              </div>
            </div>

            <div className="aptitude-card">
              <h2 className="config-section-title">
                <Sparkles size={20} className="text-amber" />
                Configure Test
              </h2>

              <div className="settings-group">
                <label>Select Difficulty</label>
                <div className="difficulty-options">
                  <button
                    className={`difficulty-btn ${difficulty === "easy" ? "active diff-easy" : ""}`}
                    onClick={() => setDifficulty("easy")}
                  >
                    Easy
                  </button>
                  <button
                    className={`difficulty-btn ${difficulty === "medium" ? "active diff-medium" : ""}`}
                    onClick={() => setDifficulty("medium")}
                  >
                    Medium
                  </button>
                  <button
                    className={`difficulty-btn ${difficulty === "hard" ? "active diff-hard" : ""}`}
                    onClick={() => setDifficulty("hard")}
                  >
                    Hard
                  </button>
                </div>
              </div>

              <div className="settings-group" style={{ marginTop: '1.25rem' }}>
                <label>Number of Questions</label>
                <div className="difficulty-options">
                  {[15, 20, 25, 30].map((num) => (
                    <button
                      key={num}
                      className={`difficulty-btn ${numQuestions === num ? "active diff-medium" : ""}`}
                      onClick={() => setNumQuestions(num)}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="meta-info-strip">
                <div className="meta-info-item">
                  <span className="meta-info-label">Questions</span>
                  <span className="meta-info-value">{numQuestions}</span>
                </div>
                <div className="meta-info-item">
                  <span className="meta-info-label">Max Score</span>
                  <span className="meta-info-value">
                    {numQuestions * 10} pts
                  </span>
                </div>
                <div className="meta-info-item">
                  <span className="meta-info-label">Duration</span>
                  <span className="meta-info-value">
                    {Math.round((numQuestions * (difficulty === "easy" ? 90 : difficulty === "hard" ? 45 : 60)) / 60)} Mins
                  </span>
                </div>
              </div>

              <button className="btn-start-test" onClick={startTest} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles size={18} style={{ marginRight: '8px' }} />
                    Generating Questions with AI...
                  </>
                ) : (
                  <>
                    <Play size={18} fill="#000" />
                    Begin Aptitude Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE TEST RUNNING STATE */}
      {testState === "running" && (
        <div className="test-running-container">
          <div className="test-active-header">
            <div className="test-title-section">
              <h2>QuestAI Aptitude Challenge</h2>
              <span className={`difficulty-badge ${difficulty}`}>
                {difficulty} mode
              </span>
            </div>

            <div
              className={`test-timer-wrapper ${timeLeft < 180 ? "warning" : ""}`}
            >
              <Clock size={20} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="test-progress-bar-container">
            <div
              className="test-progress-bar-fill"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="test-main-grid">
            {/* Active Question Panel */}
            <div className="aptitude-card">
              <div className="question-header">
                <span className="question-category">
                  {questions[currentIdx]?.category}
                </span>
                <span className="question-points">
                  Question {currentIdx + 1} of {questions.length} (+10 pts)
                </span>
              </div>

              <div className="question-text">
                {questions[currentIdx]?.question}
              </div>

              <div className="mcq-options-container">
                {questions[currentIdx]?.options.map((option, oIdx) => {
                  const letter = ["A", "B", "C", "D"][oIdx];
                  const isSelected = answers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      className={`mcq-option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => selectOption(oIdx)}
                    >
                      <span className="option-badge">{letter}</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              <div className="active-test-footer">
                <button
                  className="btn-secondary-action"
                  onClick={clearResponse}
                  disabled={answers[currentIdx] === undefined}
                >
                  <X size={15} />
                  Clear Response
                </button>

                <div className="footer-nav-buttons">
                  <button
                    className="btn-secondary-action"
                    onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                    disabled={currentIdx === 0}
                  >
                    <ArrowLeft size={16} />
                    Prev
                  </button>

                  <button
                    className={`btn-secondary-action ${flagged[currentIdx] ? "flagged" : ""}`}
                    onClick={toggleFlag}
                  >
                    <Flag
                      size={16}
                      fill={flagged[currentIdx] ? "currentColor" : "none"}
                    />
                    {flagged[currentIdx] ? "Flagged" : "Flag"}
                  </button>

                  <button
                    className="btn-secondary-action"
                    onClick={() =>
                      setCurrentIdx((p) =>
                        Math.min(questions.length - 1, p + 1),
                      )
                    }
                    disabled={currentIdx === questions.length - 1}
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Palette Column */}
            <div className="aptitude-card">
              <h3 className="sidebar-panel-title">Question Palette</h3>

              <div className="palette-stats">
                <div className="stat-box">
                  <span className="stat-value answered">{answeredCount}</span>
                  <span className="stat-label">Done</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value flagged">{flaggedCount}</span>
                  <span className="stat-label">Review</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value remaining">{remainingCount}</span>
                  <span className="stat-label">Left</span>
                </div>
              </div>

              <div className="question-grid">
                {questions.map((_, idx) => {
                  const isCur = idx === currentIdx;
                  const isAns = answers[idx] !== undefined;
                  const isFlag = flagged[idx];

                  let btnClass = "";
                  if (isAns) btnClass += " answered";
                  if (isFlag) btnClass += " flagged";
                  if (isCur) btnClass += " active";

                  return (
                    <button
                      key={idx}
                      className={`palette-btn${btnClass}`}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn-submit-test"
                onClick={() => submitTest(timeLeft)}
              >
                <CheckCircle size={18} fill="#000" />
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEST RESULTS & DETAILED REVIEW STATE */}
      {testState === "results" && (
        <div className="test-results-container">
          <div className="result-header">
            <h1>Test Results</h1>
            <p>Review your analytical metrics and question breakdowns below.</p>
          </div>

          <div className="aptitude-card score-stats-grid">
            <div className="score-ring-wrapper">
              <svg className="score-ring-svg">
                <circle className="score-ring-bg" cx="90" cy="90" r="75" />
                <circle
                  className={`score-ring-fill ${
                    scoreDetails.scorePct >= 70
                      ? "success"
                      : scoreDetails.scorePct >= 40
                        ? "warning"
                        : "danger"
                  }`}
                  cx="90"
                  cy="90"
                  r="75"
                  strokeDasharray={`${2 * Math.PI * 75}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 75 * (1 - scoreDetails.scorePct / 100)
                  }`}
                />
              </svg>
              <div className="score-ring-text">
                <span className="score-percentage">
                  {scoreDetails.scorePct}%
                </span>
                <span className="score-fraction">
                  {scoreDetails.correct} / {questions.length} Correct
                </span>
              </div>
              <span
                className={`score-ring-label ${
                  scoreDetails.scorePct >= 70
                    ? "success"
                    : scoreDetails.scorePct >= 40
                      ? "warning"
                      : "danger"
                }`}
              >
                {scoreDetails.scorePct >= 70
                  ? "Distinction"
                  : scoreDetails.scorePct >= 40
                    ? "Passed"
                    : "Fail"}
              </span>
            </div>

            <div className="metrics-detailed-grid">
              <div className="metric-card">
                <div className="metric-icon-box correct">
                  <CheckCircle size={20} />
                </div>
                <div className="metric-meta">
                  <h4>Correct Answers</h4>
                  <p>{scoreDetails.correct}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box incorrect">
                  <X size={20} />
                </div>
                <div className="metric-meta">
                  <h4>Incorrect Answers</h4>
                  <p>{scoreDetails.incorrect}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box time">
                  <Clock size={20} />
                </div>
                <div className="metric-meta">
                  <h4>Time Taken</h4>
                  <p>{formatTime(timeTaken)}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-box accuracy">
                  <TrendingUp size={20} />
                </div>
                <div className="metric-meta">
                  <h4>Total Score</h4>
                  <p>
                    {scoreDetails.correct * 10} / {questions.length * 10}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn-primary-glow" onClick={startTest}>
              <RotateCcw size={16} />
              Retake Test
            </button>
            <button
              className="btn-outline-glow"
              onClick={() => setTestState("config")}
            >
              Back to Home
            </button>
          </div>

          {/* Question Breakdown Accordion */}
          <div className="aptitude-card">
            <h2 className="review-section-title">Question Breakdown</h2>
            <div className="review-list">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.correctIndex;
                const isExpanded = !!expandedReviews[idx];

                let statusClass = "skipped";
                let statusLabel = "Skipped";
                if (userAns !== undefined) {
                  statusClass = isCorrect ? "correct" : "incorrect";
                  statusLabel = isCorrect ? "Correct" : "Incorrect";
                }

                return (
                  <div
                    key={idx}
                    className={`review-item ${isExpanded ? "expanded" : ""}`}
                  >
                    <div
                      className="review-header-summary"
                      onClick={() => toggleReviewExpand(idx)}
                    >
                      <div className="review-summary-left">
                        <span className="question-num-badge">Q{idx + 1}</span>
                        <span className={`review-status-badge ${statusClass}`}>
                          {statusLabel}
                        </span>
                        <span className="review-question-preview">
                          {q.question}
                        </span>
                      </div>
                      <div className="review-chevron-icon">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="review-body-details">
                        <div className="review-question-full">{q.question}</div>

                        <div className="review-options-grid">
                          {q.options.map((option, oIdx) => {
                            const isCorrectOpt = oIdx === q.correctIndex;
                            const isUserOpt = oIdx === userAns;

                            let optClass = "";
                            if (isCorrectOpt) optClass += " correct-answer";
                            if (isUserOpt && !isCorrectOpt)
                              optClass += " user-selected";

                            return (
                              <div
                                key={oIdx}
                                className={`review-option-card${optClass}`}
                              >
                                <span
                                  style={{
                                    marginRight: "8px",
                                    fontWeight: "700",
                                  }}
                                >
                                  {["A", "B", "C", "D"][oIdx]}.
                                </span>
                                <span>{option}</span>

                                {isUserOpt && (
                                  <span
                                    className={`review-badge-indicator ${isCorrect ? "correct" : "user"}`}
                                  >
                                    {isCorrect ? "Your Match" : "Your Choice"}
                                  </span>
                                )}
                                {isCorrectOpt && !isUserOpt && (
                                  <span className="review-badge-indicator correct">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="review-explanation-box">
                          <h4 className="explanation-title">
                            <Brain size={14} />
                            Explanation Solution
                          </h4>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

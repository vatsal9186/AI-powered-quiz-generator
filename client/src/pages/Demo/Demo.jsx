import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  BrainCircuit,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Award,
} from "lucide-react";
import "../Home/Home.css";
import "./Demo.css";
import { apiBaseUrl } from "../../utils/api.js";

export default function Demo({ user, onOpenAuth }) {
  // --- Upload / Layout States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [analyzedDoc, setAnalyzedDoc] = useState(null); // Backend parsed hierarchy
  const [selectedChapters, setSelectedChapters] = useState([]);

  // --- Quiz Generator Parameters ---
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [genQuestions, setGenQuestions] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);

  // --- Active Quiz Practice Play States ---
  const [questions, setQuestions] = useState([]); // Dynamic questions loaded from backend
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [quizTimer, setQuizTimer] = useState(600); // 10 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradedResult, setGradedResult] = useState(null);
  const [timeUpMessage, setTimeUpMessage] = useState("");
  const [activeQuizId, setActiveQuizId] = useState(null);

  // --- Chat Assistant States ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello! Welcome to the QuestAI interactive sandbox. Upload a file, and I will scan its pages, slice its chapters, and tutor you right here!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer((prev) => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && timerActive) {
      setTimerActive(false);
      handleTimeUpAutoSubmit();
    }
    return () => clearInterval(interval);
  }, [timerActive, quizTimer]);

  const formatTimer = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getDropdownOptions = () => {
    if (!analyzedDoc) return [];
    const options = [];
    if (analyzedDoc.structure) {
      analyzedDoc.structure.forEach((mod) => {
        if (mod.chapters && mod.chapters.length > 0) {
          mod.chapters.forEach((chap) => {
            if (chap.title) {
              options.push(chap.title);
            }
          });
        }
      });
    }
    if (options.length === 0) {
      for (let i = 1; i <= 10; i++) {
        options.push(`Chapter ${i}`);
      }
    }
    return options;
  };

  const dropdownOptions = getDropdownOptions();

  const pollDocumentStatus = (docId) => {
    setUploading(true);
    setUploadProgress(0);
    setProcessingStage("Uploading document to backend...");

    const uploadStartTime = Date.now();
    let currentProgress = 0;
    let targetProgress = 25;
    let backendReady = false;
    let updatedDocPayload = null;

    const progressInterval = setInterval(() => {
      if (currentProgress < targetProgress) {
        currentProgress += 1;
        setUploadProgress(currentProgress);
      } else if (currentProgress >= 95 && !backendReady) {
        // Hold at 95% until backend signals "ready"
      } else if (backendReady) {
        const elapsed = Date.now() - uploadStartTime;
        if (elapsed >= 3500) {
          currentProgress = 100;
          setUploadProgress(100);
          clearInterval(progressInterval);
          finishUpload(updatedDocPayload);
        } else {
          currentProgress = Math.min(100, currentProgress + 2);
          setUploadProgress(currentProgress);
          if (currentProgress === 100) {
            clearInterval(progressInterval);
            finishUpload(updatedDocPayload);
          }
        }
      }
    }, 80);

    const finishUpload = (updatedDoc) => {
      setAnalyzedDoc(updatedDoc);
      setUploading(false);
      setProcessingStage("Document successfully parsed and structured!");

      let firstChapter = "";
      if (updatedDoc.structure && updatedDoc.structure.length > 0) {
        const firstMod = updatedDoc.structure[0];
        if (firstMod.chapters && firstMod.chapters.length > 0) {
          firstChapter = firstMod.chapters[0].title;
        }
      }
      if (!firstChapter) {
        firstChapter = "Chapter 1";
      }
      setSelectedChapters([firstChapter]);

      setChatMessages([
        {
          sender: "ai",
          text: `Awesome! I've scanned the document "${updatedDoc.title}" and mapped its outline. Select a chapter from the dropdown to start a practice quiz!`,
        },
      ]);
    };

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/documents/${docId}`);
        if (!res.ok) {
          clearInterval(interval);
          clearInterval(progressInterval);
          setUploading(false);
          return;
        }
        const updatedDoc = await res.json();
        updatedDocPayload = updatedDoc;

        if (updatedDoc.status === "ready") {
          clearInterval(interval);
          backendReady = true;
          targetProgress = 100;
        } else if (updatedDoc.status === "failed") {
          clearInterval(interval);
          clearInterval(progressInterval);
          setUploading(false);
          setErrorMsg(updatedDoc.error_message || "Document processing failed.");
        } else {
          if (updatedDoc.status === "processing") {
            targetProgress = 35;
            setProcessingStage("Document uploaded, starting extraction...");
          } else if (updatedDoc.status === "extracting") {
            targetProgress = 55;
            setProcessingStage("Extracting text grids and parsing layouts...");
          } else if (updatedDoc.status === "detecting") {
            targetProgress = 80;
            setProcessingStage("Analyzing document hierarchy with AI model...");
          }
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 1200);
  };

  const handleUploadFile = async (file) => {
    if (!user) {
      setShowAuthWarning(true);
      return;
    }

    const filename = file.name;
    const ext = filename.toLowerCase().split(".").pop();
    const supported = ["pdf", "doc", "docx", "ppt", "pptx"];

    if (!supported.includes(ext)) {
      setErrorMsg(
        "Unsupported file type. Only PDF, PPT, PPTX, DOC, and DOCX files are supported."
      );
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg("File size exceeds 100 MB. Please select a smaller file.");
      return;
    }

    const token =
      sessionStorage.getItem("questai_token") ||
      localStorage.getItem("questai_token") ||
      (sessionStorage.getItem("questai_user") ? "session_active" : null);
    if (!token) return;

    setErrorMsg("");
    setSelectedFile(filename);
    setQuizGenerated(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBaseUrl}/api/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            "Failed to analyze document."
        );
      }

      const docData = await res.json();
      setAnalyzedDoc(docData);
      pollDocumentStatus(docData.id);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred during file analysis.");
      setSelectedFile(null);
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileBrowseChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleGeneratePracticeQuiz = async () => {
    if (!analyzedDoc) return;
    if (selectedChapters.length === 0) {
      setErrorMsg("Please select at least one chapter or module.");
      return;
    }

    const token =
      sessionStorage.getItem("questai_token") ||
      localStorage.getItem("questai_token") ||
      (sessionStorage.getItem("questai_user") ? "session_active" : null);
    if (!token) return;

    setIsGenerating(true);
    setErrorMsg("");
    setGradedResult(null);
    setTimeUpMessage("");
    setSelectedAnswers({});

    try {
      const res = await fetch(`${apiBaseUrl}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_id: analyzedDoc.id,
          selected_chapters: selectedChapters,
          difficulty: genDifficulty,
          num_questions: Number(genQuestions),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate quiz.");
      }

      const quizData = await res.json();

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiBaseUrl}/api/quizzes/${quizData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!statusRes.ok) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            throw new Error("Failed to check quiz generation status.");
          }

          const updatedQuiz = await statusRes.json();

          if (updatedQuiz.status === "completed") {
            clearInterval(pollInterval);

            const practiceRes = await fetch(
              `${apiBaseUrl}/api/quizzes/${quizData.id}?mode=practice`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (!practiceRes.ok) {
              setIsGenerating(false);
              throw new Error("Failed to load practice questions details.");
            }

            const practiceData = await practiceRes.json();
            setQuestions(practiceData.questions);
            setActiveQuizId(practiceData.id || quizData.id);

            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setIsAnswerChecked(false);
            setIsCorrect(null);
            setQuizTimer(practiceData.questions.length * 60);
            setTimerActive(true);
            setQuizGenerated(true);
            setIsGenerating(false);
          } else if (updatedQuiz.status === "failed") {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setErrorMsg(updatedQuiz.error_message || "Quiz generation failed.");
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setErrorMsg(pollErr.message || "An error occurred checking quiz status.");
        }
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || "Failed to generate AI questions.");
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionId) => {
    if (isAnswerChecked) return;
    setSelectedOption(optionId);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleCheckAnswer = () => {
    if (isAnswerChecked || selectedOption === null || !currentQuestion) return;

    const opt = currentQuestion.options.find((o) => o.id === selectedOption);
    const correct = opt ? opt.is_correct : false;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = questions[nextIdx];
      if (selectedAnswers[nextQ.id] !== undefined) {
        setSelectedOption(selectedAnswers[nextQ.id]);
      }
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const handleSubmitQuiz = async (isAuto = false) => {
    if (questions.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const totalTimeAllocated = questions.length * 60;
    const timeSpent = Math.max(1, totalTimeAllocated - quizTimer);

    const submissionPayload = {
      time_spent: timeSpent,
      answers: questions.map(q => ({
        question_id: q.id,
        selected_option_id: selectedAnswers[q.id] || null
      })).filter(a => a.selected_option_id !== null)
    };

    const token =
      sessionStorage.getItem("questai_token") ||
      localStorage.getItem("questai_token") ||
      (sessionStorage.getItem("questai_user") ? "session_active" : null);

    try {
      const targetQuizId = activeQuizId || (questions && questions[0] && questions[0].quiz_id);
      const res = await fetch(`${apiBaseUrl}/api/quizzes/${targetQuizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submissionPayload)
      });

      if (!res.ok) {
        throw new Error("Failed to submit and grade quiz.");
      }

      const result = await res.json();
      setGradedResult(result);
      setTimerActive(false);

      if (isAuto) {
        setTimeUpMessage("Time's up! Your remaining questions have been automatically submitted. Check your score below!");
      }

      const historyRes = await fetch(`${apiBaseUrl}/api/quizzes/attempts/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        sessionStorage.setItem("questai_attempts", JSON.stringify(historyData));
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUpAutoSubmit = async () => {
    setTimeUpMessage("Time's up! Your progress has been automatically saved and submitted to Analytics.");
    await handleSubmitQuiz(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setAiTyping(true);

    setTimeout(() => {
      let reply = `That's an interesting question! Based on your uploaded document "${analyzedDoc ? analyzedDoc.title : "Syllabus"}", this topic is covered in your selected chapters. Try attempting the generated quiz parameters to practice this directly!`;
      const lower = userMsg.toLowerCase();

      if (lower.includes("linked list") || lower.includes("linkedlist")) {
        reply =
          "A Linked List is a linear data structure where elements are not stored in contiguous memory locations. Instead, each element (node) points to the next node via a pointer. Insertion and deletion are O(1) if the position is known, but indexing is O(n).";
      } else if (lower.includes("array")) {
        reply =
          "An Array is a collection of elements stored at contiguous memory locations. It allows direct, random access using an index in O(1) constant time, but insertion and deletion can be slow (O(n)) because elements must be shifted.";
      } else if (lower.includes("stack") && lower.includes("queue")) {
        reply =
          "The key difference is the ordering: a Stack uses LIFO (Last-In-First-Out), adding and removing items from the top. A Queue uses FIFO (First-In-First-Out), adding items at the tail and removing from the head.";
      } else if (lower.includes("complexity") || lower.includes("big o")) {
        reply =
          "Big O notation describes the upper bound of execution time or space requirements of an algorithm. For example, array lookups are O(1), linear search is O(n), and binary search is O(log n).";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setAiTyping(false);
    }, 1200);
  };

  return (
    <div className="demo-page-container">
      {/* Background Decor Orbs */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* Header Section */}
      <header className="demo-header-section">
        <span className="demo-hero-badge">
          <Sparkles size={14} /> Interactive Sandbox
        </span>
        <h1 className="demo-page-title">AI Sandbox Playground</h1>
        <p className="demo-page-subtitle">
          Upload your actual files, map layout nodes, select custom chapters,
          and challenge yourself with immediate AI-generated grading.
        </p>
      </header>

      {/* Alert Banner */}
      {errorMsg && (
        <div className="demo-alert-banner animate-fade-in">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Interactive Dual-Column Panel */}
      <main className="demo-main-panel">
        {/* Left Column: Control Settings */}
        <div className="demo-control-col">
          <div className="demo-step-header">
            <div className="demo-step-icon-wrap">
              <FileText size={18} />
            </div>
            <h3 className="demo-step-title">1. Document Settings</h3>
          </div>
          <p className="demo-step-text">
            Upload a PDF, Word DOCX, or PowerPoint PPTX. Select specific chapters to run immediate tests.
          </p>

          {uploading ? (
            <div className="upload-progress-box animate-fade-in">
              <div className="progress-text-row">
                <span className="stage-info">
                  <BrainCircuit size={15} style={{ animation: "rotate-loader 2s linear infinite" }} /> {processingStage}
                </span>
                <span className="percentage-info">{uploadProgress}%</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : analyzedDoc ? (
            <div className="demo-config-box animate-fade-in">
              <div className="config-box-header">
                <h4>Select Chapter:</h4>
                <span className="badge-selected-count">
                  {selectedChapters.length > 0 ? "1 Selected" : "0 Selected"}
                </span>
              </div>

              <div className="field-group">
                <select
                  className="styled-select"
                  value={selectedChapters[0] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedChapters(val ? [val] : []);
                  }}
                >
                  <option value="">-- Choose a Chapter --</option>
                  {dropdownOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="two-col-fields">
                <div className="field-group">
                  <label className="field-label">Difficulty</label>
                  <select
                    className="styled-select"
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Questions</label>
                  <select
                    className="styled-select"
                    value={genQuestions}
                    onChange={(e) => setGenQuestions(parseInt(e.target.value))}
                  >
                    <option value={15}>15 Qs</option>
                    <option value={20}>20 Qs</option>
                    <option value={25}>25 Qs</option>
                    <option value={30}>30 Qs</option>
                  </select>
                </div>
              </div>

              <div className="config-actions-row">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => {
                    setAnalyzedDoc(null);
                    setSelectedChapters([]);
                  }}
                >
                  Reset File
                </button>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleGeneratePracticeQuiz}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Compiling..." : "Generate Test"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="demo-upload-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                if (!user) setShowAuthWarning(true);
              }}
            >
              <div className="upload-icon-circle">
                <Upload size={26} />
              </div>
              <p className="drag-title">Drag & Drop Document Here</p>
              <p className="drag-support">
                Supports PDF, PPT/PPTX, DOC/DOCX (Max 10MB)
              </p>
              <div className="drag-divider-row">
                <div className="drag-divider-line"></div>
                <span className="drag-divider-text">OR</span>
                <div className="drag-divider-line"></div>
              </div>
              <label
                className="demo-browse-btn"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setShowAuthWarning(true);
                  }
                }}
              >
                <BookOpen size={15} /> Browse Files
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileBrowseChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Quiz Workspace */}
        <div className="demo-workspace-col" id="demo-workspace">
          <div className="mock-window-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <span className="window-title">
              <FileText size={14} /> Workspace: {selectedFile || "Interactive_Playground.pdf"}
            </span>
          </div>

          {!quizGenerated && !isGenerating ? (
            <div className="workspace-empty-state animate-fade-in">
              <div className="empty-icon-wrapper">
                <BrainCircuit size={46} />
              </div>
              <h3>Practice Quiz Area</h3>
              <p>
                Upload your PDF/PPTX/DOCX document on the left, select custom chapters,
                and click generate to populate practice questions.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="workspace-loading-state animate-fade-in">
              <div className="pulsing-circle-loader">
                <BrainCircuit size={36} style={{ color: "var(--accent-green)" }} />
              </div>
              <h3>AI Quiz compilation...</h3>
              <p>
                Reading chapter segments, mapping semantic relations, and verifying question options.
              </p>
            </div>
          ) : gradedResult ? (
            <div className="workspace-results-area animate-fade-in">
              <div className="results-summary-card">
                <Award size={48} style={{ color: "var(--accent-amber)", marginBottom: "8px" }} />
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                  Quiz Completed!
                </h2>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 16px 0", fontSize: "0.9rem" }}>
                  Here is your performance summary for the practice session.
                </p>

                <div className={`score-circle-ring ${gradedResult.score >= 70 ? "passed" : "failed"}`}>
                  {gradedResult.score}%
                </div>

                <div style={{ marginTop: "10px" }}>
                  <span className={`status-pill-badge ${gradedResult.score >= 70 ? "passed" : "failed"}`}>
                    {gradedResult.score >= 70 ? "PASSED" : "NEEDS REVIEW"}
                  </span>
                </div>

                <p style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Completed in {Math.floor(gradedResult.time_spent / 60)}m {gradedResult.time_spent % 60}s
                </p>
              </div>

              <div className="results-actions-row">
                <button
                  className="btn-primary-action"
                  onClick={() => {
                    setQuizGenerated(false);
                    setGradedResult(null);
                    setQuestions([]);
                    setSelectedAnswers({});
                  }}
                >
                  Take Another Quiz
                </button>
                <Link
                  to="/analytics"
                  className="btn-secondary-action"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  View Analytics Report
                </Link>
              </div>
            </div>
          ) : (
            <div className="workspace-quiz-area animate-fade-in">
              <div className="quiz-top-meta-bar">
                <div className="chapter-tag-pill">
                  <BookOpen size={14} />
                  <span>Practice: {selectedChapters.slice(0, 2).join(", ")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="practice-mode-badge">
                    {genDifficulty.toUpperCase()} MODE
                  </span>
                  <div className="quiz-timer-box">
                    <Clock size={14} style={{ color: quizTimer < 120 ? "var(--error)" : "var(--accent-green)" }} />
                    <span
                      className="timer-countdown"
                      style={{ color: quizTimer < 120 ? "var(--error)" : "var(--text-primary)" }}
                    >
                      {formatTimer(quizTimer)}
                    </span>
                  </div>
                </div>
              </div>

              {timeUpMessage && (
                <div className="explanation-card warning-border animate-scale-up">
                  <div className="explanation-title-row">
                    <span className="grade-pill error">
                      <AlertTriangle size={14} /> Time Completed
                    </span>
                  </div>
                  <p className="explanation-body">{timeUpMessage}</p>
                </div>
              )}

              {currentQuestion && (
                <div className="question-panel">
                  <div className="question-heading-row">
                    <span className="q-number-pill">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>

                  <p className="question-text">{currentQuestion.question_text}</p>

                  <div className="options-list">
                    {currentQuestion.options.map((option, idx) => {
                      let btnClass = "option-card";
                      const isSelected = selectedOption === option.id;

                      if (isSelected) btnClass += " selected";

                      if (isAnswerChecked) {
                        if (option.is_correct) {
                          btnClass += " correct";
                        } else if (isSelected) {
                          btnClass += " incorrect";
                        } else {
                          btnClass += " disabled";
                        }
                      }

                      return (
                        <button
                          key={option.id}
                          className={btnClass}
                          onClick={() => !isAnswerChecked && handleSelectOption(option.id)}
                          disabled={isAnswerChecked}
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="option-text">{option.option_text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerChecked && (
                    <div className={`explanation-card ${isCorrect ? "success-border" : "warning-border"} animate-scale-up`}>
                      <div className="explanation-title-row">
                        {isCorrect ? (
                          <span className="grade-pill success">
                            <CheckCircle2 size={14} /> Correct Answer
                          </span>
                        ) : (
                          <span className="grade-pill error">
                            <AlertTriangle size={14} /> Incorrect
                          </span>
                        )}
                      </div>
                      <p className="explanation-body">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <div className="question-actions-row">
                    <button
                      className="btn-outline-glow"
                      onClick={handleCheckAnswer}
                      disabled={isAnswerChecked || selectedOption === null}
                    >
                      Submit Answer
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                      <button className="btn-next" onClick={handleNextQuestion}>
                        Next Question <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="btn-next"
                        onClick={() => handleSubmitQuiz(false)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Quiz"} <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Integrated Study Assistant (Chatbot) */}
      <section className="assistant-section">
        <div className="assistant-grid">
          <div className="assistant-chat-col">
            <div className="chat-window">
              <div className="chat-header">
                <div className="chat-avatar">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4>QuestAI Study Companion</h4>
                  <span className="chat-status">
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block" }}></span>
                    Online &bull; Read: {selectedFile || "No Active Document"}
                  </span>
                </div>
              </div>

              <div className="chat-messages-container">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                    <div className="chat-bubble">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="chat-bubble-wrapper ai">
                    <div className="chat-bubble typing-bubble">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
              </div>

              <form className="chat-input-bar" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Ask a question about the study guides..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={aiTyping}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!chatInput.trim() || aiTyping}
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          <div className="assistant-text-col">
            <span className="demo-hero-badge" style={{ alignSelf: "flex-start" }}>
              <MessageSquare size={14} /> Contextual Chat Integration
            </span>
            <h2 className="assistant-title">Your 24/7 Personal Study Tutor</h2>
            <p className="assistant-desc">
              Have doubts while resolving questions? Chat directly with the AI referencing your specific document. Ask to explain equations, request detailed code examples, or define complex words instantly.
            </p>
            <div className="assistant-chips">
              <button
                className="chip"
                onClick={() => setChatInput("Explain Linked List time complexities")}
              >
                <Sparkles size={14} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                <span>"Explain Linked List time complexities"</span>
              </button>
              <button
                className="chip"
                onClick={() => setChatInput("What is the difference between Stack and Queue?")}
              >
                <Sparkles size={14} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                <span>"What is the difference between Stack and Queue?"</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Warning Modal */}
      {showAuthWarning && (
        <div
          className="auth-warning-backdrop animate-fade-in"
          onClick={() => setShowAuthWarning(false)}
        >
          <div
            className="auth-warning-modal animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="warning-icon-wrapper">
              <AlertCircle size={32} />
            </div>
            <h3>Authentication Required</h3>
            <p>
              To upload custom textbooks, select topics, or generate interactive quiz matrices, you must be signed into your account.
            </p>
            <div className="warning-actions">
              <button
                className="btn-warning-primary"
                onClick={() => {
                  setShowAuthWarning(false);
                  if (onOpenAuth) onOpenAuth("signin");
                }}
              >
                Sign In Now
              </button>
              <button
                className="btn-warning-secondary"
                onClick={() => {
                  setShowAuthWarning(false);
                  if (onOpenAuth) onOpenAuth("signup");
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

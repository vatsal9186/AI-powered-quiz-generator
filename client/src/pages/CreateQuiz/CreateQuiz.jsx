import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  PenTool,
  Upload,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Clock,
  Play,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import "./CreateQuiz.css";
import "../Dashboard/Dashboard.css";
import { apiBaseUrl } from "../../utils/api.js";

export default function CreateQuiz({ user, onOpenAuth }) {
  const navigate = useNavigate();

  // Mode: 'selection', 'ai', 'manual'
  const [createMode, setCreateMode] = useState("selection");

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ==========================================
  // AI-Generated Quiz States
  // ==========================================
  const [genFile, setGenFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, done, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [analyzedDoc, setAnalyzedDoc] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [genQuestions, setGenQuestions] = useState(15);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // ==========================================
  // Manual Quiz Creation States
  // ==========================================
  const [manualQuiz, setManualQuiz] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "medium",
    questions: [
      {
        id: 1,
        question_text: "",
        explanation: "",
        options: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ],
  });
  const [manualErrors, setManualErrors] = useState({});
  const [isPublishingManual, setIsPublishingManual] = useState(false);

  // Clear notifications on mode switch
  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
  }, [createMode]);

  // ==========================================
  // AI Generation Handlers
  // ==========================================
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGenFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth("signin");
      return;
    }
    if (!genFile) {
      setErrorMsg("Please select a document file (.pdf, .docx, .pptx) to upload.");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(15);
    setUploadProgressMsg("Uploading document to secure server...");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", genFile);
    formData.append("title", genFile.name.replace(/\.[^/.]+$/, ""));

    try {
      const token =
        sessionStorage.getItem("questai_token") ||
        localStorage.getItem("questai_token");

      const res = await fetch(`${apiBaseUrl}/api/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Upload failed. Please try again.");
      }

      const docData = await res.json();
      setUploadProgress(45);
      setUploadProgressMsg("Scanning pages & indexing chapter tree...");

      // Poll document status until ready
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`${apiBaseUrl}/api/documents/${docData.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pollRes.ok) {
            const updatedDoc = await pollRes.json();
            if (updatedDoc.status === "ready") {
              clearInterval(pollInterval);
              setUploadProgress(100);
              setUploadProgressMsg("Layout parsed successfully!");
              setTimeout(() => {
                setAnalyzedDoc(updatedDoc);
                setUploadStatus("done");
                // Preselect first chapter
                if (updatedDoc.structure && updatedDoc.structure.length > 0) {
                  const firstMod = updatedDoc.structure[0];
                  if (firstMod.chapters && firstMod.chapters.length > 0) {
                    setSelectedChapters([firstMod.chapters[0].title]);
                  }
                }
              }, 600);
            } else if (updatedDoc.status === "failed") {
              clearInterval(pollInterval);
              setUploadStatus("error");
              setErrorMsg(updatedDoc.error_message || "Document layout analysis failed.");
            }
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setUploadStatus("error");
          setErrorMsg(pollErr.message || "Error checking document status.");
        }
      }, 1500);
    } catch (err) {
      setUploadStatus("error");
      setErrorMsg(err.message || "An error occurred during upload.");
    }
  };

  const handleToggleChapter = (chapterTitle) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterTitle)
        ? prev.filter((t) => t !== chapterTitle)
        : [...prev, chapterTitle]
    );
  };

  const handleToggleAllChapters = () => {
    if (!analyzedDoc) return;
    const allTitles = [];
    analyzedDoc.structure.forEach((mod) => {
      mod.chapters.forEach((chap) => allTitles.push(chap.title));
    });

    if (selectedChapters.length === allTitles.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(allTitles);
    }
  };

  const handleGenerateAIQuiz = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth("signin");
      return;
    }
    if (selectedChapters.length === 0) {
      setErrorMsg("Please select at least one chapter from the outline.");
      return;
    }

    setIsGeneratingAI(true);
    setErrorMsg("");

    try {
      const token =
        sessionStorage.getItem("questai_token") ||
        localStorage.getItem("questai_token");

      const payload = {
        document_id: analyzedDoc.id,
        selected_chapters: selectedChapters,
        difficulty: genDifficulty,
        num_questions: parseInt(genQuestions, 10) || 15,
      };

      const res = await fetch(`${apiBaseUrl}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Quiz generation failed.");
      }

      const newQuiz = await res.json();
      setSuccessMsg(`🎉 Quiz "${newQuiz.title}" created successfully! Redirecting to quizzes...`);
      setTimeout(() => {
        navigate("/dashboard?tab=quizzes");
      }, 1200);
    } catch (err) {
      setIsGeneratingAI(false);
      setErrorMsg(err.message || "Failed to generate AI quiz.");
    }
  };

  // ==========================================
  // Manual Quiz Creation Handlers
  // ==========================================
  const handleAddQuestion = () => {
    setManualQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: Date.now() + Math.random(),
          question_text: "",
          explanation: "",
          options: [
            { text: "", is_correct: true },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        },
      ],
    }));
  };

  const handleDeleteQuestion = (qId) => {
    if (manualQuiz.questions.length <= 1) return;
    setManualQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  const handleQuestionChange = (qId, field, value) => {
    setManualQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, [field]: value } : q
      ),
    }));
    if (manualErrors[`q_${qId}_${field}`]) {
      setManualErrors((prev) => {
        const next = { ...prev };
        delete next[`q_${qId}_${field}`];
        return next;
      });
    }
  };

  const handleOptionTextChange = (qId, optIdx, textVal) => {
    setManualQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = { ...newOpts[optIdx], text: textVal };
        return { ...q, options: newOpts };
      }),
    }));
    if (manualErrors[`q_${qId}_opt_${optIdx}`]) {
      setManualErrors((prev) => {
        const next = { ...prev };
        delete next[`q_${qId}_opt_${optIdx}`];
        return next;
      });
    }
  };

  const handleSelectCorrectOption = (qId, optIdx) => {
    setManualQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = q.options.map((opt, idx) => ({
          ...opt,
          is_correct: idx === optIdx,
        }));
        return { ...q, options: newOpts };
      }),
    }));
    if (manualErrors[`q_${qId}_correct`]) {
      setManualErrors((prev) => {
        const next = { ...prev };
        delete next[`q_${qId}_correct`];
        return next;
      });
    }
  };

  const handlePublishManualQuiz = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth("signin");
      return;
    }

    const errors = {};
    if (!manualQuiz.title.trim()) {
      errors.title = "Quiz title is required.";
    }
    if (!manualQuiz.category.trim()) {
      errors.category = "Subject or category is required.";
    }
    if (manualQuiz.questions.length === 0) {
      errors.general = "Please add at least one question.";
    }

    manualQuiz.questions.forEach((q, qIdx) => {
      if (!q.question_text.trim()) {
        errors[`q_${q.id}_question_text`] = `Question ${qIdx + 1} prompt text is required.`;
      }
      let hasCorrect = false;
      q.options.forEach((opt, optIdx) => {
        if (!opt.text.trim()) {
          errors[`q_${q.id}_opt_${optIdx}`] = `Option ${String.fromCharCode(65 + optIdx)} cannot be empty.`;
        }
        if (opt.is_correct) hasCorrect = true;
      });
      if (!hasCorrect) {
        errors[`q_${q.id}_correct`] = `Please designate one correct answer for Question ${qIdx + 1}.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setManualErrors(errors);
      setErrorMsg("Please complete all required fields and ensure each question has 4 options and a correct answer.");
      return;
    }

    setManualErrors({});
    setErrorMsg("");
    setIsPublishingManual(true);

    try {
      const token =
        sessionStorage.getItem("questai_token") ||
        localStorage.getItem("questai_token");

      const payload = {
        title: manualQuiz.title.trim(),
        description: manualQuiz.description.trim() || null,
        category: manualQuiz.category.trim() || null,
        source_type: "manual",
        difficulty: manualQuiz.difficulty,
        questions: manualQuiz.questions.map((q) => ({
          question_text: q.question_text.trim(),
          type: "mcq",
          explanation: q.explanation.trim() || null,
          points: 1,
          source_chapter: manualQuiz.category.trim() || "General",
          difficulty: manualQuiz.difficulty,
          options: q.options.map((opt) => ({
            option_text: opt.text.trim(),
            is_correct: opt.is_correct,
          })),
        })),
      };

      const res = await fetch(`${apiBaseUrl}/api/quizzes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to publish manual quiz.");
      }

      const created = await res.json();
      setSuccessMsg(`🎉 Quiz "${created.title}" published successfully! Taking you to your saved quizzes...`);
      setIsPublishingManual(false);

      setTimeout(() => {
        navigate("/dashboard?tab=quizzes");
      }, 1200);
    } catch (err) {
      setIsPublishingManual(false);
      setErrorMsg(err.message || "An error occurred while publishing the quiz.");
    }
  };

  return (
    <div className="create-quiz-page">
      {/* Ambient gradient background orbs */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      <div className="create-quiz-container">
        {/* Main Header */}
        <header className="create-quiz-header">
          <span className="create-hero-badge">
            <Sparkles size={14} /> Quiz Studio
          </span>
          <h1 className="create-quiz-title">Create a Quiz</h1>
          <p className="create-quiz-subtitle">
            Choose between automated AI document analysis or precision manual question authoring.
          </p>
        </header>

        {/* Global Alert Banners */}
        {errorMsg && (
          <div className="create-alert-banner error animate-fade-in">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="create-alert-banner success animate-fade-in">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: OPTION SELECTION HUB
            ========================================================================= */}
        {createMode === "selection" && (
          <div className="create-options-grid">
            {/* Option 1: AI-Generated Quiz */}
            <div
              className="create-option-card ai-option"
              onClick={() => setCreateMode("ai")}
            >
              <span className="card-tag-badge">✨ AI-Powered • Instant</span>
              <div className="card-icon-orb">
                <Sparkles size={32} />
              </div>
              <h2 className="card-heading">AI-Generated Quiz</h2>
              <p className="card-subtext">Automate question generation from study materials</p>
              <p className="card-summary">
                Upload your lecture slides, textbook PDFs, or syllabus documents. Our intelligent AI model scans the layout, extracts chapter structures, and formulates rigorous multiple-choice questions with full explanations.
              </p>
              <ul className="card-feature-list">
                <li>⚡ Supports PDF, PPTX, DOCX, and TXT files</li>
                <li>📑 Automatic outline and chapter hierarchy extraction</li>
                <li>🎯 Customizable question counts and difficulty thresholds</li>
                <li>💡 Comprehensive AI concept explanations</li>
              </ul>
              <button type="button" className="card-action-btn">
                <span>Generate with AI</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Option 2: Manual Quiz Creation */}
            <div
              className="create-option-card manual-option"
              onClick={() => setCreateMode("manual")}
            >
              <span className="card-tag-badge">✍️ Full Control • Custom</span>
              <div className="card-icon-orb">
                <PenTool size={32} />
              </div>
              <h2 className="card-heading">Manual Quiz Creation</h2>
              <p className="card-subtext">Author custom assessments without AI</p>
              <p className="card-summary">
                Create quizzes from scratch with complete creative control. Define your subject category, add unlimited questions dynamically, write your own 4 multiple-choice options, and select correct answers with single-click ease.
              </p>
              <ul className="card-feature-list">
                <li>📝 Custom Title, Subject/Category, and Difficulty</li>
                <li>➕ Add and remove unlimited questions dynamically</li>
                <li>🔘 4 multiple-choice options with single-click correct answer</li>
                <li>🚀 Instant saving & publishing straight to your library</li>
              </ul>
              <button type="button" className="card-action-btn">
                <span>Create Manually</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: AI-GENERATED QUIZ WORKFLOW
            ========================================================================= */}
        {createMode === "ai" && (
          <div className="section-card">
            <div className="create-mode-nav-bar">
              <button
                type="button"
                className="create-back-btn"
                onClick={() => setCreateMode("selection")}
              >
                <ArrowLeft size={16} />
                <span>Back to Options</span>
              </button>
              <span className="create-mode-pill ai">✨ AI Generation Mode</span>
            </div>

            <div className="section-header" style={{ marginBottom: "20px" }}>
              <h2>AI-Powered Quiz Generator</h2>
            </div>

            {uploadStatus !== "idle" && uploadStatus !== "done" && uploadStatus !== "error" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <div style={{ position: "relative", width: "90px", height: "90px", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "4px solid rgba(5, 196, 107, 0.15)",
                      borderTopColor: "var(--accent-green)",
                      animation: "shine-gradient 1.5s infinite linear",
                    }}
                    className="spinner-border"
                  ></div>
                  <Sparkles size={24} style={{ position: "absolute", top: "33px", left: "33px", color: "var(--accent-green)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px" }}>
                  Analyzing Document...
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "18px", textAlign: "center" }}>
                  {uploadProgressMsg}
                </p>
                <div style={{ width: "260px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "var(--accent-gradient)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            ) : isGeneratingAI ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <div style={{ position: "relative", width: "90px", height: "90px", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "4px solid rgba(255, 159, 67, 0.15)",
                      borderTopColor: "var(--accent-amber)",
                      animation: "shine-gradient 1.5s infinite linear",
                    }}
                    className="spinner-border"
                  ></div>
                  <Sparkles size={24} style={{ position: "absolute", top: "33px", left: "33px", color: "var(--accent-amber)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px" }}>
                  AI Generating Quiz...
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center" }}>
                  Extracting concepts from selected chapters and formulating questions...
                </p>
              </div>
            ) : analyzedDoc ? (
              /* Outline Selection Form */
              <form onSubmit={handleGenerateAIQuiz}>
                <div className="generator-intro" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "14px", marginBottom: "20px" }}>
                  <h3>Document Title: {analyzedDoc.title}</h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Select which modules or chapters you want to generate quiz questions from.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <button
                    type="button"
                    className="quiz-action-btn"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                    onClick={handleToggleAllChapters}
                  >
                    Toggle Select All
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <strong>{selectedChapters.length}</strong> chapter(s) selected
                  </span>
                </div>

                {/* Chapter tree structure */}
                <div
                  className="document-tree-container"
                  style={{
                    maxHeight: "350px",
                    overflowY: "auto",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    padding: "15px",
                    background: "rgba(0,0,0,0.1)",
                    marginBottom: "25px",
                  }}
                >
                  {analyzedDoc.structure.map((mod) => {
                    const isModExpanded = expandedModules[mod.id] !== false;
                    return (
                      <div key={mod.id} className="tree-module-node" style={{ marginBottom: "15px" }}>
                        <div
                          className="tree-module-header"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "8px",
                          }}
                        >
                          <button
                            type="button"
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() =>
                              setExpandedModules((prev) => ({ ...prev, [mod.id]: !isModExpanded }))
                            }
                          >
                            {isModExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <span style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                            {mod.title || "General Chapters"}
                          </span>
                        </div>

                        {isModExpanded && (
                          <div className="tree-chapters-list" style={{ paddingLeft: "30px", marginTop: "5px" }}>
                            {mod.chapters.map((chap) => {
                              const isChapChecked = selectedChapters.includes(chap.title);
                              return (
                                <div key={chap.id} className="tree-chapter-node" style={{ padding: "6px 0" }}>
                                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem" }}>
                                    <input
                                      type="checkbox"
                                      checked={isChapChecked}
                                      onChange={() => handleToggleChapter(chap.title)}
                                    />
                                    <span style={{ color: isChapChecked ? "#FAF9F6" : "var(--text-secondary)" }}>
                                      {chap.title}
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="generator-form-row">
                  <div className="generator-form-group">
                    <label htmlFor="ai-gen-diff">Difficulty Threshold</label>
                    <select
                      id="ai-gen-diff"
                      className="generator-select"
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy (Foundational Concepts)</option>
                      <option value="medium">Medium (Analytical Queries)</option>
                      <option value="hard">Hard (Advanced Syntax & Optimization)</option>
                    </select>
                  </div>
                  <div className="generator-form-group">
                    <label htmlFor="ai-gen-count">Total Questions</label>
                    <select
                      id="ai-gen-count"
                      className="generator-select"
                      value={genQuestions}
                      onChange={(e) => setGenQuestions(e.target.value)}
                    >
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={25}>25 Questions</option>
                      <option value={30}>30 Questions</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="generator-submit-btn"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", width: "auto", flexGrow: 1 }}
                    onClick={() => setAnalyzedDoc(null)}
                  >
                    Back to Upload
                  </button>
                  <button
                    type="submit"
                    className="generator-submit-btn"
                    style={{ width: "auto", flexGrow: 2 }}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles size={18} />
                    <span>Generate AI Quiz</span>
                  </button>
                </div>
              </form>
            ) : (
              /* File Upload Form */
              <form onSubmit={handleUploadAndAnalyze}>
                <div className="generator-intro">
                  <p>
                    Upload a PDF, Word DOCX, or PowerPoint PPTX syllabus deck. The AI model extracts layout modules/chapters and generates custom quiz questions.
                  </p>
                </div>

                <div className="generator-form-group">
                  <label>Upload Document (.pdf, .docx, .pptx)</label>
                  {genFile ? (
                    <div
                      className="generator-selected-file-pill"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "rgba(5, 196, 107, 0.06)",
                        border: "1px solid rgba(5, 196, 107, 0.15)",
                        borderRadius: "10px",
                        padding: "10px 15px",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText size={16} style={{ color: "var(--accent-green)" }} />
                        <span>
                          {genFile.name} ({(genFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        style={{ color: "var(--error)", cursor: "pointer", background: "none", border: "none", fontSize: "1.1rem" }}
                        onClick={() => setGenFile(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="gen-file-upload" className="generator-file-upload-zone">
                      <Upload size={28} style={{ color: "var(--text-muted)" }} />
                      <strong>Browse Document File</strong>
                      <p>Drag & drop or click to upload PDF/PPTX/DOCX (Max 100MB)</p>
                      <input
                        type="file"
                        id="gen-file-upload"
                        accept=".pdf,.docx,.pptx,.txt"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        required
                      />
                    </label>
                  )}
                </div>

                <button type="submit" className="generator-submit-btn" disabled={!genFile}>
                  <Sparkles size={18} />
                  <span>Analyze Layout Structure</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 3: MANUAL QUIZ CREATION INTERFACE
            ========================================================================= */}
        {createMode === "manual" && (
          <div className="manual-quiz-form-wrapper">
            <div className="create-mode-nav-bar">
              <button
                type="button"
                className="create-back-btn"
                onClick={() => setCreateMode("selection")}
              >
                <ArrowLeft size={16} />
                <span>Back to Options</span>
              </button>
              <span className="create-mode-pill manual">✍️ Manual Quiz Builder</span>
            </div>

            {/* Section 1: Quiz Information */}
            <div className="manual-info-card">
              <div className="manual-info-header">
                <h3>
                  <FileText size={18} style={{ color: "var(--accent-green)" }} />
                  <span>Quiz Information</span>
                </h3>
                <div className="manual-questions-count-badge">
                  <BookOpen size={14} />
                  <span>
                    {manualQuiz.questions.length} Question{manualQuiz.questions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="manual-info-grid">
                <div className="manual-field-group">
                  <label htmlFor="m-quiz-title">
                    Quiz Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="m-quiz-title"
                    type="text"
                    className={`manual-input ${manualErrors.title ? "has-error" : ""}`}
                    placeholder="e.g. Advanced Data Structures Midterm"
                    value={manualQuiz.title}
                    onChange={(e) => {
                      setManualQuiz((prev) => ({ ...prev, title: e.target.value }));
                      if (manualErrors.title) {
                        setManualErrors((prev) => {
                          const next = { ...prev };
                          delete next.title;
                          return next;
                        });
                      }
                    }}
                  />
                  {manualErrors.title && (
                    <span className="field-error-msg">
                      <AlertCircle size={12} /> {manualErrors.title}
                    </span>
                  )}
                </div>

                <div className="manual-field-group">
                  <label htmlFor="m-quiz-cat">
                    Subject or Category <span className="req-star">*</span>
                  </label>
                  <input
                    id="m-quiz-cat"
                    type="text"
                    className={`manual-input ${manualErrors.category ? "has-error" : ""}`}
                    placeholder="e.g. Computer Science, Physics"
                    value={manualQuiz.category}
                    onChange={(e) => {
                      setManualQuiz((prev) => ({ ...prev, category: e.target.value }));
                      if (manualErrors.category) {
                        setManualErrors((prev) => {
                          const next = { ...prev };
                          delete next.category;
                          return next;
                        });
                      }
                    }}
                  />
                  {manualErrors.category && (
                    <span className="field-error-msg">
                      <AlertCircle size={12} /> {manualErrors.category}
                    </span>
                  )}
                </div>

                <div className="manual-field-group">
                  <label htmlFor="m-quiz-diff">Quiz Difficulty</label>
                  <select
                    id="m-quiz-diff"
                    className="manual-select"
                    value={manualQuiz.difficulty}
                    onChange={(e) =>
                      setManualQuiz((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                  >
                    <option value="easy">Easy (Foundational)</option>
                    <option value="medium">Medium (Intermediate)</option>
                    <option value="hard">Hard (Advanced)</option>
                  </select>
                </div>
              </div>

              <div className="manual-field-group" style={{ marginTop: "14px" }}>
                <label htmlFor="m-quiz-desc">
                  Quiz Description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="m-quiz-desc"
                  rows={2}
                  className="manual-textarea"
                  placeholder="Provide instructions, coverage topics, or guidelines for test-takers..."
                  value={manualQuiz.description}
                  onChange={(e) =>
                    setManualQuiz((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Section 2: Question Creation List */}
            <div className="manual-questions-header">
              <h3>Questions ({manualQuiz.questions.length})</h3>
              <button
                type="button"
                className="quiz-action-btn quiz-btn-primary"
                style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.85rem" }}
                onClick={handleAddQuestion}
              >
                <PlusCircle size={15} />
                <span>+ Add Question</span>
              </button>
            </div>

            {manualQuiz.questions.map((q, qIdx) => {
              const qNum = String(qIdx + 1).padStart(2, "0");
              return (
                <div key={q.id} className="manual-question-card">
                  <div className="manual-question-card-header">
                    <span className="question-seq-badge">Question {qNum}</span>
                    {manualQuiz.questions.length > 1 && (
                      <button
                        type="button"
                        className="btn-delete-question"
                        onClick={() => handleDeleteQuestion(q.id)}
                        title="Delete question"
                      >
                        <Trash2 size={14} />
                        <span>Delete Question</span>
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="manual-field-group" style={{ marginBottom: "14px" }}>
                    <label>
                      Question Prompt <span className="req-star">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className={`manual-textarea ${manualErrors[`q_${q.id}_question_text`] ? "has-error" : ""}`}
                      placeholder={`Enter question ${qIdx + 1} prompt text here...`}
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(q.id, "question_text", e.target.value)}
                    />
                    {manualErrors[`q_${q.id}_question_text`] && (
                      <span className="field-error-msg">
                        <AlertCircle size={12} /> {manualErrors[`q_${q.id}_question_text`]}
                      </span>
                    )}
                  </div>

                  {/* Optional Solution Note / Explanation */}
                  <div className="manual-field-group" style={{ marginBottom: "16px" }}>
                    <label>
                      Explanation / Solution Note <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional - shown to learners after answering)</span>
                    </label>
                    <input
                      type="text"
                      className="manual-input"
                      placeholder="e.g. This is correct because..."
                      value={q.explanation || ""}
                      onChange={(e) => handleQuestionChange(q.id, "explanation", e.target.value)}
                    />
                  </div>

                  {/* 4 Multiple Choice Options */}
                  <div className="manual-options-container">
                    <div className="manual-options-title-row">
                      <span className="manual-options-title">
                        Answer Options (Select the correct answer) <span className="req-star">*</span>
                      </span>
                      <span className="manual-options-hint">
                        Select a radio button to designate the correct answer
                      </span>
                    </div>

                    {manualErrors[`q_${q.id}_correct`] && (
                      <div style={{ marginBottom: "10px" }} className="field-error-msg">
                        <AlertCircle size={14} /> {manualErrors[`q_${q.id}_correct`]}
                      </div>
                    )}

                    <div className="manual-options-grid">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const optError = manualErrors[`q_${q.id}_opt_${optIdx}`];
                        return (
                          <div
                            key={optIdx}
                            className={`manual-option-row ${opt.is_correct ? "is-correct-option" : ""}`}
                          >
                            <div className="manual-option-top">
                              <label className="manual-option-selector">
                                <input
                                  type="radio"
                                  name={`manual-correct-${q.id}`}
                                  checked={opt.is_correct}
                                  onChange={() => handleSelectCorrectOption(q.id, optIdx)}
                                />
                                <span className="option-letter-badge">{letter}</span>
                                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Option {letter}</span>
                              </label>

                              <span
                                className={`correct-indicator-tag ${opt.is_correct ? "active" : "inactive"}`}
                                onClick={() => handleSelectCorrectOption(q.id, optIdx)}
                              >
                                {opt.is_correct ? "✓ Correct Answer" : "Mark as Correct"}
                              </span>
                            </div>

                            <input
                              type="text"
                              className={`manual-input ${optError ? "has-error" : ""}`}
                              placeholder={`Enter Option ${letter} text...`}
                              value={opt.text}
                              onChange={(e) => handleOptionTextChange(q.id, optIdx, e.target.value)}
                            />
                            {optError && (
                              <span className="field-error-msg">
                                <AlertCircle size={12} /> {optError}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another Question Block Button */}
            <button type="button" className="btn-add-question-block" onClick={handleAddQuestion}>
              <PlusCircle size={20} />
              <span>+ Add Another Question</span>
            </button>

            {/* Sticky Publishing Action Bar */}
            <div className="manual-publish-bar">
              <div className="publish-bar-stats">
                <CheckCircle2 size={20} style={{ color: "var(--accent-green)" }} />
                <span>
                  <strong>{manualQuiz.questions.length} Question{manualQuiz.questions.length !== 1 ? "s" : ""}</strong> ready • 
                  <span style={{ textTransform: "capitalize", marginLeft: "6px" }}>{manualQuiz.difficulty} Difficulty</span>
                </span>
              </div>

              <div className="publish-bar-actions">
                <button
                  type="button"
                  className="btn-cancel-draft"
                  onClick={() => setCreateMode("selection")}
                  disabled={isPublishingManual}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-publish-final"
                  onClick={handlePublishManualQuiz}
                  disabled={isPublishingManual}
                >
                  {isPublishingManual ? (
                    <>
                      <span className="auth-btn-spinner" style={{ width: "16px", height: "16px", borderTopColor: "#fff" }} />
                      <span>Publishing Quiz...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Publish Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

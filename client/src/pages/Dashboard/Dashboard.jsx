import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Trash2,
  Play,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  Link as LinkIcon,
  FileText,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  X,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import "./Dashboard.css";
import { apiBaseUrl } from "../../utils/api.js";

export default function Dashboard({ user, onOpenAuth }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "overview";

  // ==========================================
  // Core State Management (Backend API Backed)
  // ==========================================
  const [documents, setDocuments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter States
  const [quizSearch, setQuizSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // ==========================================
  // Upload & Quiz Generation State
  // ==========================================
  const [genTitle, setGenTitle] = useState("");
  const [genType, setGenType] = useState("file"); // 'text', 'file', 'url'
  const [genTextContent, setGenTextContent] = useState("");
  const [genUrl, setGenUrl] = useState("");
  const [genFile, setGenFile] = useState(null);
  
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, extracting, analyzing, saving, done, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [analyzedDoc, setAnalyzedDoc] = useState(null); // The document hierarchy returned after upload
  
  // Selection tree states
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [genQuestions, setGenQuestions] = useState(15);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizProgressMsg, setQuizProgressMsg] = useState("");

  // Expanded states for module/chapter accordion in UI
  const [expandedModules, setExpandedModules] = useState({});

  // ==========================================
  // Active Quiz Runner State
  // ==========================================
  const [activeQuiz, setActiveQuiz] = useState(null); // The quiz user is taking
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: selected_option_id }
  const [quizTimer, setQuizTimer] = useState(600); // in seconds
  const [quizTimeSpent, setQuizTimeSpent] = useState(0);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [gradedAttempt, setGradedAttempt] = useState(null); // Graded feedback from backend

  // ==========================================
  // Instant Answer Feedback State
  // ==========================================
  const [answerFeedback, setAnswerFeedback] = useState({}); // { [question_id]: { is_correct, correct_option_id, explanation, selected_option_id } }
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [runningScore, setRunningScore] = useState({ correct: 0, total: 0 });

  // ==========================================
  // API Fetch Utilities
  // ==========================================
  const fetchDashboardData = async () => {
    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;
    
    setLoading(true);
    try {
      // 1. Fetch documents
      const docsRes = await fetch(`${apiBaseUrl}/api/documents`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData);
      }

      // 2. Fetch quizzes
      const quizzesRes = await fetch(`${apiBaseUrl}/api/quizzes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(quizzesData);
      }

      // 3. Fetch attempt history
      const attemptsRes = await fetch(`${apiBaseUrl}/api/quizzes/attempts/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json();
        setAttempts(attemptsData);
        sessionStorage.setItem("questai_attempts", JSON.stringify(attemptsData));
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setErrorMsg("Failed to connect to the backend server. Please verify it is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Tab switching handler
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    setErrorMsg("");
    setSuccessMsg("");
    setAnalyzedDoc(null);
    setGradedAttempt(null);
    setActiveQuiz(null);
  };

  // Timer Effect for active quiz
  useEffect(() => {
    let timer;
    if (activeQuiz && !gradedAttempt && quizTimer > 0) {
      timer = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz(); // Auto submit
            return 0;
          }
          return prev - 1;
        });
        setQuizTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, gradedAttempt, quizTimer]);

  const formatTimer = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // File Upload Handlers
  // ==========================================
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const filename = file.name;
      const ext = filename.toLowerCase().split(".").pop();
      const supported = ["pdf", "doc", "docx", "ppt", "pptx"];

      // Extension validation
      if (!supported.includes(ext)) {
        setErrorMsg("Unsupported file type. Only PDF, PPT, PPTX, DOC, and DOCX files are supported.");
        setGenFile(null);
        e.target.value = null; // Reset selection
        return;
      }

      // Size validation (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrorMsg("File size exceeds 100 MB. Please select a smaller file.");
        setGenFile(null);
        e.target.value = null; // Reset selection
        return;
      }

      setGenFile(file);
      setErrorMsg("");
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (genType === "file" && !genFile) return;

    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) {
      setErrorMsg("You must be logged in to upload files.");
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadProgressMsg("Uploading document to backend secure server...");

    const uploadStartTime = Date.now();
    let currentProgress = 0;
    let targetProgress = 15;
    let backendReady = false;
    let updatedDocPayload = null;
    let pollInterval = null;

    // Smooth progress animation interval (runs every 80ms)
    const progressInterval = setInterval(() => {
      if (currentProgress < targetProgress) {
        currentProgress += 1;
        setUploadProgress(currentProgress);
      } else if (currentProgress >= 95 && !backendReady) {
        // Hold at 95% until backend signals "ready"
      } else if (backendReady) {
        // Backend is ready. If minimum 3.5s elapsed, finish instantly or smoothly animate remaining
        const elapsed = Date.now() - uploadStartTime;
        if (elapsed >= 3500) {
          currentProgress = 100;
          setUploadProgress(100);
          clearInterval(progressInterval);
          finishUpload(updatedDocPayload);
        } else {
          // Glide to 100% over the remaining time
          currentProgress = Math.min(100, currentProgress + 2);
          setUploadProgress(currentProgress);
          if (currentProgress === 100) {
            clearInterval(progressInterval);
            finishUpload(updatedDocPayload);
          }
        }
      }
    }, 80);

    const finishUpload = async (updatedDoc) => {
      setUploadProgressMsg("Document processed & quiz auto-generated! Ready to go.");
      setUploadStatus("done");
      
      setGenTitle(updatedDoc.title);
      setAnalyzedDoc(updatedDoc);
      setSelectedChapters([]);
      
      const initialExpanded = {};
      if (updatedDoc.structure && Array.isArray(updatedDoc.structure)) {
        updatedDoc.structure.forEach((mod) => {
          initialExpanded[mod.id] = true;
        });
      }
      setExpandedModules(initialExpanded);
      await fetchDashboardData();

      // Auto-detect auto-generated quiz and offer to start it
      try {
        const quizzesCheckRes = await fetch(`${apiBaseUrl}/api/quizzes?limit=5`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (quizzesCheckRes.ok) {
          const latestQuizzes = await quizzesCheckRes.json();
          const autoQuiz = latestQuizzes.find(
            (q) => q.document_id === updatedDoc.id && q.title.includes("Auto Generated")
          );
          if (autoQuiz) {
            setSuccessMsg(`Quiz auto-generated with ${autoQuiz.questions_count} questions! Click 'Start Quiz Now' to begin.`);
            setAnalyzedDoc((prev) => prev ? { ...prev, _autoQuizId: autoQuiz.id } : prev);
          }
        }
      } catch (quizCheckErr) {
        console.error("Failed to detect auto-generated quiz", quizCheckErr);
      }
    };

    try {
      const formData = new FormData();
      formData.append("file", genFile);

      const res = await fetch(`${apiBaseUrl}/api/documents/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.detail || "Failed to initiate document upload.");
      }

      const docData = await res.json();
      
      setUploadStatus("processing");
      targetProgress = 30;
      setUploadProgressMsg("Processing document in background...");
      
      pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiBaseUrl}/api/documents/${docData.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (!statusRes.ok) {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            throw new Error("Failed to check document processing status.");
          }
          
          const updatedDoc = await statusRes.json();
          updatedDocPayload = updatedDoc;
          
          if (updatedDoc.status === "extracting") {
            setUploadStatus("extracting");
            targetProgress = 50;
            setUploadProgressMsg("Extracting text content locally...");
          } else if (updatedDoc.status === "detecting") {
            setUploadStatus("detecting");
            targetProgress = 75;
            setUploadProgressMsg("Analyzing document structure & chapters...");
          } else if (updatedDoc.status === "generating_quiz") {
            setUploadStatus("generating_quiz");
            targetProgress = 90;
            setUploadProgressMsg("AI is generating MCQ questions from your document...");
          } else if (updatedDoc.status === "ready") {
            clearInterval(pollInterval);
            backendReady = true;
            targetProgress = 100;
          } else if (updatedDoc.status === "failed") {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            setUploadStatus("error");
            setErrorMsg(updatedDoc.error_message || "Document processing failed.");
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          clearInterval(progressInterval);
          setUploadStatus("error");
          setErrorMsg(pollErr.message || "An error occurred checking document status.");
        }
      }, 1200);

    } catch (err) {
      clearInterval(progressInterval);
      if (pollInterval) clearInterval(pollInterval);
      setUploadStatus("error");
      setErrorMsg(err.message || "An error occurred during file upload.");
    }
  };

  // Toggle chapter selection
  const handleToggleChapter = (chapterTitle) => {
    setSelectedChapters((prev) => {
      if (prev.includes(chapterTitle)) {
        return prev.filter((c) => c !== chapterTitle);
      } else {
        return [...prev, chapterTitle];
      }
    });
  };

  // Toggle all chapters in a module
  const handleToggleModule = (moduleObj) => {
    const chapTitles = moduleObj.chapters.map((c) => c.title);
    const allChecked = chapTitles.every((t) => selectedChapters.includes(t));

    if (allChecked) {
      // Uncheck all
      setSelectedChapters((prev) => prev.filter((t) => !chapTitles.includes(t)));
    } else {
      // Check all (avoid duplicates)
      setSelectedChapters((prev) => {
        const filtered = prev.filter((t) => !chapTitles.includes(t));
        return [...filtered, ...chapTitles];
      });
    }
  };

  // Check if module is partially/fully checked
  const getModuleCheckState = (moduleObj) => {
    const chapTitles = moduleObj.chapters.map((c) => c.title);
    const checkedCount = chapTitles.filter((t) => selectedChapters.includes(t)).length;
    
    if (checkedCount === 0) return "none";
    if (checkedCount === chapTitles.length) return "all";
    return "partial";
  };

  // Toggle entire document
  const handleToggleAllChapters = () => {
    if (!analyzedDoc) return;
    const allTitles = [];
    analyzedDoc.structure.forEach((mod) => {
      mod.chapters.forEach((chap) => {
        allTitles.push(chap.title);
      });
    });

    const isAllChecked = allTitles.every((t) => selectedChapters.includes(t));
    if (isAllChecked) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(allTitles);
    }
  };

  // ==========================================
  // Quiz Generation Call
  // ==========================================
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!analyzedDoc) return;

    if (selectedChapters.length === 0) {
      setErrorMsg("Please select at least one chapter or module to generate questions from.");
      return;
    }

    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;

    setIsGeneratingQuiz(true);
    setQuizProgressMsg("Initiating AI quiz generation request...");
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: analyzedDoc.id,
          selected_chapters: selectedChapters,
          difficulty: genDifficulty,
          num_questions: Number(genQuestions)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate quiz.");
      }

      const quizData = await res.json();
      setQuizProgressMsg("AI is generating questions from the selected chapters...");
      
      const quizPollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiBaseUrl}/api/quizzes/${quizData.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          if (!statusRes.ok) {
            clearInterval(quizPollInterval);
            throw new Error("Failed to check quiz generation status.");
          }
          
          const updatedQuiz = await statusRes.json();
          
          if (updatedQuiz.status === "completed") {
            clearInterval(quizPollInterval);
            setQuizProgressMsg("Quiz successfully generated!");
            setSuccessMsg("Quiz successfully generated! Initiating quiz runner...");
            
            setTimeout(() => {
              setIsGeneratingQuiz(false);
              startQuizRunner(updatedQuiz);
              setGenFile(null);
              setAnalyzedDoc(null);
              setUploadStatus("idle");
            }, 1000);
          } else if (updatedQuiz.status === "failed") {
            clearInterval(quizPollInterval);
            setIsGeneratingQuiz(false);
            setErrorMsg(updatedQuiz.error_message || "Quiz generation failed.");
          } else {
            setQuizProgressMsg("AI is generating questions from the selected chapters...");
          }
        } catch (pollErr) {
          clearInterval(quizPollInterval);
          setIsGeneratingQuiz(false);
          setErrorMsg(pollErr.message || "An error occurred checking quiz status.");
        }
      }, 1500);

    } catch (err) {
      setIsGeneratingQuiz(false);
      setErrorMsg(err.message || "An error occurred during quiz generation.");
    }
  };

  // ==========================================
  // Quiz Runner & Grading Flow
  // ==========================================
  const startQuizRunner = (quizObj) => {
    setActiveQuiz(quizObj);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setGradedAttempt(null);
    setAnswerFeedback({});
    setRunningScore({ correct: 0, total: 0 });
    setQuizTimer(quizObj.questions.length * 60); // 1 minute per question
    setQuizTimeSpent(0);
    setErrorMsg("");
  };

  const handleSelectOption = async (questionId, optionId) => {
    // Prevent re-answering if already answered
    if (answerFeedback[questionId]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));

    // Instantly check the answer via backend API
    setIsCheckingAnswer(true);
    try {
      const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
      const res = await fetch(`${apiBaseUrl}/api/quizzes/check-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_option_id: optionId
        })
      });

      if (res.ok) {
        const feedback = await res.json();
        setAnswerFeedback((prev) => ({
          ...prev,
          [questionId]: {
            is_correct: feedback.is_correct,
            correct_option_id: feedback.correct_option_id,
            correct_option_text: feedback.correct_option_text,
            explanation: feedback.explanation,
            selected_option_id: optionId
          }
        }));
        setRunningScore((prev) => ({
          correct: prev.correct + (feedback.is_correct ? 1 : 0),
          total: prev.total + 1
        }));
      }
    } catch (err) {
      console.error("Failed to check answer", err);
    } finally {
      setIsCheckingAnswer(false);
    }
  };



  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;

    setIsSubmittingQuiz(true);
    setErrorMsg("");

    const submissionPayload = {
      time_spent: quizTimeSpent,
      answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
        question_id: Number(qId),
        selected_option_id: Number(optId)
      }))
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(submissionPayload)
      });

      if (!res.ok) {
        throw new Error("Failed to submit and grade quiz.");
      }

      const attemptResult = await res.json();
      setGradedAttempt(attemptResult);
      
      // Sync list details
      fetchDashboardData();
    } catch (err) {
      setErrorMsg(err.message || "Grading submission failed.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Delete Handlers (calling Backend APIs)
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This will remove all associated questions and attempts.")) return;
    
    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/quizzes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
        setSuccessMsg("Quiz deleted successfully.");
        fetchDashboardData(); // Sync history
      } else {
        throw new Error("Failed to delete quiz.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document? This will remove the document text, modules, chapters, and topics.")) return;

    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setSuccessMsg("Document deleted successfully.");
      } else {
        throw new Error("Failed to delete document.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleOpenDocStructure = async (docObj) => {
    const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
    if (!token) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/documents/${docObj.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const fullDoc = await res.json();
        setGenTitle(fullDoc.title);
        setAnalyzedDoc(fullDoc);
        setSelectedChapters([]);
        handleTabChange("generator");
        
        // Expand modules by default
        const initialExpanded = {};
        fullDoc.structure.forEach((mod) => {
          initialExpanded[mod.id] = true;
        });
        setExpandedModules(initialExpanded);
      } else {
        throw new Error("Failed to load document details.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper date formatter
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / attempts.length);
  };

  // Render SVG progression chart using real data
  const renderPerformanceChart = () => {
    if (attempts.length === 0) {
      return (
        <div className="chart-empty-state">
          <span>No historical scores available yet.</span>
        </div>
      );
    }

    const sorted = [...attempts].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    const width = 400;
    const height = 150;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 20;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const points = sorted.map((attempt, index) => {
      const divisor = Math.max(1, sorted.length - 1);
      const x = paddingLeft + (index / divisor) * chartWidth;
      const y = paddingTop + chartHeight - (attempt.score / 100) * chartHeight;
      return { x, y, score: attempt.score, title: attempt.quiz_title };
    });

    const pathD = points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : "";

    return (
      <div className="performance-chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="performance-svg">
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-green)" />
              <stop offset="100%" stopColor="var(--accent-amber)" />
            </linearGradient>
          </defs>
          
          {[0, 50, 100].map((level) => {
            const y = paddingTop + chartHeight - (level / 100) * chartHeight;
            return (
              <g key={level}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                <text x={paddingLeft - 8} y={y + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">{level}%</text>
              </g>
            );
          })}

          {points.length > 0 && (
            <>
              {points.length > 1 && <path d={areaD} fill="url(#chartAreaGradient)" />}
              {points.length > 1 ? (
                <path d={pathD} fill="none" stroke="url(#chartLineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <circle cx={points[0].x} cy={points[0].y} r="4" fill="var(--accent-green)" />
              )}
            </>
          )}

          {points.map((p, idx) => (
            <g key={idx} className="chart-dot-group">
              <circle cx={p.x} cy={p.y} r="4.5" fill="var(--bg-secondary)" stroke="var(--accent-green)" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="1.5" fill="var(--text-primary)" />
              <text x={p.x} y={p.y - 8} fill="var(--text-primary)" fontSize="8" fontWeight="700" textAnchor="middle">{p.score}%</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // ==========================================
  // Render Helper Views
  // ==========================================
  
  // Render active quiz runner view
  const renderQuizRunner = () => {
    if (!activeQuiz) return null;
    const questions = activeQuiz.questions || [];
    if (questions.length === 0) return <p>No questions found in this quiz.</p>;
    
    const q = questions[currentQuestionIdx];
    const isAnswered = selectedAnswers[q.id] !== undefined;
    const feedback = answerFeedback[q.id];
    const hasAllAnswered = questions.every((qn) => answerFeedback[qn.id]);

    return (
      <div className="section-card active-quiz-card">
        <div className="active-quiz-header">
          <div>
            <h2 className="active-quiz-title">{activeQuiz.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
              <span className={`meta-pill difficulty-${activeQuiz.difficulty}`}>{activeQuiz.difficulty.toUpperCase()} DIFFICULTY</span>
              {runningScore.total > 0 && (
                <span className="running-score-badge">
                  <CheckCircle size={14} />
                  <span>{runningScore.correct}/{runningScore.total} correct</span>
                </span>
              )}
            </div>
          </div>
          <div className="active-quiz-timer">
            <Clock size={16} />
            <span>{formatTimer(quizTimer)}</span>
          </div>
        </div>

        {/* Question index navigation grid */}
        <div className="question-nav-grid">
          {questions.map((qn, idx) => {
            const fb = answerFeedback[qn.id];
            let nodeClass = "question-nav-node";
            if (idx === currentQuestionIdx) nodeClass += " active";
            if (fb) nodeClass += fb.is_correct ? " nav-correct" : " nav-incorrect";
            else if (selectedAnswers[qn.id] !== undefined) nodeClass += " answered";
            return (
              <button
                key={idx}
                className={nodeClass}
                onClick={() => setCurrentQuestionIdx(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className={`quiz-question-box ${feedback ? (feedback.is_correct ? "feedback-correct" : "feedback-incorrect") : ""}`}>
          <div className="question-text-row">
            <span className="question-number-badge">Q{currentQuestionIdx + 1}</span>
            <h3 className="runner-question-text">{q.question_text}</h3>
          </div>

          <div className="options-grid">
            {q.options.map((opt) => {
              let optClass = "option-card-label";
              if (feedback) {
                // Show feedback state
                if (opt.id === feedback.correct_option_id) {
                  optClass += " option-correct";
                } else if (opt.id === feedback.selected_option_id && !feedback.is_correct) {
                  optClass += " option-incorrect";
                } else {
                  optClass += " option-disabled";
                }
              } else if (selectedAnswers[q.id] === opt.id) {
                optClass += " selected";
              }

              return (
                <label
                  key={opt.id}
                  className={optClass}
                  style={feedback ? { cursor: "default", pointerEvents: "none" } : {}}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={selectedAnswers[q.id] === opt.id}
                    onChange={() => handleSelectOption(q.id, opt.id)}
                    style={{ display: "none" }}
                    disabled={!!feedback || isCheckingAnswer}
                  />
                  <span className="option-checkbox-indicator">
                    {feedback && opt.id === feedback.correct_option_id && (
                      <CheckCircle size={16} style={{ color: "#22c55e" }} />
                    )}
                    {feedback && opt.id === feedback.selected_option_id && !feedback.is_correct && (
                      <X size={16} style={{ color: "#ef4444" }} />
                    )}
                  </span>
                  <span className="option-text-val">{opt.option_text}</span>
                  {feedback && opt.id === feedback.correct_option_id && (
                    <span className="instant-tag tag-correct-answer">✓ Correct</span>
                  )}
                  {feedback && opt.id === feedback.selected_option_id && !feedback.is_correct && (
                    <span className="instant-tag tag-wrong-answer">✗ Your Answer</span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Instant feedback explanation */}
          {feedback && feedback.explanation && (
            <div className="instant-explanation-box">
              <div className={`instant-feedback-banner ${feedback.is_correct ? "banner-correct" : "banner-incorrect"}`}>
                {feedback.is_correct ? (
                  <><CheckCircle size={18} /> <span>Correct! Well done.</span></>
                ) : (
                  <><AlertCircle size={18} /> <span>Incorrect. The correct answer is: <strong>{feedback.correct_option_text}</strong></span></>
                )}
              </div>
              <div className="instant-explanation-content">
                <strong>Explanation:</strong>
                <p>{feedback.explanation}</p>
              </div>
            </div>
          )}

          {isCheckingAnswer && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-green)", animation: "shine-gradient 0.8s infinite linear" }} className="spinner-border"></div>
              <span>Checking answer...</span>
            </div>
          )}
        </div>

        <div className="quiz-runner-footer">
          <div></div>

          <div className="runner-navigation-buttons">
            <button
              className="quiz-action-btn"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => p - 1)}
            >
              Previous
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                className="quiz-action-btn quiz-btn-primary"
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                disabled={!feedback}
              >
                {feedback ? "Next" : "Answer to Continue"}
              </button>
            ) : (
              <button
                className="quiz-action-btn quiz-btn-primary submit-final-btn"
                disabled={isSubmittingQuiz || !hasAllAnswered}
                onClick={handleSubmitQuiz}
              >
                {isSubmittingQuiz ? "Submitting..." : !hasAllAnswered ? `${runningScore.total}/${questions.length} Answered` : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render graded results view
  const renderQuizResults = () => {
    if (!gradedAttempt) return null;
    const isPassing = gradedAttempt.score >= 70;
    const isExcellent = gradedAttempt.score >= 90;

    return (
      <div className="section-card graded-results-card">
        <div className="results-header-banner">
          <div className="results-circular-gauge">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={isExcellent ? "var(--accent-green)" : isPassing ? "var(--accent-amber)" : "var(--error)"}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * gradedAttempt.score) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="gauge-score-value">{gradedAttempt.score}%</div>
          </div>

          <div className="results-text-block">
            <span className={`results-status-badge ${isExcellent ? "excellent" : isPassing ? "passing" : "failing"}`}>
              {isExcellent ? "EXCELLENT" : isPassing ? "PASSED" : "NEEDS REVIEW"}
            </span>
            <h2 className="results-quiz-title">{gradedAttempt.quiz_title}</h2>
            <p className="results-meta-summary">
              Completed in <strong>{Math.floor(gradedAttempt.time_spent / 60)}m {gradedAttempt.time_spent % 60}s</strong>
            </p>
            <button className="quiz-action-btn quiz-btn-primary" onClick={() => handleTabChange("quizzes")} style={{ marginTop: "15px" }}>
              Back to Quizzes
            </button>
          </div>
        </div>

        <h3 className="review-title">Review Questions</h3>
        <div className="review-questions-list">
          {gradedAttempt.answers.map((ans, idx) => {
            const q = ans.question;
            const isCorrectAnswer = ans.is_correct;
            
            return (
              <div key={q.id} className={`review-question-node ${isCorrectAnswer ? "correct-node" : "wrong-node"}`}>
                <div className="review-question-header">
                  <span className={`score-badge ${isCorrectAnswer ? "excellent" : "failing"}`}>
                    {isCorrectAnswer ? "Correct" : "Incorrect"}
                  </span>
                  <span className="review-chap-tag">Chapter: {q.source_chapter}</span>
                </div>

                <h4 className="review-question-text">
                  <span style={{ color: "var(--text-secondary)", marginRight: "8px" }}>{idx + 1}.</span>
                  {q.question_text}
                </h4>

                <div className="review-options-list">
                  {q.options.map((opt) => {
                    const isSelected = ans.selected_option_id === opt.id;
                    const isCorrectOption = opt.is_correct;
                    
                    let optClass = "";
                    if (isCorrectOption) optClass = "correct-choice";
                    else if (isSelected) optClass = "wrong-choice";

                    return (
                      <div key={opt.id} className={`review-option-item ${optClass}`}>
                        <span className="choice-indicator"></span>
                        <span className="choice-text">{opt.option_text}</span>
                        {isCorrectOption && <span className="choice-pill-tag tag-correct">Correct Option</span>}
                        {isSelected && !isCorrectOption && <span className="choice-pill-tag tag-selected">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="review-explanation-box">
                    <strong>AI Concept Explanation:</strong>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render main tab contents
  const renderActiveView = () => {
    if (activeQuiz) {
      if (gradedAttempt) return renderQuizResults();
      return renderQuizRunner();
    }

    switch (activeTab) {
      case "documents":
        return (
          <div className="section-card">
            <div className="section-header">
              <h2>My Uploaded Documents</h2>
              <button className="quiz-action-btn quiz-btn-primary" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem" }} onClick={() => handleTabChange("generator")}>
                <PlusCircle size={14} />
                <span>Upload File</span>
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="empty-state">
                <Upload size={40} className="empty-state-icon" />
                <h3>No Documents Yet</h3>
                <p>Upload a syllabus PDF, PowerPoint deck, or Word doc to analyze its chapter hierarchy.</p>
              </div>
            ) : (
              <div className="documents-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "15px" }}>
                {documents.map((doc) => (
                  <div key={doc.id} className="quiz-card shimmer-card-glow" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <h3 className="quiz-title" style={{ fontSize: "1.1rem" }}>{doc.title}</h3>
                        <button className="quiz-action-btn quiz-btn-danger" style={{ padding: "4px" }} onClick={() => handleDeleteDocument(doc.id)} aria-label="Delete document">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="quiz-desc" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
                        <FileText size={12} />
                        <span>{doc.file_name}</span>
                      </p>
                      <div className="quiz-meta-row" style={{ marginTop: "15px", marginBottom: "15px" }}>
                        <span className="meta-pill source-pill">{doc.modules_count} Modules</span>
                        <span className="meta-pill source-pill">{doc.chapters_count} Chapters</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px", fontSize: "0.75rem" }}>
                      <span className="quiz-date">Uploaded {formatDate(doc.created_at)}</span>
                      <button className="quiz-action-btn quiz-btn-primary" style={{ padding: "6px 12px" }} onClick={() => handleOpenDocStructure(doc)}>
                        <Sparkles size={12} />
                        <span>Analyze & Generate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "quizzes": {
        const filteredQuizzes = quizzes.filter((quiz) => {
          const matchesSearch = quiz.title.toLowerCase().includes(quizSearch.toLowerCase()) || 
                                (quiz.description && quiz.description.toLowerCase().includes(quizSearch.toLowerCase()));
          const matchesDiff = difficultyFilter === "all" || quiz.difficulty === difficultyFilter;
          const matchesSource = sourceFilter === "all" || quiz.source_type === sourceFilter;
          return matchesSearch && matchesDiff && matchesSource;
        });

        return (
          <div className="section-card">
            <div className="section-header quizzes-view-header">
              <h2>My Generated Quizzes</h2>
              <button className="quiz-action-btn quiz-btn-primary" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem" }} onClick={() => handleTabChange("generator")}>
                <PlusCircle size={14} />
                <span>New Quiz</span>
              </button>
            </div>

            <div className="filters-search-row">
              <input
                type="text"
                className="dashboard-search-input"
                placeholder="Search quizzes..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
              />
              <div className="filter-select-group">
                <select
                  className="dashboard-filter-select"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  className="dashboard-filter-select"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="file">File Document</option>
                  <option value="text">Raw Text</option>
                  <option value="url">Web URL</option>
                </select>
              </div>
            </div>

            {filteredQuizzes.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={40} className="empty-state-icon" />
                <h3>No Quizzes Found</h3>
                <p>Generate a quiz using the generator tab to start testing yourself!</p>
              </div>
            ) : (
              <div className="quizzes-grid">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-card shimmer-card-glow">
                    <div className="quiz-card-header">
                      <div>
                        <h3 className="quiz-title">{quiz.title}</h3>
                        <p className="quiz-desc">{quiz.description}</p>
                      </div>
                    </div>
                    <div className="quiz-meta-row">
                      <span className={`meta-pill difficulty-${quiz.difficulty}`}>
                        {quiz.difficulty.toUpperCase()}
                      </span>
                      <span className="meta-pill source-pill">
                        {quiz.questions_count} Qs
                      </span>
                    </div>
                    <div className="quiz-card-footer">
                      <span className="quiz-date">Created {formatDate(quiz.created_at)}</span>
                      <div className="quiz-card-actions">
                        <button className="quiz-action-btn quiz-btn-danger" onClick={() => handleDeleteQuiz(quiz.id)} aria-label="Delete quiz">
                          <Trash2 size={14} />
                        </button>
                        <button className="quiz-action-btn quiz-btn-primary" onClick={() => startQuizRunner(quiz)}>
                          <Play size={14} />
                          <span>Start</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "history":
        return (
          <div className="section-card">
            <div className="section-header">
              <h2>Attempt History</h2>
            </div>
            {attempts.length === 0 ? (
              <div className="empty-state">
                <History size={40} className="empty-state-icon" />
                <h3>No Attempts Recorded</h3>
                <p>Complete a quiz to record and review your score details here.</p>
              </div>
            ) : (
              <div className="attempts-table-wrapper">
                <table className="attempts-table">
                  <thead>
                    <tr>
                      <th>Quiz Name</th>
                      <th>Date Completed</th>
                      <th>Time Elapsed</th>
                      <th>Accuracy</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => {
                      const isPassing = attempt.score >= 70;
                      const isExcellent = attempt.score >= 90;
                      return (
                        <tr key={attempt.id}>
                          <td style={{ fontWeight: 600 }}>{attempt.quiz_title}</td>
                          <td>{formatDate(attempt.completed_at)}</td>
                          <td>{Math.floor(attempt.time_spent / 60)}m {attempt.time_spent % 60}s</td>
                          <td style={{ fontWeight: 700, color: isExcellent ? "var(--accent-green)" : isPassing ? "var(--accent-amber)" : "var(--error)" }}>
                            {attempt.score}%
                          </td>
                          <td>
                            <span className={`score-badge ${isExcellent ? "excellent" : isPassing ? "passing" : "failing"}`}>
                              {isExcellent ? "Excellent" : isPassing ? "Passed" : "Needs Review"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );



      case "generator":
        return (
          <div className="section-card">
            <div className="section-header">
              <h2>Intelligent Quiz Generator</h2>
            </div>
            
            {/* Show progress stages for uploading/analyzing */}
            {uploadStatus !== "idle" && uploadStatus !== "done" && uploadStatus !== "error" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "30px" }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    border: "4px solid rgba(5, 196, 107, 0.1)",
                    borderTopColor: "var(--accent-green)",
                    animation: "shine-gradient 1.5s infinite linear"
                  }} className="spinner-border"></div>
                  <Sparkles size={24} style={{ position: "absolute", top: "38px", left: "38px", color: "var(--accent-green)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", marginBottom: "10px" }}>Analyzing Document...</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px", textAlign: "center" }}>{uploadProgressMsg}</p>
                <div style={{ width: "260px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "var(--accent-gradient)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            ) : isGeneratingQuiz ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "30px" }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    border: "4px solid rgba(5, 196, 107, 0.1)",
                    borderTopColor: "var(--accent-green)",
                    animation: "shine-gradient 1.5s infinite linear"
                  }} className="spinner-border"></div>
                  <Sparkles size={24} style={{ position: "absolute", top: "38px", left: "38px", color: "var(--accent-green)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", marginBottom: "10px" }}>AI Generating Quiz...</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center" }}>{quizProgressMsg}</p>
              </div>
            ) : analyzedDoc ? (
              // Document structure rendering with checkboxes
              <form onSubmit={handleGenerateQuiz}>
                <div className="generator-intro" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", pb: "15px", mb: "20px" }}>
                  <h3>Document Title: {analyzedDoc.title}</h3>
                  <p style={{ color: "var(--text-secondary)" }}>Select which modules or chapters you want to generate quiz questions from.</p>
                </div>

                {/* Auto-generated quiz quick-start card */}
                {analyzedDoc._autoQuizId && (
                  <div className="auto-quiz-ready-card">
                    <div className="auto-quiz-ready-content">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Sparkles size={22} style={{ color: "var(--accent-green)" }} />
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "4px" }}>Quiz Auto-Generated!</h4>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                            15 MCQ questions have been generated from your document. Start practicing instantly!
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="quiz-action-btn quiz-btn-primary auto-quiz-start-btn"
                        onClick={async () => {
                          const token = sessionStorage.getItem("questai_user") ? "session_active" : null;
                          try {
                            const res = await fetch(`${apiBaseUrl}/api/quizzes/${analyzedDoc._autoQuizId}?mode=practice`, {
                              headers: { "Authorization": `Bearer ${token}` }
                            });
                            if (res.ok) {
                              const quizData = await res.json();
                              startQuizRunner(quizData);
                            }
                          } catch (err) {
                            setErrorMsg("Failed to load auto-generated quiz.");
                          }
                        }}
                      >
                        <Play size={16} />
                        <span>Start Quiz Now</span>
                      </button>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "12px", marginBottom: 0 }}>
                      Or select specific chapters below to generate a custom quiz.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <button type="button" className="quiz-action-btn" style={{ background: "rgba(255,255,255,0.05)" }} onClick={handleToggleAllChapters}>
                    Toggle Select All
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <strong>{selectedChapters.length}</strong> chapter(s) selected
                  </span>
                </div>

                {/* Tree Structure Layout */}
                <div className="document-tree-container" style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "15px", background: "rgba(0,0,0,0.1)", marginBottom: "25px" }}>
                  {analyzedDoc.structure.map((mod) => {
                    const checkState = getModuleCheckState(mod);
                    const isModExpanded = expandedModules[mod.id] !== false;
                    
                    return (
                      <div key={mod.id} className="tree-module-node" style={{ marginBottom: "15px" }}>
                        <div className="tree-module-header" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", p: 0 }}
                            onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !isModExpanded }))}
                          >
                            {isModExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          
                          {/* Module Checkbox */}
                          {mod.title ? (
                            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "bold", flexGrow: 1, fontSize: "0.95rem" }}>
                              <input
                                type="checkbox"
                                checked={checkState === "all"}
                                ref={(el) => {
                                  if (el) el.indeterminate = checkState === "partial";
                                }}
                                onChange={() => handleToggleModule(mod)}
                              />
                              <span>{mod.title}</span>
                            </label>
                          ) : (
                            <span style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.95rem" }}>General Chapters</span>
                          )}
                        </div>

                        {/* Chapters under Module */}
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
                                    <span style={{ color: isChapChecked ? "#FAF9F6" : "var(--text-secondary)" }}>{chap.title}</span>
                                  </label>
                                  {chap.topics && chap.topics.length > 0 && (
                                    <div className="tree-topics-list" style={{ paddingLeft: "25px", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                      <ul style={{ listStyleType: "disc", margin: 0, paddingLeft: "15px" }}>
                                        {chap.topics.map(t => (
                                          <li key={t.id}>{t.title}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
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
                    <label htmlFor="gen-difficulty">Difficulty Threshold</label>
                    <select
                      id="gen-difficulty"
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
                    <label htmlFor="gen-questions">Total Questions</label>
                    <select
                      id="gen-questions"
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

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button type="button" className="generator-submit-btn" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", width: "auto", flexGrow: 1 }} onClick={() => setAnalyzedDoc(null)}>
                    Back to Upload
                  </button>
                  <button type="submit" className="generator-submit-btn" style={{ width: "auto", flexGrow: 2 }} disabled={isGeneratingQuiz}>
                    <Sparkles size={18} />
                    <span>{isGeneratingQuiz ? "AI Generating Quiz..." : "Generate AI Quiz"}</span>
                  </button>
                </div>
              </form>
            ) : (
              // Standard upload form
              <form onSubmit={handleUploadAndAnalyze}>
                <div className="generator-intro">
                  <p>Upload a PDF, Word DOCX, or PowerPoint PPTX syllabus deck. The AI model will extract slide decks or pages, formulate layout modules/chapters, and let you select custom blocks to run testing parameters.</p>
                </div>

                <div className="generator-form-group">
                  <label>Document Source Input</label>
                  <div className="generator-input-type-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="generator-type-card selected" style={{ pointerEvents: "none" }}>
                      <Upload size={20} />
                      <span>Document File (PDF, PPTX, DOCX)</span>
                    </div>
                  </div>
                </div>

                <div className="generator-form-group">
                  <label>Upload Document (.pdf, .docx, .pptx)</label>
                  {genFile ? (
                    <div className="generator-selected-file-pill" style={{ display: "flex", alignItems: "center", background: "rgba(5, 196, 107, 0.06)", border: "1px solid rgba(5, 196, 107, 0.15)", borderRadius: "10px", padding: "10px 15px", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText size={16} style={{ color: "var(--accent-green)" }} />
                        <span>{genFile.name} ({(genFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button type="button" style={{ color: "var(--error)", cursor: "pointer", background: "none", border: "none", fontSize: "1.1rem" }} onClick={() => setGenFile(null)}>✕</button>
                    </div>
                  ) : (
                    <label htmlFor="gen-file" className="generator-file-upload-zone">
                      <Upload size={24} style={{ color: "var(--text-muted)" }} />
                      <strong>Browse Document File</strong>
                      <p>Drag and drop or click here to upload a syllabus PDF/PPTX/DOCX (Max 10MB)</p>
                      <input
                        type="file"
                        id="gen-file"
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
        );

      case "overview":
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Quick Actions Row */}
            <div className="section-card">
              <div className="section-header">
                <h2>Quick Overview</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Generate New Quiz</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>Formulate custom interactive questions dynamically by analyzing text layouts, PowerPoint nodes, or syllabus PDFs.</p>
                  <button className="quiz-action-btn quiz-btn-primary" style={{ alignSelf: "flex-start", marginTop: "5px" }} onClick={() => handleTabChange("generator")}>
                    <span>Launch Generator</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>My Document Library</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>Access your analyzed document repositories, view module structures, and slice chapters to trigger new assessments.</p>
                  <button className="quiz-action-btn" style={{ alignSelf: "flex-start", marginTop: "5px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={() => handleTabChange("documents")}>
                    <span>View Library</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Quizzes Mini List */}
            <div className="section-card">
              <div className="section-header">
                <h2>Recent Quizzes</h2>
                <button className="tab-btn" style={{ fontSize: "0.75rem", padding: "6px 12px", width: "auto", border: "1px solid rgba(255,255,255,0.05)" }} onClick={() => handleTabChange("quizzes")}>
                  View All
                </button>
              </div>
              {quizzes.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px 0" }}>No quizzes generated yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {quizzes.slice(0, 2).map((q) => (
                    <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{q.title}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{q.questions_count} Qs • {q.difficulty.toUpperCase()} difficulty</span>
                      </div>
                      <button className="quiz-action-btn quiz-btn-primary" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem" }} onClick={() => startQuizRunner(q)}>
                        <Play size={12} />
                        <span>Start</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Analytics Highlight Card */}
            <div className="section-card">
              <div className="section-header">
                <h2>Performance Analytics</h2>
              </div>
              <div className="analytics-split-layout">
                <div className="analytics-details-text">
                  <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>Adaptive Difficulty Indexing</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4", marginBottom: "15px" }}>Your average accuracy is currently sitting at <strong>{getAverageScore()}%</strong> across <strong>{attempts.length} attempts</strong>. The QuestAI model will serve more challenging topics as you sustain &gt;85% accuracy thresholds.</p>
                  <div className="progress-indicator-container">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "6px" }}>
                      <span>Concept Accuracy</span>
                      <span style={{ color: "var(--accent-green)" }}>{getAverageScore()}%</span>
                    </div>
                    <div className="overview-progress-bar-track">
                      <div className="overview-progress-bar-fill" style={{ width: `${getAverageScore()}%` }}></div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px", display: "inline-block" }}>Level Threshold: Intermediate (Level 2)</span>
                  </div>
                </div>
                <div className="analytics-chart-panel">
                  <h4 className="chart-panel-title">Score Progression</h4>
                  {renderPerformanceChart()}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Logged out boundary check
  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>

        <div className="dashboard-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="section-card" style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}>
            <AlertCircle size={48} className="empty-state-icon" style={{ color: "var(--accent-amber)", marginBottom: "20px" }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.8rem", marginBottom: "12px" }}>Access Restricted</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "1rem", lineHeight: "1.5" }}>
              Please sign in or create an account to view your personalized dashboard, generated quizzes, bookmarks, and analytics report.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="quiz-action-btn quiz-btn-primary" onClick={() => onOpenAuth("signin")}>
                Sign In
              </button>
              <button className="quiz-action-btn" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={() => onOpenAuth("signup")}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Background Decor Gradients */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      <div className="dashboard-container">
        {/* Alerts row */}
        {errorMsg && (
          <div style={{ background: "rgba(235, 94, 85, 0.1)", border: "1px solid rgba(235, 94, 85, 0.25)", color: "#eb5e55", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: "0.85rem" }}>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ background: "rgba(5, 196, 107, 0.1)", border: "1px solid rgba(5, 196, 107, 0.25)", color: "var(--accent-green)", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: "0.85rem" }}>{successMsg}</span>
          </div>
        )}

        {/* Banner Welcome */}
        <div className="dashboard-header-banner">
          <div className="welcome-info">
            <div className="welcome-avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name || "User"} className="welcome-avatar-img" />
              ) : (
                <div className="welcome-avatar-circle">
                  {(user.name || "User").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                </div>
              )}
            </div>
            <div className="welcome-text">
              <h1>Welcome back, {(user.name || "User").split(" ")[0]}!</h1>
              <p>Ready to challenge yourself today? Upload standard documents to generate custom quizzes.</p>
            </div>
          </div>
          <div className="header-action-date">
            <Calendar size={16} style={{ color: "var(--accent-green)" }} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box">
              <BookOpen size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{quizzes.length}</span>
              <span className="stat-label">Quizzes Saved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ color: "var(--accent-amber)", background: "rgba(255,159,67,0.08)", borderColor: "rgba(255,159,67,0.15)" }}>
              <History size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{attempts.length}</span>
              <span className="stat-label">Tests Taken</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ color: "var(--accent-green)", background: "rgba(5,196,107,0.08)" }}>
              <Award size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{getAverageScore()}%</span>
              <span className="stat-label">Avg Accuracy</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ color: "#00c2ff", background: "rgba(0,194,255,0.08)", borderColor: "rgba(0,194,255,0.15)" }}>
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{attempts.length > 0 ? `${(attempts.length * 0.25).toFixed(1)}h` : "0h"}</span>
              <span className="stat-label">Study Time</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="dashboard-main-layout">
          {/* Left Sidebar Menu */}
          <aside className="dashboard-sidebar">
            <nav className="tabs-list">
              <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => handleTabChange("overview")}>
                <LayoutDashboard size={18} />
                <span>Dashboard Overview</span>
              </button>
              <button className={`tab-btn ${activeTab === "documents" ? "active" : ""}`} onClick={() => handleTabChange("documents")}>
                <FileText size={18} />
                <span>My Documents ({documents.length})</span>
              </button>
              <button className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`} onClick={() => handleTabChange("quizzes")}>
                <BookOpen size={18} />
                <span>My Quizzes ({quizzes.length})</span>
              </button>
              <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => handleTabChange("history")}>
                <History size={18} />
                <span>Attempt History ({attempts.length})</span>
              </button>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "10px 0" }}></div>
              <button className={`tab-btn ${activeTab === "generator" ? "active" : ""}`} onClick={() => handleTabChange("generator")} style={{ border: "1px dashed var(--glass-border-hover)" }}>
                <Sparkles size={18} style={{ color: "var(--accent-amber)" }} />
                <span style={{ color: activeTab === "generator" ? "#FAF9F6" : "var(--text-primary)" }}>Quiz Generator</span>
              </button>
            </nav>
          </aside>

          {/* Right Main Panel View */}
          <main className="dashboard-content-panel">
            {loading && !activeQuiz && (
              <div className="empty-state" style={{ minHeight: "300px", justifyContent: "center" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.05)",
                  borderTopColor: "var(--accent-green)",
                  animation: "shine-gradient 1.2s infinite linear"
                }} className="spinner-border"></div>
                <p style={{ marginTop: "15px", color: "var(--text-secondary)" }}>Loading database records...</p>
              </div>
            )}
            {(!loading || activeQuiz) && renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
}

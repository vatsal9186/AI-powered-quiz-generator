import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Trash2, Edit3, CheckCircle, Ban, X, Plus } from 'lucide-react';

export default function Questions() {
  const [questionsList, setQuestionsList] = useState(() => {
    const saved = sessionStorage.getItem('questai_questions');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "What is the primary benefit of React Server Components (RSC)?", subject: "React 19", chapter: "Server Components", difficulty: "hard", createdBy: "Vatsal Kansara", usageCount: 14, date: "2026-08-23", status: "approved", explanation: "RSCs execute only on the server, which keeps heavy dependencies out of the client-side JavaScript bundle.", options: [
        { text: "Direct rendering optimization on server side.", isCorrect: true },
        { text: "Standard client bundling compression ratio.", isCorrect: false },
        { text: "Improved CSS rendering pathways.", isCorrect: false }
      ]},
      { id: 2, text: "Explain the differences between useMemo and useCallback in React.", subject: "React Hooks", chapter: "Memoization Hooks", difficulty: "medium", createdBy: "Vatsal Kansara", usageCount: 22, date: "2026-08-22", status: "approved", explanation: "useMemo caches the result of a function call, while useCallback caches the function instance itself.", options: [
        { text: "useMemo returns a memoized value; useCallback returns a memoized function.", isCorrect: true },
        { text: "useCallback executes during compilation; useMemo executes at runtime.", isCorrect: false },
        { text: "Both are obsolete in React 19.", isCorrect: false }
      ]},
      { id: 3, text: "Write a python script that implements a subclass inheriting variables from a parent.", subject: "Python", chapter: "Encapsulation & Inheritance", difficulty: "easy", createdBy: "Vatsal Kansara", usageCount: 8, date: "2026-08-20", status: "approved", explanation: "Use parent class name inside parentheses of subclass declaration, calling super().__init__() if initializer is overridden.", options: [
        { text: "class Child(Parent): pass", isCorrect: true },
        { text: "class Child implements Parent { }", isCorrect: false },
        { text: "class Child extend Parent:", isCorrect: false }
      ]},
      { id: 4, text: "Which HTTP status code represents a successful REST API resource deletion?", subject: "Web APIs", chapter: "REST Standards", difficulty: "easy", createdBy: "Hardik Jadav", usageCount: 19, date: "2026-08-19", status: "approved", explanation: "204 No Content is ideal when a DELETE operation succeeds and no response payload needs to be returned.", options: [
        { text: "204 No Content", isCorrect: true },
        { text: "200 Ok", isCorrect: false },
        { text: "201 Created", isCorrect: false }
      ]},
      { id: 5, text: "Explain the ACID properties of relational databases and how they map to PostgreSQL.", subject: "Databases", chapter: "SQL Constraints", difficulty: "hard", createdBy: "Vatsal Kansara", usageCount: 11, date: "2026-08-18", status: "approved", explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability - PostgreSQL guarantees these via write-ahead logging and MVCC.", options: [
        { text: "Atomicity, Consistency, Isolation, Durability", isCorrect: true },
        { text: "Access, Control, Indexing, Delivery", isCorrect: false },
        { text: "Availability, Consistency, Integration, Duplication", isCorrect: false }
      ]}
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('questai_questions', JSON.stringify(questionsList));
  }, [questionsList]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active Modals
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Manual Creation form states
  const [newText, setNewText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newExplanation, setNewExplanation] = useState('');
  const [newOptions, setNewOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(questionsList.map(q => q.subject)));
  }, [questionsList]);

  const filteredQuestions = useMemo(() => {
    let result = questionsList.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.chapter.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesDifficulty && matchesSubject && matchesStatus;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'usage-high') {
      result.sort((a, b) => b.usageCount - a.usageCount);
    } else if (sortBy === 'usage-low') {
      result.sort((a, b) => a.usageCount - b.usageCount);
    }

    return result;
  }, [questionsList, searchTerm, difficultyFilter, subjectFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Actions
  const handleDelete = (id) => {
    setQuestionsList(prev => prev.filter(q => q.id !== id));
  };

  const handleApprove = (id) => {
    setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, status: 'approved' } : q));
    if (selectedQuestion && selectedQuestion.id === id) {
      setSelectedQuestion(prev => ({ ...prev, status: 'approved' }));
    }
  };

  const handleReject = (id) => {
    setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected' } : q));
    if (selectedQuestion && selectedQuestion.id === id) {
      setSelectedQuestion(prev => ({ ...prev, status: 'rejected' }));
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const cleanOptions = newOptions.filter(o => o.text.trim() !== '');
    if (cleanOptions.length < 2) {
      alert("Please provide at least 2 options for the question.");
      return;
    }
    const hasCorrect = cleanOptions.some(o => o.isCorrect);
    if (!hasCorrect) {
      alert("Please select one option as correct.");
      return;
    }

    const created = {
      id: Date.now(),
      text: newText,
      subject: newSubject || "General",
      chapter: newChapter || "General Overview",
      difficulty: newDifficulty,
      createdBy: "Vatsal Kansara",
      usageCount: 0,
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      explanation: newExplanation || "No explanation provided.",
      options: cleanOptions
    };

    setQuestionsList(prev => [created, ...prev]);
    setIsCreateOpen(false);
    setNewText('');
    setNewSubject('');
    setNewChapter('');
    setNewDifficulty('medium');
    setNewExplanation('');
    setNewOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setQuestionsList(prev => prev.map(q => q.id === editQuestion.id ? editQuestion : q));
    setEditQuestion(null);
  };

  const handleOptionChange = (idx, value) => {
    setNewOptions(prev => prev.map((o, i) => i === idx ? { ...o, text: value } : o));
  };

  const handleOptionCorrectSelect = (idx) => {
    setNewOptions(prev => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  };

  const stats = useMemo(() => {
    const total = questionsList.length;
    const easy = questionsList.filter(q => q.difficulty === 'easy').length;
    const medium = questionsList.filter(q => q.difficulty === 'medium').length;
    const hard = questionsList.filter(q => q.difficulty === 'hard').length;
    return { total, easy, medium, hard };
  }, [questionsList]);

  return (
    <div className="questions-page-wrapper">
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <span className="stat-title" style={{ fontSize: '11px' }}>Total Questions</span>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '6px', marginBottom: 0 }}>{stats.total}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--admin-primary)' }}>
          <span className="stat-title" style={{ fontSize: '11px' }}>Easy Questions</span>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '6px', marginBottom: 0, color: 'var(--admin-primary)' }}>{stats.easy}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--admin-secondary)' }}>
          <span className="stat-title" style={{ fontSize: '11px' }}>Medium Questions</span>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '6px', marginBottom: 0, color: 'var(--admin-secondary)' }}>{stats.medium}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--admin-danger)' }}>
          <span className="stat-title" style={{ fontSize: '11px' }}>Hard Questions</span>
          <div className="stat-value" style={{ fontSize: '24px', marginTop: '6px', marginBottom: 0, color: 'var(--admin-danger)' }}>{stats.hard}</div>
        </div>
      </section>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Question Repository Bank</h3>
          <button className="admin-btn" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            <span>Create Question</span>
          </button>
        </div>

        <div className="section-header" style={{ borderBottom: '1px solid var(--admin-border-color)', paddingBottom: '20px', marginTop: '10px' }}>
          <div className="controls-container" style={{ width: '100%' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search question text, chapter..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <select 
              className="admin-select"
              value={subjectFilter}
              onChange={e => { setSubjectFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>

            <select 
              className="admin-select"
              value={difficultyFilter}
              onChange={e => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select 
              className="admin-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>

            <select 
              className="admin-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="usage-high">Most Used</option>
              <option value="usage-low">Least Used</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question Prompt</th>
                <th>Subject & Chapter</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Appears In</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.length > 0 ? (
                paginatedQuestions.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div 
                        style={{ 
                          maxWidth: '280px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap', 
                          fontWeight: 500 
                        }}
                        title={q.text}
                      >
                        {q.text}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{q.subject}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.chapter}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${q.difficulty}`}>{q.difficulty}</span>
                    </td>
                    <td>
                      <span className={`badge ${q.status === 'approved' ? 'active' : q.status === 'pending' ? 'medium' : 'suspended'}`}>
                        {q.status === 'approved' ? 'approved' : q.status === 'pending' ? 'pending' : 'rejected'}
                      </span>
                    </td>
                    <td style={{ paddingLeft: '30px' }}>
                      <strong>{q.usageCount}</strong> quizzes
                    </td>
                    <td>{q.createdBy}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="View details" onClick={() => setSelectedQuestion(q)}>
                          <Eye size={14} />
                        </button>
                        <button className="action-btn edit" title="Edit Question" onClick={() => setEditQuestion(q)}>
                          <Edit3 size={14} />
                        </button>
                        {q.status === 'pending' && (
                          <>
                            <button className="action-btn view" style={{ color: 'var(--admin-primary)' }} title="Approve Question" onClick={() => handleApprove(q.id)}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="action-btn delete" style={{ color: 'var(--admin-danger)' }} title="Reject Question" onClick={() => handleReject(q.id)}>
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                        <button className="action-btn delete" title="Delete permanently" onClick={() => handleDelete(q.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">❓</div>
                      <h4 className="empty-state-title">No Questions Found</h4>
                      <p className="empty-state-desc">No queries match selection filters or keyword strings.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
            </span>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`page-num ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
              <button 
                className="pagination-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedQuestion && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedQuestion(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Question Card Review</h3>
              <button className="modal-close-btn" onClick={() => setSelectedQuestion(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Question Text</span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.5 }}>
                  {selectedQuestion.text}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--admin-border-color)', borderBottom: '1px solid var(--admin-border-color)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Subject</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{selectedQuestion.subject}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Chapter</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{selectedQuestion.chapter}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Difficulty</span>
                  <div style={{ marginTop: '2px' }}><span className={`badge ${selectedQuestion.difficulty}`}>{selectedQuestion.difficulty}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Review status</span>
                  <div style={{ marginTop: '2px' }}><span className={`badge ${selectedQuestion.status === 'approved' ? 'active' : selectedQuestion.status === 'pending' ? 'medium' : 'suspended'}`}>{selectedQuestion.status}</span></div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Multiple Choice Options</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {selectedQuestion.options && selectedQuestion.options.map((opt, idx) => (
                    <div key={idx} style={{ 
                      padding: '8px 12px', 
                      border: `1px solid ${opt.isCorrect ? 'var(--admin-primary)' : 'var(--admin-border-color)'}`, 
                      borderRadius: '6px', 
                      fontSize: '13px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      backgroundColor: opt.isCorrect ? 'var(--admin-primary-glow)' : 'transparent' 
                    }}>
                      <span>{opt.text}</span>
                      {opt.isCorrect && <span style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>Correct Answer</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Explanation / Solution Key</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedQuestion.explanation}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              {selectedQuestion.status === 'pending' && (
                <>
                  <button className="admin-btn" style={{ background: 'var(--admin-primary)' }} onClick={() => handleApprove(selectedQuestion.id)}>Approve</button>
                  <button className="admin-btn" style={{ background: 'var(--admin-danger)' }} onClick={() => handleReject(selectedQuestion.id)}>Reject</button>
                </>
              )}
              <button className="admin-btn secondary" onClick={() => setSelectedQuestion(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editQuestion && (
        <div className="admin-modal-backdrop" onClick={() => setEditQuestion(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Question Bank Record</h3>
              <button className="modal-close-btn" onClick={() => setEditQuestion(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Question Text Prompt</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={editQuestion.text}
                    onChange={e => setEditQuestion({ ...editQuestion, text: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editQuestion.subject}
                      onChange={e => setEditQuestion({ ...editQuestion, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chapter / Topic</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={editQuestion.chapter}
                      onChange={e => setEditQuestion({ ...editQuestion, chapter: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select 
                      className="admin-select" 
                      style={{ width: '100%' }}
                      value={editQuestion.difficulty}
                      onChange={e => setEditQuestion({ ...editQuestion, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approval status</label>
                    <select 
                      className="admin-select" 
                      style={{ width: '100%' }}
                      value={editQuestion.status}
                      onChange={e => setEditQuestion({ ...editQuestion, status: e.target.value })}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Modify Options (Select correct option radio)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {editQuestion.options && editQuestion.options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="radio" 
                          name="edit-correct-radio"
                          checked={opt.isCorrect} 
                          onChange={() => {
                            const updatedOpts = editQuestion.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                            setEditQuestion({ ...editQuestion, options: updatedOpts });
                          }}
                        />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ margin: 0, flex: 1 }}
                          value={opt.text}
                          onChange={(e) => {
                            const updatedOpts = editQuestion.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o);
                            setEditQuestion({ ...editQuestion, options: updatedOpts });
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Explanation</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={editQuestion.explanation}
                    onChange={e => setEditQuestion({ ...editQuestion, explanation: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setEditQuestion(null)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {isCreateOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Manual Question</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Question Text Prompt</label>
                  <textarea 
                    placeholder="Enter question prompt..."
                    className="form-input" 
                    style={{ minHeight: '50px', resize: 'vertical' }}
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject Category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React 19"
                      className="form-input"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chapter / Topic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Server Components"
                      className="form-input"
                      value={newChapter}
                      onChange={e => setNewChapter(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Difficulty Rating</label>
                  <select 
                    className="admin-select" 
                    style={{ width: '100%' }}
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Create Option Items (Mark correct radio button)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {newOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="radio" 
                          name="create-correct-radio"
                          checked={opt.isCorrect} 
                          onChange={() => handleOptionCorrectSelect(idx)}
                        />
                        <input 
                          type="text" 
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="form-input" 
                          style={{ margin: 0, flex: 1 }}
                          value={opt.text}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          required={idx < 2} // At least 2 options are required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Explanation / Correct Rationale</label>
                  <textarea 
                    placeholder="Include details explaining why marked answer is correct..."
                    className="form-input" 
                    style={{ minHeight: '50px', resize: 'vertical' }}
                    value={newExplanation}
                    onChange={e => setNewExplanation(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save to Repository</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

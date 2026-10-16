import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Edit3, Trash2, Plus, X, Globe, EyeOff, Archive } from 'lucide-react';
import { QuizViewModal, QuizEditModal, QuizDeleteModal } from '../components/Modals';

export default function Quizzes() {
  const [quizzesList, setQuizzesList] = useState(() => {
    const saved = sessionStorage.getItem('questai_quizzes');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "React 19 Hooks Advanced", createdBy: "Vatsal Kansara", questionsCount: 15, difficulty: "hard", attempts: 184, status: "published", createdDate: "2026-08-23", description: "Test your skills on advanced hooks like useActionState, useFormStatus, and compilation optimization.", duration: 25, passingScore: 60 },
      { id: 2, name: "Logical Aptitude & Puzzles", createdBy: "Vatsal Kansara", questionsCount: 20, difficulty: "medium", attempts: 642, status: "published", createdDate: "2026-08-22", description: "A set of aptitude puzzles checking cognitive mapping, speed math, and semantic alignment.", duration: 30, passingScore: 50 },
      { id: 3, name: "Python Encapsulation Basics", createdBy: "Vatsal Kansara", questionsCount: 10, difficulty: "easy", attempts: 322, status: "published", createdDate: "2026-08-20", description: "Foundational quiz testing name mangling, private variables, and constructor class methods.", duration: 15, passingScore: 50 },
      { id: 4, name: "FastAPI CRUD Operations", createdBy: "Hardik Jadav", questionsCount: 12, difficulty: "medium", attempts: 89, status: "draft", createdDate: "2026-08-19", description: "Path operations test utilizing SQLAlchemy async models and query filters.", duration: 20, passingScore: 55 },
      { id: 5, name: "SQL Subqueries & Join Optimization", createdBy: "Vatsal Kansara", questionsCount: 15, difficulty: "hard", attempts: 412, status: "published", createdDate: "2026-08-18", description: "Analytical join types, indexing strategies, and nested query benchmarks.", duration: 20, passingScore: 60 },
      { id: 6, name: "Javascript ES13 Features", createdBy: "Vatsal Kansara", questionsCount: 10, difficulty: "medium", attempts: 156, status: "archived", createdDate: "2026-08-15", description: "Top-level await, error causes, and object-has-own validations.", duration: 15, passingScore: 50 }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('questai_quizzes', JSON.stringify(quizzesList));
  }, [quizzesList]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active Modals
  const [viewQuiz, setViewQuiz] = useState(null);
  const [editQuiz, setEditQuiz] = useState(null);
  const [deleteQuiz, setDeleteQuiz] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create form states
  const [newQuizName, setNewQuizName] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [newQuizDifficulty, setNewQuizDifficulty] = useState('medium');
  const [newQuizQuestions, setNewQuizQuestions] = useState(10);
  const [newQuizDuration, setNewQuizDuration] = useState(20);
  const [newQuizPassing, setNewQuizPassing] = useState(50);
  const [newQuizStatus, setNewQuizStatus] = useState('draft');

  const filteredQuizzes = useMemo(() => {
    let result = quizzesList.filter(q => {
      const matchesSearch = 
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

      return matchesSearch && matchesDifficulty && matchesStatus;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    } else if (sortBy === 'attempts') {
      result.sort((a, b) => b.attempts - a.attempts);
    } else if (sortBy === 'questions') {
      result.sort((a, b) => b.questionsCount - a.questionsCount);
    }

    return result;
  }, [quizzesList, searchTerm, difficultyFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage) || 1;
  const paginatedQuizzes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuizzes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuizzes, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSaveEdit = (updatedQuiz) => {
    setQuizzesList(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
    setEditQuiz(null);
  };

  const handleDeleteConfirm = (quizId) => {
    setQuizzesList(prev => prev.filter(q => q.id !== quizId));
    setDeleteQuiz(null);
  };

  // Toggle status shortcut
  const handleToggleStatus = (id, newStatus) => {
    setQuizzesList(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const createdQuiz = {
      id: Date.now(),
      name: newQuizName,
      createdBy: "Vatsal Kansara",
      questionsCount: parseInt(newQuizQuestions) || 10,
      difficulty: newQuizDifficulty,
      attempts: 0,
      status: newQuizStatus,
      createdDate: new Date().toISOString().split('T')[0],
      description: newQuizDesc || "No description provided.",
      duration: parseInt(newQuizDuration) || 20,
      passingScore: parseInt(newQuizPassing) || 50
    };
    setQuizzesList(prev => [createdQuiz, ...prev]);
    setIsCreateOpen(false);
    setNewQuizName('');
    setNewQuizDesc('');
    setNewQuizDifficulty('medium');
    setNewQuizQuestions(10);
    setNewQuizDuration(20);
    setNewQuizPassing(50);
    setNewQuizStatus('draft');
  };

  return (
    <div className="quizzes-page-wrapper">
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Quiz Configurations</h3>
          
          <button className="admin-btn" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            <span>Create Quiz</span>
          </button>
        </div>

        <div className="section-header" style={{ borderBottom: '1px solid var(--admin-border-color)', paddingBottom: '20px', marginTop: '10px' }}>
          <div className="controls-container" style={{ width: '100%' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search quiz title, creator..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select 
              className="admin-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="attempts">Most Popular</option>
              <option value="questions">Questions Count</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Created By</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Difficulty</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuizzes.length > 0 ? (
                paginatedQuizzes.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{q.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created: {q.createdDate}</span>
                      </div>
                    </td>
                    <td>{q.createdBy}</td>
                    <td style={{ paddingLeft: '35px' }}>{q.questionsCount}</td>
                    <td>{q.duration} mins</td>
                    <td>
                      <span className={`badge ${q.difficulty}`}>{q.difficulty}</span>
                    </td>
                    <td>{q.attempts} attempts</td>
                    <td>
                      <span className={`badge ${q.status === 'published' ? 'active' : q.status === 'draft' ? 'medium' : 'suspended'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="View details" onClick={() => setViewQuiz(q)}>
                          <Eye size={14} />
                        </button>
                        <button className="action-btn edit" title="Edit Configurations" onClick={() => setEditQuiz(q)}>
                          <Edit3 size={14} />
                        </button>
                        {q.status === 'draft' && (
                          <button className="action-btn view" style={{ color: 'var(--admin-primary)' }} title="Publish Quiz" onClick={() => handleToggleStatus(q.id, 'published')}>
                            <Globe size={14} />
                          </button>
                        )}
                        {q.status === 'published' && (
                          <button className="action-btn view" style={{ color: 'var(--admin-secondary)' }} title="Unpublish Quiz" onClick={() => handleToggleStatus(q.id, 'draft')}>
                            <EyeOff size={14} />
                          </button>
                        )}
                        {q.status !== 'archived' && (
                          <button className="action-btn view" style={{ color: 'var(--text-muted)' }} title="Archive Quiz" onClick={() => handleToggleStatus(q.id, 'archived')}>
                            <Archive size={14} />
                          </button>
                        )}
                        <button className="action-btn delete" title="Delete Quiz" onClick={() => setDeleteQuiz(q)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">📝</div>
                      <h4 className="empty-state-title">No Quizzes Match Criteria</h4>
                      <p className="empty-state-desc">Try resetting your status filters or inputting a different search keyword.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredQuizzes.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuizzes.length)} of {filteredQuizzes.length} entries
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
      {viewQuiz && (
        <div className="admin-modal-backdrop" onClick={() => setViewQuiz(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Quiz Configurations Details</h3>
              <button className="modal-close-btn" onClick={() => setViewQuiz(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{viewQuiz.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Created by <strong>{viewQuiz.createdBy}</strong> on {viewQuiz.createdDate}</p>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {viewQuiz.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--admin-border-color)', borderBottom: '1px solid var(--admin-border-color)' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Questions</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{viewQuiz.questionsCount} items</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration Limit</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{viewQuiz.duration} minutes</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passing score</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{viewQuiz.passingScore}% minimum</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Difficulty Rating</span>
                  <div style={{ marginTop: '2px' }}><span className={`badge ${viewQuiz.difficulty}`}>{viewQuiz.difficulty}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Publishing Status</span>
                  <div style={{ marginTop: '2px' }}><span className={`badge ${viewQuiz.status === 'published' ? 'active' : viewQuiz.status === 'draft' ? 'medium' : 'suspended'}`}>{viewQuiz.status}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Student Attempts</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{viewQuiz.attempts} attempts</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setViewQuiz(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editQuiz && (
        <div className="admin-modal-backdrop" onClick={() => setEditQuiz(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Quiz Configuration</h3>
              <button className="modal-close-btn" onClick={() => setEditQuiz(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit(editQuiz);
            }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quiz Name / Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editQuiz.name} 
                    onChange={e => setEditQuiz({ ...editQuiz, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={editQuiz.description} 
                    onChange={e => setEditQuiz({ ...editQuiz, description: e.target.value })} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="admin-select" value={editQuiz.difficulty} onChange={e => setEditQuiz({ ...editQuiz, difficulty: e.target.value })} style={{ width: '100%' }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publishing Status</label>
                    <select className="admin-select" value={editQuiz.status} onChange={e => setEditQuiz({ ...editQuiz, status: e.target.value })} style={{ width: '100%' }}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Questions</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      className="form-input" 
                      value={editQuiz.questionsCount}
                      onChange={e => setEditQuiz({ ...editQuiz, questionsCount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (m)</label>
                    <input 
                      type="number" 
                      min="5" 
                      max="180" 
                      className="form-input" 
                      value={editQuiz.duration}
                      onChange={e => setEditQuiz({ ...editQuiz, duration: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pass Score (%)</label>
                    <input 
                      type="number" 
                      min="10" 
                      max="100" 
                      className="form-input" 
                      value={editQuiz.passingScore}
                      onChange={e => setEditQuiz({ ...editQuiz, passingScore: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setEditQuiz(null)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteQuiz && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteQuiz(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Quiz Configuration</h3>
              <button className="modal-close-btn" onClick={() => setDeleteQuiz(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ color: 'var(--admin-danger)', backgroundColor: 'rgba(255, 94, 87, 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} />
              </div>
              <h4 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>Confirm Permanent Deletion?</h4>
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are deleting quiz <strong>{deleteQuiz.name}</strong>. This removes it from student dashboard panels and purges attempt history.
              </p>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setDeleteQuiz(null)}>Cancel</button>
              <button className="admin-btn" style={{ background: 'var(--admin-danger)' }} onClick={() => handleDeleteConfirm(deleteQuiz.id)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Configure & Create Quiz</h3>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quiz Name / Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Docker Volumes Deep Dive" 
                    className="form-input" 
                    value={newQuizName}
                    onChange={e => setNewQuizName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    placeholder="Provide overview details..." 
                    className="form-input" 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={newQuizDesc}
                    onChange={e => setNewQuizDesc(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select className="admin-select" value={newQuizDifficulty} onChange={e => setNewQuizDifficulty(e.target.value)} style={{ width: '100%' }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="admin-select" value={newQuizStatus} onChange={e => setNewQuizStatus(e.target.value)} style={{ width: '100%' }}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Questions</label>
                    <input 
                      type="number" 
                      min="5" 
                      max="50" 
                      className="form-input" 
                      value={newQuizQuestions}
                      onChange={e => setNewQuizQuestions(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (m)</label>
                    <input 
                      type="number" 
                      min="5" 
                      max="180" 
                      className="form-input" 
                      value={newQuizDuration}
                      onChange={e => setNewQuizDuration(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pass Score (%)</label>
                    <input 
                      type="number" 
                      min="10" 
                      max="100" 
                      className="form-input" 
                      value={newQuizPassing}
                      onChange={e => setNewQuizPassing(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Configurations</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, X, BookOpen, Clock, Award, CheckCircle } from 'lucide-react';

export default function Assessment() {
  const [attempts, setAttempts] = useState(() => {
    const saved = sessionStorage.getItem('questai_attempts');
    return saved ? JSON.parse(saved) : [
      { id: 1, studentName: "Vatsal Kansara", email: "vatsal.k@gmail.com", quizName: "React 19 Hooks Advanced", score: "13/15", accuracy: 87, timeSpent: "12m 40s", status: "passed", date: "2026-08-23", subject: "React 19", answers: [
        { q: "What is the primary benefit of React Server Components (RSC)?", chosen: "A) Direct rendering optimization on server side.", correct: "A) Direct rendering optimization on server side.", status: "correct", explanation: "RSCs execute only on the server, which minimizes client bundle size by keeping heavy dependencies on the backend." },
        { q: "Explain the difference between useActionState and useFormStatus.", chosen: "B) They perform identical operations.", correct: "A) useActionState manages Action state; useFormStatus checks parent form pending status.", status: "incorrect", explanation: "useActionState is for returning state values from actions, whereas useFormStatus checks if a parent form is currently in a pending submission state." }
      ]},
      { id: 2, studentName: "Hardik Jadav", email: "hardik.j@gmail.com", quizName: "Logical Aptitude & Puzzles", score: "18/20", accuracy: 90, timeSpent: "14m 10s", status: "passed", date: "2026-08-22", subject: "Aptitude", answers: [
        { q: "If A is taller than B, and B is taller than C, who is the shortest?", chosen: "C) Person C", correct: "C) Person C", status: "correct", explanation: "Linear ordering shows A > B > C, hence C is shortest." }
      ]},
      { id: 3, studentName: "David Miller", email: "miller.d@outlook.com", quizName: "Python Encapsulation Basics", score: "5/10", accuracy: 50, timeSpent: "08m 15s", status: "passed", date: "2026-08-21", subject: "Python", answers: [
        { q: "Which prefix declares a private attribute in a Python class?", chosen: "A) Single underscore (_)", correct: "B) Double underscore (__)", status: "incorrect", explanation: "Double underscore (__) triggers name mangling, making the attribute private to the class." }
      ]},
      { id: 4, studentName: "Jessica Alba", email: "jessica@alba.com", quizName: "SQL Subqueries & Join Optimization", score: "6/15", accuracy: 40, timeSpent: "15m 00s", status: "failed", date: "2026-08-19", subject: "Databases", answers: [
        { q: "What is the key difference between INNER JOIN and LEFT JOIN?", chosen: "B) Both return all rows from the right table.", correct: "A) INNER JOIN returns matches in both; LEFT JOIN returns all left rows.", status: "incorrect", explanation: "LEFT JOIN ensures all records from the left table are returned, filling null values for missing right-side records." }
      ]},
      { id: 5, studentName: "Emma Watson", email: "emma@hermione.org", quizName: "React 19 Hooks Advanced", score: "15/15", accuracy: 100, timeSpent: "09m 50s", status: "passed", date: "2026-08-18", subject: "React 19", answers: [] },
      { id: 6, studentName: "Robert Downey", email: "tony@stark.com", quizName: "Docker Containerization Essentials", score: "9/10", accuracy: 90, timeSpent: "07m 12s", status: "passed", date: "2026-08-17", subject: "DevOps", answers: [] },
      { id: 7, studentName: "Vatsal Kansara", email: "vatsal.k@gmail.com", quizName: "SQL Subqueries & Join Optimization", score: "11/15", accuracy: 73, timeSpent: "13m 22s", status: "passed", date: "2026-08-15", subject: "Databases", answers: [] },
      { id: 8, studentName: "Hardik Jadav", email: "hardik.j@gmail.com", quizName: "Python Encapsulation Basics", score: "9/10", accuracy: 90, timeSpent: "10m 05s", status: "passed", date: "2026-08-14", subject: "Python", answers: [] }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('questai_attempts', JSON.stringify(attempts));
  }, [attempts]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  // Subjects lists
  const subjectsList = useMemo(() => {
    return Array.from(new Set(attempts.map(a => a.subject)));
  }, [attempts]);

  // Filtering & Sorting
  const filteredAttempts = useMemo(() => {
    let result = attempts.filter(a => {
      const matchesSearch = a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.quizName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesSubject = subjectFilter === 'all' || a.subject === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'score-high') {
      result.sort((a, b) => b.accuracy - a.accuracy);
    } else if (sortBy === 'score-low') {
      result.sort((a, b) => a.accuracy - b.accuracy);
    }

    return result;
  }, [attempts, searchTerm, statusFilter, subjectFilter, sortBy]);

  const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage) || 1;
  const paginatedAttempts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAttempts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAttempts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Aggregates for display cards
  const stats = useMemo(() => {
    const totalCount = attempts.length;
    const passedCount = attempts.filter(a => a.status === 'passed').length;
    const avgAccuracy = attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalCount) : 0;
    const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    return { totalCount, avgAccuracy, passRate };
  }, [attempts]);

  // Quiz-wise performance data (Chart Data)
  const chartData = {
    labels: ["React 19", "Python", "Aptitude", "SQL DB", "Docker"],
    data: [93, 70, 90, 56, 90]
  };

  return (
    <div className="assessment-page-wrapper">
      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '25px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Attempts Monitored</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-info)' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.totalCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered exam submissions</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Average Score Accuracy</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-primary)' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.avgAccuracy}%</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mean scoring on test matrices</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Overall Pass Rate</span>
            <div className="stat-icon-wrapper" style={{ color: 'var(--admin-secondary)' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.passRate}%</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submissions above 50% threshold</span>
        </div>
      </section>

      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Assessment Attempt Registry</h3>
          
          <div className="controls-container">
            <div className="search-input-wrapper">
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search student, quiz topic..." 
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
              {subjectsList.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>

            <select 
              className="admin-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>

            <select 
              className="admin-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="score-high">Highest Accuracy</option>
              <option value="score-low">Lowest Accuracy</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Quiz Topic</th>
                <th>Subject</th>
                <th>Score Ratio</th>
                <th>Accuracy</th>
                <th>Time Spent</th>
                <th>Status</th>
                <th>Attempt Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttempts.length > 0 ? (
                paginatedAttempts.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{a.studentName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.email}</span>
                      </div>
                    </td>
                    <td>{a.quizName}</td>
                    <td><span className="badge user">{a.subject}</span></td>
                    <td>{a.score}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{a.accuracy}%</strong>
                        <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${a.accuracy}%`, 
                              height: '100%', 
                              backgroundColor: a.status === 'passed' ? 'var(--admin-primary)' : 'var(--admin-danger)' 
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>{a.timeSpent}</td>
                    <td>
                      <span className={`badge ${a.status === 'passed' ? 'active' : 'suspended'}`}>
                        {a.status === 'passed' ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td>{a.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="View Review Sheet" onClick={() => setSelectedAttempt(a)}>
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <div className="empty-state-icon">📊</div>
                      <h4 className="empty-state-title">No Attempts Logged</h4>
                      <p className="empty-state-desc">Try clearing filter conditions or searching a different keyword.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAttempts.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAttempts.length)} of {filteredAttempts.length} entries
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

      {/* Review sheet modal details */}
      {selectedAttempt && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedAttempt(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Student Response Sheet</h3>
              <button className="modal-close-btn" onClick={() => setSelectedAttempt(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--admin-border-color)' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedAttempt.studentName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedAttempt.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exam Title</span>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedAttempt.quizName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Subject: {selectedAttempt.subject}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Score</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`badge ${selectedAttempt.status === 'passed' ? 'active' : 'suspended'}`}>
                      {selectedAttempt.score} ({selectedAttempt.accuracy}% Accuracy)
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time & Date</span>
                  <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>{selectedAttempt.timeSpent} on {selectedAttempt.date}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Question Response Matrix</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  {selectedAttempt.answers && selectedAttempt.answers.length > 0 ? (
                    selectedAttempt.answers.map((ans, idx) => (
                      <div key={idx} style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: `1px solid ${ans.status === 'correct' ? 'rgba(5, 196, 107, 0.15)' : 'rgba(255, 94, 87, 0.15)'}` 
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          Q{idx + 1}: {ans.q}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '8px' }}>
                          <div style={{ color: ans.status === 'correct' ? 'var(--admin-primary)' : 'var(--admin-danger)' }}>
                            <strong>Selected Answer:</strong> {ans.chosen}
                          </div>
                          {ans.status === 'incorrect' && (
                            <div style={{ color: 'var(--admin-primary)' }}>
                              <strong>Expected Answer:</strong> {ans.correct}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(100, 100, 100, 0.08)', paddingTop: '6px' }}>
                          <strong>Explanation:</strong> {ans.explanation}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontStyle: 'italic', fontSize: '12px', color: 'var(--text-muted)' }}>
                      No detailed response matrix parsed for this historical submission. Only aggregate score was logged.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setSelectedAttempt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

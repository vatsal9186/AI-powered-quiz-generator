import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Trash2, Edit3, UploadCloud, RefreshCw, X, FolderOpen, FileText } from 'lucide-react';

export default function Content() {
  const [materials, setMaterials] = useState(() => {
    const saved = sessionStorage.getItem('questai_materials');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "React 19 Advanced Performance & RSC", fileName: "react19_perf_guide.pdf", subject: "React 19", chaptersCount: 4, size: "1.2 MB", uploadDate: "2026-08-20", status: "parsed", description: "Deep-dive study guide covering React Server Components, Suspense boundaries, and compiler-level render tree optimizations.", structure: [
        { id: 1, title: "Module 1: Server Components Architecture", chapters: ["Introduction to Server Components", "Data Fetching Paradigms", "Streaming HTML & Progressive Hydration"] },
        { id: 2, title: "Module 2: React 19 Compiler", chapters: ["Auto-memoization internals", "Bypassing useMemo & useCallback"] }
      ]},
      { id: 2, title: "Introduction to Python OOP & Classes", fileName: "python_oop_basics.docx", subject: "Python", chaptersCount: 3, size: "840 KB", uploadDate: "2026-08-18", status: "parsed", description: "Core OOP foundations for Python including parent-child inheritance, encapsulation rules, and operator overloading configurations.", structure: [
        { id: 1, title: "Module 1: Classes & Object Syntax", chapters: ["Constructors & self keyword", "Instance vs Class Variables"] },
        { id: 2, title: "Module 2: Inheritance Foundations", chapters: ["Single & Multiple Inheritance", "Method Resolution Order (MRO)"] }
      ]},
      { id: 3, title: "FastAPI Routing & Dependency Injection", fileName: "fastapi_di_architecture.pdf", subject: "Python", chaptersCount: 5, size: "2.1 MB", uploadDate: "2026-08-15", status: "parsed", description: "Architectural blueprint detailing path operations, dependencies, OAuth2 scopes, and database session bindings.", structure: [
        { id: 1, title: "Module 1: Router Layouts", chapters: ["APIRouter instances", "Path and Query parameters validation"] },
        { id: 2, title: "Module 2: Dependency Injection Engine", chapters: ["Depends() keyword rules", "Yielding database connections", "Mocking dependencies in tests"] }
      ]},
      { id: 4, title: "PostgreSQL Constraint Fundamentals", fileName: "postgres_constraints.pdf", subject: "Databases", chaptersCount: 2, size: "620 KB", uploadDate: "2026-08-12", status: "parsing", description: "Study text focusing on foreign key constraints, index creation types, check validations, and transactional integrity guarantees.", structure: [] },
      { id: 5, title: "Docker Networking & Multi-Container Storage", fileName: "docker_networking_deepdive.epub", subject: "DevOps", chaptersCount: 6, size: "3.5 MB", uploadDate: "2026-08-10", status: "failed", description: "Overview of bridge/overlay network interfaces, Docker volume bindings, and multi-service configurations via Compose.", structure: [] }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('questai_materials', JSON.stringify(materials));
  }, [materials]);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active Modals
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [deleteMaterial, setDeleteMaterial] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload form states
  const [newTitle, setNewTitle] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newSubject, setNewSubject] = useState('React 19');
  const [newDescription, setNewDescription] = useState('');
  const [newSize, setNewSize] = useState('1.5 MB');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Unique Subjects for filter
  const subjectsList = useMemo(() => {
    return Array.from(new Set(materials.map(m => m.subject)));
  }, [materials]);

  // Filtering & Sorting logic
  const processedMaterials = useMemo(() => {
    let result = materials.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || m.subject === subjectFilter;
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'size-large') {
      const parseSize = sizeStr => {
        const num = parseFloat(sizeStr);
        return sizeStr.includes('MB') ? num * 1024 : num;
      };
      result.sort((a, b) => parseSize(b.size) - parseSize(a.size));
    }

    return result;
  }, [materials, searchTerm, subjectFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(processedMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedMaterials.slice(startIdx, startIdx + itemsPerPage);
  }, [processedMaterials, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Actions
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMaterials(prev => prev.map(m => m.id === editMaterial.id ? editMaterial : m));
    setEditMaterial(null);
  };

  const handleDeleteConfirm = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    setDeleteMaterial(null);
  };

  const handleReParse = (id) => {
    // Set parsing then parsed simulation
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'parsing' } : m));
    setTimeout(() => {
      setMaterials(prev => prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status: 'parsed',
            chaptersCount: 3,
            structure: [
              { id: 1, title: "Module 1: System Networking Core", chapters: ["Network Bridges", "Configuring Host Resolution"] },
              { id: 2, title: "Module 2: Container Volume Bindings", chapters: ["Named Volumes", "Anonymizing paths"] }
            ]
          };
        }
        return m;
      }));
    }, 2000);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newFileName) return;

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc = {
              id: Date.now(),
              title: newTitle,
              fileName: newFileName,
              subject: newSubject,
              chaptersCount: 0,
              size: newSize,
              uploadDate: new Date().toISOString().split('T')[0],
              status: 'parsing',
              description: newDescription || "No description provided.",
              structure: []
            };
            setMaterials(prevList => [newDoc, ...prevList]);
            setIsUploading(false);
            setIsUploadOpen(false);
            setNewTitle('');
            setNewFileName('');
            setNewDescription('');

            // Automatically transition to parsed after 5 seconds
            setTimeout(() => {
              setMaterials(prevList => prevList.map(m => {
                if (m.id === newDoc.id) {
                  return {
                    ...m,
                    status: 'parsed',
                    chaptersCount: 3,
                    structure: [
                      { id: 1, title: "Module 1: Foundation Topics", chapters: ["Chapter 1: Overview", "Chapter 2: Key Concepts"] },
                      { id: 2, title: "Module 2: Core Abstractions", chapters: ["Chapter 3: Advanced Details"] }
                    ]
                  };
                }
                return m;
              }));
            }, 5000);
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  return (
    <div className="content-page-wrapper">
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Study Materials & Learning Resources</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Upload and manage reading texts to feed the AI generator database.
            </span>
          </div>

          <button className="admin-btn" onClick={() => setIsUploadOpen(true)}>
            <UploadCloud size={16} />
            <span>Upload Material</span>
          </button>
        </div>

        <div className="section-header" style={{ borderBottom: '1px solid var(--admin-border-color)', paddingBottom: '20px', marginTop: '10px' }}>
          <div className="controls-container" style={{ width: '100%' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search by title or filename..." 
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
              <option value="parsed">Parsed</option>
              <option value="parsing">Parsing</option>
              <option value="failed">Failed</option>
            </select>

            <select 
              className="admin-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Upload</option>
              <option value="oldest">Oldest Upload</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="size-large">Largest Size</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document Details</th>
                <th>Subject</th>
                <th>AI Chapters</th>
                <th>File Size</th>
                <th>Parsing Status</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.length > 0 ? (
                paginatedMaterials.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="user-cell">
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--admin-border-color)'
                        }}>
                          <FileText size={18} color={m.status === 'parsed' ? 'var(--admin-primary)' : m.status === 'parsing' ? 'var(--admin-secondary)' : 'var(--admin-danger)'} />
                        </div>
                        <div className="user-cell-details" style={{ marginLeft: '12px' }}>
                          <span className="user-cell-name" style={{ fontWeight: 600 }}>{m.title}</span>
                          <span className="user-cell-sub" style={{ fontFamily: 'monospace' }}>{m.fileName}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge user">{m.subject}</span></td>
                    <td style={{ paddingLeft: '35px' }}>
                      <strong>{m.chaptersCount}</strong> chapters
                    </td>
                    <td>{m.size}</td>
                    <td>
                      <span className={`badge ${m.status === 'parsed' ? 'active' : m.status === 'parsing' ? 'medium' : 'suspended'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{m.uploadDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View Extraction Structure" 
                          disabled={m.status !== 'parsed'}
                          onClick={() => setSelectedMaterial(m)}
                          style={{ opacity: m.status !== 'parsed' ? 0.4 : 1 }}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit Document Meta" 
                          onClick={() => setEditMaterial(m)}
                        >
                          <Edit3 size={14} />
                        </button>
                        {m.status === 'failed' && (
                          <button 
                            className="action-btn view" 
                            title="Re-Parse Document" 
                            style={{ color: 'var(--admin-info)' }}
                            onClick={() => handleReParse(m.id)}
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                        <button 
                          className="action-btn delete" 
                          title="Remove uploaded material" 
                          onClick={() => setDeleteMaterial(m)}
                        >
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
                      <div className="empty-state-icon">📂</div>
                      <h4 className="empty-state-title">No Learning Resources Matched</h4>
                      <p className="empty-state-desc">Try updating filters or keyword strings to locate document files.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {processedMaterials.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedMaterials.length)} of {processedMaterials.length} entries
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

      {/* View Extraction Details Modal */}
      {selectedMaterial && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedMaterial(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">AI Extracted Structure</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMaterial(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Title & Subject</span>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 0' }}>{selectedMaterial.title}</h4>
                <div style={{ marginTop: '4px' }}><span className="badge user">{selectedMaterial.subject}</span></div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedMaterial.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--admin-border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <FolderOpen size={14} color="var(--admin-primary)" />
                  Modules & Sub-Chapters Structure
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedMaterial.structure.length > 0 ? (
                    selectedMaterial.structure.map((mod) => (
                      <div key={mod.id} style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {mod.title}
                        </div>
                        <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {mod.chapters.map((chap, cIdx) => (
                            <li key={cIdx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{chap}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      No sub-structure parsed yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setSelectedMaterial(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meta Modal */}
      {editMaterial && (
        <div className="admin-modal-backdrop" onClick={() => setEditMaterial(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Document Properties</h3>
              <button className="modal-close-btn" onClick={() => setEditMaterial(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Material Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editMaterial.title}
                    onChange={e => setEditMaterial({ ...editMaterial, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Category</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editMaterial.subject}
                    onChange={e => setEditMaterial({ ...editMaterial, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={editMaterial.description}
                    onChange={e => setEditMaterial({ ...editMaterial, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setEditMaterial(null)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMaterial && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteMaterial(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Learning Resource</h3>
              <button className="modal-close-btn" onClick={() => setDeleteMaterial(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                color: 'var(--admin-danger)',
                backgroundColor: 'rgba(255, 94, 87, 0.1)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={24} />
              </div>
              <h4 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>Confirm permanent removal?</h4>
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are about to delete resource <strong>{deleteMaterial.title}</strong>. This removes it from the generator feed and cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setDeleteMaterial(null)}>Cancel</button>
              <button 
                className="admin-btn" 
                style={{ background: 'var(--admin-danger)' }}
                onClick={() => handleDeleteConfirm(deleteMaterial.id)}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="admin-modal-backdrop" onClick={() => !isUploading && setIsUploadOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Study Material</h3>
              <button className="modal-close-btn" disabled={isUploading} onClick={() => setIsUploadOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body">
                {isUploading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 10px', gap: '15px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      border: '3px solid var(--bg-tertiary)',
                      borderTopColor: 'var(--admin-primary)',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Uploading and Analyzing File...</div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--admin-primary)', transition: 'width 0.15s ease' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Progress: {uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Material Title / Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. AWS Cloud Architectures Guide"
                        className="form-input" 
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Subject Category</label>
                        <select className="admin-select" value={newSubject} onChange={e => setNewSubject(e.target.value)} style={{ width: '100%' }}>
                          <option value="React 19">React 19</option>
                          <option value="Python">Python</option>
                          <option value="FastAPI">FastAPI</option>
                          <option value="Databases">Databases</option>
                          <option value="DevOps">DevOps</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">File Size (Mock)</label>
                        <select className="admin-select" value={newSize} onChange={e => setNewSize(e.target.value)} style={{ width: '100%' }}>
                          <option value="420 KB">420 KB</option>
                          <option value="1.5 MB">1.5 MB</option>
                          <option value="4.8 MB">4.8 MB</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Upload File Attachment</label>
                      <input 
                        type="text" 
                        placeholder="e.g. aws_architect_framework.pdf"
                        className="form-input" 
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brief Description</label>
                      <textarea 
                        placeholder="Include summary details..."
                        className="form-input" 
                        style={{ minHeight: '60px', resize: 'vertical' }}
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" disabled={isUploading} onClick={() => setIsUploadOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={isUploading}>Start Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation Style injection for loader */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

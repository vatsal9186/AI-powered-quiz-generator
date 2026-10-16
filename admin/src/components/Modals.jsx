import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

function ModalWrapper({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function UserViewModal({ isOpen, onClose, user }) {
  if (!user) return null;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="User Account Details">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--admin-border-color)' }}>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{user.name}</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{user.email}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System Role</span>
            <div style={{ marginTop: '4px' }}><span className={`badge ${user.role}`}>{user.role}</span></div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
            <div style={{ marginTop: '4px' }}><span className={`badge ${user.status}`}>{user.status}</span></div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Date</span>
            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>{user.joinedDate || 'N/A'}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quizzes Completed</span>
            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>{user.quizzesCount || 0} Attempts</div>
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Recent Quiz Attempts</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '12px' }}>
              <span>Aptitude Test (Logical Reasoning)</span>
              <span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>88%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '12px' }}>
              <span>Python Basics (Introduction)</span>
              <span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>92%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="admin-btn secondary" onClick={onClose}>Close</button>
      </div>
    </ModalWrapper>
  );
}

export function UserEditModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'user');
      setStatus(user.status || 'active');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, name, email, role, status });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Modify User Account">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="admin-select" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
                <option value="user">User / Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn">Save Changes</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function UserDeleteModal({ isOpen, onClose, user, onDelete }) {
  if (!user) return null;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Delete User Account">
      <div className="modal-body">
        <div className="modal-alert-icon">
          <AlertTriangle size={28} />
        </div>
        <h4 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>Are you absolutely sure?</h4>
        <p className="modal-alert-text">
          You are about to delete user <strong>{user.name}</strong> ({user.email}). 
          This action will permanently purge the account and cannot be undone.
        </p>
      </div>
      <div className="modal-footer">
        <button className="admin-btn secondary" onClick={onClose}>Cancel</button>
        <button 
          className="admin-btn" 
          style={{ background: 'var(--admin-danger)', boxShadow: '0 4px 12px rgba(255, 94, 87, 0.2)' }}
          onClick={() => { onDelete(user.id); onClose(); }}
        >
          Confirm Delete
        </button>
      </div>
    </ModalWrapper>
  );
}

export function UserSuspendModal({ isOpen, onClose, user, onSuspend }) {
  if (!user) return null;
  const isCurrentlySuspended = user.status === 'suspended';
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={isCurrentlySuspended ? "Unsuspend User Account" : "Suspend User Account"}>
      <div className="modal-body">
        <div className="modal-alert-icon warning">
          <ShieldAlert size={28} />
        </div>
        <h4 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>
          {isCurrentlySuspended ? "Reactivate account?" : "Temporarily block account?"}
        </h4>
        <p className="modal-alert-text">
          {isCurrentlySuspended ? (
            <>Reactivating <strong>{user.name}</strong>'s account will grant them immediate system access once again.</>
          ) : (
            <>Suspending <strong>{user.name}</strong> will temporarily revoke their access. They will be blocked from logging in.</>
          )}
        </p>
      </div>
      <div className="modal-footer">
        <button className="admin-btn secondary" onClick={onClose}>Cancel</button>
        <button 
          className="admin-btn" 
          style={{ background: isCurrentlySuspended ? 'var(--admin-primary)' : 'var(--admin-secondary)', boxShadow: 'none' }}
          onClick={() => { onSuspend(user.id); onClose(); }}
        >
          {isCurrentlySuspended ? "Confirm Reactivation" : "Confirm Suspension"}
        </button>
      </div>
    </ModalWrapper>
  );
}

export function QuizViewModal({ isOpen, onClose, quiz }) {
  if (!quiz) return null;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Quiz Information">
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{quiz.name}</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Created by <strong>{quiz.createdBy}</strong></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px 0', borderTop: '1px solid var(--admin-border-color)', borderBottom: '1px solid var(--admin-border-color)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Questions</span>
            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 600 }}>{quiz.questionsCount || 0} Questions</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Difficulty</span>
            <div style={{ marginTop: '4px' }}><span className={`badge ${quiz.difficulty}`}>{quiz.difficulty}</span></div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Attempts</span>
            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 600 }}>{quiz.attempts || 0} Completed</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Created Date</span>
            <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 500 }}>{quiz.createdDate}</div>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>AI Prompt Source</span>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '13px', marginTop: '6px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            "Generate a test on advanced structures including classes, subclasses, inheritance, encapsulation and polymorphism."
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="admin-btn secondary" onClick={onClose}>Close</button>
      </div>
    </ModalWrapper>
  );
}

export function QuizEditModal({ isOpen, onClose, quiz, onSave }) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('active');

  React.useEffect(() => {
    if (quiz) {
      setName(quiz.name || '');
      setDifficulty(quiz.difficulty || 'medium');
      setStatus(quiz.status || 'active');
    }
  }, [quiz]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...quiz, name, difficulty, status });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Quiz Configuration">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Quiz Name / Title</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Difficulty Rating</label>
              <select className="admin-select" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: '100%' }}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="active">Active / Published</option>
                <option value="inactive">Draft / Hidden</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn">Save Changes</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function QuizDeleteModal({ isOpen, onClose, quiz, onDelete }) {
  if (!quiz) return null;
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Delete Generated Quiz">
      <div className="modal-body">
        <div className="modal-alert-icon">
          <AlertTriangle size={28} />
        </div>
        <h4 style={{ textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: '0 0 10px' }}>Are you absolutely sure?</h4>
        <p className="modal-alert-text">
          You are deleting quiz <strong>{quiz.name}</strong> created by <strong>{quiz.createdBy}</strong>. 
          This will wipe all historical attempt records for this quiz.
        </p>
      </div>
      <div className="modal-footer">
        <button className="admin-btn secondary" onClick={onClose}>Cancel</button>
        <button 
          className="admin-btn" 
          style={{ background: 'var(--admin-danger)', boxShadow: 'none' }}
          onClick={() => { onDelete(quiz.id); onClose(); }}
        >
          Confirm Delete
        </button>
      </div>
    </ModalWrapper>
  );
}

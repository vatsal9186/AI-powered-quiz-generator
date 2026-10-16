

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { UserViewModal, UserEditModal, UserDeleteModal, UserSuspendModal } from '../components/Modals';

export default function Users() {
  const [usersList, setUsersList] = useState(() => {
    const saved = sessionStorage.getItem('questai_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Vatsal Kansara", email: "vatsal.k@gmail.com", role: "user", quizzesCount: 14, status: "active", joinedDate: "2026-08-22", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100" },
      { id: 2, name: "Hardik Jadav", email: "hardik.j@gmail.com", role: "user", quizzesCount: 9, status: "active", joinedDate: "2026-08-21", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" },
      { id: 3, name: "Vatsal Kansara", email: "vatsal.kansara@questai.com", role: "admin", quizzesCount: 0, status: "active", joinedDate: "2026-08-01", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" },
      { id: 4, name: "Jessica Alba", email: "jessica@alba.com", role: "user", quizzesCount: 22, status: "suspended", joinedDate: "2026-08-18", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100" },
      { id: 5, name: "David Miller", email: "miller.d@outlook.com", role: "user", quizzesCount: 5, status: "inactive", joinedDate: "2026-08-15", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100" },
      { id: 6, name: "Robert Downey", email: "tony@stark.com", role: "user", quizzesCount: 45, status: "active", joinedDate: "2026-08-12", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" },
      { id: 7, name: "Emma Watson", email: "emma@hermione.org", role: "user", quizzesCount: 18, status: "active", joinedDate: "2026-08-10", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" },
      { id: 8, name: "Chris Evans", email: "cap@avengers.org", role: "admin", quizzesCount: 1, status: "active", joinedDate: "2026-08-05", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100" },
    ];
  });

  useEffect(() => {
    sessionStorage.setItem('questai_users', JSON.stringify(usersList));
  }, [usersList]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);

  const filteredUsers = useMemo(() => {
    let result = usersList.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'date-newest') {
      result.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    } else if (sortBy === 'date-oldest') {
      result.sort((a, b) => new Date(a.joinedDate) - new Date(b.joinedDate));
    } else if (sortBy === 'attempts-high') {
      result.sort((a, b) => b.quizzesCount - a.quizzesCount);
    } else if (sortBy === 'attempts-low') {
      result.sort((a, b) => a.quizzesCount - b.quizzesCount);
    }

    return result;
  }, [usersList, searchTerm, roleFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSaveEdit = (updatedUser) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteConfirm = (userId) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
  };

  const handleSuspendConfirm = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <div className="users-page-wrapper">
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Registered Accounts</h3>
          
          <div className="controls-container">
            <div className="search-input-wrapper">
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search by name, email..." 
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <select 
              className="admin-select"
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Users / Students</option>
            </select>

            <select 
              className="admin-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select 
              className="admin-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date-newest">Newest Joined</option>
              <option value="date-oldest">Oldest Joined</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="attempts-high">Attempts (High-Low)</option>
              <option value="attempts-low">Attempts (Low-High)</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Quizzes Attempted</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-details">
                          <span className="user-cell-name">{user.name}</span>
                          <span className="user-cell-sub">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td style={{ paddingLeft: '30px' }}>
                      <strong>{user.quizzesCount}</strong>
                    </td>
                    <td>
                      <span className={`badge ${user.status}`}>{user.status}</span>
                    </td>
                    <td>{user.joinedDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="View Profile Info" onClick={() => setViewUser(user)}>
                          <Eye size={14} />
                        </button>
                        <button className="action-btn edit" title="Edit Account Config" onClick={() => setEditUser(user)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="action-btn suspend" title={user.status === 'suspended' ? "Unsuspend account" : "Suspend account"} onClick={() => setSuspendUser(user)}>
                          <ShieldAlert size={14} />
                        </button>
                        <button className="action-btn delete" title="Delete account permanently" onClick={() => setDeleteUser(user)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <h4 className="empty-state-title">No Users Found</h4>
                      <p className="empty-state-desc">Try clearing filters or adjusting search queries to locate profiles.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-text">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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

      {viewUser && (
        <UserViewModal 
          isOpen={viewUser !== null} 
          onClose={() => setViewUser(null)} 
          user={viewUser} 
        />
      )}
      {editUser && (
        <UserEditModal 
          isOpen={editUser !== null} 
          onClose={() => setEditUser(null)} 
          user={editUser}
          onSave={handleSaveEdit}
        />
      )}
      {deleteUser && (
        <UserDeleteModal 
          isOpen={deleteUser !== null} 
          onClose={() => setDeleteUser(null)} 
          user={deleteUser}
          onDelete={handleDeleteConfirm}
        />
      )}
      {suspendUser && (
        <UserSuspendModal 
          isOpen={suspendUser !== null} 
          onClose={() => setSuspendUser(null)} 
          user={suspendUser}
          onSuspend={handleSuspendConfirm}
        />
      )}
    </div>
  );
}

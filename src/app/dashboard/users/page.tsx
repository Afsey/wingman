'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, MoreVertical, Eye, Lock, Edit2 } from 'lucide-react';
import '../admin/AdminCenter.css';
import EditUserModal from './EditUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  dob?: string;
  createdAt: string;
}

export default function WingmanUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Security checks
  const [currentUserRole, setCurrentUserRole] = useState('user');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  // Dropdown and Details State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Password Reset Override State
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null);
  const [newOverridePassword, setNewOverridePassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wingman_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUserRole(user.role);
      }
    } catch (e) {}

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else if (res.status === 403) {
        setError('You do not have permission to view the user directory.');
      }
    } catch (e) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          password: newUserPassword,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserRole('user');
      fetchUsers(); // refresh list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
        return;
      }
      fetchUsers();
    } catch (e) {
      alert('Network error occurred.');
    }
  };

  const handleOverridePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!passwordResetUserId) return;

    try {
      const res = await fetch(`/api/admin/users/${passwordResetUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newOverridePassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setResetSuccess('Password successfully overridden!');
      setTimeout(() => {
        setPasswordResetUserId(null);
        setNewOverridePassword('');
        setResetSuccess('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message);
    }
  };

  if (loading) {
    return <div className="admin-center-container">Loading User Directory...</div>;
  }

  if (error && users.length === 0) {
    return (
      <div className="admin-center-container">
        <div className="text-error-box">{error}</div>
      </div>
    );
  }

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="admin-center-container">
      <div className="admin-header">
        <h1>Wingman Users</h1>
        <p>Company directory and user management.</p>
      </div>

      <div className="admin-panel">
        <div className="panel-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Registered Users</h2>
          {isAdmin && (
            <button className="btn-primary mobile-icon-btn" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} /> <span className="hide-text-mobile">Add Users</span>
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right', position: 'relative' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openDropdownId === user.id && (
                      <div className="action-dropdown glass-panel">
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDropdownId(null);
                          }}
                        >
                          <Eye size={16} /> View Details
                        </button>
                        
                        {isAdmin && (
                          <>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                setEditingUser(user);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Edit2 size={16} /> Edit User
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                setPasswordResetUserId(user.id);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Lock size={16} /> Change Password
                            </button>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => {
                                handleDeleteUser(user.id, user.name);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Trash2 size={16} /> Delete User
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Override Password Modal */}
      {passwordResetUserId && (
        <div className="add-user-modal">
          <div className="add-user-content" style={{ maxWidth: '400px' }}>
            <button className="add-user-close" onClick={() => { setPasswordResetUserId(null); setResetError(''); setResetSuccess(''); }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Override Password</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Forcefully change the password for this user.
            </p>

            {resetError && <div className="text-error-box" style={{ marginBottom: '16px' }}>{resetError}</div>}
            {resetSuccess && (
              <div className="text-success-box" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleOverridePassword}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">New Password</label>
                <div className="input-with-icon-wrapper">
                  <span className="input-icon"><Lock size={16} /></span>
                  <input 
                    type="text" 
                    className="form-input-custom" 
                    required 
                    value={newOverridePassword}
                    onChange={e => setNewOverridePassword(e.target.value)}
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Override Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && isAdmin && (
        <div className="add-user-modal">
          <div className="add-user-content">
            <button className="add-user-close" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Add New User</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Create a new account. You must assign an initial password.
            </p>

            {error && <div className="text-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

            <form onSubmit={handleAddUser}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input-custom" 
                  required 
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input-custom" 
                  required 
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input-custom" 
                  required 
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Initial Password</label>
                <input 
                  type="text" 
                  className="form-input-custom" 
                  required 
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="Type password manually"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Role</label>
                <select 
                  className="form-input-custom" 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="add-user-modal">
          <div className="add-user-content">
            <button className="add-user-close" onClick={() => setSelectedUser(null)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>User Registration Data</h2>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{selectedUser.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{selectedUser.dob || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timezone</span>
                <span className="detail-value">{selectedUser.timezone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registration Date</span>
                <span className="detail-value">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">System ID</span>
                <span className="detail-value" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{selectedUser.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        user={editingUser} 
        onUserUpdated={() => {
          setEditingUser(null);
          fetchUsers();
        }} 
      />
    </div>
  );
}

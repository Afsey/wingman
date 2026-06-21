import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import '../admin/AdminCenter.css';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  timezone: string;
  dob?: string;
  location?: string;
  language?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [dob, setDob] = useState('');
  const [timezone, setTimezone] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'user');
      setDob(user.dob || '');
      setTimezone(user.timezone || '');
      setLocation(user.location || '');
      setLanguage(user.language || '');
      setError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          role,
          dob,
          timezone,
          location,
          language
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      
      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-modal">
      <div className="add-user-content">
        <button className="add-user-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Edit User</h2>

        {error && <div className="text-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input-custom" required value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input-custom" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input-custom" required value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input-custom" value={role} onChange={e => setRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input-custom" value={dob} onChange={e => setDob(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <input type="text" className="form-input-custom" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="e.g. Asia/Kolkata" />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input-custom" value={location} onChange={e => setLocation(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <input type="text" className="form-input-custom" value={language} onChange={e => setLanguage(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

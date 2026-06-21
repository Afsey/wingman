'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Lock, User, Calendar, MapPin, Globe, Upload, Languages } from 'lucide-react';
import './UserProfileModal.css';
import CustomSelect from './CustomSelect';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onProfileUpdated: (updatedData: any) => void;
}

const WORLD_CLOCKS = [
  { value: 'Asia/Kolkata', label: 'Kolkata, India' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE' },
  { value: 'Europe/London', label: 'London, UK' },
  { value: 'America/New_York', label: 'New York, USA' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' }
];

const LANGUAGES = [
  'English', 
  'Spanish', 
  'French', 
  'German', 
  'Italian', 
  'Malayalam', 
  'Arabic', 
  'Chinese', 
  'Hindi'
];

export default function UserProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }: UserProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [language, setLanguage] = useState('English');
  const [newPassword, setNewPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [age, setAge] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setDob(currentUser.dob || '');
      setLocation(currentUser.location || '');
      setTimezone(currentUser.timezone || 'Asia/Kolkata');
      setLanguage(currentUser.language || 'English');
      setProfilePic(currentUser.profilePic || '');
      setNewPassword('');
      setError('');
      setSuccess('');
      calculateAge(currentUser.dob);
    }
  }, [isOpen, currentUser]);

  const calculateAge = (dobString: string) => {
    if (!dobString) {
      setAge(null);
      return;
    }
    const birthDate = new Date(dobString);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    setAge(computedAge);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDob(e.target.value);
    calculateAge(e.target.value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 102400) { // 100KB limit
      setError('Profile picture must be under 100KB to save storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePic(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dob,
          location,
          timezone,
          language,
          profilePic,
          newPassword: newPassword || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccess('Profile updated successfully!');
      onProfileUpdated({
        name, dob, location, timezone, language, profilePic
      });
      
      // Update local storage to stay in sync
      const stored = localStorage.getItem('wingman_user');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('wingman_user', JSON.stringify({ 
          ...user, name, dob, location, timezone, language, profilePic 
        }));
      }

      setNewPassword('');
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="modal-overlay" style={{ zIndex: 100000 }}>
      <div className="modal-container glass-panel glow-card profile-modal-large" style={{ maxWidth: '600px', width: '90%' }}>
        
        <button onClick={onClose} className="modal-close-btn" aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">My Profile</h2>
          <p className="modal-subtitle">Update your personal information and preferences.</p>
        </div>

        {error && <div className="text-error-box" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && (
          <div className="text-success-box" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form-grid">
          
          <div className="profile-pic-section">
            <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={32} />
                </div>
              )}
              <div className="avatar-overlay">
                <Upload size={16} />
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Max 100KB</p>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="form-fields-grid">
            <div className="form-group">
              <label className="form-label">Email / Username (Read-only)</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input type="text" className="form-input-custom" value={email} readOnly style={{ paddingLeft: '38px', opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input type="text" className="form-input-custom" required value={name} onChange={e => setName(e.target.value)} style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon"><Calendar size={16} /></span>
                <input type="date" className="form-input-custom" value={dob} onChange={handleDobChange} style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <div className="input-with-icon-wrapper">
                <input type="text" className="form-input-custom" value={age !== null ? `${age} years` : ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed', paddingLeft: '12px' }} placeholder="Auto-calculated" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon"><MapPin size={16} /></span>
                <input type="text" className="form-input-custom" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" style={{ paddingLeft: '38px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Worldclock</label>
              <div className="input-with-icon-wrapper" style={{ zIndex: 10 }}>
                <span className="input-icon" style={{ zIndex: 20 }}><Globe size={16} /></span>
                <CustomSelect 
                  value={timezone} 
                  onChange={setTimezone} 
                  options={WORLD_CLOCKS}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <div className="input-with-icon-wrapper" style={{ zIndex: 9 }}>
                <span className="input-icon" style={{ zIndex: 20 }}><Languages size={16} /></span>
                <CustomSelect 
                  value={language} 
                  onChange={setLanguage} 
                  options={LANGUAGES.map(lang => ({ value: lang, label: lang }))}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input type="password" className="form-input-custom" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" style={{ paddingLeft: '38px' }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

'use client';

import React, { useState, useEffect } from 'react';
import ThemeSelector from './ThemeSelector';
import HeaderClock from './HeaderClock';
import UserProfileModal from './UserProfileModal';
import { User, Sparkles, Bell } from 'lucide-react';
import './Header.css';

export default function Header() {
  const [userName, setUserName] = useState('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wingman_user');
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.name);
        setCurrentUserData(user);
      }
    } catch (e) {}

    // Secure fetch from server
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserName(data.user.name);
          setCurrentUserData(data.user);
          localStorage.setItem('wingman_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="dashboard-header glass-panel">
      <div className="header-left">
        <HeaderClock timezone={currentUserData?.timezone} />
      </div>
      
      <div className="header-right">
        {/* ECHO AI Button */}
        <button className="echo-btn glow-card">
          <Sparkles size={18} className="echo-icon" />
          <span>ECHO</span>
        </button>

        {/* Notifications */}
        <button className="icon-btn">
          <Bell size={20} />
        </button>

        {/* Theme Toggler */}
        <ThemeSelector />

        {/* User Profile (Desktop only, mobile handled in sidebar) */}
        <div className="user-profile-dropdown">
          <button className="profile-btn" onClick={() => setShowProfileModal(true)}>
            <div className="profile-avatar" style={{ overflow: 'hidden' }}>
              {currentUserData?.profilePic ? (
                <img src={currentUserData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="profile-name">{userName || 'Admin'}</span>
          </button>
        </div>
      </div>

      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUserData}
        onProfileUpdated={(updatedData) => {
          setUserName(updatedData.name || userName);
          if (currentUserData) {
            setCurrentUserData({ ...currentUserData, ...updatedData });
          } else {
            setCurrentUserData(updatedData);
          }
        }}
      />
    </header>
  );
}

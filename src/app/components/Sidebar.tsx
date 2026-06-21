'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Video, 
  Users, 
  Briefcase, 
  Building2, 
  Plus,
  Share2,
  Newspaper,
  BookOpen,
  CloudLightning,
  Heart,
  Paperclip,
  Laptop,
  UserCheck,
  Settings,
  LogOut,
  PinOff,
  Pin,
  Pen
} from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import './Sidebar.css';

const ALL_TABS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Meetings', path: '/dashboard/meetings', icon: Video },
  { name: 'Clients', path: '/dashboard/clients', icon: Users },
  { name: 'Works', path: '/dashboard/works', icon: Briefcase },
  { name: 'Companies', path: '/dashboard/companies', icon: Building2 },
  { name: 'Social Media', path: '/dashboard/social', icon: Share2 },
  { name: 'Marketing News', path: '/dashboard/news', icon: Newspaper },
  { name: 'Study Note', path: '/dashboard/study-notes', icon: BookOpen },
  { name: 'Dream', path: '/dashboard/dream', icon: CloudLightning },
  { name: 'Life', path: '/dashboard/life', icon: Heart },
  { name: 'Attachments', path: '/dashboard/attachments', icon: Paperclip },
  { name: 'Freelance', path: '/dashboard/freelance', icon: Laptop },
  { name: 'Wingman Users', path: '/dashboard/users', icon: UserCheck },
];

const DEFAULT_PINNED = ['Overview', 'Tasks', 'Meetings', 'Clients', 'Works', 'Companies'];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSecondary, setShowSecondary] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(DEFAULT_PINNED);
  const [editMode, setEditMode] = useState(false);

  React.useEffect(() => {
    try {
      const savedPins = localStorage.getItem('wingman_sidebar_pinned');
      if (savedPins) {
        setPinnedTabs(JSON.parse(savedPins));
      }
    } catch(e) {}
    
    // Quick fallback first
    try {
      const stored = localStorage.getItem('wingman_user');
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.name);
        setCurrentUserData(user);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {}

    // Secure fetch from server
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserName(data.user.name);
          setCurrentUserData(data.user);
          setIsAdmin(data.user.role === 'admin');
          // Update local storage to stay in sync
          localStorage.setItem('wingman_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('wingman_user');
      router.push('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const togglePin = (tabName: string) => {
    let newPins;
    if (pinnedTabs.includes(tabName)) {
      newPins = pinnedTabs.filter(t => t !== tabName);
    } else {
      newPins = [...pinnedTabs, tabName];
    }
    setPinnedTabs(newPins);
    localStorage.setItem('wingman_sidebar_pinned', JSON.stringify(newPins));
  };

  const primaryTabs = ALL_TABS.filter(tab => pinnedTabs.includes(tab.name));
  const secondaryTabs = ALL_TABS.filter(tab => !pinnedTabs.includes(tab.name));

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Wingman Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
          <h2>WINGMAN</h2>
        </div>
        <button 
          onClick={() => setEditMode(!editMode)}
          style={{ background: 'transparent', border: 'none', color: editMode ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Edit Sidebar Layout"
        >
          <Pen size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">

        <ul className="nav-list">
          {primaryTabs.map((tab) => {
            const isActive = pathname === tab.path;
            const Icon = tab.icon;
            return (
              <li key={tab.name} className="nav-item" style={{ position: 'relative' }}>
                <Link href={tab.path} className={`nav-bubble ${isActive ? 'active' : ''}`} style={{ paddingRight: editMode ? '40px' : '16px' }}>
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-text">{tab.name}</span>
                </Link>
                {editMode && (
                  <button 
                    onClick={() => togglePin(tab.name)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    title="Remove from main sidebar"
                  >
                    <PinOff size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className={`secondary-nav ${showSecondary ? 'expanded' : ''}`}>
          <button 
            className={`expand-btn nav-bubble ${showSecondary ? 'active-expand' : ''}`}
            onClick={() => setShowSecondary(!showSecondary)}
            title="More Options"
          >
            <Plus size={20} className={`nav-icon transition-transform ${showSecondary ? 'rotate' : ''}`} />
            <span className="nav-text">{showSecondary ? 'Less' : 'More'}</span>
          </button>

          {showSecondary && (
            <ul className="nav-list secondary-list">
              {secondaryTabs.map((tab) => {
                const isActive = pathname === tab.path;
                const Icon = tab.icon;
                return (
                  <li key={tab.name} className="nav-item" style={{ position: 'relative' }}>
                    <Link href={tab.path} className={`nav-bubble secondary-bubble ${isActive ? 'active' : ''}`} style={{ paddingRight: editMode ? '40px' : '16px' }}>
                      <Icon size={18} className="nav-icon" />
                      <span className="nav-text">{tab.name}</span>
                    </Link>
                    {editMode && (
                      <button 
                        onClick={() => togglePin(tab.name)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                        title="Add to main sidebar"
                      >
                        <Pin size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      <div className="sidebar-footer" style={{ padding: '20px 16px 0', borderTop: '1px solid var(--glass-border)' }}>
        {isAdmin && (
          <Link href="/dashboard/admin" className="admin-link" style={{ marginBottom: '8px' }}>
            <Settings size={16} className="admin-icon" />
            <span>Admin Center</span>
          </Link>
        )}
        
        <div className="user-profile-dropdown mobile-only-profile" style={{ marginLeft: '-8px' }}>
          <button 
            className="profile-btn" 
            onClick={() => setShowProfileModal(true)}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px', background: 'transparent', border: 'none' }}
          >
            <div className="profile-avatar" style={{ overflow: 'hidden' }}>
              {currentUserData?.profilePic ? (
                <img src={currentUserData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCheck size={18} />
              )}
            </div>
            <span className="profile-name" style={{ marginLeft: '12px', fontSize: '0.9rem', fontWeight: 500 }}>
              {userName || 'User Profile'}
            </span>
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="logout-btn" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '4px', borderRadius: '8px', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Log Out</span>
        </button>
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
    </aside>
  );
}

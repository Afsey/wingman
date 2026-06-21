'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Plus, Search, Link2, Calendar, FileText, Trash2, X, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { SocialAccount, SocialPost } from '@/lib/db';
import './SocialMedia.css';

function FormSelect({
  value,
  options,
  onChange,
  placeholder = "— Select —",
  allowCustom = false,
  onDeleteOption
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  onDeleteOption?: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="form-select-wrap" ref={ref}>
      <button 
        type="button" 
        className={`modal-input form-select-btn ${!value ? 'placeholder' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} className={`form-select-icon ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="form-select-menu">
          {options.map(opt => (
            <div key={opt} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                className={`form-select-item ${opt === value ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt === value && <Check size={14} className="check-icon" />}
                {opt}
              </button>
              {onDeleteOption && opt !== 'Other' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteOption(opt); setOpen(false); }}
                  title="Delete custom option"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 8px' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {allowCustom && (
            <button
              type="button"
              className="form-select-item custom-add-btn"
              onClick={() => { onChange('custom_entry'); setOpen(false); }}
            >
              <Plus size={14} style={{ marginRight: 6 }} /> Add New...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'accounts'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const fetchData = async () => {
    try {
      const [accRes, postRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/social/posts')
      ]);
      const accData = await accRes.json();
      const postData = await postRes.json();
      setAccounts(Array.isArray(accData) ? accData : []);
      setPosts(Array.isArray(postData) ? postData : []);
    } catch (error) {
      console.error('Error fetching social media data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAccountModal = (account?: SocialAccount) => {
    setSelectedAccount(account || null);
    setIsAccountModalOpen(true);
  };

  const openPostModal = (post?: SocialPost) => {
    setSelectedPost(post || null);
    setIsPostModalOpen(true);
  };

  const filteredAccounts = accounts.filter(a => 
    a.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="social-page">
      <div className="social-header">
        <div className="social-header-left">
          <h1 className="page-title">Social Media & Links</h1>
        </div>
        
        <div className="social-header-actions">
          {activeTab === 'accounts' ? (
            <button className="btn-primary" onClick={() => openAccountModal()}>
              <Plus size={18} />
              Add Reference
            </button>
          ) : (
            <button className="btn-primary" onClick={() => openPostModal()}>
              <Plus size={18} />
              Plan Post
            </button>
          )}
        </div>
      </div>

      <div className="social-controls">
        <div className="social-controls-top">
          <div className="social-search-wrapper">
            <div className="social-search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                className="social-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="social-toggle-tabs">
            <button 
              className={`toggle-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText size={16} /> Posts
            </button>
            <button 
              className={`toggle-tab ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <Link2 size={16} /> References
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'accounts' && (
        <div className="social-grid">
          {filteredAccounts.length === 0 ? (
            <div className="social-empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon-wrapper"><Link2 size={32} /></div>
              <h3>No References Found</h3>
              <p>You haven't added any references yet. Add a link to get started!</p>
              <button className="btn-primary" onClick={() => openAccountModal()}>Add Reference</button>
            </div>
          ) : (
            filteredAccounts.map(account => (
              <div className="social-card" key={account.id} onClick={() => openAccountModal(account)}>
                <div className="social-card-inner">
                  <div className="social-card-accent" />
                  <div className="social-card-body">
                    <div className="social-card-header">
                      <h3 className="social-card-title">{account.platform}</h3>
                      <span className="status-badge account">Reference</span>
                    </div>
                    <div className="social-card-content">
                      <div className="social-card-meta">
                        {account.username && (
                          <div className="meta-item">
                            <AlertCircle size={14} /> {account.username}
                          </div>
                        )}
                        {account.url && (
                          <div className="meta-item" style={{wordBreak: 'break-all'}}>
                            <Link2 size={14} /> {account.url}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="social-grid">
          {filteredPosts.length === 0 ? (
            <div className="social-empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon-wrapper"><FileText size={32} /></div>
              <h3>No Posts Found</h3>
              <p>You haven't planned any social media posts yet. Draft one to get started!</p>
              <button className="btn-primary" onClick={() => openPostModal()}>Plan Post</button>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div className="social-card" key={post.id} onClick={() => openPostModal(post)}>
                <div className="social-card-inner">
                  <div className="social-card-accent" />
                  <div className="social-card-body">
                    <div className="social-card-header">
                      <h3 className="social-card-title">{post.title}</h3>
                      <span className={`status-badge ${post.status.toLowerCase()}`}>{post.status}</span>
                    </div>
                    <div className="social-card-platform">
                      {post.platform}
                    </div>
                    <div className="social-card-content" style={{ marginTop: '12px' }}>
                      <div className="social-card-meta">
                        {post.scheduledFor && (
                          <div className="meta-item">
                            <Calendar size={14} /> {new Date(post.scheduledFor).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isAccountModalOpen && (
        <AccountModal 
          account={selectedAccount} 
          onClose={() => setIsAccountModalOpen(false)} 
          onSaved={fetchData} 
        />
      )}

      {isPostModalOpen && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setIsPostModalOpen(false)} 
          onSaved={fetchData} 
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Modals
// ----------------------------------------------------------------------

function AccountModal({ account, onClose, onSaved }: { account: SocialAccount | null, onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({
    platform: account?.platform || '',
    url: account?.url || '',
    username: account?.username || '',
    password: account?.password || '',
    notes: account?.notes || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = account ? `/api/social/accounts/${account.id}` : '/api/social/accounts';
      const method = account ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await fetch(`/api/social/accounts/${account.id}`, { method: 'DELETE' });
      onSaved();
      onClose();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="social-modal" role="dialog">
        <div className="social-modal-header">
          <h2 className="social-modal-title">{account ? 'Edit Reference' : 'Add Reference'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="social-modal-body">
            <div className="form-group">
              <label>Category *</label>
              <FormSelect 
                value={form.platform} 
                options={['Video', 'Blog', 'Inspiration', 'Other']}
                onChange={val => setForm({...form, platform: val})}
                allowCustom={true}
              />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input className="modal-input" type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Title / Description</label>
              <input className="modal-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea className="modal-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
          </div>
          <div className="social-modal-footer">
            {account && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Reference'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostModal({ post, onClose, onSaved }: { post: SocialPost | null, onClose: () => void, onSaved: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    platform: post?.platform || 'LinkedIn',
    status: post?.status || 'Draft',
    scheduledFor: post?.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0,16) : ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = post ? `/api/social/posts/${post.id}` : '/api/social/posts';
      const method = post ? 'PUT' : 'POST';
      const payload = {
        ...form,
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch(`/api/social/posts/${post.id}`, { method: 'DELETE' });
      onSaved();
      onClose();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="social-modal" role="dialog">
        <div className="social-modal-header">
          <h2 className="social-modal-title">{post ? 'Edit Post' : 'Plan Post'}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="social-modal-body">
            <div className="form-group">
              <label>Title *</label>
              <input className="modal-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Q3 Launch Announcement" />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <FormSelect 
                value={form.platform} 
                options={['LinkedIn', 'Twitter / X', 'Instagram', 'Facebook', 'Other']}
                onChange={val => setForm({...form, platform: val})}
                allowCustom={true}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <FormSelect 
                value={form.status} 
                options={['Draft', 'Scheduled', 'Published']}
                onChange={val => setForm({...form, status: val})}
                allowCustom={false}
              />
            </div>
            <div className="form-group">
              <label>Scheduled Date & Time</label>
              <input type="datetime-local" className="modal-input" value={form.scheduledFor} onChange={e => setForm({...form, scheduledFor: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea className="modal-textarea" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write your post here..." />
            </div>
          </div>
          <div className="social-modal-footer">
            {post && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

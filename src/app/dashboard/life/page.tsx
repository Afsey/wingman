'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Pin, Trash2, Heart, Edit2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import './Life.css';

interface Note {
  id: string;
  title: string;
  content?: string | null;
  category: string;
  color: string;
  isPinned: boolean;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function LifePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes?category=life');
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (form.id) {
        // Update
        const res = await fetch(`/api/notes/${form.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            content: form.content,
          }),
        });
        const updated = await res.json();
        setNotes(prev => prev.map(n => n.id === form.id ? updated : n));
      } else {
        // Create
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            category: 'life',
            color: '#1a1a2e',
            isPinned: false,
          }),
        });
        const created = await res.json();
        setNotes(prev => [created, ...prev]);
      }
      setForm({ id: '', title: '', content: '' });
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (note: Note) => {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !note.isPinned }),
    });
    const updated = await res.json();
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeleteConfirm(null);
  };

  const openEdit = (note: Note) => {
    setForm({ id: note.id, title: note.title, content: note.content || '' });
    setShowModal(true);
  };

  const pinned = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <div className="life-card">
      <div className="life-card-header">
        <h3 className="life-card-title">{note.title}</h3>
      </div>
      <div className="life-card-content">
        {note.content || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No content</span>}
      </div>
      
      <div className="life-card-footer">
        <span className="life-card-date">
          {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div className="life-card-actions">
          <button 
            className={`action-btn pin ${note.isPinned ? 'active' : ''}`}
            onClick={() => togglePin(note)}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
          </button>
          <button className="action-btn" onClick={() => openEdit(note)} title="Edit">
            <Edit2 size={16} />
          </button>
          
          {deleteConfirm === note.id ? (
             <div style={{ display: 'flex', gap: '4px' }}>
               <button className="action-btn delete" onClick={() => handleDelete(note.id)} style={{ color: '#ef4444' }}>Yes</button>
               <button className="action-btn" onClick={() => setDeleteConfirm(null)}>No</button>
             </div>
          ) : (
            <button className="action-btn delete" onClick={() => setDeleteConfirm(note.id)} title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="life-page">
      <div className="life-header">
        <div className="life-header-left">
          <div className="life-icon-badge">
            <Heart size={22} />
          </div>
          <div>
            <h1 className="life-title">Life Space</h1>
            <p className="life-subtitle">Your personal workspace for thoughts, lists, and links.</p>
          </div>
        </div>
        <button className="life-add-btn" onClick={() => { setForm({ id: '', title: '', content: '' }); setShowModal(true); }}>
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your space...</p>
        </div>
      ) : notes.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', opacity: 0.6 }}>
          <Heart size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>It's quiet in here</h3>
          <p>Create your first entry to start journaling or taking notes.</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pin size={16} /> Pinned Entries
              </h2>
              <div className="life-grid">
                {pinned.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <h2 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Other Entries</h2>
              )}
              <div className="life-grid">
                {unpinned.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h2 className="modal-title">{form.id ? 'Edit Entry' : 'New Entry'}</h2>
            
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Entry title..."
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea 
                value={form.content} 
                onChange={e => setForm({...form, content: e.target.value})}
                placeholder="Write whatever is on your mind..."
                rows={8}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={!form.title.trim() || saving}>
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

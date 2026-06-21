'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pin, Trash2, Edit3, Plus, X, Check, BookOpen } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import './StudyNotes.css';

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

const PRESET_COLORS = [
  { hex: '#1a1a2e', label: 'Midnight' },
  { hex: '#1e3a2f', label: 'Forest' },
  { hex: '#2d1b1b', label: 'Crimson' },
  { hex: '#1a2744', label: 'Ocean' },
  { hex: '#2d1b36', label: 'Violet' },
  { hex: '#2a2a1a', label: 'Olive' },
];

function getAccentFromColor(hex: string): string {
  const map: Record<string, string> = {
    '#1a1a2e': '#818cf8',
    '#1e3a2f': '#34d399',
    '#2d1b1b': '#f87171',
    '#1a2744': '#60a5fa',
    '#2d1b36': '#c084fc',
    '#2a2a1a': '#d4d068',
  };
  return map[hex] || '#818cf8';
}

export default function StudyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: '#1a1a2e', tags: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes?category=study');
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const openCreate = () => {
    setEditNote(null);
    setForm({ title: '', content: '', color: '#1a1a2e', tags: '' });
    setShowModal(true);
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setForm({
      title: note.title,
      content: note.content || '',
      color: note.color,
      tags: note.tags || '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditNote(null); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editNote) {
        const res = await fetch(`/api/notes/${editNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.title, content: form.content, color: form.color, tags: form.tags }),
        });
        const updated = await res.json();
        setNotes(prev => prev.map(n => n.id === editNote.id ? updated : n));
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: form.title, content: form.content, color: form.color, tags: form.tags, category: 'study', isPinned: false }),
        });
        const created = await res.json();
        setNotes(prev => [created, ...prev]);
      }
      closeModal();
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
    setNotes(prev => {
      const newList = prev.map(n => n.id === note.id ? updated : n);
      return [...newList].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeleteConfirm(null);
  };

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  return (
    <div className="sn-page">
      {/* Header */}
      <div className="sn-header">
        <div className="sn-header-left">
          <div className="sn-icon-badge">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="sn-title">Study Notes</h1>
            <p className="sn-subtitle">Your personal knowledge garden — capture, organize, and grow.</p>
          </div>
        </div>
        <button className="sn-add-btn" onClick={openCreate}>
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="sn-loading">
          <div className="sn-loading-spinner" />
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="sn-empty">
          <div className="sn-empty-icon">📝</div>
          <h3>No study notes yet</h3>
          <p>Click "New Note" to capture your first idea.</p>
          <button className="sn-add-btn" onClick={openCreate}>
            <Plus size={16} /> Create First Note
          </button>
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div className="sn-section">
              <div className="sn-section-label">
                <Pin size={13} />
                <span>Pinned</span>
              </div>
              <div className="sn-grid">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPin={togglePin}
                    onEdit={openEdit}
                    onDelete={id => setDeleteConfirm(id)}
                  />
                ))}
              </div>
            </div>
          )}
          {unpinnedNotes.length > 0 && (
            <div className="sn-section">
              {pinnedNotes.length > 0 && (
                <div className="sn-section-label">
                  <span>All Notes</span>
                </div>
              )}
              <div className="sn-grid">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPin={togglePin}
                    onEdit={openEdit}
                    onDelete={id => setDeleteConfirm(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="sn-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="sn-modal glass-panel">
            <div className="sn-modal-header">
              <h2>{editNote ? 'Edit Note' : 'New Note'}</h2>
              <button className="sn-modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="sn-modal-body">
              <label className="sn-label">Title</label>
              <input
                className="sn-input"
                placeholder="Note title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
              <label className="sn-label">Content</label>
              <RichTextEditor
                content={form.content}
                onChange={html => setForm(f => ({ ...f, content: html }))}
              />
              <label className="sn-label">Tags <span style={{ opacity: 0.5, fontWeight: 400 }}>(comma separated)</span></label>
              <input
                className="sn-input"
                placeholder="e.g. math, physics, important"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
              <label className="sn-label">Note Color</label>
              <div className="sn-color-picker">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    className={`sn-color-swatch ${form.color === c.hex ? 'selected' : ''}`}
                    style={{ background: c.hex, borderColor: form.color === c.hex ? getAccentFromColor(c.hex) : 'transparent' }}
                    onClick={() => setForm(f => ({ ...f, color: c.hex }))}
                    title={c.label}
                  >
                    {form.color === c.hex && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="sn-modal-footer">
              <button className="sn-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="sn-btn-save" onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving...' : editNote ? 'Update Note' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="sn-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="sn-delete-dialog glass-panel" onClick={e => e.stopPropagation()}>
            <h3>Delete this note?</h3>
            <p>This action cannot be undone.</p>
            <div className="sn-delete-actions">
              <button className="sn-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="sn-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onPin, onEdit, onDelete }: {
  note: Note;
  onPin: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const accent = getAccentFromColor(note.color);
  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="sn-card" style={{ background: note.color, '--accent': accent } as React.CSSProperties}>
      <div className="sn-card-top-border" style={{ background: accent }} />
      <div className="sn-card-actions">
        <button
          className={`sn-card-action-btn ${note.isPinned ? 'pinned' : ''}`}
          onClick={() => onPin(note)}
          title={note.isPinned ? 'Unpin' : 'Pin'}
          style={{ color: note.isPinned ? accent : undefined }}
        >
          <Pin size={14} fill={note.isPinned ? accent : 'none'} />
        </button>
        <button className="sn-card-action-btn" onClick={() => onEdit(note)} title="Edit">
          <Edit3 size={14} />
        </button>
        <button className="sn-card-action-btn delete" onClick={() => onDelete(note.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
      <h3 className="sn-card-title">{note.title}</h3>
      {note.content && (
        <div 
          className="sn-card-content rich-text-preview" 
          dangerouslySetInnerHTML={{ __html: note.content }} 
        />
      )}
      {tags.length > 0 && (
        <div className="sn-card-tags">
          {tags.map(tag => (
            <span key={tag} className="sn-tag" style={{ borderColor: accent, color: accent }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="sn-card-date">
        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

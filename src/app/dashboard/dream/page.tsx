'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Sparkles, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dream.css';

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

const CATEGORY_EMOJIS: Record<string, string> = {
  'Travel': '✈️',
  'Health': '💪',
  'Career': '🚀',
  'Family': '❤️',
  'Finance': '💰',
  'Adventure': '🏔️',
  'Learning': '📚',
  'Creative': '🎨',
  'Spiritual': '🌟',
  'Other': '✨',
};

const CATEGORY_LIST = Object.keys(CATEGORY_EMOJIS);

// Animated constellation canvas
function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.a = 0.3 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 160, 255, ${s.a})`;
        ctx.fill();
      });
      // Draw faint connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="dr-constellation" />;
}

export default function DreamPage() {
  const [dreams, setDreams] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [customCat, setCustomCat] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const customCatRef = useRef<HTMLInputElement>(null);

  const fetchDreams = async () => {
    try {
      const res = await fetch('/api/notes?category=dream');
      const data = await res.json();
      setDreams(Array.isArray(data) ? data : []);
    } catch {
      setDreams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDreams(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const finalTag = isCustomCat ? customCat.trim() : form.tags;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          tags: finalTag,
          category: 'dream',
          color: '#1a1a2e',
          isPinned: false,
          content: null,
        }),
      });
      const created = await res.json();
      setDreams(prev => [created, ...prev]);
      setForm({ title: '', tags: '' });
      setCustomCat('');
      setIsCustomCat(false);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleAchieved = async (dream: Note) => {
    const res = await fetch(`/api/notes/${dream.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !dream.isPinned }),
    });
    const updated = await res.json();
    setDreams(prev => prev.map(d => d.id === dream.id ? updated : d));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setDreams(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const ahead = dreams.filter(d => !d.isPinned);
  const achieved = dreams.filter(d => d.isPinned);
  const pct = dreams.length > 0 ? Math.round((achieved.length / dreams.length) * 100) : 0;

  return (
    <div className="dr-page">
      <ConstellationCanvas />

      {/* Glowing Orbs */}
      <div className="dr-orb dr-orb-1" />
      <div className="dr-orb dr-orb-2" />
      <div className="dr-orb dr-orb-3" />

      {/* Header */}
      <div className="dr-header">
        <div className="dr-header-left">
          <div className="dr-icon-badge">
            <Sparkles size={20} />
            <div className="dr-icon-ring" />
          </div>
          <div>
            <h1 className="dr-title">Dream Board</h1>
            <p className="dr-subtitle">Your constellation of life goals — dream by dream.</p>
          </div>
        </div>
        <button className="dr-add-btn" onClick={() => setShowModal(true)}>
          <span className="dr-add-btn-glow" />
          <Plus size={16} />
          <span>Add Dream</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="dr-stats">
        <div className="dr-stat">
          <span className="dr-stat-number">{dreams.length}</span>
          <span className="dr-stat-label">Total Dreams</span>
        </div>
        <div className="dr-stat-divider" />
        <div className="dr-stat">
          <span className="dr-stat-number dr-stat-gold">{achieved.length}</span>
          <span className="dr-stat-label">Achieved ✨</span>
        </div>
        <div className="dr-stat-divider" />
        <div className="dr-stat">
          <span className="dr-stat-number dr-stat-violet">{ahead.length}</span>
          <span className="dr-stat-label">Dreams Ahead</span>
        </div>
        {dreams.length > 0 && (
          <>
            <div className="dr-stat-divider" />
            <div className="dr-stat dr-stat-wide">
              <div className="dr-progress-wrap">
                <div className="dr-progress-bar">
                  <div className="dr-progress-fill" style={{ width: `${pct}%` }}>
                    <div className="dr-progress-glow" />
                  </div>
                </div>
                <span className="dr-progress-pct">{pct}%</span>
              </div>
              <span className="dr-stat-label">Journey Complete</span>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="dr-loading">
          <div className="dr-loading-ring">
            <div /><div /><div /><div />
          </div>
          <p>Loading your dreams…</p>
        </div>
      ) : dreams.length === 0 ? (
        <div className="dr-empty">
          <div className="dr-empty-icon">
            <span className="dr-empty-emoji">🌌</span>
            <div className="dr-empty-ring" />
          </div>
          <h3>Your Universe Awaits</h3>
          <p>Add your first dream and begin mapping your constellation of goals.</p>
          <button className="dr-add-btn" onClick={() => setShowModal(true)}>
            <span className="dr-add-btn-glow" />
            <Plus size={16} /> Add First Dream
          </button>
        </div>
      ) : (
        <>
          {ahead.length > 0 && (
            <div className="dr-section">
              <div className="dr-section-header">
                <div className="dr-section-dot pending">
                  <div className="dr-dot-pulse" />
                </div>
                <h2 className="dr-section-title">Dreams Still Ahead</h2>
                <span className="dr-section-count">{ahead.length}</span>
              </div>
              <motion.div layout className="dr-grid">
                <AnimatePresence>
                  {ahead.map((dream, i) => (
                    <DreamCard
                      key={dream.id}
                      dream={dream}
                      achieved={false}
                      index={i}
                      onToggle={toggleAchieved}
                      onDelete={id => setDeleteConfirm(id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {achieved.length > 0 && (
            <div className="dr-section">
              <div className="dr-section-header">
                <div className="dr-section-dot achieved">
                  <div className="dr-dot-pulse" />
                </div>
                <h2 className="dr-section-title">Dreams Achieved</h2>
                <span className="dr-section-count achieved">{achieved.length}</span>
              </div>
              <motion.div layout className="dr-grid">
                <AnimatePresence>
                  {achieved.map((dream, i) => (
                    <DreamCard
                      key={dream.id}
                      dream={dream}
                      achieved={true}
                      index={i}
                      onToggle={toggleAchieved}
                      onDelete={id => setDeleteConfirm(id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Add Dream Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="dr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              className="dr-modal"
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="dr-modal-shimmer" />
              <div className="dr-modal-header">
                <div className="dr-modal-icon"><Star size={18} /></div>
                <h2>Add a Dream</h2>
                <button className="dr-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <p className="dr-modal-hint">What's one thing you want to experience, achieve, or become?</p>
              <label className="dr-label">Dream / Goal</label>
              <input
                className="dr-input"
                placeholder="e.g. Watch the northern lights in Iceland…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              />
              <label className="dr-label">Category <span className="dr-label-opt">(optional)</span></label>
              <div className="dr-cat-grid">
                {CATEGORY_LIST.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`dr-cat-chip ${!isCustomCat && form.tags === cat ? 'active' : ''}`}
                    onClick={() => {
                      setIsCustomCat(false);
                      setCustomCat('');
                      setForm(f => ({ ...f, tags: f.tags === cat ? '' : cat }));
                    }}
                  >
                    <span>{CATEGORY_EMOJIS[cat]}</span> {cat}
                  </button>
                ))}
                {/* Custom category chip */}
                <button
                  type="button"
                  className={`dr-cat-chip dr-cat-custom-chip ${isCustomCat ? 'active' : ''}`}
                  onClick={() => {
                    setIsCustomCat(true);
                    setForm(f => ({ ...f, tags: '' }));
                    setTimeout(() => customCatRef.current?.focus(), 50);
                  }}
                >
                  <Plus size={12} /> Custom
                </button>
              </div>
              {/* Custom category text input — slides in when active */}
              <AnimatePresence>
                {isCustomCat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden', marginBottom: 24 }}
                  >
                    <input
                      ref={customCatRef}
                      className="dr-input"
                      style={{ marginBottom: 0 }}
                      placeholder="e.g. Mindfulness, Music, Cooking…"
                      value={customCat}
                      onChange={e => setCustomCat(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="dr-modal-footer">
                <button className="dr-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="dr-btn-add" onClick={handleCreate} disabled={saving || !form.title.trim()}>
                  {saving ? (
                    <span className="dr-btn-saving">✦ Adding…</span>
                  ) : (
                    <><Sparkles size={14} /> Add Dream</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="dr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              className="dr-delete-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="dr-delete-icon">🗑️</div>
              <h3>Remove this dream?</h3>
              <p>This cannot be undone.</p>
              <div className="dr-delete-actions">
                <button className="dr-btn-cancel" onClick={() => setDeleteConfirm(null)}>Keep It</button>
                <button className="dr-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DreamCard({ dream, achieved, index, onToggle, onDelete }: {
  dream: Note;
  achieved: boolean;
  index: number;
  onToggle: (dream: Note) => void;
  onDelete: (id: string) => void;
}) {
  const tag = dream.tags ? dream.tags.split(',')[0].trim() : null;
  const emoji = tag ? (CATEGORY_EMOJIS[tag] ?? '✨') : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, y: -10 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      className={`dr-card ${achieved ? 'achieved' : ''}`}
    >
      {/* Gradient border shimmer */}
      <div className="dr-card-border" />

      {/* Left accent */}
      <div className="dr-card-left-accent" />

      <div className="dr-card-body">
        <button
          className="dr-check-btn"
          onClick={() => onToggle(dream)}
          title={achieved ? 'Mark as not achieved' : 'Mark as achieved!'}
        >
          {achieved ? <Check size={14} strokeWidth={3} /> : null}
        </button>

        <div className="dr-card-text">
          <span className="dr-card-title">{dream.title}</span>
          {tag && (
            <span className="dr-card-tag">
              {emoji && <span className="dr-tag-emoji">{emoji}</span>}
              {tag}
            </span>
          )}
        </div>
      </div>

      <div className="dr-card-actions">
        {achieved && (
          <span className="dr-achieved-badge">
            <Star size={11} fill="currentColor" /> Done
          </span>
        )}
        <button
          className="dr-action-btn delete"
          onClick={() => onDelete(dream.id)}
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

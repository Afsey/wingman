'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Calendar, MoreVertical, X, Check, Trash2, Pencil, GripVertical, AlertCircle } from 'lucide-react';
import './Works.css';

interface Work {
  id: string;
  title: string;
  clientName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  details: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLUMNS = [
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'completed', label: 'Completed' }
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const EMPTY_WORK: Omit<Work, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  clientName: '',
  status: 'pending',
  priority: 'medium',
  dueDate: '',
  details: ''
};

// ─── Custom Form Select ───────────────────────────────────────────────────────
function FormSelect({
  value,
  options,
  onChange,
  placeholder = "— Select —"
}: {
  value: string;
  options: { label: string, value: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="form-select-wrap" ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button 
        type="button" 
        className={`form-input ${!value ? 'placeholder' : ''}`}
        onClick={() => setOpen(!open)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>{selectedLabel || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%',
          background: 'rgba(20, 20, 25, 0.98)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 1050, backdropFilter: 'blur(16px)',
          maxHeight: '250px', overflowY: 'auto'
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              style={{
                width: '100%', textAlign: 'left', background: opt.value === value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: 'none', padding: '10px 12px', borderRadius: '8px', color: opt.value === value ? '#818cf8' : '#e4e4e7',
                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s'
              }}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.value === value && <Check size={14} style={{ marginRight: '8px' }} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Work Modal ───────────────────────────────────────────────────────────────
function WorkModal({
  mode,
  initial,
  onClose,
  onSave,
  saving,
}: {
  mode: 'add' | 'edit';
  initial: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>;
  onClose: () => void;
  onSave: (data: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);

  const update = (field: keyof typeof form, value: any) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={handleBackdrop}>
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{mode === 'add' ? 'Add New Work' : 'Edit Work'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Project Title <span style={{color: '#f87171'}}>*</span></label>
            <input required type="text" className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Website Redesign" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Client Name <span style={{color: '#f87171'}}>*</span></label>
            <input required type="text" className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} value={form.clientName} onChange={e => update('clientName', e.target.value)} placeholder="e.g. Acme Corp" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Status</label>
            <FormSelect
              value={form.status}
              options={STATUS_COLUMNS.map(s => ({ label: s.label, value: s.id }))}
              onChange={val => update('status', val)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Priority</label>
            <FormSelect
              value={form.priority}
              options={PRIORITIES.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))}
              onChange={val => update('priority', val)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Due Date</label>
            <input type="date" className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} value={form.dueDate?.split('T')[0] || ''} onChange={e => update('dueDate', e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.85rem' }}>Details</label>
            <textarea rows={3} className="form-input" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }} value={form.details || ''} onChange={e => update('details', e.target.value)} placeholder="Project notes..." />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Work | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Drag and drop state (desktop)
  const [draggedItem, setDraggedItem] = useState<Work | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Touch drag refs (bypasses Framer Motion event interception)
  const touchWorkRef = useRef<Work | null>(null);
  const dragOverColRef = useRef<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const autoScrollRAF = useRef<number | null>(null);
  const scrollSpeedRef = useRef<number>(0);

  const fetchWorks = async () => {
    try {
      const res = await fetch('/api/works');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWorks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleSave = async (data: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await fetch('/api/works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else if (modalMode === 'edit' && editTarget) {
        await fetch(`/api/works/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setModalMode(null);
      setEditTarget(null);
      fetchWorks();
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this work item?')) return;
    try {
      await fetch(`/api/works/${id}`, { method: 'DELETE' });
      fetchWorks();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    try {
      await fetch(`/api/works/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      fetchWorks();
    }
  };

  // ─── Desktop drag handlers ────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, work: Work) => {
    setDraggedItem(work);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverCol(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedItem && draggedItem.status !== statusId) {
      handleStatusChange(draggedItem.id, statusId);
    }
  };

  // ─── Touch drag handlers (document-level, bypasses Framer Motion) ─────────

  const stopAutoScroll = () => {
    if (autoScrollRAF.current !== null) {
      cancelAnimationFrame(autoScrollRAF.current);
      autoScrollRAF.current = null;
    }
    scrollSpeedRef.current = 0;
  };

  const startAutoScroll = () => {
    if (autoScrollRAF.current !== null) return; // already running
    const tick = () => {
      const board = boardRef.current;
      if (board && scrollSpeedRef.current !== 0) {
        board.scrollLeft += scrollSpeedRef.current;
      }
      autoScrollRAF.current = requestAnimationFrame(tick);
    };
    autoScrollRAF.current = requestAnimationFrame(tick);
  };

  const onNativeTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // prevent scroll during drag
    const touch = e.touches[0];

    // Move floating clone
    const clone = document.getElementById('touch-clone');
    if (clone) {
      clone.style.left = `${touch.clientX - clone.offsetWidth / 2}px`;
      clone.style.top = `${touch.clientY - clone.offsetHeight / 2}px`;
    }

    // ── Auto-scroll when near horizontal edges of the board ──────────────
    const board = boardRef.current;
    if (board) {
      const boardRect = board.getBoundingClientRect();
      const edgeZone = 72; // px from edge to start scrolling
      const distFromRight = boardRect.right - touch.clientX;
      const distFromLeft = touch.clientX - boardRect.left;

      if (distFromRight < edgeZone) {
        // Scale speed: closer to edge → faster scroll (max 18px/frame)
        scrollSpeedRef.current = Math.round(Math.max(2, (1 - distFromRight / edgeZone) * 18));
        startAutoScroll();
      } else if (distFromLeft < edgeZone) {
        scrollSpeedRef.current = -Math.round(Math.max(2, (1 - distFromLeft / edgeZone) * 18));
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    }

    // Find closest column to determine drop target
    let closestColId: string | null = null;
    let minDist = Infinity;
    document.querySelectorAll<HTMLElement>('[data-col-id]').forEach(col => {
      const rect = col.getBoundingClientRect();
      const dist = Math.abs(touch.clientX - (rect.left + rect.width / 2));
      if (dist < minDist) { minDist = dist; closestColId = col.dataset.colId || null; }
    });

    if (closestColId !== dragOverColRef.current) {
      dragOverColRef.current = closestColId;
      setDragOverCol(closestColId);
    }
  };

  const onNativeTouchEnd = (e: TouchEvent) => {
    document.removeEventListener('touchmove', onNativeTouchMove);
    document.removeEventListener('touchend', onNativeTouchEnd);
    stopAutoScroll();

    const work = touchWorkRef.current;
    if (work) {
      const el = document.getElementById(`work-${work.id}`);
      if (el) el.style.opacity = '1';
    }

    const clone = document.getElementById('touch-clone');
    if (clone) clone.remove();

    const touch = e.changedTouches[0];
    let closestColId: string | null = null;
    let minDist = Infinity;
    document.querySelectorAll<HTMLElement>('[data-col-id]').forEach(col => {
      const rect = col.getBoundingClientRect();
      const dist = Math.abs(touch.clientX - (rect.left + rect.width / 2));
      if (dist < minDist) { minDist = dist; closestColId = col.dataset.colId || null; }
    });

    setDragOverCol(null);
    dragOverColRef.current = null;
    touchWorkRef.current = null;

    if (work && closestColId && closestColId !== work.status) {
      handleStatusChange(work.id, closestColId);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, work: Work) => {
    // Clean up any stale clone
    document.getElementById('touch-clone')?.remove();

    const el = document.getElementById(`work-${work.id}`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];

    touchWorkRef.current = work;
    el.style.opacity = '0.4';

    // Create a floating clone for visual feedback
    const clone = el.cloneNode(true) as HTMLElement;
    clone.id = 'touch-clone';
    Object.assign(clone.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '99999',
      opacity: '0.92',
      width: `${rect.width}px`,
      margin: '0',
      boxSizing: 'border-box',
      left: `${touch.clientX - rect.width / 2}px`,
      top: `${touch.clientY - rect.height / 2}px`,
      transform: 'scale(1.04) rotate(1.5deg)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
      borderRadius: '12px',
      transition: 'none',
    });
    document.body.appendChild(clone);

    // Attach native document listeners so Framer Motion cannot intercept them
    document.addEventListener('touchmove', onNativeTouchMove, { passive: false });
    document.addEventListener('touchend', onNativeTouchEnd);
  };

  const filteredWorks = works.filter(w => 
    w.title.toLowerCase().includes(search.toLowerCase()) || 
    w.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="works-page">
      <div className="works-header">
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>Track projects and deliverables</p>
        </div>
        
        <div className="works-actions">
          <div className="works-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search works..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            onClick={() => { setEditTarget(null); setModalMode('add'); }}
            className="works-add-btn"
          >
            <Plus size={18} /> <span className="add-btn-text">Add Work</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>Loading works...</div>
      ) : (
        <div className="kanban-board" ref={boardRef}>
          {STATUS_COLUMNS.map(col => {
            const columnWorks = filteredWorks.filter(w => w.status === col.id);
            return (
              <div 
                key={col.id} 
                data-col-id={col.id}
                className={`kanban-column ${dragOverCol === col.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="kanban-column-header">
                  <h3>{col.label} <span className="kanban-count">{columnWorks.length}</span></h3>
                  <button onClick={() => { setEditTarget({ ...EMPTY_WORK, status: col.id } as Work); setModalMode('add'); }} className="icon-btn" title="Add to this column">
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="kanban-column-body">
                  <AnimatePresence>
                    {columnWorks.map(work => {
                      const isOverdue = work.dueDate && new Date(work.dueDate) < new Date();
                      return (
                        <motion.div 
                          key={work.id}
                          id={`work-${work.id}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="work-card"
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, work)}
                          onDragEnd={(e: any) => handleDragEnd(e)}
                          onTouchStart={(e) => handleTouchStart(e, work)}
                          style={{ touchAction: 'none' }}
                        >
                          <div className="work-card-header">
                            <div>
                              <h4 className="work-title">{work.title}</h4>
                              <p className="work-client">{work.clientName}</p>
                            </div>
                            <GripVertical size={14} style={{ color: '#52525b', cursor: 'grab' }} />
                          </div>
                          
                          <div className="work-badges">
                            <span className={`priority-badge priority-${work.priority}`}>{work.priority}</span>
                          </div>

                          <div className="work-footer">
                            <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                              {work.dueDate ? (
                                <>
                                  <Calendar size={12} />
                                  {new Date(work.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </>
                              ) : <span style={{ opacity: 0.5 }}>No date</span>}
                            </div>
                            <div className="card-actions">
                              <button className="icon-btn" onClick={() => { setEditTarget(work); setModalMode('edit'); }} title="Edit"><Pencil size={14} /></button>
                              <button className="icon-btn delete" onClick={() => handleDelete(work.id)} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {columnWorks.length === 0 && (
                    <div className="empty-state">
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No works in this stage</p>
                    </div>
                  )}
                  
                  <button className="add-card-btn" onClick={() => { setEditTarget({ ...EMPTY_WORK, status: col.id } as Work); setModalMode('add'); }}>
                    <Plus size={16} /> Add Card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalMode && (
        <WorkModal
          mode={modalMode}
          initial={modalMode === 'edit' && editTarget ? editTarget : (editTarget || EMPTY_WORK)}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

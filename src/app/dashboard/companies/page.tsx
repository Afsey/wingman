'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Building2,
  Briefcase,
  CalendarDays,
  FileText,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import './Companies.css';

/* ================================================================
   Types
================================================================ */

interface Company {
  id: string;
  name: string;
  industry: string;
  myRole?: string | null;
  interviewDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ================================================================
   Status Helpers
================================================================ */
type Status = 'Collab' | 'Interviewing' | 'Offer' | 'Rejected';

const STATUS_META: Record<string, { label: string; dotClass: string; badgeClass: string; accentClass: string; color: string }> = {
  Collab:       { label: 'Collab',       dotClass: 'dot-collab',       badgeClass: 'status-collab',       accentClass: 'accent-collab',       color: '#8b5cf6' },
  Interviewing: { label: 'Interviewing', dotClass: 'dot-interviewing', badgeClass: 'status-interviewing', accentClass: 'accent-interviewing', color: '#f59e0b' },
  Offer:        { label: 'Offer',        dotClass: 'dot-offer',        badgeClass: 'status-offer',        accentClass: 'accent-offer',        color: '#10b981' },
  Rejected:     { label: 'Rejected',     dotClass: 'dot-rejected',     badgeClass: 'status-rejected',     accentClass: 'accent-rejected',     color: '#ef4444' },
};

const DEFAULT_STATUSES: string[] = ['Collab', 'Interviewing', 'Offer', 'Rejected'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/* ================================================================
   Default Form State
================================================================ */
const EMPTY_FORM = {
  name: '',
  industry: '',
  myRole: '',
  interviewDate: '',
  status: 'Collab',
  notes: '',
};

/* ================================================================
   Company Modal
================================================================ */
interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  company: Company | null;
  existingStatuses: string[];
  onDeleteStatus?: (status: string) => void;
}

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
              {onDeleteOption && !DEFAULT_STATUSES.includes(opt) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteOption(opt); setOpen(false); }}
                  title="Delete custom status"
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
              <Plus size={14} style={{ marginRight: 6 }} /> Add New Status...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CompanyModal({ isOpen, onClose, onSaved, company, existingStatuses, onDeleteStatus }: CompanyModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name:          company.name || '',
        industry:      company.industry || '',
        myRole:        company.myRole || '',
        interviewDate: company.interviewDate
          ? company.interviewDate.split('T')[0]  // date portion only
          : '',
        status:  company.status || 'Collab',
        notes:   company.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setIsCustomStatus(false);
  }, [company, isOpen]);

  const [isCustomStatus, setIsCustomStatus] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.industry.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        industry:      form.industry.trim(),
        myRole:        form.myRole.trim() || null,
        interviewDate: form.interviewDate || null,
        status:        form.status,
        notes:         form.notes.trim() || null,
      };

      if (company) {
        await fetch(`/api/companies/${company.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="company-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="company-modal-header">
          <h2 className="company-modal-title">
            {company ? 'Edit Company' : 'Add Company'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="company-modal-body">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="co-name">Company Name *</label>
              <input
                id="co-name"
                name="name"
                className="modal-input"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Industry + Status (side by side) */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="co-industry">Industry *</label>
                <input
                  id="co-industry"
                  name="industry"
                  className="modal-input"
                  placeholder="e.g. SaaS, Fintech…"
                  value={form.industry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="co-status">Status</label>
                {!isCustomStatus ? (
                  <FormSelect
                    value={form.status}
                    options={existingStatuses}
                    onChange={(val) => {
                      if (val === 'custom_entry') {
                        setIsCustomStatus(true);
                        setForm(prev => ({ ...prev, status: '' }));
                      } else {
                        setForm(prev => ({ ...prev, status: val }));
                      }
                    }}
                    onDeleteOption={onDeleteStatus}
                    placeholder="— Select status —"
                    allowCustom={true}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="co-status-custom"
                      name="status"
                      className="modal-input"
                      placeholder="e.g. On Hold"
                      value={form.status}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setIsCustomStatus(false);
                        setForm(prev => ({ ...prev, status: 'Collab' }));
                      }}
                      style={{ padding: '0 12px' }}
                      title="Cancel custom status"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* My Role + Interview Date (side by side) */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="co-role">My Role</label>
                <input
                  id="co-role"
                  name="myRole"
                  className="modal-input"
                  placeholder="e.g. Frontend Dev"
                  value={form.myRole}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="co-date">Interview Date</label>
                <input
                  id="co-date"
                  name="interviewDate"
                  type="date"
                  className="modal-input"
                  value={form.interviewDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="co-notes">Notes</label>
              <textarea
                id="co-notes"
                name="notes"
                className="modal-textarea"
                placeholder="Any notes, links, contacts…"
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="company-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : company ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   Company Card
================================================================ */
interface CompanyCardProps {
  company: Company;
  onEdit: (c: Company) => void;
  onDelete: (id: string) => void;
}

function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const meta = STATUS_META[company.status] || null;

  return (
    <div className="company-card">
      <div className="company-card-inner">
        {/* Left accent bar */}
        <div className={`company-card-accent ${meta ? meta.accentClass : 'accent-custom'}`} />

        {/* Card body */}
        <div className="company-card-body">
          {/* Header: name + status badge */}
          <div className="company-card-header">
            <div className="company-name-block">
              <div className="company-name" title={company.name}>{company.name}</div>
              <div className="company-industry-badge">
                <Building2 size={10} />
                &nbsp;{company.industry}
              </div>
            </div>
            {meta ? (
              <span className={`company-status-badge ${meta.badgeClass}`}>
                <span className={`status-dot ${meta.dotClass}`} />
                {meta.label}
              </span>
            ) : (
              <span className="company-status-badge custom-status">
                {company.status}
              </span>
            )}
          </div>

          {/* My Role */}
          {company.myRole && (
            <div className="company-info-row">
              <Briefcase size={14} />
              <span>{company.myRole}</span>
            </div>
          )}

          {/* Interview Date */}
          {company.interviewDate && (
            <div className="company-info-row">
              <CalendarDays size={14} />
              <span>{formatDate(company.interviewDate)}</span>
            </div>
          )}

          {/* Notes */}
          {company.notes && (
            <div className="company-notes">
              {company.notes}
            </div>
          )}

          {/* Card actions */}
          <div className="company-card-footer">
            <button className="card-action-btn edit" onClick={() => onEdit(company)}>
              <Pencil size={13} /> Edit
            </button>
            <button className="card-action-btn delete" onClick={() => onDelete(company.id)}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Main Page
================================================================ */
export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | string>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  /* ================================================================
     Derived Data
  ================================================================ */
  // Get all unique statuses
  const dynamicStatuses = React.useMemo(() => {
    const s = new Set(DEFAULT_STATUSES);
    companies.forEach(c => {
      if (c.status) s.add(c.status);
    });
    return Array.from(s);
  }, [companies]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (Array.isArray(data)) setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company entry?')) return;
    setCompanies(prev => prev.filter(c => c.id !== id)); // optimistic
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    } catch {
      fetchCompanies(); // rollback
    }
  };

  const handleDeleteStatus = async (status: string) => {
    if (!confirm(`Delete status "${status}" and reset all its companies to "Collab"?`)) return;
    
    // optimistic UI update
    setCompanies(prev => prev.map(c => 
      c.status === status ? { ...c, status: 'Collab' } : c
    ));
    
    try {
      await fetch('/api/companies/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldStatus: status, newStatus: 'Collab' })
      });
      fetchCompanies();
    } catch (err) {
      console.error(err);
      fetchCompanies(); // rollback
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  /* ---- Filtering ---- */
  const filtered = companies.filter(c => {
    const matchStatus = activeFilter === 'All' || c.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      (c.myRole?.toLowerCase().includes(q) ?? false) ||
      (c.notes?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  /* ---- Stats counts ---- */
  const counts = dynamicStatuses.reduce((acc, s) => {
    acc[s] = companies.filter(c => c.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  /* ---- Filter tab class helper ---- */
  const tabStatusClass: Record<string, string> = {
    Collab: 'tab-collab',
    Interviewing: 'tab-interviewing',
    Offer: 'tab-offer',
    Rejected: 'tab-rejected',
  };

  return (
    <div className="companies-page">
      {/* ---- Page Header ---- */}
      <div className="companies-header">
        <div className="companies-header-left">
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Track companies you collaborate with or have interviewed at.</p>
        </div>
        <div className="companies-header-actions">
          <button className="add-company-btn" onClick={handleAdd}>
            <Plus size={16} />
            Add Company
          </button>
        </div>
      </div>

      {/* ---- Stats Pills ---- */}
      <div className="companies-stats">
        {dynamicStatuses.map(s => {
          const m = STATUS_META[s];
          return (
            <div key={s} className="stat-pill">
              <div className="stat-pill-dot" style={{ background: m ? m.color : '#a1a1aa' }} />
              <div className="stat-pill-info">
                <span className="stat-pill-value">{counts[s]}</span>
                <span className="stat-pill-label">{m ? m.label : s}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Controls: Search + Filter Tabs ---- */}
      <div className="companies-controls">
        <div className="companies-controls-top">
          <div className="companies-search-wrapper">
            <div className="companies-search-bar">
              <Search size={16} />
              <input
                className="companies-search-input"
                placeholder="Search companies, roles, notes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="companies-filter-tabs" role="tablist">
          <button
            role="tab"
            className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
            aria-selected={activeFilter === 'All'}
          >
            All
            <span className="filter-tab-count">{companies.length}</span>
          </button>
          {dynamicStatuses.map(s => (
            <button
              key={s}
              role="tab"
              className={`filter-tab ${tabStatusClass[s] || ''} ${activeFilter === s ? 'active' : ''}`}
              onClick={() => setActiveFilter(s)}
              aria-selected={activeFilter === s}
            >
              {s}
              <span className="filter-tab-count">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- Grid ---- */}
      <div className="companies-grid">
        {loading ? (
          <div className="companies-loading">
            <div className="spinner" />
            <span>Loading companies…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="companies-empty">
            <div className="companies-empty-icon">
              <Building2 size={32} />
            </div>
            <h3>{search || activeFilter !== 'All' ? 'No matches found' : 'No companies yet'}</h3>
            <p>
              {search || activeFilter !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'Click "Add Company" to start tracking your collaborations and interviews.'}
            </p>
            {!search && activeFilter === 'All' && (
              <button className="btn-primary" onClick={handleAdd}>
                <Plus size={16} /> Add Your First Company
              </button>
            )}
          </div>
        ) : (
          filtered.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* ---- Modal ---- */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchCompanies}
        company={editingCompany}
        existingStatuses={dynamicStatuses}
        onDeleteStatus={handleDeleteStatus}
      />
    </div>
  );
}

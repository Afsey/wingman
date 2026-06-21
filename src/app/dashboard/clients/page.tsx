'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, Check, ChevronDown,
  ExternalLink, Users, Phone, Globe, DollarSign, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Clients.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  slNo?: number | null;
  date?: string | null;
  name: string;
  number?: string | null;
  whichService?: string | null;
  enquiry?: string | null;
  status: string;
  paid: boolean;
  workDetails?: string | null;
  amount?: string | null;
  websiteLinks?: string | null;
  createdAt: string;
  updatedAt: string;
}

type StatusType = 'Ongoing' | 'Finished' | 'Contacted' | 'Proposal Sent' | 'Not decided';

const STATUS_OPTIONS: StatusType[] = [
  'Ongoing', 'Contacted', 'Proposal Sent', 'Finished', 'Not decided'
];

const SERVICE_OPTIONS = [
  'WordPress Website',
  'SEO',
  'Meta Ads',
  'Poster',
  'Package 1',
  'Social Media',
  'Not decided',
  'Other',
];

const FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];

const EMPTY_FORM: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
  slNo: null,
  date: '',
  name: '',
  number: '',
  whichService: '',
  enquiry: '',
  status: 'Contacted',
  paid: false,
  workDetails: '',
  amount: '',
  websiteLinks: '',
};

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusClass(status: string): string {
  switch (status) {
    case 'Ongoing':       return 'status-ongoing';
    case 'Finished':      return 'status-finished';
    case 'Contacted':     return 'status-contacted';
    case 'Proposal Sent': return 'status-proposal';
    case 'Not decided':   return 'status-not-decided';
    default:              return 'status-contacted';
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ─── Inline Status Dropdown ──────────────────────────────────────────────────

function StatusDropdown({
  clientId,
  currentStatus,
  onUpdate,
}: {
  clientId: string;
  currentStatus: string;
  onUpdate: (id: string, status: string) => void;
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

  return (
    <div className="status-dropdown-wrap" ref={ref}>
      <button
        className={`status-badge ${getStatusClass(currentStatus)}`}
        onClick={() => setOpen(v => !v)}
        type="button"
      >
        {currentStatus}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="status-dropdown-menu">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`status-dropdown-item ${getStatusClass(s)} ${s === currentStatus ? 'active' : ''}`}
              onClick={() => { onUpdate(clientId, s); setOpen(false); }}
              type="button"
            >
              {s === currentStatus && <Check size={12} />}
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Custom Form Select ───────────────────────────────────────────────────────

function FormSelect({
  value,
  options,
  onChange,
  placeholder = "— Select —",
  allowCustom = false
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
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

  return (
    <div className="form-select-wrap" ref={ref}>
      <button 
        type="button" 
        className={`form-input form-select-btn ${!value ? 'placeholder' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={16} className={`form-select-icon ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="form-select-menu">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              className={`form-select-item ${opt === value ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt === value && <Check size={14} className="check-icon" />}
              {opt}
            </button>
          ))}
          {allowCustom && (
            <button
              type="button"
              className="form-select-item custom-add-btn"
              onClick={() => { onChange('custom_entry'); setOpen(false); }}
            >
              <Plus size={14} style={{ marginRight: 6 }} /> Add New Service...
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Client Modal ────────────────────────────────────────────────────────────

function ClientModal({
  mode,
  initial,
  onClose,
  onSave,
  saving,
}: {
  mode: 'add' | 'edit';
  initial: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
  onClose: () => void;
  onSave: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [isCustomService, setIsCustomService] = useState(
    initial.whichService ? !SERVICE_OPTIONS.includes(initial.whichService) : false
  );

  const update = (field: keyof typeof form, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-box glass-panel">
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add New Client' : 'Edit Client'}</h2>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid">

            {/* Row 1 */}
            <div className="form-group">
              <label>Sl No</label>
              <input
                type="number"
                className="form-input"
                placeholder="1"
                value={form.slNo ?? ''}
                onChange={e => update('slNo', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-input"
                value={form.date ?? ''}
                onChange={e => update('date', e.target.value || null)}
              />
            </div>

            {/* Row 2 */}
            <div className="form-group form-group--full">
              <label>Client Name <span className="required">*</span></label>
              <input
                required
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>

            {/* Row 3 */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={form.number ?? ''}
                onChange={e => update('number', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Which Service</label>
              {!isCustomService ? (
                <FormSelect
                  value={form.whichService ?? ''}
                  options={SERVICE_OPTIONS}
                  onChange={val => {
                    if (val === 'custom_entry') {
                      setIsCustomService(true);
                      update('whichService', '');
                    } else {
                      update('whichService', val);
                    }
                  }}
                  placeholder="— Select service —"
                  allowCustom={true}
                />
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type new service..."
                    value={form.whichService ?? ''}
                    onChange={e => update('whichService', e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '0 12px', flexShrink: 0 }}
                    onClick={() => {
                      setIsCustomService(false);
                      update('whichService', '');
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Row 4 */}
            <div className="form-group form-group--full">
              <label>Enquiry</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe the client's enquiry..."
                rows={2}
                value={form.enquiry ?? ''}
                onChange={e => update('enquiry', e.target.value)}
              />
            </div>

            {/* Row 5 */}
            <div className="form-group">
              <label>Status</label>
              <FormSelect
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={val => update('status', val)}
              />
            </div>
            <div className="form-group form-group--paid">
              <label>Paid</label>
              <label className="toggle-wrap">
                <input
                  type="checkbox"
                  className="toggle-checkbox"
                  checked={form.paid}
                  onChange={e => update('paid', e.target.checked)}
                />
                <span className="toggle-slider" />
                <span className="toggle-label">{form.paid ? 'Yes' : 'No'}</span>
              </label>
            </div>

            {/* Row 6 */}
            <div className="form-group form-group--full">
              <label>Work Details</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe what work needs to be done..."
                rows={2}
                value={form.workDetails ?? ''}
                onChange={e => update('workDetails', e.target.value)}
              />
            </div>

            {/* Row 7 */}
            <div className="form-group">
              <label>Amount</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ₹25,000"
                value={form.amount ?? ''}
                onChange={e => update('amount', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Website / Links</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={form.websiteLinks ?? ''}
                onChange={e => update('websiteLinks', e.target.value)}
              />
            </div>

          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin-icon" /> : null}
              {saving ? 'Saving…' : mode === 'add' ? 'Add Client' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  clientName,
  onConfirm,
  onCancel,
  deleting,
}: {
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-box--sm glass-panel">
        <div className="delete-modal-icon">
          <Trash2 size={28} />
        </div>
        <h2 className="delete-modal-title">Delete Client?</h2>
        <p className="delete-modal-desc">
          This will permanently remove <strong>{clientName}</strong> from your CRM. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? <Loader2 size={16} className="spin-icon" /> : <Trash2 size={16} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.number ?? '').toLowerCase().includes(q) ||
      (c.whichService ?? '').toLowerCase().includes(q) ||
      (c.enquiry ?? '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // ── Summary counts ─────────────────────────────────────────────────────────
  const counts = {
    total: clients.length,
    ongoing: clients.filter(c => c.status === 'Ongoing').length,
    contacted: clients.filter(c => c.status === 'Contacted').length,
    proposal: clients.filter(c => c.status === 'Proposal Sent').length,
  };

  // ── Inline status update ───────────────────────────────────────────────────
  const handleStatusUpdate = async (id: string, status: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // revert on error
      fetchClients();
    }
  };

  // ── Inline paid toggle ─────────────────────────────────────────────────────
  const handlePaidToggle = async (id: string, paid: boolean) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, paid } : c));
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid }),
      });
    } catch {
      fetchClients();
    }
  };

  // ── Add / Edit save ────────────────────────────────────────────────────────
  const handleSave = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add client');
      } else if (modalMode === 'edit' && editTarget) {
        const res = await fetch(`/api/clients/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update client');
      }
      setModalMode(null);
      setEditTarget(null);
      await fetchClients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete client');
      setDeleteTarget(null);
      await fetchClients();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (client: Client) => {
    setEditTarget(client);
    setModalMode('edit');
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalMode('add');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="clients-page">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="clients-header">
        <div className="clients-title-group">
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Your client CRM — track leads and active clients.</p>
        </div>
        <button className="btn-primary clients-add-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="clients-summary-row">
        <div className="summary-card glass-panel">
          <div className="summary-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="summary-value">{counts.total}</div>
            <div className="summary-label">Total Clients</div>
          </div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <Check size={20} />
          </div>
          <div>
            <div className="summary-value">{counts.ongoing}</div>
            <div className="summary-label">Ongoing</div>
          </div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-icon" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
            <Phone size={20} />
          </div>
          <div>
            <div className="summary-value">{counts.contacted}</div>
            <div className="summary-label">Contacted</div>
          </div>
        </div>
        <div className="summary-card glass-panel">
          <div className="summary-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className="summary-value">{counts.proposal}</div>
            <div className="summary-label">Proposal Sent</div>
          </div>
        </div>
      </div>

      {/* ── Controls Row ────────────────────────────────────────────────── */}
      <div className="clients-controls glass-panel">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="clients-search"
            placeholder="Search clients by name, phone or service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-pills">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              className={`filter-pill ${activeFilter === f ? 'active' : ''} ${f !== 'All' ? getStatusClass(f) + '-pill' : ''}`}
              onClick={() => setActiveFilter(f)}
              type="button"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="clients-table-wrap glass-panel">
        {loading ? (
          <div className="clients-loading">
            <Loader2 size={32} className="spin-icon" />
            <p>Loading clients…</p>
          </div>
        ) : error ? (
          <div className="clients-error">
            <p>⚠ {error}</p>
            <button className="btn-secondary" onClick={fetchClients}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="clients-empty">
            <Users size={48} />
            <p>{clients.length === 0 ? 'No clients yet. Click "+ Add Client" to get started.' : 'No clients match your search.'}</p>
            {clients.length === 0 && (
              <button className="btn-primary" onClick={openAdd} style={{ marginTop: '16px' }}>
                <Plus size={16} /> Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Number</th>
                  <th>Service</th>
                  <th>Enquiry</th>
                  <th>Status</th>
                  <th className="td-center">Paid</th>
                  <th>Work / Amount</th>
                  <th>Links</th>
                  <th className="td-center">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence>
                  {filtered.map((client, idx) => (
                    <motion.tr 
                      key={client.id} 
                      className="client-row"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 }
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                    >
                    <td className="td-slno">{client.slNo ?? idx + 1}</td>
                    <td className="td-date">{formatDate(client.date)}</td>
                    <td className="td-name">
                      <span className="client-name">{client.name}</span>
                    </td>
                    <td className="td-number">
                      {client.number ? (
                        <a href={`tel:${client.number}`} className="phone-link">
                          <Phone size={12} /> {client.number}
                        </a>
                      ) : <span className="empty-cell">—</span>}
                    </td>
                    <td className="td-service">
                      {client.whichService
                        ? <span className="service-chip">{client.whichService}</span>
                        : <span className="empty-cell">—</span>
                      }
                    </td>
                    <td className="td-enquiry">
                      <span className="td-truncate" title={client.enquiry ?? ''}>
                        {client.enquiry || <span className="empty-cell">—</span>}
                      </span>
                    </td>
                    <td className="td-status">
                      <StatusDropdown
                        clientId={client.id}
                        currentStatus={client.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td className="td-paid td-center">
                      <label className="paid-toggle" title={client.paid ? 'Mark as Unpaid' : 'Mark as Paid'}>
                        <input
                          type="checkbox"
                          checked={client.paid}
                          onChange={e => handlePaidToggle(client.id, e.target.checked)}
                          className="paid-checkbox"
                        />
                        <span className={`paid-indicator ${client.paid ? 'paid-yes' : 'paid-no'}`}>
                          {client.paid ? <Check size={12} /> : <X size={12} />}
                        </span>
                      </label>
                    </td>
                    <td className="td-work">
                      {(client.workDetails || client.amount) ? (
                        <div className="work-cell">
                          {client.workDetails && (
                            <span className="td-truncate work-details" title={client.workDetails}>
                              {client.workDetails}
                            </span>
                          )}
                          {client.amount && (
                            <span className="amount-badge">
                              <DollarSign size={11} /> {client.amount}
                            </span>
                          )}
                        </div>
                      ) : <span className="empty-cell">—</span>}
                    </td>
                    <td className="td-links">
                      {client.websiteLinks ? (
                        <a
                          href={client.websiteLinks.startsWith('http') ? client.websiteLinks : `https://${client.websiteLinks}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-btn"
                          title={client.websiteLinks}
                        >
                          <Globe size={13} />
                          <span className="td-truncate">{client.websiteLinks}</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : <span className="empty-cell">—</span>}
                    </td>
                    <td className="td-actions td-center">
                      <div className="action-btns">
                        <button className="action-btn" onClick={() => openEdit(client)} title="Edit Client">
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete-btn" onClick={() => setDeleteTarget(client)} title="Delete Client">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      )}

        {!loading && filtered.length > 0 && (
          <div className="table-footer">
            Showing <strong>{filtered.length}</strong> of <strong>{clients.length}</strong> clients
            {activeFilter !== 'All' && <> · filtered by <strong>{activeFilter}</strong></>}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {modalMode && (
        <ClientModal
          mode={modalMode}
          initial={
            modalMode === 'edit' && editTarget
              ? {
                  slNo: editTarget.slNo,
                  date: editTarget.date ?? '',
                  name: editTarget.name,
                  number: editTarget.number ?? '',
                  whichService: editTarget.whichService ?? '',
                  enquiry: editTarget.enquiry ?? '',
                  status: editTarget.status,
                  paid: editTarget.paid,
                  workDetails: editTarget.workDetails ?? '',
                  amount: editTarget.amount ?? '',
                  websiteLinks: editTarget.websiteLinks ?? '',
                }
              : { ...EMPTY_FORM, slNo: clients.length > 0 ? Math.max(...clients.map(c => c.slNo || 0)) + 1 : 1 }
          }
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          clientName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

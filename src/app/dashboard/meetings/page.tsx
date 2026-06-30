'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Clock,
  MapPin,
  Bell,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  Video,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Meetings.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'interview';
  status: string;
  reminder?: string;
  location?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface MeetingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'interview';
  description: string;
  location: string;
  reminder: string;
  status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getMeetingDateKey(isoString: string): string {
  const date = new Date(isoString);
  return toLocalDateString(date);
}

function buildGoogleCalendarUrl(meeting: MeetingFormData): string {
  const formatGCal = (dateStr: string, timeStr: string) => {
    const dt = new Date(`${dateStr}T${timeStr}`);
    return dt.toISOString().replace(/[-:]/g, '').replace('.000', '');
  };

  const start = formatGCal(meeting.date, meeting.startTime);
  const end = formatGCal(meeting.date, meeting.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    dates: `${start}/${end}`,
    details: meeting.description || '',
    location: meeting.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const emptyForm = (date: string): MeetingFormData => ({
  title: '',
  date,
  startTime: '09:00',
  endTime: '10:00',
  type: 'meeting',
  description: '',
  location: '',
  reminder: 'none',
  status: 'scheduled',
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<MeetingFormData>(emptyForm(toLocalDateString(today)));
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const [hasGoogleCalendar, setHasGoogleCalendar] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings?_t=${Date.now()}`);
      const data = await res.json();
      
      if (data.googleSyncError) {
        setHasGoogleCalendar(false);
        alert("Google Calendar sync failed: Your token has expired. Please click 'Connect Google Calendar' again to re-authenticate.");
      }

      if (data.meetings && Array.isArray(data.meetings)) {
        setMeetings(data.meetings);
      } else if (Array.isArray(data)) {
        setMeetings(data);
      }
    } catch (e) {
      console.error('Error fetching meetings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth to see if Google Calendar is connected
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserId(data.user.id || '');
          if (data.user.hasGoogleCalendar) {
            setHasGoogleCalendar(true);
          }
        }
      })
      .catch(err => console.error('Error checking auth:', err));
    
    fetchMeetings();
  }, [fetchMeetings]);

  const meetingsByDate = React.useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    meetings.forEach((m) => {
      const key = getMeetingDateKey(m.startTime);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return map;
  }, [meetings]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (date: Date) => {
    const key = toLocalDateString(date);
    setSelectedDate(key);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDate(null), 300);
  };

  const openAddModal = (dateStr?: string) => {
    const date = dateStr || toLocalDateString(today);
    setEditingMeeting(null);
    setFormData(emptyForm(date));
    setIsModalOpen(true);
  };

  const openEditModal = (meeting: Meeting) => {
    const startDate = new Date(meeting.startTime);
    const endDate = new Date(meeting.endTime);
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      date: toLocalDateString(startDate),
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      type: meeting.type,
      description: meeting.description || '',
      location: meeting.location || '',
      reminder: meeting.reminder || 'none',
      status: meeting.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      const endTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

      const payload = {
        title: formData.title,
        description: formData.description,
        startTime,
        endTime,
        type: formData.type,
        status: formData.status,
        reminder: formData.reminder === 'none' ? null : formData.reminder,
        location: formData.location,
        userId,
      };

      if (editingMeeting) {
        await fetch(`/api/meetings/${editingMeeting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await fetchMeetings();
      closeModal();
    } catch (err) {
      console.error('Error saving meeting:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting?')) return;
    try {
      await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting meeting:', err);
    }
  };

  const handleAddToGoogleCalendar = () => {
    const url = buildGoogleCalendarUrl(formData);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const todayKey = toLocalDateString(today);
  const selectedDateMeetings = selectedDate ? (meetingsByDate[selectedDate] || []) : [];

  return (
    <div className="meetings-page">
      {/* Header */}
      <div className="meetings-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">Schedule and manage your meetings and interviews.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!hasGoogleCalendar ? (
            <button className="btn-secondary meetings-add-btn" onClick={() => window.location.href='/api/auth/google'} title="Connect Google Calendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-sync">
                <path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
                <path d="M21 14.5A4.5 4.5 0 0 0 17.5 19"/>
                <path d="M17.5 19H14"/>
                <path d="M14 19v-3.5"/>
                <path d="M16 21.5L14 19l2-2.5"/>
              </svg>
              <span>Connect GCal</span>
            </button>
          ) : (
            <button className="btn-secondary meetings-add-btn" onClick={() => fetchMeetings()} title="Sync with Google Calendar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>Sync</span>
            </button>
          )}
          <button className="btn-primary meetings-add-btn" onClick={() => openAddModal()}>
            <Plus size={18} />
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <motion.div 
        className="calendar-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="calendar-controls">
          <div className="meetings-header-left">
            <button className="nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
              <ChevronLeft size={20} />
            </button>
            <button className="nav-btn" onClick={goToNextMonth} aria-label="Next month">
              <ChevronRight size={20} />
            </button>
            <h2 className="calendar-month-title">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
          </div>
          <button className="today-btn" onClick={goToToday}>Today</button>
        </div>

        <div className="calendar-grid-header">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}
        </div>

        <motion.div 
          className="calendar-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.02 }
            }
          }}
          initial="hidden"
          animate="show"
          key={`${currentYear}-${currentMonth}`}
        >
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="calendar-cell other-month" />;
            }

            const key = toLocalDateString(day);
            const dayMeetings = meetingsByDate[key] || [];
            const isToday = key === todayKey;

            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  show: { opacity: 1, scale: 1 }
                }}
                className={`calendar-cell${isToday ? ' is-today' : ''}`}
                onClick={() => handleDayClick(day)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleDayClick(day); }}
                aria-label={`${MONTHS[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`}
              >
                <span className="day-number">
                  {day.getDate()}
                </span>
                
                {dayMeetings.slice(0, 3).map(m => (
                  <div
                    key={m.id}
                    className={`meeting-block ${m.type === 'interview' ? 'interview' : 'meeting'}`}
                    title={m.title}
                  >
                    <span className="meeting-title-text">{m.title}</span>
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>
                    +{dayMeetings.length - 3} more
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {loading && (
          <div className="calendar-loading">
            <div className="cal-loading-spinner" />
            <span>Loading meetings…</span>
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot meeting" />
          <span>Meeting</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot interview" />
          <span>Interview</span>
        </div>
      </div>

      {/* Day Detail Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div 
            className="panel-overlay" 
            onClick={closePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="day-panel glass-panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="day-panel-header">
              <div>
                <div className="day-panel-date-label">
                  {selectedDate && formatDisplayDate(selectedDate)}
                </div>
                <div className="day-panel-count">
                  {selectedDateMeetings.length === 0
                    ? 'No meetings'
                    : `${selectedDateMeetings.length} meeting${selectedDateMeetings.length > 1 ? 's' : ''}`}
                </div>
              </div>
              <div className="day-panel-actions">
                <button
                  className="panel-add-btn"
                  onClick={() => openAddModal(selectedDate || undefined)}
                  title="Add meeting for this day"
                >
                  <Plus size={18} />
                </button>
                <button className="panel-close-btn" onClick={closePanel} aria-label="Close panel">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="day-panel-body">
              {selectedDateMeetings.length === 0 ? (
                <div className="panel-empty">
                  <Calendar size={40} strokeWidth={1} />
                  <p>No meetings scheduled</p>
                  <button className="btn-primary" onClick={() => openAddModal(selectedDate || undefined)}>
                    <Plus size={16} /> Schedule Meeting
                  </button>
                </div>
              ) : (
                <div className="panel-meetings-list">
                  {selectedDateMeetings
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(m => (
                      <div key={m.id} className="panel-meeting-card">
                        <div className="panel-meeting-time-col">
                          <span className="panel-meeting-start">{formatTime(m.startTime)}</span>
                          <span className="panel-meeting-divider">—</span>
                          <span className="panel-meeting-end">{formatTime(m.endTime)}</span>
                        </div>
                        <div className={`panel-meeting-stripe ${m.type}`} />
                        <div className="panel-meeting-info">
                          <div className="panel-meeting-top">
                            <span className="panel-meeting-title">{m.title}</span>
                            <span className={`panel-type-badge ${m.type}`}>
                              {m.type === 'interview' ? <Users size={11} /> : <Video size={11} />}
                              {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                            </span>
                          </div>
                          {m.location && (
                            <div className="panel-meeting-meta">
                              <MapPin size={12} />
                              <span>{m.location}</span>
                            </div>
                          )}
                          {m.description && (
                            <p className="panel-meeting-desc">{m.description}</p>
                          )}
                          <div className="panel-meeting-footer">
                            <span className={`panel-status-badge status-${m.status}`}>{m.status}</span>
                            <div className="panel-meeting-btns">
                              <button
                                className="panel-edit-btn"
                                onClick={() => openEditModal(m)}
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="panel-delete-btn"
                                onClick={() => handleDelete(m.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-backdrop" 
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="meeting-modal glass-panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
              <h2 className="modal-title">
                <Calendar size={20} />
                {editingMeeting ? 'Edit Meeting' : 'New Meeting'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>
              {/* Title */}
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Meeting title…"
                  required
                />
              </div>

              {/* Date + Type row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} /> Date *
                  </label>
                  <input
                    className="form-input"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Tag size={14} /> Type
                  </label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={e => setFormData(f => ({ ...f, type: e.target.value as 'meeting' | 'interview' }))}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="interview">Interview</option>
                  </select>
                </div>
              </div>

              {/* Start + End time row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={14} /> Start Time *
                  </label>
                  <input
                    className="form-input"
                    type="time"
                    value={formData.startTime}
                    onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={14} /> End Time *
                  </label>
                  <input
                    className="form-input"
                    type="time"
                    value={formData.endTime}
                    onChange={e => setFormData(f => ({ ...f, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} /> Location
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                  placeholder="Room, address or video link…"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Add agenda or notes…"
                  rows={3}
                />
              </div>

              {/* Reminder + Status row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Bell size={14} /> Reminder
                  </label>
                  <select
                    className="form-input"
                    value={formData.reminder}
                    onChange={e => setFormData(f => ({ ...f, reminder: e.target.value }))}
                  >
                    <option value="none">None</option>
                    <option value="15min">15 minutes before</option>
                    <option value="30min">30 minutes before</option>
                    <option value="1hour">1 hour before</option>
                    <option value="1day">1 day before</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              {/* Google Calendar button */}
              <button
                type="button"
                className="gcal-btn"
                onClick={handleAddToGoogleCalendar}
              >
                <ExternalLink size={16} />
                Add to Google Calendar
              </button>

              {/* Form actions */}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingMeeting ? 'Save Changes' : 'Create Meeting'}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

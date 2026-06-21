'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare, Video, Briefcase, Plus,
  Users, TrendingUp, Clock, CalendarDays
} from 'lucide-react';
import './Dashboard.css';
import { useRouter } from 'next/navigation';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface Client {
  id: string;
  name: string;
  status: string;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  type?: string;
}

interface Work {
  id: string;
  title: string;
  status: string;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return { startOfWeek, endOfWeek };
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ─────────────────────────────────────────────
   SVG Area Chart (Productivity)
───────────────────────────────────────────── */
function ProductivityChart({ tasks }: { tasks: Task[] }) {
  const days = last7Days();

  const counts = useMemo(() => {
    return days.map(day =>
      tasks.filter(t => t.createdAt && t.createdAt.slice(0, 10) === day).length
    );
  }, [tasks, days]);

  const maxVal = Math.max(...counts, 1);

  const W = 600;
  const H = 160;
  const padX = 36;
  const padY = 16;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2 - 24; // 24 for x-axis labels

  const points = counts.map((c, i) => {
    const x = padX + (i / (days.length - 1)) * chartW;
    const y = padY + chartH - (c / maxVal) * chartH;
    return { x, y, count: c };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Smooth curve using cardinal spline approximation
  function buildPath(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
      const cp1y = pts[i].y;
      const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
      const cp2y = pts[i + 1].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return d;
  }

  const linePath = buildPath(points);

  // Area path: close to bottom
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padY + chartH}` +
    ` L ${points[0].x} ${padY + chartH} Z`;

  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    Math.round((maxVal / yTickCount) * i)
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="productivity-svg"
      aria-label="Task productivity chart"
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((tick, i) => {
        const y = padY + chartH - (tick / maxVal) * chartH;
        return (
          <g key={i}>
            <line
              x1={padX} y1={y} x2={W - padX * 0.5} y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? 'none' : '4,4'}
            />
            <text
              x={padX - 6} y={y + 4}
              fill="rgba(148,163,184,0.7)"
              fontSize="10"
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glowFilter)"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" opacity="0.25" />
          <circle cx={p.x} cy={p.y} r="3" fill="#a5b4fc" filter="url(#glowFilter)" />
          {p.count > 0 && (
            <text
              x={p.x}
              y={p.y - 10}
              fill="#a5b4fc"
              fontSize="10"
              textAnchor="middle"
              fontWeight="600"
            >
              {p.count}
            </text>
          )}
        </g>
      ))}

      {/* X-axis labels */}
      {days.map((day, i) => {
        const x = padX + (i / (days.length - 1)) * chartW;
        const dayLabel = DAY_LABELS[new Date(day + 'T12:00:00').getDay()];
        const isToday = day === new Date().toISOString().slice(0, 10);
        return (
          <text
            key={i}
            x={x}
            y={H - 4}
            fill={isToday ? '#818cf8' : 'rgba(148,163,184,0.6)'}
            fontSize="11"
            textAnchor="middle"
            fontWeight={isToday ? '700' : '400'}
          >
            {dayLabel}
          </text>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SVG Donut Chart (Client Status)
───────────────────────────────────────────── */
const CLIENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ongoing:       { label: 'Ongoing',       color: '#10b981' },
  contacted:     { label: 'Contacted',     color: '#f59e0b' },
  'proposal sent': { label: 'Proposal Sent', color: '#3b82f6' },
  finished:      { label: 'Finished',      color: '#94a3b8' },
  'not decided': { label: 'Not Decided',   color: '#64748b' },
};

function getStatusConfig(status: string) {
  const key = status.toLowerCase().trim();
  return CLIENT_STATUS_CONFIG[key] ?? { label: status, color: '#6366f1' };
}

function DonutChart({ clients }: { clients: Client[] }) {
  // Count by status
  const counts: Record<string, number> = {};
  clients.forEach(c => {
    const key = c.status?.toLowerCase().trim() || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = clients.length || 1;
  const segments = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    ...getStatusConfig(status),
    pct: count / total,
  }));

  const R = 54;   // outer radius
  const r = 34;   // inner radius (hole)
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * R; // not used; we use arc paths

  // Build arc segments
  function polarToCartesian(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(startAngle: number, endAngle: number) {
    const outerStart = polarToCartesian(startAngle, R);
    const outerEnd = polarToCartesian(endAngle, R);
    const innerStart = polarToCartesian(startAngle, r);
    const innerEnd = polarToCartesian(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ');
  }

  let currentAngle = 0;
  const arcs = segments.map(seg => {
    const startAngle = currentAngle;
    const sweepAngle = seg.pct * 360;
    currentAngle += sweepAngle;
    return { ...seg, startAngle, endAngle: currentAngle };
  });

  if (clients.length === 0) {
    // Empty state ring
    return (
      <div className="donut-wrapper">
        <svg viewBox="0 0 160 160" className="donut-svg">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="12">No data</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="donut-wrapper">
      <svg viewBox="0 0 160 160" className="donut-svg">
        <defs>
          {arcs.map((seg, i) => (
            <filter key={i} id={`glow-seg-${i}`}>
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Background ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="20" />

        {/* Segments */}
        {arcs.map((seg, i) => {
          const sweepAngle = seg.endAngle - seg.startAngle;
          if (sweepAngle < 0.5) return null;
          return (
            <path
              key={i}
              d={arcPath(seg.startAngle, seg.endAngle - 1)}
              fill={seg.color}
              opacity="0.9"
            >
              <title>{seg.label}: {seg.count}</title>
            </path>
          );
        })}

        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="700" fontFamily="'Space Grotesk',sans-serif">
          {clients.length}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="10">
          clients
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  glowColor: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, glowColor, loading }: StatCardProps) {
  return (
    <div className="stat-card glass-panel" style={{ '--stat-glow': glowColor } as React.CSSProperties}>
      <div className="stat-icon-wrap" style={{ background: `${glowColor}22`, color: glowColor }}>
        {icon}
      </div>
      <div className="stat-body">
        <span className="stat-value">
          {loading ? <span className="stat-skeleton" /> : value}
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-glow-orb" style={{ background: glowColor }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function DashboardOverview() {
  const router = useRouter();

  const [tasks, setTasks]       = useState<Task[]>([]);
  const [clients, setClients]   = useState<Client[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [works, setWorks]       = useState<Work[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/clients').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/meetings').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/works').then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([t, c, m, w]) => {
      setTasks(Array.isArray(t) ? t : []);
      setClients(Array.isArray(c) ? c : []);
      setMeetings(Array.isArray(m) ? m : []);
      setWorks(Array.isArray(w) ? w : []);
      setLoading(false);
    });
  }, []);

  /* ── Stats ── */
  const totalClients = clients.length;

  const tasksDoneToday = tasks.filter(
    t => t.status === 'done' && isToday(t.updatedAt)
  ).length;

  const pendingTasks = tasks.filter(
    t => t.status === 'todo' || t.status === 'inprogress' || t.status === 'in_progress'
  ).length;

  const { startOfWeek, endOfWeek } = getWeekBounds();
  const meetingsThisWeek = meetings.filter(m => {
    const s = new Date(m.startTime);
    return s >= startOfWeek && s < endOfWeek;
  }).length;

  /* ── Pending works for widget ── */
  const pendingWorksList = works.filter(
    w => w.status === 'pending' || w.status === 'in-progress' || w.status === 'inprogress'
  );

  /* ── Pending tasks for widget ── */
  const pendingTaskList = tasks.filter(
    t => t.status === 'todo' || t.status === 'inprogress' || t.status === 'in_progress'
  );

  /* ── Client status breakdown ── */
  const clientStatusCounts: Record<string, number> = {};
  clients.forEach(c => {
    const key = c.status?.toLowerCase().trim() || 'unknown';
    clientStatusCounts[key] = (clientStatusCounts[key] || 0) + 1;
  });

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Here is what is happening today.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="stats-row">
        <StatCard
          label="Total Clients"
          value={totalClients}
          icon={<Users size={20} />}
          glowColor="#6366f1"
          loading={loading}
        />
        <StatCard
          label="Tasks Done Today"
          value={tasksDoneToday}
          icon={<TrendingUp size={20} />}
          glowColor="#10b981"
          loading={loading}
        />
        <StatCard
          label="Pending Tasks"
          value={pendingTasks}
          icon={<Clock size={20} />}
          glowColor="#f59e0b"
          loading={loading}
        />
        <StatCard
          label="Meetings This Week"
          value={meetingsThisWeek}
          icon={<CalendarDays size={20} />}
          glowColor="#3b82f6"
          loading={loading}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="charts-row">
        {/* Productivity Chart */}
        <div className="chart-panel glass-panel productivity-panel">
          <div className="chart-panel-header">
            <div className="chart-title-group">
              <div className="chart-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                <TrendingUp size={16} />
              </div>
              <h3 className="chart-title">Productivity This Week</h3>
            </div>
            <span className="chart-subtitle">Tasks created per day</span>
          </div>
          <div className="productivity-chart-wrap">
            {loading ? (
              <div className="chart-loading">
                <div className="chart-skeleton-bars">
                  {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                    <div key={i} className="chart-skeleton-bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <ProductivityChart tasks={tasks} />
            )}
          </div>
        </div>

        {/* Client Status Donut */}
        <div className="chart-panel glass-panel donut-panel">
          <div className="chart-panel-header">
            <div className="chart-title-group">
              <div className="chart-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <Users size={16} />
              </div>
              <h3 className="chart-title">Client Status</h3>
            </div>
            <span className="chart-subtitle">Distribution</span>
          </div>

          {loading ? (
            <div className="donut-loading">
              <div className="donut-skeleton-ring" />
            </div>
          ) : (
            <div className="donut-content">
              <DonutChart clients={clients} />
              <div className="donut-legend">
                {Object.entries(clientStatusCounts).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No client data</p>
                ) : (
                  Object.entries(clientStatusCounts).map(([status, count]) => {
                    const cfg = getStatusConfig(status);
                    return (
                      <div key={status} className="legend-item">
                        <span className="legend-dot" style={{ background: cfg.color }} />
                        <span className="legend-label">{cfg.label}</span>
                        <span className="legend-count">{count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Existing Widgets ── */}
      <div className="widgets-grid">

        {/* Tasks Today Widget */}
        <div className="widget-card glass-panel">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <CheckSquare size={18} />
              </div>
              <h3>Tasks Today</h3>
            </div>
            <button className="widget-action-btn" title="Add Task" onClick={() => router.push('/dashboard/tasks')}>
              <Plus size={16} />
            </button>
          </div>

          <div className={`widget-content ${pendingTaskList.length === 0 && !loading ? 'empty-state' : ''}`}>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading tasks...</p>
            ) : pendingTaskList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {pendingTaskList.slice(0, 5).map(task => (
                  <div key={task.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{task.title}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: task.status === 'inprogress' || task.status === 'in_progress' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: task.status === 'inprogress' || task.status === 'in_progress' ? '#3b82f6' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      {task.status === 'inprogress' || task.status === 'in_progress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                ))}
                <button
                  className="btn-secondary"
                  style={{ marginTop: '8px', fontSize: '0.85rem', padding: '8px 16px', alignSelf: 'flex-start' }}
                  onClick={() => router.push('/dashboard/tasks')}
                >
                  View All Tasks
                </button>
              </div>
            ) : (
              <>
                <CheckSquare size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No tasks scheduled for today.</p>
                <button
                  className="btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={() => router.push('/dashboard/tasks')}
                >
                  Go to Tasks
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Meetings Widget */}
        <div className="widget-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/meetings')}>
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <Video size={18} />
              </div>
              <h3>Upcoming Meetings</h3>
            </div>
            <button
              className="widget-action-btn"
              title="Go to Meetings"
              onClick={e => { e.stopPropagation(); router.push('/dashboard/meetings'); }}
            >
              <CalendarDays size={16} />
            </button>
          </div>

          <div className={`widget-content ${meetings.filter(m => new Date(m.startTime) >= new Date()).length === 0 && !loading ? 'empty-state' : ''}`}>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading meetings...</p>
            ) : (() => {
              const now = new Date();
              const upcoming = meetings
                .filter(m => new Date(m.startTime) >= now)
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 4);
              if (upcoming.length === 0) return (
                <>
                  <Video size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No upcoming meetings.</p>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: '12px', fontSize: '0.85rem', padding: '8px 16px' }}
                    onClick={e => { e.stopPropagation(); router.push('/dashboard/meetings'); }}
                  >
                    Schedule Meeting
                  </button>
                </>
              );
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {upcoming.map(m => {
                    const start = new Date(m.startTime);
                    const isToday2 = isToday(m.startTime);
                    return (
                      <div key={m.id} style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          minWidth: '40px',
                          background: isToday2 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '8px', padding: '6px 4px'
                        }}>
                          <span style={{ fontSize: '0.65rem', color: isToday2 ? '#60a5fa' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {start.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: isToday2 ? '#60a5fa' : 'var(--text-primary)', lineHeight: 1 }}>
                            {start.getDate()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {isToday2 && <span style={{ marginLeft: '6px', color: '#60a5fa', fontWeight: 600 }}>Today</span>}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.68rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 600,
                          background: (m as any).type === 'interview' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                          color: (m as any).type === 'interview' ? '#34d399' : '#60a5fa',
                          whiteSpace: 'nowrap'
                        }}>
                          {(m as any).type || 'meeting'}
                        </span>
                      </div>
                    );
                  })}
                  <button
                    className="btn-secondary"
                    style={{ marginTop: '4px', fontSize: '0.82rem', padding: '8px 14px', alignSelf: 'flex-start' }}
                    onClick={e => { e.stopPropagation(); router.push('/dashboard/meetings'); }}
                  >
                    View Calendar →
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Pending Works Widget */}
        <div className="widget-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/works')}>
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Briefcase size={18} />
              </div>
              <h3>Pending Works</h3>
            </div>
            <button className="widget-action-btn" title="Go to Works" onClick={e => { e.stopPropagation(); router.push('/dashboard/works'); }}>
              <Plus size={16} />
            </button>
          </div>

          <div className={`widget-content ${pendingWorksList.length === 0 && !loading ? 'empty-state' : ''}`}>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading works...</p>
            ) : pendingWorksList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {pendingWorksList.slice(0, 5).map(work => (
                  <div key={work.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{work.title}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: work.status === 'in-progress' || work.status === 'inprogress' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: work.status === 'in-progress' || work.status === 'inprogress' ? '#3b82f6' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      {work.status === 'in-progress' || work.status === 'inprogress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
                <button
                  className="btn-secondary"
                  style={{ marginTop: '8px', fontSize: '0.85rem', padding: '8px 16px', alignSelf: 'flex-start' }}
                  onClick={e => { e.stopPropagation(); router.push('/dashboard/works'); }}
                >
                  View All Works
                </button>
              </div>
            ) : (
              <>
                <Briefcase size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No pending works right now.</p>
                <button
                  className="btn-secondary"
                  style={{ marginTop: '12px', fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={e => { e.stopPropagation(); router.push('/dashboard/works'); }}
                >
                  Add Work
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

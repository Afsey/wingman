'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Link as LinkIcon, Cpu } from 'lucide-react';
import './AdminCenter.css';

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function AdminCenter() {
  const [activeTab, setActiveTab] = useState<'logs' | 'integrations' | 'ai'>('logs');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (res.ok) setLogs(data.logs || []);
    } catch (e) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-center-container">Loading Admin Center...</div>;
  }

  return (
    <div className="admin-center-container">
      <div className="admin-header">
        <h1>System Settings & Integrations</h1>
        <p>Review security logs and manage system-wide integrations.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          System Logs
        </button>
        <button 
          className={`admin-tab ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          Connected Apps
        </button>
        <button 
          className={`admin-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Settings
        </button>
      </div>

      <div className="admin-panel">
        {activeTab === 'logs' && (
          <div>
            <div className="panel-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--accent-color)" /> Activity Logs
              </h2>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.userName}</td>
                      <td style={{ color: 'var(--accent-color)', fontWeight: 500 }}>{log.action}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                        No system logs available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <div className="panel-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LinkIcon size={20} color="var(--accent-color)" /> Connected Apps
              </h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'center', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LinkIcon size={32} color="var(--text-secondary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Google Calendar Integration</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                Connect Wingman to Google Workspace to automatically sync meetings and schedule blocks. 
                This module is scheduled for future development.
              </p>
              <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Coming Soon
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <div className="panel-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="var(--accent-color)" /> AI Model Settings
              </h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'center', marginTop: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Cpu size={32} color="var(--text-secondary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>ECHO AI Engine</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                Configure LLM endpoints, API keys, and model parameters for the ECHO Assistant.
                This module is scheduled for future development.
              </p>
              <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

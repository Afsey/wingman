import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, FileText, AlignLeft, ListTodo, Flag, User } from 'lucide-react';
import './Tasks.css';
import '../admin/AdminCenter.css';
import CustomSelect from '../../components/CustomSelect';

interface User {
  id: string;
  name: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  task?: any;
  isAdmin: boolean;
}

export default function TaskModal({ isOpen, onClose, onSaved, task, isAdmin }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [userId, setUserId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDetails(task.details || '');
        setStatus(task.status || 'todo');
        setPriority(task.priority || 'medium');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setUserId(task.userId || '');
      } else {
        setTitle('');
        setDetails('');
        setStatus('todo');
        setPriority('medium');
        setDueDate('');
        setUserId('');
      }
      setError('');
      
      if (isAdmin) {
        fetch('/api/admin/users')
          .then(res => res.json())
          .then(data => {
            if (data.users && Array.isArray(data.users)) {
              setUsers(data.users);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, task, isAdmin]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
    const method = task ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          status,
          priority,
          dueDate: dueDate || null,
          userId: userId || undefined
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save task');
      
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-modal">
      <div className="add-user-content" style={{ maxWidth: '500px' }}>
        <button className="add-user-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>{task ? 'Edit Task' : 'Create Task'}</h2>

        {error && <div className="text-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <div className="input-with-icon-wrapper">
              <span className="input-icon"><FileText size={16} /></span>
              <input type="text" className="form-input-custom" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Design Homepage" style={{ paddingLeft: '38px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Details / Description</label>
            <div className="input-with-icon-wrapper">
              <span className="input-icon" style={{ top: '16px', transform: 'none' }}><AlignLeft size={16} /></span>
              <textarea className="form-input-custom" rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="Task details..." style={{ resize: 'vertical', paddingLeft: '38px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="input-with-icon-wrapper" style={{ zIndex: 20 }}>
                <span className="input-icon" style={{ zIndex: 30 }}><ListTodo size={16} /></span>
                <CustomSelect 
                  value={status} 
                  onChange={setStatus}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'inprogress', label: 'In Progress' },
                    { value: 'done', label: 'Done' },
                    { value: 'archived', label: 'Archived' }
                  ]}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="input-with-icon-wrapper" style={{ zIndex: 19 }}>
                <span className="input-icon" style={{ zIndex: 30 }}><Flag size={16} /></span>
                <CustomSelect 
                  value={priority} 
                  onChange={setPriority}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' }
                  ]}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div 
                className="input-with-icon-wrapper" 
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => (document.getElementById('due-date-picker') as HTMLInputElement)?.showPicker()}
              >
                <span className="input-icon" style={{ zIndex: 10 }}><Calendar size={16} /></span>
                <input 
                  id="due-date-picker"
                  type="date" 
                  className="form-input-custom"
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  style={{ cursor: 'pointer', paddingLeft: '38px', paddingRight: '12px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <div className="input-with-icon-wrapper" style={{ zIndex: 18 }}>
                  <span className="input-icon" style={{ zIndex: 30 }}><User size={16} /></span>
                  <CustomSelect 
                    value={userId} 
                    onChange={setUserId}
                    options={[
                      { value: '', label: 'Unassigned (Self)' },
                      ...users.map(u => ({ value: u.id, label: u.name }))
                    ]}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

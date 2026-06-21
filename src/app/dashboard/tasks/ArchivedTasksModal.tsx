import React from 'react';
import { X, ArchiveRestore, Trash2 } from 'lucide-react';
import './Tasks.css';
import '../admin/AdminCenter.css';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
}

interface ArchivedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onRestore: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function ArchivedTasksModal({ isOpen, onClose, tasks, onRestore, onDelete }: ArchivedTasksModalProps) {
  if (!isOpen) return null;

  const archivedTasks = tasks.filter(t => t.status === 'archived');

  return (
    <div className="add-user-modal">
      <div className="add-user-content" style={{ maxWidth: '600px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <button className="add-user-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Archived Tasks</h2>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {archivedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
              No archived tasks found.
            </div>
          ) : (
            archivedTasks.map(task => (
              <div key={task.id} style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{task.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Priority: <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                    {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onRestore(task.id)}
                    title="Restore to To Do"
                  >
                    <ArchiveRestore size={14} /> Restore
                  </button>
                  <button 
                    className="icon-btn text-danger" 
                    onClick={() => onDelete(task.id)}
                    title="Delete permanently"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

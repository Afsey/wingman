import React from 'react';
import { Calendar, Trash2, Edit2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTouchStart?: (e: React.TouchEvent, taskId: string) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent, taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onDragStart, onTouchStart, onTouchMove, onTouchEnd }: TaskCardProps) {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getDaysDiff = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderDueDate = () => {
    if (task.status === 'done') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          <CheckCircle2 size={12} />
          <span>Well Done!</span>
        </div>
      );
    }

    if (!task.dueDate) return null;

    const daysDiff = getDaysDiff(task.dueDate);
    
    if (daysDiff !== null && daysDiff < 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          <AlertCircle size={12} />
          <span>Due {Math.abs(daysDiff)} days ago</span>
        </div>
      );
    }

    const date = new Date(task.dueDate);
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return (
      <div className="task-date">
        <Calendar size={12} />
        <span>{formatted}</span>
      </div>
    );
  };

  return (
    <div 
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onTouchStart={(e) => onTouchStart && onTouchStart(e, task.id)}
      onTouchMove={onTouchMove}
      onTouchEnd={(e) => onTouchEnd && onTouchEnd(e, task.id)}
      style={{ touchAction: 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <FileText size={16} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} />
          <h4 className="task-title" style={{ margin: 0, fontWeight: 500, lineHeight: 1.4 }}>{task.title}</h4>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="icon-btn" 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            title="Edit Task"
          >
            <Edit2 size={14} />
          </button>
          <button 
            className="icon-btn text-danger" 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {task.details && (
        <p className="task-details">{task.details}</p>
      )}
      
      <div className="task-meta">
        {renderDueDate()}

        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

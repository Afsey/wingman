import React, { useState } from 'react';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
}

interface TasksBoardProps {
  tasks: Task[];
  onTaskUpdated: (taskId: string, newStatus: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS = [
  { id: 'todo', title: 'Not started', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  { id: 'inprogress', title: 'In progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'done', title: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
];

export default function TasksBoard({ tasks, onTaskUpdated, onEditTask, onDeleteTask }: TasksBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    // Slight delay so the drag image isn't immediately transparent
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, taskId: string) => {
    const el = document.getElementById(`task-${taskId}`);
    if (el) el.classList.remove('dragging');
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onTaskUpdated(taskId, colId);
    }
  };

  const boardRef = React.useRef<HTMLDivElement>(null);

  const handleBoardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (boardRef.current) {
      const board = boardRef.current;
      const rect = board.getBoundingClientRect();
      const edgeThreshold = 80;

      if (e.clientX > rect.right - edgeThreshold) {
        board.scrollLeft += 7;
      } else if (e.clientX < rect.left + edgeThreshold) {
        board.scrollLeft -= 7;
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    // Remove any existing clones just in case
    const existing = document.getElementById('touch-clone');
    if (existing) existing.remove();

    const el = document.getElementById(`task-${taskId}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const touch = e.touches[0];

      el.classList.add('dragging');
      // Create a clone for visual feedback during touch
      const clone = el.cloneNode(true) as HTMLElement;
      clone.id = 'touch-clone';
      clone.style.position = 'fixed';
      clone.style.pointerEvents = 'none';
      clone.style.zIndex = '99999';
      clone.style.opacity = '0.9';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';
      clone.style.left = `${touch.clientX - rect.width / 2}px`;
      clone.style.top = `${touch.clientY - rect.height / 2}px`;
      clone.style.transform = 'scale(1.05) rotate(2deg)';
      clone.style.boxShadow = '0 12px 30px rgba(0,0,0,0.6)';
      document.body.appendChild(clone);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Move the visual clone
    const clone = document.getElementById('touch-clone');
    if (clone) {
      const w = clone.offsetWidth;
      const h = clone.offsetHeight;
      clone.style.left = `${touch.clientX - w / 2}px`;
      clone.style.top = `${touch.clientY - h / 2}px`;
    }

    // Highlight closest drop target column (Smart Highlight)
    let closestCol: Element | null = null;
    let minDistance = Infinity;
    document.querySelectorAll('.kanban-column').forEach(col => {
      const rect = col.getBoundingClientRect();
      // Calculate distance from center of touch to center of column horizontally
      const colCenter = rect.left + rect.width / 2;
      const dist = Math.abs(touch.clientX - colCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestCol = col;
      }
    });

    if (closestCol) {
      const colId = (closestCol as Element).getAttribute('data-col-id');
      if (colId && dragOverCol !== colId) {
        setDragOverCol(colId);
      }
    } else {
      setDragOverCol(null);
    }

    // Auto scroll logic
    if (boardRef.current) {
      const board = boardRef.current;
      const rect = board.getBoundingClientRect();
      const edgeThreshold = 80;

      if (touch.clientX > rect.right - edgeThreshold) {
        board.scrollLeft += 7;
      } else if (touch.clientX < rect.left + edgeThreshold) {
        board.scrollLeft -= 7;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, taskId: string) => {
    const el = document.getElementById(`task-${taskId}`);
    if (el) {
      el.classList.remove('dragging');
    }
    
    // Remove clone
    const clone = document.getElementById('touch-clone');
    if (clone) {
      clone.remove();
    }
    
    setDragOverCol(null);

    const touch = e.changedTouches[0];
    
    // SMART SNAP: If dropped anywhere on the board (even between columns), snap to the closest one horizontally
    let closestColId: string | null = null;
    let minDistance = Infinity;
    document.querySelectorAll('.kanban-column').forEach(col => {
      const rect = col.getBoundingClientRect();
      const colCenter = rect.left + rect.width / 2;
      const dist = Math.abs(touch.clientX - colCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestColId = col.getAttribute('data-col-id');
      }
    });

    if (closestColId) {
      onTaskUpdated(taskId, closestColId);
    }
  };

  return (
    <div className="kanban-board" ref={boardRef} onDragOver={handleBoardDragOver}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id}
            data-col-id={col.id}
            className={`kanban-column ${dragOverCol === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header" style={{ borderBottom: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: col.bg, borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                <span style={{ color: col.color === '#6b7280' ? 'var(--text-primary)' : col.color }}>{col.title}</span>
              </div>
              <span className="column-count" style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--text-secondary)' }}>{colTasks.length}</span>
            </div>
            
            <div className="task-list">
              {colTasks.map(task => (
                <div key={task.id} id={`task-${task.id}`} onDragEnd={(e) => handleDragEnd(e, task.id)}>
                  <TaskCard 
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onDragStart={handleDragStart}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Archive, Filter, ChevronDown } from 'lucide-react';
import TasksBoard from './TasksBoard';
import TaskModal from './TaskModal';
import ArchivedTasksModal from './ArchivedTasksModal';
import './Tasks.css';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('wingman_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') setIsAdmin(true);
      if (user.role !== 'admin') setFilter('my_tasks'); // Force user to my_tasks
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?filter=${filter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      fetchTasks(); // rollback on error
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setTasks(tasks.filter(t => t.id !== id)); // Optimistic UI
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      fetchTasks();
    }
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your daily tasks and to-dos.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Filter Dropdown */}
          <div className="filter-dropdown-wrapper" style={{ position: 'relative' }}>
            <button 
              className="mobile-filter-btn icon-only"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <Filter size={18} />
            </button>

            {isMobileFilterOpen && (
              <div className="mobile-filter-menu glass-panel">
                {isAdmin ? (
                  <>
                    <button className={`dropdown-item ${filter === 'all' ? 'active' : ''}`} onClick={() => {setFilter('all'); setIsMobileFilterOpen(false);}}>All Tasks</button>
                    <button className={`dropdown-item ${filter === 'my_tasks' ? 'active' : ''}`} onClick={() => {setFilter('my_tasks'); setIsMobileFilterOpen(false);}}>My Tasks</button>
                    <button className={`dropdown-item ${filter === 'admin_assigned' ? 'active' : ''}`} onClick={() => {setFilter('admin_assigned'); setIsMobileFilterOpen(false);}}>Admin Assigned</button>
                    <button className={`dropdown-item ${filter === 'today' ? 'active' : ''}`} onClick={() => {setFilter('today'); setIsMobileFilterOpen(false);}}>Today Added</button>
                    <button className={`dropdown-item ${filter === 'yesterday' ? 'active' : ''}`} onClick={() => {setFilter('yesterday'); setIsMobileFilterOpen(false);}}>Yesterday Added</button>
                    <button className={`dropdown-item ${filter === 'last_week' ? 'active' : ''}`} onClick={() => {setFilter('last_week'); setIsMobileFilterOpen(false);}}>Last Week Added</button>
                  </>
                ) : (
                  <>
                    <button className={`dropdown-item ${filter === 'admin_assigned' ? 'active' : ''}`} onClick={() => {setFilter('admin_assigned'); setIsMobileFilterOpen(false);}}>Admin Assigned</button>
                    <button className={`dropdown-item ${filter === 'all' ? 'active' : ''}`} onClick={() => {setFilter('all'); setIsMobileFilterOpen(false);}}>All Tasks</button>
                    <button className={`dropdown-item ${filter === 'today' ? 'active' : ''}`} onClick={() => {setFilter('today'); setIsMobileFilterOpen(false);}}>Today Added</button>
                    <button className={`dropdown-item ${filter === 'yesterday' ? 'active' : ''}`} onClick={() => {setFilter('yesterday'); setIsMobileFilterOpen(false);}}>Yesterday Added</button>
                    <button className={`dropdown-item ${filter === 'last_week' ? 'active' : ''}`} onClick={() => {setFilter('last_week'); setIsMobileFilterOpen(false);}}>Last Week Added</button>
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            className="mobile-icon-btn"
            onClick={() => setIsArchivedModalOpen(true)}
            title="Archived Tasks"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          >
            <Archive size={18} />
          </button>

          <button 
            className="btn-primary mobile-icon-btn" 
            onClick={handleCreateNew} 
            title="New Task"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              padding: 0
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tasks...</div>
      ) : (
        <TasksBoard 
          tasks={tasks}
          onTaskUpdated={handleTaskStatusUpdate}
          onEditTask={handleEdit}
          onDeleteTask={handleDeleteTask}
        />
      )}

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTasks}
        task={editingTask}
        isAdmin={isAdmin}
      />

      <ArchivedTasksModal 
        isOpen={isArchivedModalOpen}
        onClose={() => setIsArchivedModalOpen(false)}
        tasks={tasks}
        onRestore={(id) => handleTaskStatusUpdate(id, 'todo')}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

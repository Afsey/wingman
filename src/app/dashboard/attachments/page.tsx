'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Plus, X, UploadCloud, Download, Trash2, FileText, FileArchive, Film, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import './Attachments.css';

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  createdAt: string;
}

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
  }, []);

  const fetchAttachments = async () => {
    try {
      const res = await fetch('/api/attachments');
      const data = await res.json();
      setAttachments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch attachments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (res.ok) {
        const newAttachment = await res.json();
        setAttachments(prev => [newAttachment, ...prev]);
        setTimeout(() => {
          setShowModal(false);
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (e) {
      console.error('Upload error', e);
      alert('An error occurred during upload');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAttachments(prev => prev.filter(a => a.id !== id));
      } else {
        alert('Failed to delete attachment');
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (category: string) => {
    switch(category) {
      case 'image': return <ImageIcon size={32} />;
      case 'document': return <FileText size={32} />;
      case 'archive': return <FileArchive size={32} />;
      case 'media': return <Film size={32} />;
      default: return <FileIcon size={32} />;
    }
  };

  const filteredAttachments = filter === 'all' 
    ? attachments 
    : attachments.filter(a => a.category === filter);

  return (
    <div className="att-page">
      <div className="att-header">
        <div className="att-header-left">
          <div className="att-icon-badge">
            <Paperclip size={22} />
          </div>
          <div>
            <h1 className="att-title">Attachments</h1>
            <p className="att-subtitle">Your personal cloud vault for all important files.</p>
          </div>
        </div>
        <button className="att-add-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Upload File</span>
        </button>
      </div>

      <div className="att-filters">
        <div className={`att-filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Files</div>
        <div className={`att-filter-chip ${filter === 'image' ? 'active' : ''}`} onClick={() => setFilter('image')}>Images</div>
        <div className={`att-filter-chip ${filter === 'document' ? 'active' : ''}`} onClick={() => setFilter('document')}>Documents</div>
        <div className={`att-filter-chip ${filter === 'media' ? 'active' : ''}`} onClick={() => setFilter('media')}>Media</div>
        <div className={`att-filter-chip ${filter === 'archive' ? 'active' : ''}`} onClick={() => setFilter('archive')}>Archives</div>
        <div className={`att-filter-chip ${filter === 'other' ? 'active' : ''}`} onClick={() => setFilter('other')}>Others</div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading vault...</p>
        </div>
      ) : filteredAttachments.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', opacity: 0.6 }}>
          <Paperclip size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Your vault is empty</h3>
          <p>Upload some files to get started.</p>
        </div>
      ) : (
        <div className="att-grid">
          {filteredAttachments.map(file => (
            <div key={file.id} className="att-card">
              <div className="att-card-preview">
                {file.category === 'image' ? (
                  <img src={file.url} alt={file.originalName} loading="lazy" />
                ) : (
                  <div className="att-card-icon">
                    {getFileIcon(file.category)}
                  </div>
                )}
                
                <div className="att-card-actions">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="att-action-btn" title="Download/View">
                    <Download size={16} />
                  </a>
                  <button className="att-action-btn delete" onClick={() => handleDelete(file.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="att-card-info">
                <div className="att-card-title" title={file.originalName}>{file.originalName}</div>
                <div className="att-card-meta">
                  <span>{formatSize(file.size)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => !uploading && setShowModal(false)}>
              <X size={20} />
            </button>
            <h2 className="modal-title">Upload File</h2>
            
            <div 
              className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                style={{ display: 'none' }} 
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <UploadCloud size={48} className="upload-icon" />
              <div className="upload-text">Click or drag a file to upload</div>
              <div className="upload-subtext">Supports images, documents, videos, and archives</div>
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

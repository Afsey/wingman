import React, { useState } from 'react';
import { X, Tags, Link, Star, MoreHorizontal, Share, Smile } from 'lucide-react';
import './Finance.css';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export default function CategoryModal({ isOpen, onClose, onCategoryAdded }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('/api/finance/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          icon,
          budget
        })
      });
      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header-nav">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
             <button className="btn-new-page" style={{ margin: 0, padding: '0.25rem 0.75rem' }}>
                <Share size={14}/> Share
             </button>
             <button className="icon-btn"><Link size={16}/></button>
             <button className="icon-btn"><Star size={16}/></button>
             <button className="icon-btn"><MoreHorizontal size={16}/></button>
             <button className="icon-btn" onClick={onClose}><X size={20}/></button>
          </div>
        </div>
        
        <div style={{ padding: '2rem 2rem 0' }}>
          <Tags size={48} color="white" />
        </div>
        
        <h2 className="notion-page-title">New Category</h2>
        
        <form className="notion-form" onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-label">
              <Tags size={16} /> Name
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Housing, Food, Entertainment"
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-label">
              <Smile size={16} /> Icon (Emoji)
            </div>
            <input 
              type="text" 
              placeholder="📌"
              className="form-input" 
              value={icon} 
              onChange={e => setIcon(e.target.value)}
              maxLength={4}
            />
          </div>

          <div className="form-row">
            <div className="form-label">
              <Tags size={16} /> Monthly Budget
            </div>
            <input 
              type="number" 
              step="0.01"
              placeholder="Empty"
              className="form-input" 
              value={budget} 
              onChange={e => setBudget(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

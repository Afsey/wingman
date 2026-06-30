import React, { useState } from 'react';
import { X, Wallet, Image as ImageIcon, Link, Star, MoreHorizontal, Share } from 'lucide-react';
import './Finance.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

export default function AccountModal({ isOpen, onClose, onAccountAdded }: AccountModalProps) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('Savings Account');
  const [creditLimit, setCreditLimit] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          accountType,
          creditLimit
        })
      });
      onAccountAdded();
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
          <Wallet size={48} color="white" />
        </div>
        
        <h2 className="notion-page-title">New Account</h2>
        
        <form className="notion-form" onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-label">
               NAME
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. HDFC Savings"
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-label">
               TYPE
            </div>
            <select 
              className="form-input" 
              value={accountType} 
              onChange={e => setAccountType(e.target.value)}
            >
              <option value="Savings Account">Savings Account</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Wallet">Wallet / UPI</option>
              <option value="Loan">Loan</option>
            </select>
          </div>

          {accountType === 'Credit Card' && (
            <div className="form-row">
              <div className="form-label">
                 Credit Limit
              </div>
              <input 
                type="number" 
                step="0.01"
                placeholder="Empty"
                className="form-input" 
                value={creditLimit} 
                onChange={e => setCreditLimit(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', paddingLeft: '164px' }}>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

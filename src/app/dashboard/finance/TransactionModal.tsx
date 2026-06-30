import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Wallet, Tags, AlignLeft, Share, Link, Star, MoreHorizontal, ArrowUp } from 'lucide-react';
import './Finance.css';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string; // 'Expense', 'Payment', 'Income', 'Refund'
  preSelectedAccountId?: string;
  onTransactionAdded: () => void;
}

export default function TransactionModal({ isOpen, onClose, type, preSelectedAccountId, onTransactionAdded }: TransactionModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(preSelectedAccountId || '');
  const [categoryId, setCategoryId] = useState('');
  const [misc, setMisc] = useState('');
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/finance/accounts').then(res => res.json()).then(setAccounts);
      fetch('/api/finance/categories').then(res => res.json()).then(setCategories);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          amount,
          type,
          accountId,
          categoryId,
          misc
        })
      });
      onTransactionAdded();
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
          <ArrowUp size={48} color="white" />
        </div>
        
        <h2 className="notion-page-title">New {type.toLowerCase()}</h2>
        
        <form className="notion-form" onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-label">
              <Calendar size={16} /> Date
            </div>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-label">
              <DollarSign size={16} /> Amount
            </div>
            <input 
              type="number" 
              step="0.01"
              placeholder="Empty"
              className="form-input" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-label">
              <Wallet size={16} /> Accounts
            </div>
            <select 
              className="form-input" 
              value={accountId} 
              onChange={e => setAccountId(e.target.value)}
              required
            >
              <option value="">Select a page...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-label">
              <Tags size={16} /> Categories
            </div>
            <select 
              className="form-input" 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Select a page...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-label">
              <AlignLeft size={16} /> Misc
            </div>
            <input 
              type="text" 
              placeholder="Empty"
              className="form-input" 
              value={misc} 
              onChange={e => setMisc(e.target.value)}
            />
          </div>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', margin: '1rem 0' }}></div>
          
          <div className="form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', color: 'var(--text-secondary)' }}>
               <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#333' }}></div>
               <input type="text" placeholder="Add a comment..." className="form-input" style={{ border: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

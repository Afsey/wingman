import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, Link, MoreHorizontal, Star, Share } from 'lucide-react';
import './Finance.css';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export default function AccountDetailModal({ isOpen, onClose, accountId }: AccountDetailModalProps) {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && accountId) {
      // Fetch account details
      fetch('/api/finance/accounts').then(res => res.json()).then(data => {
        const found = data.find((a: any) => a.id === accountId);
        setAccount(found);
      });
      // Fetch transactions for this account
      fetch(`/api/finance/transactions?accountId=${accountId}`).then(res => res.json()).then(setTransactions);
    }
  }, [isOpen, accountId]);

  if (!isOpen || !account) return null;

  const expenses = transactions.filter(t => t.type === 'Expense' || t.type === 'Transfer Out');
  const incomes = transactions.filter(t => t.type === 'Income' || t.type === 'Refund' || t.type === 'Transfer In');
  const payments = transactions.filter(t => t.type === 'Payment');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  
  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '900px', height: '90vh' }} onClick={e => e.stopPropagation()}>
        
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
        
        <div className="account-hero">
          {account.logoUrl && (
             <div className="account-hero-logo">
               <img src={account.logoUrl} alt={account.name} />
             </div>
          )}
        </div>

        <h2 className="account-detail-title">{account.name}</h2>
        <div className="account-detail-balance">{formatCurrency(account.balance)}</div>
        
        <div style={{ padding: '0 2rem' }}>
           <div className="form-row" style={{ marginBottom: '0.75rem' }}>
              <div className="form-label" style={{ width: 180 }}>Account Type</div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem' }}>
                {account.accountType}
              </div>
           </div>
           
           <div className="form-row" style={{ marginBottom: '0.75rem' }}>
              <div className="form-label" style={{ width: 180 }}>Total Expense</div>
              <div>{formatCurrency(totalExpense)}</div>
           </div>
           
           <div className="form-row" style={{ marginBottom: '0.75rem' }}>
              <div className="form-label" style={{ width: 180 }}>Total Income</div>
              <div>{formatCurrency(totalIncome)}</div>
           </div>

           {account.creditLimit && (
             <div className="form-row" style={{ marginBottom: '0.75rem' }}>
                <div className="form-label" style={{ width: 180 }}>Credit Limit</div>
                <div>{formatCurrency(account.creditLimit)}</div>
             </div>
           )}
        </div>
        
        <div style={{ padding: '2rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div className="list-box expenses" style={{ backgroundColor: '#2a2626' }}>
                <div className="list-header" style={{ color: '#fff' }}>
                  <ArrowUp size={24} /> Expenses
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  can use this section to track for any purchases
                </div>
                <div className="table-container">
                  <table className="finance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0 ? (
                        <tr><td colSpan={3} className="empty-state">No expenses yet</td></tr>
                      ) : (
                        expenses.map(t => (
                          <tr key={t.id}>
                            <td>{new Date(t.date).toLocaleDateString()}</td>
                            <td>{t.category?.name || t.misc || 'Expense'}</td>
                            <td>{formatCurrency(t.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button className="btn-new-page">+ New page</button>
              </div>
              
              <div className="list-box income" style={{ backgroundColor: '#1f2924' }}>
                <div className="list-header" style={{ color: '#fff' }}>
                  <ArrowDown size={24} /> Refunds / Income
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  can use this section to track for any money coming in
                </div>
                <div className="table-container">
                  <table className="finance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomes.length === 0 ? (
                        <tr><td colSpan={3} className="empty-state">No income yet</td></tr>
                      ) : (
                        incomes.map(t => (
                          <tr key={t.id}>
                            <td>{new Date(t.date).toLocaleDateString()}</td>
                            <td>{t.category?.name || t.misc || 'Income'}</td>
                            <td>{formatCurrency(t.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button className="btn-new-page">+ New page</button>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}

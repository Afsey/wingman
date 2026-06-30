"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ArrowUp, ArrowDown, Repeat, Wallet } from 'lucide-react';
import TransactionModal from './TransactionModal';
import AccountDetailModal from './AccountDetailModal';
import AccountModal from './AccountModal';
import CategoryModal from './CategoryModal';
import './Finance.css';

export default function FinanceTracker() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [txType, setTxType] = useState('Expense');
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  
  const [detailModalAccountId, setDetailModalAccountId] = useState<string | null>(null);

  const fetchData = async () => {
    const [accRes, catRes, txRes] = await Promise.all([
      fetch('/api/finance/accounts'),
      fetch('/api/finance/categories'),
      fetch('/api/finance/transactions')
    ]);
    
    if (accRes.ok) setAccounts(await accRes.json());
    if (catRes.ok) setCategories(await catRes.json());
    if (txRes.ok) setTransactions(await txRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openTxModal = (type: string, accId?: string) => {
    setTxType(type);
    setSelectedAccountId(accId);
    setIsTxModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const calculateUtilization = (balance: number, limit: number | null) => {
    if (!limit) return 0;
    // utilization = (balance / limit) * 100
    // Assuming balance represents how much is spent if it's a credit card.
    // If balance is cash on hand, utilization of a credit limit doesn't make sense unless it's a CC.
    // We'll just do absolute balance / limit
    return Math.min(100, Math.max(0, (Math.abs(balance) / limit) * 100));
  };

  // Mock initial account addition if empty just to avoid a blank slate (or user can add via API later)
  // For the sake of this page, we'll assume they can add accounts directly via a small prompt or API.

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h1>Finance Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your accounts, budgets, and transactions.</p>
      </div>

      <div className="finance-section">
        <div className="finance-section-header">
          <div className="finance-section-title">
             <Wallet /> Accounts
          </div>
        </div>

        <div className="gallery-grid">
          {accounts.map(acc => (
            <div key={acc.id} className="account-card" onClick={() => setDetailModalAccountId(acc.id)}>
              {acc.logoUrl ? (
                <div className="account-logo-container">
                  <img src={acc.logoUrl} alt={acc.name} className="account-logo" />
                </div>
              ) : (
                <div className="account-logo-container" style={{ backgroundColor: '#2a2a2a', color: '#fff' }}>
                  <Wallet size={48} />
                </div>
              )}
              
              <div className="account-name">{acc.name}</div>
              <div className="account-balance">{formatCurrency(acc.balance)}</div>
              
              {acc.creditLimit && (
                <div className="account-utilization">
                  Utilization: {calculateUtilization(acc.balance, acc.creditLimit).toFixed(1)}%
                </div>
              )}

              <div className="account-actions">
                <button 
                  className="action-btn btn-expense"
                  onClick={(e) => { e.stopPropagation(); openTxModal('Expense', acc.id); }}
                >
                  <ArrowUp size={16}/> Add Expense
                </button>
                <button 
                  className="action-btn btn-payment"
                  onClick={(e) => { e.stopPropagation(); openTxModal('Payment', acc.id); }}
                >
                  <Repeat size={16}/> Add Payment
                </button>
                <button 
                  className="action-btn btn-income"
                  onClick={(e) => { e.stopPropagation(); openTxModal('Income', acc.id); }}
                >
                  <ArrowDown size={16}/> Add Income
                </button>
              </div>
            </div>
          ))}
          
          <div className="account-card" style={{ justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
             <button className="primary-btn" onClick={() => setIsAccountModalOpen(true)}>
                <Plus size={20}/> New Account
             </button>
          </div>
        </div>
      </div>

      <div className="finance-section">
        <div className="finance-section-header">
          <div className="finance-section-title">
             <Wallet /> Categories
          </div>
        </div>

        <div className="gallery-grid">
          {categories.map(cat => {
            // Calculate budget utilization
            const catTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'Expense');
            const spent = catTx.reduce((sum, t) => sum + t.amount, 0);
            const progress = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
            const isOverBudget = progress > 100;

            return (
              <div key={cat.id} className="category-card">
                <div className="category-header">
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </div>
                <div className="category-budget">
                  {formatCurrency(spent)} / {formatCurrency(cat.budget)}
                </div>
                
                <div className="progress-bar-container">
                  <div className={`progress-segment ${progress > 0 ? (isOverBudget ? 'danger' : 'filled') : ''}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                  <div className="progress-segment" style={{ width: `${Math.max(0, 100 - progress)}%`, backgroundColor: 'var(--border-color)' }}></div>
                </div>
                
                <div className="category-status">
                  <div className={`status-dot ${isOverBudget ? 'danger' : ''}`}></div>
                  {isOverBudget ? 'Over Budget' : 'Within Budget'}
                </div>
              </div>
            );
          })}
          
          <div className="category-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
             <button className="primary-btn" onClick={() => setIsCategoryModalOpen(true)}>
                <Plus size={20}/> New Category
             </button>
          </div>
        </div>
      </div>

      {isTxModalOpen && (
        <TransactionModal 
          isOpen={isTxModalOpen} 
          onClose={() => setIsTxModalOpen(false)} 
          type={txType}
          preSelectedAccountId={selectedAccountId}
          onTransactionAdded={fetchData}
        />
      )}
      
      {detailModalAccountId && (
        <AccountDetailModal 
          isOpen={!!detailModalAccountId} 
          onClose={() => {
            setDetailModalAccountId(null);
            fetchData(); // Refresh to get updated balance
          }} 
          accountId={detailModalAccountId} 
        />
      )}

      {isAccountModalOpen && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onAccountAdded={fetchData}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCategoryAdded={fetchData}
        />
      )}
    </div>
  );
}

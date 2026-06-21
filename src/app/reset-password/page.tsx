'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-error-box" style={{ textAlign: 'center' }}>
        Invalid or missing reset token. Please request a new password reset link.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>Password Reset Successful!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You can now log in with your new password. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <div className="modal-header">
        <h2 className="modal-title">Create New Password</h2>
        <p className="modal-subtitle">Ensure your new password is at least 8 characters.</p>
      </div>

      {error && <div className="text-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">New Password</label>
        <div className="input-with-icon-wrapper">
          <span className="input-icon"><Lock size={16} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input-custom"
            placeholder="Min 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-btn"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label">Confirm Password</label>
        <div className="input-with-icon-wrapper">
          <span className="input-icon"><Lock size={16} /></span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input-custom"
            placeholder="Confirm password"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '480px' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

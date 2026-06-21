'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, X, Calendar } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; timezone: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'dob'>('password');
  const [dob, setDob] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [view, setView] = useState<'login' | 'forgot_password'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // Load saved email if remember me was used
  useEffect(() => {
    const savedEmail = localStorage.getItem('wingman_saved_login');
    if (savedEmail) {
      setUsernameOrEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password, phone, loginMethod, dob }),
      });

      const data = await response.json();
      const elapsedTime = Date.now() - startTime;
      const minDuration = 2000; // 2 seconds minimum loading time for visual walk cycle

      if (elapsedTime < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsedTime));
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('wingman_saved_login', usernameOrEmail);
      } else {
        localStorage.removeItem('wingman_saved_login');
      }

      // Success!
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to request reset');
      
      setResetMessage(data.message || 'Reset link sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-panel glow-card">
        
        {/* Close Button */}
        {!loading && (
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        )}

        {/* Loading State Overlay */}
        {loading && (
          <div className="loading-overlay">
            
            {/* Double Animation: Walking Person + Buffering Circle */}
            <div className="loading-animation-wrapper">
              {/* Circular Buffer Spinner */}
              <div className="loading-spinner-circle"></div>
              
              {/* Walking Person (pure CSS walk cycle) */}
              <div className="walker-container" style={{ transform: 'scale(0.7)' }}>
                <div className="walker-head"></div>
                <div className="walker-torso"></div>
                <div className="walker-arm-left"></div>
                <div className="walker-arm-right"></div>
                <div className="walker-leg-left"></div>
                <div className="walker-leg-right"></div>
              </div>
            </div>

            <h3 className="modal-title" style={{ color: 'var(--accent-color)', fontSize: '1.25rem' }}>Analyzing identity...</h3>
            <p className="modal-subtitle" style={{ maxWidth: '280px', margin: '0.5rem auto 0' }}>
              Wingman is walking through authorization nodes. Please wait.
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {view === 'login' ? 'Who are you?' : 'Reset Password'}
          </h2>
          <p className="modal-subtitle">
            {view === 'login' 
              ? 'Wingman requests credentials to unlock dashboard.' 
              : 'Enter your email to receive a secure reset link.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-error-box">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="text-success-box" style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {resetMessage}
          </div>
        )}

        {view === 'forgot_password' ? (
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="form-input-custom"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', display: 'block' }}>
              Send Reset Link
            </button>
            <button 
              type="button" 
              onClick={() => { setView('login'); setError(''); setResetMessage(''); }}
              style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
          
          {/* Username / Email */}
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div className="input-with-icon-wrapper">
              <span className="input-icon">
                <Mail size={16} />
              </span>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Username / Email"
                className="form-input-custom"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Login Method Toggle */}
          <div className="form-group" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Authenticate using:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="loginMethod" 
                  value="password" 
                  checked={loginMethod === 'password'} 
                  onChange={() => setLoginMethod('password')} 
                  style={{ accentColor: 'var(--accent-color)' }}
                />
                Password
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="loginMethod" 
                  value="dob" 
                  checked={loginMethod === 'dob'} 
                  onChange={() => setLoginMethod('dob')} 
                  style={{ accentColor: 'var(--accent-color)' }}
                />
                Date of Birth
              </label>
            </div>
          </div>

          {/* Password or DOB */}
          {loginMethod === 'password' ? (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-input-custom"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => { setView('forgot_password'); setError(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div className="input-with-icon-wrapper">
                <span className="input-icon">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="form-input-custom"
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon-wrapper">
              <span className="input-icon">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="form-input-custom"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              id="rememberMe" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
              Remember Me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', display: 'block' }}
          >
            Authenticate
          </button>
        </form>
        )}

        <div className="form-footer-hint">
          Wingman Client Security Protocol v1.0
        </div>
      </div>
    </div>
  );
}

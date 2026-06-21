'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#020617', // Match dark theme
      color: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: 'bold',
        margin: '0',
        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>404</h1>
      
      <h2 style={{ fontSize: '2rem', margin: '10px 0 20px 0' }}>Page Not Found</h2>
      <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '40px', lineHeight: '1.6' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link href="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#4f46e5',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
      }}>
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </div>
  );
}

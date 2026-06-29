'use client';

import React, { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  baseColor: string; // 'accent' or 'glow'
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const FluidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track cursor coordinates and dynamic speed multiplier
    let mouseX = -1000;
    let mouseY = -1000;
    let smoothMouseX = width / 2;
    let smoothMouseY = height / 2;
    let mouseActive = false;
    let speedMultiplier = 1.0;
    let currentMultiplier = 1.0;
    
    // Trail for cursor movement
    let trail: TrailPoint[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
      // Boost in speed multiplier up to 6.0 for strong visual feedback
      speedMultiplier = Math.min(6.0, speedMultiplier + 0.8);
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Track window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic color helper
    const getColorFromTheme = (variableName: string, fallback: string): string => {
      if (typeof window === 'undefined') return fallback;
      const val = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
      return val || fallback;
    };

    // 4 moving fluid blobs
    const blobs: Blob[] = [
      { x: width * 0.2, y: height * 0.3, radius: Math.min(width, height) * 0.25, vx: 0.8, vy: 0.6, baseColor: 'accent' },
      { x: width * 0.7, y: height * 0.2, radius: Math.min(width, height) * 0.3, vx: -0.6, vy: 0.8, baseColor: 'glow' },
      { x: width * 0.3, y: height * 0.8, radius: Math.min(width, height) * 0.28, vx: 0.5, vy: -0.7, baseColor: 'accent' },
      { x: width * 0.8, y: height * 0.7, radius: Math.min(width, height) * 0.22, vx: -0.7, vy: -0.5, baseColor: 'glow' },
    ];

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay speedMultiplier back to 1.0
      speedMultiplier = Math.max(1.0, speedMultiplier - 0.04);
      // Smoothly interpolate currentMultiplier
      currentMultiplier += (speedMultiplier - currentMultiplier) * 0.1;

      // Fetch active theme colors dynamically in each frame in case user changes theme
      const accentColor = getColorFromTheme('--accent-color', '#6366f1');

      // Convert hex accent color to rgba for smooth blending
      let primaryRGB = '99, 102, 241'; // Fallback for #6366f1
      if (accentColor.startsWith('#')) {
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          primaryRGB = `${r}, ${g}, ${b}`;
        }
      }

      // Draw each blob as a radial gradient
      blobs.forEach((blob) => {
        // Move blobs with speed multiplier
        blob.x += blob.vx * currentMultiplier;
        blob.y += blob.vy * currentMultiplier;

        // Bounce off bounds
        if (blob.x - blob.radius < -100) {
          blob.x = -100 + blob.radius;
          blob.vx *= -1;
        } else if (blob.x + blob.radius > width + 100) {
          blob.x = width + 100 - blob.radius;
          blob.vx *= -1;
        }

        if (blob.y - blob.radius < -100) {
          blob.y = -100 + blob.radius;
          blob.vy *= -1;
        } else if (blob.y + blob.radius > height + 100) {
          blob.y = height + 100 - blob.radius;
          blob.vy *= -1;
        }

        // Draw radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          blob.radius * 0.05,
          blob.x,
          blob.y,
          blob.radius
        );

        // Increased opacity for more visibility
        const colorStart = blob.baseColor === 'accent' 
          ? `rgba(${primaryRGB}, 0.65)` 
          : `rgba(${primaryRGB}, 0.45)`;
        const colorEnd = 'rgba(0, 0, 0, 0)';

        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Smooth cursor follow
      if (mouseActive && mouseX >= 0 && mouseY >= 0) {
        smoothMouseX += (mouseX - smoothMouseX) * 0.15;
        smoothMouseY += (mouseY - smoothMouseY) * 0.15;

        // Add to trail
        trail.push({ x: smoothMouseX, y: smoothMouseY, age: 0 });
      }

      // Draw and update trail
      const cursorRadius = Math.min(width, height) * 0.15;
      
      trail.forEach((point, index) => {
        point.age += 1;
        const opacity = Math.max(0, 0.4 - (point.age / 30)); // Fade out over 30 frames
        const size = cursorRadius * Math.max(0.1, 1 - (point.age / 40));
        
        if (opacity > 0) {
          const trailGradient = ctx.createRadialGradient(
            point.x, point.y, size * 0.05,
            point.x, point.y, size
          );
          trailGradient.addColorStop(0, `rgba(${primaryRGB}, ${opacity})`);
          trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = trailGradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Remove old trail points
      trail = trail.filter(point => point.age < 30);

      // Draw Main Interactive Cursor Glow Blob
      if (mouseActive && mouseX >= 0 && mouseY >= 0) {
        const mainGradient = ctx.createRadialGradient(
          smoothMouseX,
          smoothMouseY,
          cursorRadius * 0.05,
          smoothMouseX,
          smoothMouseY,
          cursorRadius * 1.5
        );
        // Very bright follower glow
        mainGradient.addColorStop(0, `rgba(${primaryRGB}, 0.8)`);
        mainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(smoothMouseX, smoothMouseY, cursorRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1.0, 
        filter: 'blur(25px)', // Sharpened for more visibility
        mixBlendMode: 'screen', // Additive blending
      }}
    />
  );
};

export default React.memo(FluidBackground);

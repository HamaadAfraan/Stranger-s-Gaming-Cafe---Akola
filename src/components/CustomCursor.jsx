import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dotRef = useRef(null);
  const squareRef = useRef(null);

  const pos = useRef({ x: -100, y: -100 });
  const targetPos = useRef({ x: -100, y: -100 });

  // Mobile / Touch device detection
  useEffect(() => {
    const checkTouch = () => {
      if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTouchDevice]);

  // Hardware-accelerated GPU 60FPS tracking
  useEffect(() => {
    if (isTouchDevice) return;

    let animId;

    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.5 : 1})`;
      }

      pos.current.x += (targetPos.current.x - pos.current.x) * 0.4;
      pos.current.y += (targetPos.current.y - pos.current.y) * 0.4;

      if (squareRef.current) {
        squareRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${
          isClicking ? 0.8 : isHovered ? 1.4 : 1
        }) rotate(${isHovered ? '45deg' : '0deg'})`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isHovered, isClicking, isTouchDevice]);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseOver = (e) => {
      const isInteractive = Boolean(
        e.target.closest('button, a, input, select, [role="button"], .group')
      );
      setIsHovered(isInteractive);
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, [isTouchDevice]);

  // Touch screen par cursor bilkul render nahi hoga
  if (isTouchDevice) return null;

  return (
    <>
      {/* Center Precision Dot (Z-Index 99999) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-red-500 rounded-full pointer-events-none z-[99999]"
        style={{ willChange: 'transform' }}
      />

      {/* Cyber Square Reticle (Z-Index 99999) */}
      <div
        ref={squareRef}
        className={`fixed top-0 left-0 pointer-events-none z-[99999] transition-all duration-150 ease-out border flex items-center justify-center ${
          isHovered
            ? 'w-10 h-10 border-cyan-400 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.6)]'
            : 'w-7 h-7 border-red-500/80 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      >
        <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500"></span>
        <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-500"></span>
        <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-500"></span>
        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500"></span>
      </div>
    </>
  );
};
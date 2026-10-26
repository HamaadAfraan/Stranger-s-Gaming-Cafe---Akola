import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-4 sm:py-6 border-t border-[#ccff00]/20 text-center text-xs text-gray-400 bg-[#0a0a0c] relative z-10 font-mono">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
        
        {/* Cafe Title & Branding */}
        <p className="font-black font-orbitron text-white text-sm sm:text-base md:text-lg tracking-wider uppercase">
          STRANGER'S <span className="text-[#ccff00] drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]">GAMING CAFE</span>
        </p>
        
        <p className="text-[10px] sm:text-[11px] text-zinc-500 tracking-wide">
          © 2026 ALL RIGHTS RESERVED. BILL MART MALL, AKOLA, MAHARASHTRA.
        </p>

      </div>
    </footer>
  );
};
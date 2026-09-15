import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-cyan-500/20 text-center text-xs text-gray-400 bg-[#050507] relative z-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 font-mono">
        
        {/* Cafe Title & Branding */}
        <div className="text-center md:text-left">
          <p className="font-black font-orbitron text-white text-base sm:text-lg tracking-wider uppercase">
            STRANGER'S <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">GAMING CAFE</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 tracking-wide">
            © 2026 ALL RIGHTS RESERVED. AKOLA, MAHARASHTRA.
          </p>
        </div>

        {/* Mobile Friendly Contact Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs w-full md:w-auto">
          
          {/* WhatsApp / Call */}
          <a 
            href="https://wa.me/919185203313" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all duration-200 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-[12px]">+91 9185203313</span>
          </a>

          {/* Email */}
          <a 
            href="mailto:collabwith.hamaad@gmail.com" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200 active:scale-95"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-[12px] truncate max-w-[220px] sm:max-w-none">
              collabwith.hamaad@gmail.com
            </span>
          </a>

        </div>

      </div>
    </footer>
  );
};
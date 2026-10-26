import React from 'react';
import { Sparkles, ShieldCheck, Flame } from 'lucide-react';

export const Hero = ({ onOpenBooking }) => {
  return (
    <section id="home" className="relative pt-24 sm:pt-36 md:pt-40 pb-10 sm:pb-20 px-3.5 sm:px-6 max-w-6xl mx-auto text-center flex flex-col items-center overflow-hidden font-sans">
      
      {/* Background Neon Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[280px] sm:w-[600px] h-[180px] sm:h-[350px] bg-[#ccff00]/10 rounded-full blur-[80px] sm:blur-[150px] pointer-events-none"></div>

      {/* Top Tagline Badge */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#101014] border border-[#ccff00]/40 text-[#ccff00] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[12px] font-black tracking-wider sm:tracking-widest mb-5 sm:mb-8 uppercase backdrop-blur-md font-mono shadow-[0_0_15px_rgba(204,255,0,0.15)]">
        <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00] animate-pulse shrink-0" /> EAT • SLEEP • GAME • REPEAT
      </div>

      {/* Responsive Title Header */}
      <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-7xl font-black mb-3.5 sm:mb-6 tracking-tight uppercase leading-snug sm:leading-none font-orbitron text-white break-words w-full">
        BEST GAMING CAFE In AKOLA<br />
        <span className="text-[#ccff00] drop-shadow-[0_0_25px_rgba(204,255,0,0.35)]">
          STRANGER'S GAMING
        </span>
      </h1>

      {/* Hero Subtitle with Local Keywords */}
      <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl sm:max-w-3xl mx-auto mb-6 sm:mb-10 font-medium leading-relaxed px-1 sm:px-2 font-mono">
        Play More. Rank Higher. Experience Akola's premier <span className="text-white font-bold">gaming cafe in Bill Mart Mall</span> featuring <span className="text-white font-bold">PS5 VIP gaming lounge</span>, <span className="text-white font-bold">200Hz PC esports arena</span>, <span className="text-white font-bold">pro racing simulator</span> & <span className="text-white font-bold">PS4 co-op zone</span>.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-14 relative z-10 w-full sm:w-auto px-1 sm:px-0 font-orbitron">
        <button 
          onClick={onOpenBooking}
          className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#b8e600] text-black font-black px-6 sm:px-9 py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-[#ccff00]/20 transition transform active:scale-95 sm:hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 shrink-0" /> BOOK YOUR STATION NOW
        </button>
        <a 
          href="#pricing"
          className="w-full sm:w-auto bg-[#101014] hover:bg-white/10 text-gray-200 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest border border-white/15 transition active:scale-95 flex items-center justify-center cursor-pointer"
        >
          VIEW PRICING LIST
        </a>
      </div>

      {/* Bottom Features Bar */}
      <div className="w-full max-w-xl sm:max-w-full bg-[#101014] border border-white/10 px-3.5 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg">
        <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 gap-y-2 text-gray-300 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase font-mono">
          <span className="flex items-center gap-1.5 text-[#ccff00] whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> FULL A/C
          </span>
          <span className="text-gray-700">•</span>
          <span className="flex items-center gap-1.5 text-[#ccff00] whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />HIGH SPEED WI-FI
          </span>
          <span className="text-gray-700">•</span>
          <span className="flex items-center gap-1.5 text-[#ccff00] whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> PARKING Available
          </span>
        </div>
      </div>

    </section>
  );
};
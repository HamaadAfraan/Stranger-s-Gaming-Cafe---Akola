import React from 'react';
import { Sparkles, ShieldCheck, Flame } from 'lucide-react';

export const Hero = ({ onOpenBooking }) => {
  return (
    <section id="home" className="relative pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center flex flex-col items-center overflow-hidden">
      {/* Background Neon Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] sm:h-[350px] bg-cyan-500/15 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>

      {/* Top Tagline Badge */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#121520] border border-cyan-500/30 text-cyan-400 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest mb-6 sm:mb-8 uppercase backdrop-blur-md">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 animate-pulse" /> EAT • SLEEP • GAME • REPEAT
      </div>

      {/* Responsive Title Header */}
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight uppercase leading-snug sm:leading-none font-orbitron text-white break-words w-full">
        STRANGER'S <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-red-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          GAMING CAFE AKOLA
        </span>
      </h1>

      {/* Hero Subtitle */}
      <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-10 font-medium leading-relaxed px-2">
        Play More. Rank Higher. Experience Akola's premier gaming lounge featuring <span className="text-white font-bold">PS5 VIP Lounge</span>, <span className="text-white font-bold">200Hz PC Esports Arena</span>, <span className="text-white font-bold">Pro Racing Simulator</span> & <span className="text-white font-bold">PS4 Co-Op Zone</span>.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-14 relative z-10 w-full sm:w-auto px-2 sm:px-0">
        <button 
          onClick={onOpenBooking}
          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-cyan-500 hover:from-red-500 hover:to-cyan-400 text-white font-black px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition transform active:scale-95 sm:hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> BOOK YOUR STATION NOW
        </button>
        <a 
          href="#pricing"
          className="w-full sm:w-auto bg-[#10121a] hover:bg-[#181b28] text-gray-300 font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs uppercase tracking-widest border border-white/10 transition active:scale-95 flex items-center justify-center cursor-pointer"
        >
          VIEW PRICING LIST
        </a>
      </div>

      {/* Bottom Features Bar */}
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-gray-400 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase bg-[#0d0f17] border border-white/10 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl max-w-full">
        <span className="flex items-center gap-1.5 sm:gap-2 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> FULL A/C
        </span>
        <span className="text-gray-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 sm:gap-2 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> PREMIUM LUXURY SEATING
        </span>
        <span className="text-gray-700 hidden sm:inline">•</span>
        <span className="flex items-center gap-1.5 sm:gap-2 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> HIGH SPEED WI-FI
        </span>
      </div>
    </section>
  );
};
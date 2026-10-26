import React from 'react';

export const Stats = () => {
  const stats = [
    { num: "1", label: "FLAGSHIP LOCATION" },
    { num: "200Hz", label: "COMPETITIVE PANELS" },
    { num: "4K 120Hz", label: "VIP CONSOLE LOUNGE" },
    { num: "G29", label: "PRO RACING SIMS" },
  ];

  return (
    <section className="py-8 sm:py-16 border-y border-white/10 bg-[#0a0a0c] relative overflow-hidden font-sans">
      {/* Background Subtle Ambient Neon Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00]/5 via-transparent to-[#ccff00]/5 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 text-center relative z-10">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#101014] border border-white/5 backdrop-blur-sm flex flex-col justify-center items-center group hover:border-[#ccff00]/60 hover:shadow-[0_0_20px_rgba(204,255,0,0.12)] transition-all duration-300"
          >
            <h3 className="text-2xl xs:text-3xl sm:text-5xl font-black font-orbitron bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent group-hover:text-[#ccff00] transition-all duration-300 tracking-tight whitespace-nowrap">
              {s.num}
            </h3>
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider sm:tracking-widest mt-1.5 sm:mt-2 font-orbitron leading-tight">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
import React from 'react';
import { Coffee, Wifi, Wind, Shield } from 'lucide-react';

export const Perks = () => {
  const perks = [
    { icon: Wind, title: "Full A/C Chill Lounge", desc: "Fully air-conditioned ambient setup for long comfortable gaming sessions." },
    { icon: Coffee, title: "Vending Snacks & Drinks", desc: "Automatic Cafe Desire hot tea, coffee & chilled beverages available." },
    { icon: Wifi, title: "Gigabit High-Speed Network", desc: "Zero lag, low-ping esports gaming connected over high-speed local network." },
    { icon: Shield, title: "CCTV Secured & Sanitized", desc: "Cleaned regularly with high security standards for all gamers." },
  ];

  return (
    <section className="py-10 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto bg-[#101014] rounded-2xl sm:rounded-3xl border border-white/10 my-6 sm:my-14 font-sans shadow-xl">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-12">
        <span className="text-[#ccff00] text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
          PREMIUM EXPERIENCE
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-wider uppercase font-orbitron text-white">
          LOUNGE <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">AMENITIES</span>
        </h2>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {perks.map((perk, idx) => {
          const Icon = perk.icon;
          return (
            <div 
              key={idx} 
              className="p-4 sm:p-6 bg-[#0a0a0c] rounded-xl sm:rounded-2xl border border-white/10 hover:border-[#ccff00]/60 text-center transition-all duration-300 group hover:shadow-[0_0_20px_rgba(204,255,0,0.12)] flex flex-col items-center justify-start"
            >
              <div className="p-2.5 sm:p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xl mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0 text-[#ccff00]">
                <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-bold text-white text-xs sm:text-base mb-1 font-orbitron leading-tight group-hover:text-[#ccff00] transition-colors">
                {perk.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-mono">
                {perk.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
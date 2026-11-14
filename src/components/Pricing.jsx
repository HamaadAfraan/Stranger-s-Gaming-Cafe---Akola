import React from 'react';

export const Pricing = ({ onOpenBooking }) => {
  return (
    <section id="pricing" className="py-12 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/10 font-sans relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-14 relative z-10">
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white">
          GAMING CAFE <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">PRICING LIST AKOLA</span>
        </h2>
        <p className="text-[#ccff00] text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-1.5 font-mono">
          BILL MART MALL • UPDATED & EFFECTIVE NOW
        </p>
      </div>

      {/* GTA 6 Launch Section - Clean Premium Dark Cyberpunk Style */}
      <div className="mb-6 sm:mb-10 bg-[#12131a] border border-[#ccff00]/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        
        {/* Subtle Diagonal Lines Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2029_1px,transparent_1px),linear-gradient(to_bottom,#1f2029_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <span className="bg-[#ccff00] text-black text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.4)] font-mono">
              <span>🚀</span> MOST AWAITED LAUNCH IN AKOLA
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase font-orbitron tracking-wide">
              GTA VI <span className="text-[#ccff00] font-sans text-sm sm:text-base font-normal normal-case block sm:inline mt-1 sm:mt-0">Experience Zone</span>
            </h3>
          </div>

          {/* Special Rates Revealed Badge */}
          <div className="bg-[#0a0a0c] border border-[#ccff00]/40 px-4 py-2 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block font-mono">SPECIAL RATES</span>
            <span className="text-[#ccff00] font-black text-xs sm:text-sm tracking-wider font-orbitron animate-pulse">
              ⚡ RATES REVEALED
            </span>
          </div>
        </div>

        {/* Teaser Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
          
          {/* PS5 VIP Zone (Ultimate Edition) */}
          <div className="bg-[#0a0a0c] border border-[#ccff00]/30 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="text-[#ccff00] font-black text-xs uppercase block tracking-wider font-mono">PS5 VIP LOUNGE AKOLA</span>
                <span className="text-white font-bold text-sm sm:text-base">55" 4K HDR TV • Ultimate Edition</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="bg-[#181922] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase">30 MIN</span>
                <span className="text-[#ccff00] font-black text-sm">₹150</span>
              </div>
              <div className="bg-[#181922] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase">1 HOUR</span>
                <span className="text-[#ccff00] font-black text-sm">₹250</span>
              </div>
              
              {/* 🔥 HIGHLIGHTED 3 HOUR PACK */}
              <div className="bg-[#ccff00]/15 p-2.5 rounded-xl border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] relative overflow-hidden transform hover:scale-105 transition-all">
                <span className="bg-[#ccff00] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider block font-orbitron mb-1 font-bold shadow-md">
                  🔥 BEST VALUE
                </span>
                <span className="text-white text-[9px] block font-bold uppercase">3 HOUR</span>
                <span className="text-[#ccff00] font-black text-base drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]">₹650</span>
              </div>
            </div>
          </div>

          {/* PS5 Standard Zone (Standard Edition) */}
          <div className="bg-[#0a0a0c] border border-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="text-[#ccff00] font-black text-xs uppercase block tracking-wider font-mono">PS5 STANDARD ZONE</span>
                <span className="text-white font-bold text-sm sm:text-base">43" 4K TV • Standard Edition</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="bg-[#181922] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase">30 MIN</span>
                <span className="text-[#ccff00] font-black text-sm">₹120</span>
              </div>
              <div className="bg-[#181922] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center">
                <span className="text-gray-400 text-[9px] block font-bold uppercase">1 HOUR</span>
                <span className="text-[#ccff00] font-black text-sm">₹200</span>
              </div>
              
              {/* 🔥 HIGHLIGHTED 3 HOUR PACK */}
              <div className="bg-[#ccff00]/15 p-2.5 rounded-xl border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] relative overflow-hidden transform hover:scale-105 transition-all">
                <span className="bg-[#ccff00] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider block font-orbitron mb-1 font-bold shadow-md">
                  🔥 POPULAR
                </span>
                <span className="text-white text-[9px] block font-bold uppercase">3 HOUR</span>
                <span className="text-[#ccff00] font-black text-base drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]">₹500</span>
              </div>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-5 font-medium italic font-mono relative z-10">
          ⚡ Early slot pre-bookings for GTA 6 Launch Week at STRANGERS GAMING CAFE AKOLA will open soon!
        </p>
      </div>

      {/* Main Top Grid: PS5 VIP & Standard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-10">
        
        {/* PS5 VIP Zone Card */}
        <div className="bg-[#12131a] border-2 border-[#ccff00]/60 p-4 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl shadow-[#ccff00]/5 flex flex-col justify-between hover:border-[#ccff00] transition-all">
          <div>
            <span className="bg-[#ccff00] text-black text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider mb-2.5 sm:mb-4 inline-block font-mono">
              VIP ZONE AKOLA
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between flex-wrap gap-1">
              <span>PLAYSTATION 5</span>
              <span className="text-[#ccff00] text-[10px] sm:text-sm font-sans normal-case bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/20 font-mono">55" TV</span>
            </h3>
            
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px] font-mono">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2 text-right sm:text-left">30 MIN</th>
                    <th className="py-2 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm font-mono">
                  <tr><td className="py-2">👤 1 Player</td><td className="text-[#ccff00] text-right sm:text-left">₹100</td><td className="text-[#ccff00] text-right">₹180</td></tr>
                  <tr><td className="py-2">👥 2 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹160</td><td className="text-[#ccff00] text-right">₹250</td></tr>
                  <tr><td className="py-2">👥 3 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹210</td><td className="text-[#ccff00] text-right">₹320</td></tr>
                  <tr><td className="py-2">👥 4 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹260</td><td className="text-[#ccff00] text-right">₹400</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PS5 Standard Zone Card */}
        <div className="bg-[#12131a] border-2 border-white/10 p-4 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl flex flex-col justify-between hover:border-[#ccff00]/50 transition-all">
          <div>
            <span className="bg-white/10 text-[#ccff00] text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider mb-2.5 sm:mb-4 inline-block font-mono border border-[#ccff00]/30">
              STANDARD ZONE
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between flex-wrap gap-1">
              <span>PLAYSTATION 5</span>
              <span className="text-gray-300 text-[10px] sm:text-sm font-sans normal-case bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">43" TV</span>
            </h3>

            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px] font-mono">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2 text-right sm:text-left">30 MIN</th>
                    <th className="py-2 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm font-mono">
                  <tr><td className="py-2">👤 1 Player</td><td className="text-[#ccff00] text-right sm:text-left">₹80</td><td className="text-[#ccff00] text-right">₹150</td></tr>
                  <tr><td className="py-2">👥 2 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹120</td><td className="text-[#ccff00] text-right">₹200</td></tr>
                  <tr><td className="py-2">👥 3 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹150</td><td className="text-[#ccff00] text-right">₹280</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: PC, Racing Sim, PS4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

        {/* PC Gaming Arena */}
        <div className="bg-[#12131a] border border-white/10 hover:border-[#ccff00]/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between transition-all">
          <div>
            <span className="text-[#ccff00] text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2 font-mono">
              200Hz ESPORTS ARENA AKOLA
            </span>
            <h4 className="text-base sm:text-xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4">
              HIGH-END PC GAMING
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-bold font-mono">
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>30 MINUTES</span><span className="text-[#ccff00]">₹70</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>1 HOUR</span><span className="text-[#ccff00]">₹120</span></div>
            </div>
          </div>
        </div>

        {/* Racing Simulator */}
        <div className="bg-[#12131a] border border-[#ccff00]/30 hover:border-[#ccff00] p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between transition-all">
          <div>
            <span className="text-[#ccff00] text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2 font-mono">
              PRO SIMULATOR AKOLA
            </span>
            <h3 className="text-base sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between">
              <span>SIMULATOR</span>
              <span className="text-[#ccff00] text-[10px] sm:text-xs font-sans bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/30 font-mono">Car / Truck</span>
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-bold font-mono">
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>10 MINUTES</span><span className="text-[#ccff00]">₹50</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>30 MINUTES</span><span className="text-[#ccff00]">₹150</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>1 HOUR</span><span className="text-[#ccff00]">₹250</span></div>
            </div>
          </div>
        </div>

        {/* PS4 Co-Op Zone */}
        <div className="bg-[#12131a] border border-white/10 hover:border-[#ccff00]/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between transition-all">
          <div>
            <span className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2 font-mono">
              120Hz CO-OP ZONE
            </span>
            <h4 className="text-base sm:text-xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4">
              PLAYSTATION 4
            </h4>
            
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px] font-mono">
                    <th className="py-1.5">PLAYERS</th>
                    <th className="py-1.5 text-right sm:text-left">30 MIN</th>
                    <th className="py-1.5 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm font-mono">
                  <tr><td className="py-1.5">👤 1 Player</td><td className="text-[#ccff00] text-right sm:text-left">₹50</td><td className="text-[#ccff00] text-right">₹100</td></tr>
                  <tr><td className="py-1.5">👥 2 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹100</td><td className="text-[#ccff00] text-right">₹160</td></tr>
                  <tr><td className="py-1.5">👥 3 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹140</td><td className="text-[#ccff00] text-right">₹240</td></tr>
                  <tr><td className="py-1.5">👥 4 Players</td><td className="text-[#ccff00] text-right sm:text-left">₹180</td><td className="text-[#ccff00] text-right">₹280</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="mt-8 sm:mt-12 text-center px-1">
        <button 
          onClick={onOpenBooking}
          className="w-full sm:w-auto bg-[#ccff00] hover:bg-[#b8e600] text-black font-black px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.3)] transition transform active:scale-95 sm:hover:scale-105 cursor-pointer font-orbitron"
        >
          RESERVE YOUR ARENA SLOT NOW →
        </button>
      </div>
    </section>
  );
};
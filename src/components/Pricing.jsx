import React from 'react';

export const Pricing = ({ onOpenBooking }) => {
  return (
    <section id="pricing" className="py-12 sm:py-24 px-3.5 sm:px-6 max-w-6xl mx-auto border-t border-white/10 font-sans">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-14">
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white">
          PRICING <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">LIST</span>
        </h2>
        <p className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-1.5">
          UPDATED & EFFECTIVE NOW
        </p>
      </div>

      {/* Main Top Grid: PS5 VIP & Standard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-10">
        
        {/* PS5 VIP Zone Card */}
        <div className="bg-[#0b0c10] border-2 border-red-500/60 p-4 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl shadow-red-500/10 flex flex-col justify-between">
          <div>
            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider mb-2.5 sm:mb-4 inline-block">
              VIP ZONE
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between flex-wrap gap-1">
              <span>PLAYSTATION 5</span>
              <span className="text-red-500 text-[10px] sm:text-sm font-sans normal-case bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">55" TV</span>
            </h3>
            
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px]">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2 text-right sm:text-left">30 MIN</th>
                    <th className="py-2 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm">
                  <tr><td className="py-2">👤 1 Player</td><td className="text-cyan-400 text-right sm:text-left">₹100</td><td className="text-cyan-400 text-right">₹180</td></tr>
                  <tr><td className="py-2">👥 2 Players</td><td className="text-cyan-400 text-right sm:text-left">₹160</td><td className="text-cyan-400 text-right">₹250</td></tr>
                  <tr><td className="py-2">👥 3 Players</td><td className="text-cyan-400 text-right sm:text-left">₹210</td><td className="text-cyan-400 text-right">₹320</td></tr>
                  <tr><td className="py-2">👥 4 Players</td><td className="text-cyan-400 text-right sm:text-left">₹260</td><td className="text-cyan-400 text-right">₹400</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PS5 Standard Zone Card */}
        <div className="bg-[#0b0c10] border-2 border-cyan-500/60 p-4 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl shadow-cyan-500/10 flex flex-col justify-between">
          <div>
            <span className="bg-cyan-500 text-black text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider mb-2.5 sm:mb-4 inline-block">
              STANDARD ZONE
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between flex-wrap gap-1">
              <span>PLAYSTATION 5</span>
              <span className="text-cyan-400 text-[10px] sm:text-sm font-sans normal-case bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">43" TV</span>
            </h3>

            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px]">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2 text-right sm:text-left">30 MIN</th>
                    <th className="py-2 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm">
                  <tr><td className="py-2">👤 1 Player</td><td className="text-cyan-400 text-right sm:text-left">₹80</td><td className="text-cyan-400 text-right">₹150</td></tr>
                  <tr><td className="py-2">👥 2 Players</td><td className="text-cyan-400 text-right sm:text-left">₹120</td><td className="text-cyan-400 text-right">₹200</td></tr>
                  <tr><td className="py-2">👥 3 Players</td><td className="text-cyan-400 text-right sm:text-left">₹150</td><td className="text-cyan-400 text-right">₹280</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: PC, Racing Sim, PS4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

        {/* PC Gaming Arena */}
        <div className="bg-[#0b0c10] border border-purple-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-purple-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2">
              200Hz ESPORTS ARENA
            </span>
            <h4 className="text-base sm:text-xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4">
              HIGH-END PC GAMING
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-bold">
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>30 MINUTES</span><span className="text-purple-400">₹70</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>1 HOUR</span><span className="text-purple-400">₹120</span></div>
            </div>
          </div>
        </div>

        {/* Racing Simulator */}
        <div className="bg-[#0b0c10] border border-red-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2">
              PRO EXPERIENCE
            </span>
            <h3 className="text-base sm:text-2xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4 flex items-center justify-between">
              <span>SIMULATOR</span>
              <span className="text-yellow-400 text-[10px] sm:text-xs font-sans bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Car / Truck</span>
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-bold">
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>10 MINUTES</span><span className="text-red-500">₹50</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>30 MINUTES</span><span className="text-red-500">₹150</span></div>
              <div className="flex justify-between border-b border-gray-800/60 py-2"><span>1 HOUR</span><span className="text-red-500">₹250</span></div>
            </div>
          </div>
        </div>

        {/* PS4 Co-Op Zone */}
        <div className="bg-[#0b0c10] border border-blue-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-1.5 sm:mb-2">
              120Hz CO-OP ZONE
            </span>
            <h4 className="text-base sm:text-xl font-black text-white uppercase font-orbitron mb-3 sm:mb-4">
              PLAYSTATION 4
            </h4>
            
            <div className="w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[9px] sm:text-[10px]">
                    <th className="py-1.5">PLAYERS</th>
                    <th className="py-1.5 text-right sm:text-left">30 MIN</th>
                    <th className="py-1.5 text-right">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold text-xs sm:text-sm">
                  <tr><td className="py-1.5">👤 1 Player</td><td className="text-blue-400 text-right sm:text-left">₹50</td><td className="text-blue-400 text-right">₹100</td></tr>
                  <tr><td className="py-1.5">👥 2 Players</td><td className="text-blue-400 text-right sm:text-left">₹100</td><td className="text-blue-400 text-right">₹160</td></tr>
                  <tr><td className="py-1.5">👥 3 Players</td><td className="text-blue-400 text-right sm:text-left">₹140</td><td className="text-blue-400 text-right">₹240</td></tr>
                  <tr><td className="py-1.5">👥 4 Players</td><td className="text-blue-400 text-right sm:text-left">₹180</td><td className="text-blue-400 text-right">₹280</td></tr>
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
          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-cyan-500 hover:from-red-500 hover:to-cyan-400 text-white font-black px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition transform active:scale-95 sm:hover:scale-105 cursor-pointer"
        >
          RESERVE YOUR ARENA SLOT NOW
        </button>
      </div>
    </section>
  );
};
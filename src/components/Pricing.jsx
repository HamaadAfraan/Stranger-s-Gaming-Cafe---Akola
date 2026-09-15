import React from 'react';

export const Pricing = ({ onOpenBooking }) => {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/10">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white">
          PRICING <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">LIST</span>
        </h2>
        <p className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-2">
          UPDATED & EFFECTIVE NOW
        </p>
      </div>

      {/* Main Top Grid: PS5 VIP & Standard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
        
        {/* PS5 VIP Zone Card */}
        <div className="bg-[#0b0c10] border-2 border-red-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl shadow-red-500/10 flex flex-col justify-between">
          <div>
            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 sm:mb-4 inline-block">
              VIP ZONE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-orbitron mb-4">
              PLAYSTATION 5 - <span className="text-red-500 text-[9px] sm:text-[14px]">55 inches Tv</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[260px]">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2">30 MIN</th>
                    <th className="py-2">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold">
                  <tr><td className="py-2.5">👤 1 Player</td><td className="text-cyan-400">₹100</td><td className="text-cyan-400">₹180</td></tr>
                  <tr><td className="py-2.5">👥 2 Players</td><td className="text-cyan-400">₹160</td><td className="text-cyan-400">₹250</td></tr>
                  <tr><td className="py-2.5">👥 3 Players</td><td className="text-cyan-400">₹210</td><td className="text-cyan-400">₹320</td></tr>
                  <tr><td className="py-2.5">👥 4 Players</td><td className="text-cyan-400">₹260</td><td className="text-cyan-400">₹400</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PS5 Standard Zone Card */}
        <div className="bg-[#0b0c10] border-2 border-cyan-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl relative shadow-xl shadow-cyan-500/10 flex flex-col justify-between">
          <div>
            <span className="bg-cyan-500 text-black text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 sm:mb-4 inline-block">
              STANDARD ZONE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-orbitron mb-4">
              PLAYSTATION 5 - <span className="text-cyan-400 text-[9px] sm:text-[14px]">43" INCH TV</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[260px]">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                    <th className="py-2">PLAYERS</th>
                    <th className="py-2">30 MIN</th>
                    <th className="py-2">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold">
                  <tr><td className="py-2.5">👤 1 Player</td><td className="text-cyan-400">₹80</td><td className="text-cyan-400">₹150</td></tr>
                  <tr><td className="py-2.5">👥 2 Players</td><td className="text-cyan-400">₹120</td><td className="text-cyan-400">₹200</td></tr>
                  <tr><td className="py-2.5">👥 3 Players</td><td className="text-cyan-400">₹150</td><td className="text-cyan-400">₹280</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: PC, Racing Sim, PS4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* PC Gaming Arena */}
        <div className="bg-[#0b0c10] border border-purple-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-purple-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-2">
              200Hz ESPORTS ARENA
            </span>
            <h4 className="text-lg sm:text-xl font-black text-white uppercase font-orbitron mb-4">
              HIGH-END PC GAMING
            </h4>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between border-b border-gray-800 py-2"><span>30 MINUTES</span><span className="text-purple-400">₹70</span></div>
              <div className="flex justify-between border-b border-gray-800 py-2"><span>1 HOUR</span><span className="text-purple-400">₹120</span></div>
            </div>
          </div>
        </div>

        {/* Racing Simulator */}
        <div className="bg-[#0b0c10] border border-red-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-2">
              PRO EXPERIENCE
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-orbitron mb-4">
              Simulator <span className="text-yellow-400 text-[9px] sm:text-[14px]">Car / Truck</span>
            </h3>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between border-b border-gray-800 py-2"><span>10 MINUTES</span><span className="text-red-500">₹50</span></div>
              <div className="flex justify-between border-b border-gray-800 py-2"><span>30 MINUTES</span><span className="text-red-500">₹150</span></div>
              <div className="flex justify-between border-b border-gray-800 py-2"><span>1 HOUR</span><span className="text-red-500">₹250</span></div>
            </div>
          </div>
        </div>

        {/* PS4 Co-Op Zone */}
        <div className="bg-[#0b0c10] border border-blue-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <span className="text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider block mb-2">
              120Hz CO-OP ZONE
            </span>
            <h4 className="text-lg sm:text-xl font-black text-white uppercase font-orbitron mb-4">
              PLAYSTATION 4
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[240px]">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                    <th className="py-1.5">PLAYERS</th>
                    <th className="py-1.5">30 MIN</th>
                    <th className="py-1.5">1 HOUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200 font-bold">
                  <tr><td className="py-1.5">👤 1 Player</td><td className="text-blue-400">₹50</td><td className="text-blue-400">₹100</td></tr>
                  <tr><td className="py-1.5">👥 2 Players</td><td className="text-blue-400">₹100</td><td className="text-blue-400">₹160</td></tr>
                  <tr><td className="py-1.5">👥 3 Players</td><td className="text-blue-400">₹140</td><td className="text-blue-400">₹240</td></tr>
                  <tr><td className="py-1.5">👥 4 Players</td><td className="text-blue-400">₹180</td><td className="text-blue-400">₹280</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="mt-10 sm:mt-12 text-center px-2">
        <button 
          onClick={onOpenBooking}
          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-cyan-500 hover:from-red-500 hover:to-cyan-400 text-white font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition transform active:scale-95 sm:hover:scale-105"
        >
          RESERVE YOUR ARENA SLOT NOW
        </button>
      </div>
    </section>
  );
};
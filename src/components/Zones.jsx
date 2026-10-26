import React from 'react';

export const Zones = () => {
  const zones = [
    {
      title: 'PS5 QLED VIP ZONE AKOLA',
      specs: '4K 120Hz QLED • DualSense • Soundbar Audio',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQstE1Rw6lGag0EeJ2bCRw6lkHoVhpPixvSOHXlYL7yHOW76TvhhktxXEA&s=10?auto=format&fit=crop&w=800&q=80',
      tag: 'PS5'
    },
    {
      title: 'PRO RACING SIMULATOR AKOLA',
      specs: 'Logitech G29 • Force Feedback • Manual Shifter',
      img: 'https://playarena.in/wp-content/uploads/2024/07/Car_sim1.jpg?auto=format&fit=crop&w=800&q=80',
      tag: 'RC WHEEL'
    },
    {
      title: 'PC ESPORTS ARENA BILL MART MALL',
      specs: 'Esports Rigs • 200Hz Panels • RGB Gaming Gear',
      img: 'https://maketecheasier.com/wp-content/uploads/2023/03/Prebuilt-vs-custom-gaming-pc-featured.jpg?auto=format&fit=crop&w=800&q=80',
      tag: 'PC RIGS'
    }
  ];

  return (
    <section id="zones" className="py-12 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20 border-t border-white/10 font-sans">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-14">
        <span className="text-[#ccff00] text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
          HARDWARE & STATIONS IN AKOLA
        </span>
        <h2 className="text-2xl sm:text-5xl font-black font-orbitron text-center tracking-wider text-white">
          ARENA <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">BATTLE ZONES</span>
        </h2>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        {zones.map((zone, idx) => (
          <div 
            key={idx} 
            className="group rounded-2xl overflow-hidden bg-[#101014] border border-white/10 hover:border-[#ccff00]/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(204,255,0,0.15)] flex flex-col justify-between"
          >
            <div>
              {/* Image Container */}
              <div className="h-44 sm:h-52 overflow-hidden relative">
                <img 
                  src={zone.img} 
                  alt={zone.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#ccff00] text-[10px] sm:text-xs font-mono font-bold border border-[#ccff00]/30">
                  {zone.tag}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold font-orbitron text-white group-hover:text-[#ccff00] transition-colors">
                  {zone.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 font-mono leading-relaxed">
                  {zone.specs}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
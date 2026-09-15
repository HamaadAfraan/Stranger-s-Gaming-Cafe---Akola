import React from 'react';

export const Zones = () => {
  const zones = [
    {
      title: 'PS5 QLED ZONE',
      specs: '4K 120Hz OLED • DualSense • Premium Audio',
      img: 'https://www.samsung.com/my/explore/entertainment/best-gaming-tv-for-ps5-pc-and-xbox-consoles-2022/?srsltid=AfmBOopjMqqlU52PkZBk125goyB83_z0ZKHiQPxFCMCbyhSHaPOho3dQ',
      tag: 'PS5'
    },
    {
      title: 'RACING SIMULATOR',
      specs: 'Logitech G29 • Force Feedback • Manual Shifter',
      img: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=800&q=80',
      tag: 'RC WHEEL'
    },
    {
      title: 'PRO RIGS BATTLEGROUND',
      specs: 'RTX 4070 • 32GB DDR5 • 240Hz Esports Displays',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      tag: 'PC RIGS'
    }
  ];

  return (
    <section id="zones" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20 border-t border-white/10">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="text-red-500 text-[11px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
          HARDWARE & STATIONS
        </span>
        <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-center tracking-wider text-white">
          ARENA <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">BATTLE ZONES</span>
        </h2>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {zones.map((zone, idx) => (
          <div 
            key={idx} 
            className="group rounded-2xl overflow-hidden bg-[#0b0c10] border border-white/10 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] flex flex-col justify-between"
          >
            <div>
              {/* Image Container */}
              <div className="h-44 sm:h-52 overflow-hidden relative">
                <img 
                  src={zone.img} 
                  alt={zone.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-cyan-400 text-[10px] sm:text-xs font-mono font-bold border border-cyan-400/30">
                  {zone.tag}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-5">
                <h3 className="text-base sm:text-lg font-bold font-orbitron text-white group-hover:text-cyan-400 transition-colors">
                  {zone.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-mono leading-relaxed">
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
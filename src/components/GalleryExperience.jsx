import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Wifi, Wind, Coffee, Volume2 } from 'lucide-react';

export const GalleryExperience = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos', 'amenities'

  const mediaItems = [
    {
      type: 'image',
      title: 'PS5 VIP Lounge (4K QLED Displays)',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
      badge: 'PS5 VIP BAY'
    },
    {
      type: 'image',
      title: 'Pro Esports PC Arena (200Hz)',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
      badge: 'HIGH-END RIGS'
    },
    {
      type: 'image',
      title: 'Pro Racing Simulators (PXN & Logitech)',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
      badge: 'SIMULATOR BAY'
    },
    {
      type: 'video',
      title: 'Stranger\'s Gaming Cafe Cinematic Walkthrough',
      category: 'videos',
      url: 'https://www.youtube.com/embed/4MjXpsCoNs0', 
      badge: 'CAFE TOUR'
    },
    {
      type: 'image',
      title: 'Cyberpunk Neon Heartbeat Vibe',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
      badge: 'AMBIENCE'
    },
    {
      type: 'image',
      title: 'Cafe Desire Instant Beverage Bar',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=1000&auto=format&fit=crop',
      badge: 'REFRESHMENTS'
    }
  ];

  const amenities = [
    { 
      icon: <Wind className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Dual Daikin 4-Star ACs', 
      desc: 'Powered by twin 1.5-ton Daikin air conditioners maintained at a crisp 24°C–25°C to handle Akola heat during marathon sessions.' 
    },
    { 
      icon: <Wifi className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Ultra-Low Ping Fiber Network', 
      desc: 'Dedicated high-speed broadband configured with ASTER multi-seat architecture for zero packet loss in competitive BGMI & Valorant.' 
    },
    { 
      icon: <Coffee className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Cafe Desire VM20 Vending Bar', 
      desc: 'Instant Cardamom tea and Nescafé coffee served fresh in half (65ml) & full (130ml) cups to keep your energy levels peaked.' 
    },
    { 
      icon: <ShieldCheck className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Ergonomic Gaming Stations', 
      desc: 'Equipped with premium 4-finger full-gyro iPhone setups, mechanical keyboards, and cushioned gaming armchairs.' 
    },
    { 
      icon: <Volume2 className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Spatial Surround Audio', 
      desc: 'High-fidelity gaming headsets and immersive acoustic setups for pinpoint footsteps and crystal-clear voice comms.' 
    },
    { 
      icon: <Sparkles className="w-6 h-6 text-[#ccff00]" />, 
      title: 'Custom Neon Heartbeat Wall', 
      desc: 'Handcrafted 5-meter neon light installation across an 8ft gaming wall delivering an unmatched esports aesthetic.' 
    }
  ];

  const filteredMedia = activeTab === 'amenities' 
    ? [] 
    : activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeTab);

  return (
    <section id="gallery" className="py-16 sm:py-24 px-3.5 sm:px-6 max-w-7xl mx-auto font-sans border-t border-white/15 bg-[#0a0a0c] text-white">
      
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block font-mono shadow-[0_0_12px_rgba(204,255,0,0.15)]">
          BILL MART MALL AKOLA • LIVE EXPERIENCE
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white mt-1">
          CAFE GALLERY & <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">AMENITIES</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-mono">
          Explore Akola's premier gaming destination. From power-packed PS5 lounges to lightning-fast esports PCs and simulation rigs.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 sm:mt-8">
          {[
            { id: 'all', label: '🌟 All Showcase' },
            { id: 'photos', label: '📸 Photos' },
            { id: 'videos', label: '🎥 Videos & Tours' },
            { id: 'amenities', label: '⚡ Facilities & AC' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer font-orbitron ${
                activeTab === tab.id
                  ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/25 scale-105 font-black'
                  : 'bg-[#101014] border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white font-mono'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities Grid View */}
      {activeTab === 'amenities' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn">
          {amenities.map((item, idx) => (
            <div key={idx} className="bg-[#101014] border border-white/10 hover:border-[#ccff00]/40 p-6 rounded-2xl sm:rounded-3xl transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(204,255,0,0.1)]">
                {item.icon}
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">{item.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Media Photos & Videos Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn">
          {filteredMedia.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#101014] border border-white/10 hover:border-[#ccff00]/40 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <span className="absolute top-3 left-3 z-10 bg-black/85 backdrop-blur-md border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono shadow-md">
                  {item.badge}
                </span>

                {item.type === 'video' ? (
                  <iframe
                    src={item.url}
                    title={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                )}
              </div>

              <div className="p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-black font-orbitron text-white group-hover:text-[#ccff00] transition">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  Engineered for hardcore gamers and casual squads at Stranger's Gaming Cafe, Bill Mart Mall.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
};
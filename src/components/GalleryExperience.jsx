import React, { useState } from 'react';
import { Sparkles, Play, Image as ImageIcon, ShieldCheck, Wifi, Wind, Coffee, Volume2 } from 'lucide-react';

export const GalleryExperience = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos', 'amenities'

  // Aap yahan apne cafe ki real images aur video links daal sakte hain
  const mediaItems = [
    {
      type: 'image',
      title: 'PS5 VIP Zone (55" 4K HDR)',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
      badge: 'VIP LOUNGE'
    },
    {
      type: 'image',
      title: 'Esports 200Hz PC Arena',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
      badge: 'PRO RIGS'
    },
    {
      type: 'image',
      title: 'Racing Simulator Cockpit',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
      badge: 'SIMULATOR'
    },
    {
      type: 'video',
      title: 'Stranger\'s Gaming Cafe Cinematic Walkthrough',
      category: 'videos',
      // Yahan aap apne cafe ka YouTube video embed link ya MP4 URL daal sakte hain
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
      badge: 'CAFE TOUR'
    },
    {
      type: 'image',
      title: 'Cafe Ambience & Neon Vibe',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
      badge: 'VIBE'
    },
    {
      type: 'image',
      title: 'Automatic Hot Beverage Bar',
      category: 'photos',
      url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=1000&auto=format&fit=crop',
      badge: 'CAFE DESIRE'
    }
  ];

  const amenities = [
    { icon: <Wind className="w-6 h-6 text-cyan-400" />, title: 'Fully Air-Conditioned', desc: 'Powerful climate control to keep you cool during intense multiplayer battles.' },
    { icon: <Wifi className="w-6 h-6 text-emerald-400" />, title: 'Ultra High-Speed Fiber', desc: 'Low ping, zero packet loss dedicated fiber network for competitive esports.' },
    { icon: <Coffee className="w-6 h-6 text-amber-400" />, title: 'Hot Beverage Vending', desc: 'Instant cardamom tea and NESCAFÉ coffee available 24/7 via Cafe Desire VM20.' },
    { icon: <ShieldCheck className="w-6 h-6 text-purple-400" />, title: 'Comfortable Gaming Chairs', desc: 'Ergonomic racing seats designed for long-hour marathon gaming sessions.' },
    { icon: <Volume2 className="w-6 h-6 text-red-500" />, title: 'Immersive Surround Audio', desc: 'High-end gaming headphones and surround sound setups for ultimate spatial awareness.' },
    { icon: <Sparkles className="w-6 h-6 text-yellow-400" />, title: 'Neon Ambient Lighting', desc: 'Futuristic cyberpunk interior aesthetics with custom heartbeat light curves.' }
  ];

  const filteredMedia = activeTab === 'amenities' 
    ? [] 
    : activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeTab);

  return (
    <section id="gallery-amenities" className="py-16 sm:py-24 px-3.5 sm:px-6 max-w-7xl mx-auto font-sans border-t border-white/10">
      
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
          EXPLORE THE ARENA
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white mt-1">
          CAFE GALLERY & <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">AMENITIES</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2">
          Step inside Akola’s ultimate gaming paradise. Check out our state-of-the-art setups, premium AC comfort, and world-class facilities.
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
                  ? 'bg-gradient-to-r from-red-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
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
            <div key={idx} className="bg-[#0b0c10] border border-white/10 hover:border-cyan-500/40 p-6 rounded-2xl sm:rounded-3xl transition-all shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-white mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Media Photos & Videos Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn">
          {filteredMedia.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#0b0c10] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-xl flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <span className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md border border-white/20 text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-orbitron">
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
                <h3 className="text-sm sm:text-base font-black font-orbitron text-white group-hover:text-cyan-400 transition">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Experience professional gaming gear and supreme hospitality at Stranger's Gaming Cafe.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
};
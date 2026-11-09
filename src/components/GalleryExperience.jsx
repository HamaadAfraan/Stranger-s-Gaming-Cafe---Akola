import React, { useState, useRef } from 'react';
import { Sparkles, ShieldCheck, Wifi, Wind, Coffee, Volume2 } from 'lucide-react';
import ps5VipImage from '../assets/library/ps5-vip.jpg';
import esportsImage from '../assets/library/pro-pc.jpg';
import pxnImage from '../assets/library/pxn-g29.jpg';
import teaCoffeeImage from '../assets/library/tea-coffe.jpg';

const isVideoUrl = (url) => {
  if (!url) return false;
  const str = String(url).toLowerCase();
  return str.includes('.mp4') || str.includes('.mov') || str.includes('cloudinary');
};

// Modal Video Player Component with GamesLibrary Loading Spinner
const ModalVideoPlayer = ({ mediaUrl, title }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-52 sm:h-72 w-full shrink-0 bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center z-10 space-y-2">
          <div className="w-8 h-8 border-3 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-[#ccff00] font-mono tracking-wider uppercase font-bold">
            Loading Video...
          </span>
        </div>
      )}
      {isVideoUrl(mediaUrl) ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsLoading(false)}
          onPlaying={() => setIsLoading(false)}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <img
          src={mediaUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// Individual Media Card Component with Loading Spinner
const MediaCard = ({ item, onOpenModal }) => {
  const videoRef = useRef(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const isVideo = item.type === 'video';

  return (
    <div
      onClick={() => isVideo && onOpenModal(item)}
      className={`bg-[#101014] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg flex flex-col justify-between transition-all duration-300 ${
        isVideo ? 'hover:border-[#ccff00]/50 cursor-pointer' : ''
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-900 flex items-center justify-center">
        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 bg-black/80 backdrop-blur-md text-[#ccff00] border border-[#ccff00]/30 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono shadow-md">
          {item.badge}
        </span>

        {isVideo ? (
          <>
            {isVideoLoading && (
              <div className="absolute inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center z-10 space-y-2">
                <div className="w-7 h-7 border-3 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[9px] text-[#ccff00] font-mono tracking-wider uppercase font-bold">
                  Loading Tour...
                </span>
              </div>
            )}
            <video
              ref={videoRef}
              src={item.url}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={() => setIsVideoLoading(false)}
              onPlaying={() => setIsVideoLoading(false)}
              className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none ${
                isVideoLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </>
        ) : (
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        )}
      </div>

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black font-orbitron text-white group-hover:text-[#ccff00] transition line-clamp-1">
            {item.title}
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono line-clamp-2">
            Engineered for hardcore gamers and casual squads at Stranger's Gaming Cafe, Bill Mart Mall.
          </p>
        </div>
      </div>
    </div>
  );
};

export const GalleryExperience = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos', 'amenities'
  const [activeModalItem, setActiveModalItem] = useState(null);

  const mediaItems = [
    {
      type: 'image',
      title: 'PS5 VIP Lounge (4K QLED Displays)',
      category: 'photos',
      url: ps5VipImage,
      badge: 'PS5 VIP BAY'
    },
    {
      type: 'image',
      title: 'Pro Esports PC Arena (200Hz)',
      category: 'photos',
      url: esportsImage,
      badge: 'HIGH-END RIGS'
    },
    {
      type: 'image',
      title: 'Pro Racing Simulators (PXN & Logitech)',
      category: 'photos',
      url: pxnImage,
      badge: 'SIMULATOR BAY'
    },
    {
      type: 'video',
      title: 'Stranger\'s Gaming Cafe Cinematic Walkthrough',
      category: 'videos',
      url: 'https://res.cloudinary.com/fxg5jmee/video/upload/v1794078661/Walking-cafe.mp4', 
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
      url: teaCoffeeImage,
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
            <MediaCard key={idx} item={item} onOpenModal={setActiveModalItem} />
          ))}
        </div>
      )}

      {/* Modal Popup Details */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
          <div className="bg-[#101014] border border-[#ccff00]/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.2)] max-h-[90vh] flex flex-col relative">
            
            {/* Round Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-11 h-11 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/30 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer z-50 shadow-2xl text-lg font-black"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="relative w-full">
              <ModalVideoPlayer mediaUrl={activeModalItem.url} title={activeModalItem.title} />
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto">
              <div>
                <span className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                  {activeModalItem.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white font-orbitron mt-2">
                  {activeModalItem.title}
                </h3>
              </div>

              <div className="bg-[#0a0a0c] p-3 rounded-xl border border-white/5">
                <h4 className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 mb-1">Highlight Info:</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-mono">
                  Engineered for hardcore gamers and casual squads at Stranger's Gaming Cafe, Bill Mart Mall, Akola. Experience ultra-low ping networking and 4K visuals.
                </p>
              </div>

              <button
                onClick={() => setActiveModalItem(null)}
                className="w-full py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-orbitron shadow-lg shadow-[#ccff00]/20"
              >
                Close Showcase
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
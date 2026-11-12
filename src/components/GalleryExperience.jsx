import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Wifi, Wind, Coffee, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import ps5VipImage from '../assets/library/ps5-vip.jpg';
import esportsImage from '../assets/library/pro-pc.jpg';
import pxnImage from '../assets/library/pxn-g29.jpg';
import teaCoffeeImage from '../assets/library/tea-coffe.jpg';

const isVideoUrl = (url) => {
  if (!url) return false;
  const str = String(url).toLowerCase();
  return str.includes('.mp4') || str.includes('.mov') || str.includes('cloudinary');
};

// Modal Video Player Component (Unmuted Audio)
const ModalVideoPlayer = ({ mediaUrl, title }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-64 sm:h-96 w-full shrink-0 bg-black flex items-center justify-center">
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
          controls
          playsInline
          preload="auto"
          onLoadedData={() => setIsLoading(false)}
          onPlaying={() => setIsLoading(false)}
          className="w-full h-full object-cover"
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

export const GalleryExperience = () => {
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Combined Master Showcase List (Photos, Videos & Amenities together)
  const showcaseItems = [
    {
      type: 'image',
      title: 'PS5 VIP Lounge (4K QLED Displays)',
      url: ps5VipImage,
      badge: 'PS5 VIP BAY',
      desc: 'Powered by twin 1.5-ton Daikin air conditioners maintained at a crisp 24°C–25°C to handle Akola heat.'
    },
    {
      type: 'image',
      title: 'Pro Esports PC Arena (200Hz)',
      url: esportsImage,
      badge: 'HIGH-END RIGS',
      desc: 'Dedicated high-speed broadband configured with ASTER multi-seat architecture for zero packet loss.'
    },
    {
      type: 'image',
      title: 'Pro Racing Simulators (PXN & Logitech)',
      url: pxnImage,
      badge: 'SIMULATOR BAY',
      desc: 'Clutch, accelerator & break setup with Logitech G29 force feedback and manual shifter.'
    },
    {
      type: 'video',
      title: 'Stranger\'s Gaming Cafe Cinematic Walkthrough',
      url: 'https://res.cloudinary.com/fxg5jmee/video/upload/v1794078661/Walking-cafe.mp4', 
      badge: 'CAFE TOUR',
      desc: 'Explore Akola\'s premier gaming destination with zero-lag competitive play setups.'
    },
    {
      type: 'image',
      title: 'Cyberpunk Neon Heartbeat Vibe',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
      badge: 'AMBIENCE',
      desc: 'Handcrafted 5-meter neon light installation across an 8ft gaming wall delivering an unmatched esports aesthetic.'
    },
    {
      type: 'image',
      title: 'Cafe Desire Instant Beverage Bar',
      url: teaCoffeeImage,
      badge: 'REFRESHMENTS',
      desc: 'Instant Cardamom tea and Nescafé coffee served fresh in half and full cups to keep your energy peaked.'
    }
  ];

  const length = showcaseItems.length;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  // Automatic Carousel Interval (Every 3.5 Seconds)
  useEffect(() => {
    if (isPaused || length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, length]);

  const getCardIndex = (offset) => {
    return (currentIndex + offset + length) % length;
  };

  return (
    <section id="gallery" className="py-16 sm:py-24 px-3.5 sm:px-6 max-w-7xl mx-auto font-sans border-t border-white/15 bg-[#0a0a0c] text-white overflow-hidden">

      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-3 inline-block font-mono shadow-[0_0_12px_rgba(204,255,0,0.15)]">
          BILL MART MALL AKOLA • LIVE EXPERIENCE
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white mt-1">
          CAFE GALLERY & <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">HIGHLIGHTS</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 font-mono">
          Explore Akola's premier gaming destination. From power-packed PS5 lounges to lightning-fast esports PCs and simulation rigs.
        </p>
      </div>

      {/* IMMERSIVE 3D COVERFLOW WITH FULL TOUCH/MOUSE DRAG SWIPE & SLIDE ANIMATION */}
      <div 
        className="relative max-w-6xl mx-auto py-8 px-2 flex flex-col items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >

        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 top-[42%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
          aria-label="Previous"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 top-[42%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
          aria-label="Next"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Large Stage with Drag & Swipe Enabled */}
        <div 
          className="relative w-full h-[480px] sm:h-[580px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ perspective: '1500px' }}
        >
          <motion.div 
            className="relative w-full h-full flex items-center justify-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={(_, info) => {
              const swipePower = info.offset.x * info.velocity.x;
              if (swipePower < -200 || info.offset.x < -40) {
                handleNext();
              } else if (swipePower > 200 || info.offset.x > 40) {
                handlePrev();
              }
            }}
          >
            {[-1, 0, 1].map((offset) => {
              const itemIndex = getCardIndex(offset);
              const item = showcaseItems[itemIndex];
              const isCenter = offset === 0;
              const isVideo = item.type === 'video';

              return (
                <motion.div
                  key={`${itemIndex}-${offset}`}
                  initial={{ opacity: 0, x: direction > 0 ? 120 : -120, scale: 0.85 }}
                  animate={{
                    x: offset * (window.innerWidth < 640 ? 280 : 440),
                    scale: isCenter ? 1 : 0.82,
                    rotateY: offset * -30,
                    opacity: isCenter ? 1 : 0.35,
                    zIndex: isCenter ? 30 : 10,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 24,
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      setDirection(offset > 0 ? 1 : -1);
                      setCurrentIndex(itemIndex);
                    } else if (isVideo) {
                      setActiveModalItem(item);
                    }
                  }}
                  className={`absolute w-[320px] sm:w-[500px] bg-[#101014] border rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl select-none ${
                    isCenter 
                      ? 'border-[#ccff00]/90 shadow-[0_0_65px_rgba(204,255,0,0.35)] cursor-pointer' 
                      : 'border-white/10 hover:opacity-60 cursor-pointer'
                  }`}
                >
                  {/* Increased Media Height */}
                  <div className="relative h-[280px] sm:h-[360px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                    <span className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 bg-black/85 backdrop-blur-md text-[#ccff00] border border-[#ccff00]/40 text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-xl uppercase tracking-wider font-mono shadow-lg">
                      {item.badge}
                    </span>

                    {isVideo ? (
                      <video
                        src={item.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                  </div>

                  <div className="p-5 sm:p-7 bg-[#101014]">
                    <h3 className="text-base sm:text-xl font-black font-orbitron text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {showcaseItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-10 bg-[#ccff00]' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Modal Popup Details */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans animate-fadeIn">
          <div className="bg-[#101014] border border-[#ccff00]/40 rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.2)] max-h-[90vh] flex flex-col relative">
            
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

            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
              <div>
                <span className="bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase">
                  {activeModalItem.badge}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white font-orbitron mt-2">
                  {activeModalItem.title}
                </h3>
              </div>

              <div className="bg-[#0a0a0c] p-3.5 rounded-xl border border-white/5">
                <h4 className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 mb-1">Highlight Info:</h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
                  {activeModalItem.desc} Engineered for hardcore gamers at Stranger's Gaming Cafe, Bill Mart Mall, Akola.
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
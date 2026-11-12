import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Zones = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const zones = [
    {
      title: 'PS5 VIP ZONE AKOLA',
      specs: '4K 120Hz QLED • DualSense • Dolby Audio',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQstE1Rw6lGag0EeJ2bCRw6lkHoVhpPixvSOHXlYL7yHOW76TvhhktxXEA&s=10?auto=format&fit=crop&w=800&q=80',
      tag: 'PS5'
    },
    {
      title: 'PRO RACING SIMULATOR IN AKOLA',
      specs: 'Clutch, Accelerator & Break • Logitech G29 • Force Feedback • Manual Shifter',
      img: 'https://playarena.in/wp-content/uploads/2024/07/Car_sim1.jpg?auto=format&fit=crop&w=800&q=80',
      tag: 'SIMULATOR'
    },
    {
      title: 'PC ESPORTS ARENA BILL MART MALL',
      specs: 'Esports Rigs • 200Hz Panels • RGB Gaming Gear',
      img: 'https://maketecheasier.com/wp-content/uploads/2023/03/Prebuilt-vs-custom-gaming-pc-featured.jpg?auto=format&fit=crop&w=800&q=80',
      tag: 'HIGH-END PC'
    }
  ];

  const length = zones.length;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  // Auto Play Carousel Loop
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
    <section id="zones" className="py-12 sm:py-24 px-3.5 sm:px-6 max-w-7xl mx-auto scroll-mt-20 border-t border-white/10 font-sans text-white overflow-hidden">
      
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-14">
        <span className="text-[#ccff00] text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
          HARDWARE & STATIONS
        </span>
        <h2 className="text-2xl sm:text-5xl font-black font-orbitron text-center tracking-wider text-white">
          ARENA <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">BATTLE ZONES</span>
        </h2>
      </div>

      {/* 3D ELASTIC COVERFLOW CAROUSEL STAGE */}
      <div 
        className="relative max-w-6xl mx-auto py-6 px-2 flex flex-col items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 top-[42%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
          aria-label="Previous Zone"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 top-[42%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
          aria-label="Next Zone"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* 3D Drag/Touch Swipe Area */}
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
              const zone = zones[itemIndex];
              const isCenter = offset === 0;

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
                    }
                  }}
                  className={`absolute w-[320px] sm:w-[500px] bg-[#101014] border rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl select-none ${
                    isCenter 
                      ? 'border-[#ccff00]/90 shadow-[0_0_65px_rgba(204,255,0,0.35)] cursor-pointer' 
                      : 'border-white/10 hover:opacity-60 cursor-pointer'
                  }`}
                >
                  {/* Large Image Container */}
                  <div className="relative h-[280px] sm:h-[360px] overflow-hidden bg-zinc-900">
                    <img
                      src={zone.img}
                      alt={zone.title}
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-transparent to-transparent" />
                    <span className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[#ccff00] text-[10px] sm:text-xs font-mono font-bold border border-[#ccff00]/40 shadow-lg">
                      {zone.tag}
                    </span>
                  </div>

                  {/* Info Box */}
                  <div className="p-5 sm:p-7 bg-[#101014] text-left">
                    <h3 className="text-base sm:text-xl font-black font-orbitron text-white line-clamp-1">
                      {zone.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono leading-relaxed line-clamp-2">
                      {zone.specs}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {zones.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-10 bg-[#ccff00]' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
              aria-label={`Go to zone ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
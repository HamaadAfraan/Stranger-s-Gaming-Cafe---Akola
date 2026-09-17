import React, { useState, useEffect } from 'react';
import { Crosshair, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'zones', 'pricing', 'games', 'location'];
      const scrollPosition = window.scrollY + 120; // Adjusted offset for mobile navbar

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setActiveTab(id);
    setIsMobileMenuOpen(false);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const navbarHeight = 70;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'zones', label: 'ZONES' },
    { id: 'pricing', label: 'PRICING' },
    { id: 'games', label: 'GAMES' },
    { id: 'location', label: 'LOCATION' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#08080a]/95 backdrop-blur-lg z-50 border-b border-white/10 px-3.5 sm:px-8 py-3 sm:py-4 flex justify-between items-center font-sans">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, 'home')}
          className="text-red-500 font-black text-base xs:text-lg sm:text-xl md:text-2xl tracking-tighter flex items-center gap-1.5 font-orbitron truncate"
        >
          <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> 
          <span className="truncate">STRANGER'S <span className="text-white hidden sm:inline"> GAMING CAFE</span></span>
        </a>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-widest text-gray-400 uppercase">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleNavClick(e, item.id)}
            className={`relative py-1 transition-colors ${
              activeTab === item.id ? 'text-white font-extrabold' : 'hover:text-white'
            }`}
          >
            {item.label}
            {activeTab === item.id && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 rounded-full transition-all duration-300"></span>
            )}
          </a>
        ))}
      </div>

      {/* Action Button & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button 
          onClick={onOpenBooking}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition transform active:scale-95 sm:hover:scale-105 cursor-pointer whitespace-nowrap"
        >
          BOOK A STATION
        </button>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white p-1.5 focus:outline-none rounded-lg bg-white/5 border border-white/10 active:bg-white/10"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 w-full bg-[#0b0c10]/98 backdrop-blur-xl border-b border-white/10 px-5 py-5 flex flex-col gap-2 font-orbitron shadow-2xl animate-in slide-in-from-top-2 z-50">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`text-xs font-bold tracking-widest py-3 px-3 rounded-lg flex items-center justify-between uppercase transition-all ${
                activeTab === item.id 
                  ? 'bg-red-600/15 text-red-400 border border-red-500/30 font-extrabold' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {activeTab === item.id && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};
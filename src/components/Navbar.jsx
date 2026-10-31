import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import profileImg from '../assets/profile.jpeg';
import bannerImg from '../assets/banner.png';

export const Navbar = ({ onOpenBooking, onOpenLogin, session, onOpenProfile, onGoHome }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(profileImg);
  const [userName, setUserName] = useState('');

  const currentUser = session?.user || auth.currentUser;

  // Safe Firebase Firestore fetch for avatar & user profile name
  useEffect(() => {
    let isMounted = true;

    const fetchLatestAvatarAndProfile = async () => {
      const userId = currentUser?.uid || currentUser?.id;

      const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Gamer';
      if (isMounted) setUserName(displayName);

      if (!userId) {
        if (isMounted) setCurrentAvatar(currentUser?.photoURL || profileImg);
        return;
      }

      try {
        const userRef = doc(db, 'profiles', userId);
        const userSnap = await getDoc(userRef);

        if (isMounted) {
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.avatar_url) setCurrentAvatar(data.avatar_url);
            if (data.name) setUserName(data.name);
            else if (data.full_name) setUserName(data.full_name);
          } else {
            setCurrentAvatar(currentUser?.photoURL || profileImg);
          }
        }
      } catch (err) {
        console.warn("Avatar/Profile fetch skipped/failed:", err.message);
        if (isMounted) {
          setCurrentAvatar(currentUser?.photoURL || profileImg);
        }
      }
    };

    fetchLatestAvatarAndProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Active section detection on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'zones', 'gallery', 'pricing', 'games', 'location'];
      const scrollPosition = window.scrollY + 120;

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

    // Agar onGoHome diya gaya hai, toh pehle home view par le aao
    if (onGoHome) {
      onGoHome();
    }

    // Thoda delay dekar element par scroll karo taaki home view render ho jaye
    setTimeout(() => {
      const targetElement = document.getElementById(id);
      if (targetElement) {
        const navbarHeight = 70;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'zones', label: 'ZONES' },
    { id: 'gallery', label: 'GALLERY' },
    { id: 'pricing', label: 'PRICING' },
    { id: 'games', label: 'GAMES' },
    { id: 'location', label: 'LOCATION' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0a0a0c]/95 backdrop-blur-lg z-50 border-b border-white/10 px-3 sm:px-8 py-2.5 sm:py-3.5 flex justify-between items-center font-sans">
      
      {/* Brand Logo - Responsive Banner Image */}
      <div className="flex items-center min-w-0 shrink">
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center group cursor-pointer"
        >
          <img 
            src={bannerImg} 
            alt="Stranger's Gaming Cafe" 
            className="h-7 xs:h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_10px_rgba(204,255,0,0.15)]"
          />
        </a>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-widest text-gray-400 uppercase font-mono">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleNavClick(e, item.id)}
            className={`relative py-1 transition-colors ${
              activeTab === item.id ? 'text-[#ccff00] font-extrabold' : 'hover:text-white'
            }`}
          >
            {item.label}
            {activeTab === item.id && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ccff00] rounded-full transition-all duration-300 shadow-[0_0_8px_#ccff00]"></span>
            )}
          </a>
        ))}
      </div>

      {/* Action Buttons & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {currentUser ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onOpenProfile}
              title="Gamer Profile & Bookings"
              className="p-0.5 bg-white/5 hover:bg-white/10 border border-[#ccff00]/40 rounded-full transition duration-200 cursor-pointer overflow-hidden active:scale-95"
            >
              <img 
                src={currentAvatar} 
                onError={() => setCurrentAvatar(profileImg)} 
                alt="Gamer Avatar" 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#ccff00]"
              />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-black px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs uppercase tracking-wider shadow-lg shadow-[#ccff00]/20 transition transform active:scale-95 sm:hover:scale-105 cursor-pointer whitespace-nowrap font-orbitron flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>LOG IN / SIGN UP</span>
          </button>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white p-1.5 focus:outline-none rounded-lg bg-white/5 border border-white/10 active:bg-white/10"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-[#ccff00]" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[57px] left-0 w-full bg-[#101014]/98 backdrop-blur-xl border-b border-white/10 px-5 py-5 flex flex-col gap-2 font-orbitron shadow-2xl z-50">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`text-xs font-bold tracking-widest py-3 px-3 rounded-lg flex items-center justify-between uppercase transition-all ${
                activeTab === item.id 
                  ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40 font-extrabold' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {activeTab === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"></span>}
            </a>
          ))}

          {currentUser ? (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="mt-3 py-3 px-3.5 rounded-xl flex items-center gap-3 bg-[#ccff00]/10 border border-[#ccff00]/40 text-left transition-all hover:bg-[#ccff00]/20 active:scale-[0.98]"
            >
              <img 
                src={currentAvatar} 
                onError={() => setCurrentAvatar(profileImg)} 
                alt="Profile Avatar" 
                className="w-9 h-9 rounded-full object-cover border-2 border-[#ccff00] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-gray-400 font-mono block uppercase leading-none mb-1">
                  GAMER PROFILE & BOOKINGS
                </span>
                <span className="text-xs font-black text-[#ccff00] truncate block uppercase font-orbitron tracking-wider">
                  WELCOME, {userName}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="mt-2 text-xs font-bold tracking-widest py-3 px-3 rounded-lg flex items-center gap-2 text-gray-300 hover:text-[#ccff00] bg-white/5 border border-white/10 uppercase transition-all"
            >
              <User className="w-4 h-4 text-[#ccff00]" />
              <span>LOG IN / SIGN UP</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

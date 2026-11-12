import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function: Resolves local asset image path (Vite / React support)
const getCoverImage = (filename) => {
  try {
    return new URL(`../assets/games/${filename}`, import.meta.url).href;
  } catch (e) {
    return "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop";
  }
};

const PLATFORMS = [
  { id: 'all', label: 'All Platforms' },
  { id: 'ps5-vip-55', label: 'PS5 - (55" TV)' },
  { id: 'ps5-reg-43', label: 'PS5 - (43" TV)' },
  { id: 'ps4', label: 'PS4' },
  { id: 'pc-arena', label: 'PC Arena' },
  { id: 'car-simulator', label: 'Car Simulator' },
  { id: 'truck-simulator', label: 'Truck Simulator' },
];

const GENRES = ['All', 'Action/Adventure', 'Fighting', 'Sports', 'Racing', 'FPS', 'Open World', 'Co-Op / Arcade', 'Simulation'];
const PLAYER_COUNTS = ['All', '1P', '2P', '3P-4P'];

// --- GAMES DATA WITH DIRECT CLOUDINARY .MOV LINKS ---
const GAMES_DATA = [
  {
    id: 1,
    name: "GTA 6",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Experience the open-world action and adventure of the next installment in the Grand Theft Auto series.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1793976885/gta-6.mov",
    coverImage: getCoverImage("gta-6.avif")
  },
  {
    id: 2,
    name: "GTA V",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Massive open-world action title filled with driving, shooting, bank heists, and vast exploration at Stranger's Gaming Cafe Akola.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419701/gta_v.mov",
    coverImage: getCoverImage("gta-v.jpg")
  },
  {
    id: 3,
    name: "Tekken 8",
    genre: "Fighting",
    players: "1-2P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Next-gen 3D fighting tournament with aggressive Heat System mechanics and legendary martial artists.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419702/tekken.mov",
    coverImage: getCoverImage("tekken.webp")
  },
  {
    id: 4,
    name: "Spider-Man 2",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Swing through Marvel's New York as Peter Parker & Miles Morales to fight formidable villains like Venom.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419715/spiderman.mov",
    coverImage: getCoverImage("spiderman.jpeg")
  },
  {
    id: 5,
    name: "God of War Ragnarök",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Epic Norse saga following Kratos and Atreus as they battle legendary gods and mythical monsters.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419639/god_of_war_ragnarok.mov",
    coverImage: getCoverImage("god-of-war.webp")
  },
  {
    id: 6,
    name: "Red Dead Redemption 2",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['ps4'],
    description: "Epic tale of outlaw Arthur Morgan and the Van der Linde gang across the dying American frontier.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419708/red_dead.mov",
    coverImage: getCoverImage("rdr2.jpeg")
  },
  {
    id: 7,
    name: "Valorant",
    genre: "FPS",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena'],
    description: "5v5 character-based tactical shooter combining precise gunplay with tactical character abilities.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419705/valorant.mov",
    coverImage: getCoverImage("valorant.jpg")
  },
  {
    id: 8,
    name: "PUBG: Battlegrounds",
    genre: "FPS",
    players: "1-4P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55'],
    description: "Intense battle royale shooter where 100 players fight for survival on sprawling tactical maps.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419696/pubg.mov",
    coverImage: getCoverImage("pubg.jpg")
  },
  {
    id: 9,
    name: "Forza Horizon 5",
    genre: "Racing",
    players: "1P",
    isPopular: false,
    platforms: ['car-simulator', 'truck-simulator'],
    description: "High-speed open-world racing game featuring breathtaking Mexican landscapes and ultimate supercar drives.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419644/forza.mov",
    coverImage: getCoverImage("forza.jpg")
  },
  {
    id: 10,
    name: "Gran Turismo 7",
    genre: "Simulation",
    players: "1-2P",
    isPopular: false,
    platforms: ['car-simulator'],
    description: "Ultra-realistic driving simulator delivering authentic motorsport racing across real-world circuits.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419699/gran_tourismo.mov",
    coverImage: getCoverImage("gran-tourismo.jpg")
  },
  {
    id: 11,
    name: "Euro Truck Simulator 2",
    genre: "Simulation",
    players: "1P",
    isPopular: false,
    platforms: ['truck-simulator'],
    description: "Drive heavy trucks across European highways, deliver cargo, and expand your freight company.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419698/Euro_Truck_Simulator.mov",
    coverImage: getCoverImage("ets2.jpg")
  },
  {
    id: 12,
    name: "EA Sports FC 26",
    genre: "Sports",
    players: "1-4P",
    isPopular: false,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Premier football simulation featuring world-class clubs and competitive local multiplayer matches.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419700/fc.mov",
    coverImage: getCoverImage("fc26.jpg")
  },
  {
    id: 13,
    name: "Cricket 24",
    genre: "Sports",
    players: "1-4P",
    isPopular: false,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Authentic professional cricket simulation featuring deep career modes, licensed teams, and stadium action.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419640/Cricket.mov",
    coverImage: getCoverImage("cricket24.jpg")
  },
  {
    id: 14,
    name: "WWE SmackDown! Here Comes the Pain",
    genre: "Co-Op / Arcade",
    players: "1-4P",
    isPopular: false,
    platforms: ['ps4'],
    description: "Nostalgic arcade wrestling classic featuring legendary WWE superstars and chaotic ring action.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419713/wwe_htwp.mov",
    coverImage: getCoverImage("wwe-pain.avif")
  },
  {
    id: 15,
    name: "WWE 2K26",
    genre: "Sports",
    players: "1-4P",
    isPopular: false,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Modern professional wrestling simulator built with realistic combat physics and stunning visuals.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419718/wwe_2k26.mov",
    coverImage: getCoverImage("wwe.jpg")
  },
  {
    id: 16,
    name: "Mortal Kombat 1",
    genre: "Fighting",
    players: "1-2P",
    isPopular: false,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Visceral 1v1 fighter featuring cinematic Fatalities, Kameo assistance, and a rebooted universe story.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419708/mortal_kombat.mov",
    coverImage: getCoverImage("mortal.avif")
  },
  {
    id: 17,
    name: "Call of Duty: Black Ops",
    genre: "FPS",
    players: "1-4P",
    isPopular: false,
    platforms: ['ps5-vip-55'],
    description: "Action-packed tactical shooter with thrilling stealth combat, military campaign, and zombie survival.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419717/Call_of_Duty.mov",
    coverImage: getCoverImage("call-of-duty.jpg")
  },
  {
    id: 18,
    name: "Call of Duty: Modern Warfare III",
    genre: "FPS",
    players: "1-2P",
    isPopular: false,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps4'],
    description: "Modern military shooter delivering high-speed gunfights, campaign missions, and multiplayer warfare.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419717/Call_of_Duty.mov",
    coverImage: getCoverImage("call_of_duty_mw3.webp")
  },
  {
    id: 19,
    name: "GTA: San Andreas",
    genre: "Open World",
    players: "1P",
    isPopular: false,
    platforms: ['pc-arena', 'ps4'],
    description: "Iconic crime saga where CJ navigates gang warfare, drive-bys, and story missions across San Andreas.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419704/gta_sa.mov",
    coverImage: getCoverImage("gta-sa.jpg")
  },
  {
    id: 20,
    name: "GTA: Vice City",
    genre: "Open World",
    players: "1P",
    isPopular: false,
    platforms: ['ps4'],
    description: "80s-themed crime adventure following Tommy Vercetti's rise through neon-lit Vice City.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419701/gta_vc.mov",
    coverImage: getCoverImage("gtavc.png")
  },
  {
    id: 22,
    name: "Far Cry 6",
    genre: "Open World",
    players: "1-2P",
    isPopular: false,
    platforms: ['pc-arena', 'ps5-vip-55'],
    description: "Join a guerrilla revolution to liberate a tropical paradise from a ruthless modern dictator.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419710/Far_Cry.mov",
    coverImage: getCoverImage("far cry 6.jpg")
  },
  {
    id: 23,
    name: "Assassin's Creed Valhalla",
    genre: "Open World",
    players: "1P",
    isPopular: false,
    platforms: ['pc-arena', 'ps5-vip-55'],
    description: "Become Eivor, a legendary Viking raider, and lead your clan to build a new home in Dark Age England.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419689/Assassins_Creed.mov",
    coverImage: getCoverImage("assasian.jpg")
  },
  {
    id: 24,
    name: "It Takes Two",
    genre: "Co-Op / Arcade",
    players: "2P",
    isPopular: false,
    platforms: ['ps5-reg-43', 'ps4'],
    description: "Pure cooperative platformer adventure designed strictly for two players to solve creative puzzles.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419703/it_takes_two.mov",
    coverImage: getCoverImage("it2.webp")
  },
  {
    id: 25,
    name: "A Way Out",
    genre: "Co-Op / Arcade",
    players: "2P",
    isPopular: false,
    platforms: ['ps5-reg-43'],
    description: "Split-screen story adventure centered around two inmates attempting a daring prison breakout.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419697/A_Way_Out.mov",
    coverImage: getCoverImage("a_way_out.jpg")
  },
  {
    id: 26,
    name: "God of War 2",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: false,
    platforms: ['ps4'],
    description: "Classic hack-and-slash adventure featuring Kratos' vengeance against the Greek Olympian gods.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419707/god_of_war_3_remastered.mov",
    coverImage: getCoverImage("god2.jpg")
  },
  {
    id: 27,
    name: "Ghost of Tsushima",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: false,
    platforms: ['ps5-vip-55'],
    description: "Forge a new path and wage an unconventional war for the freedom of Tsushima as samurai Jin Sakai.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419643/ghost.mov",
    coverImage: getCoverImage("ghost of tsushima.png")
  },
  {
    id: 28,
    name: "Uncharted: Legacy of Thieves Collection",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: false,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Seek fortune and leave your mark on the map in thrilling cinematic treasure-hunting adventures.",
    mediaUrl: "https://res.cloudinary.com/fxg5jmee/video/upload/v1792419710/unchartered.mov",
    coverImage: getCoverImage("uncharted.jpg")
  }
];

const isVideoUrl = (url) => {
  if (!url) return false;
  const str = String(url).toLowerCase();
  return str.includes('.mp4') || str.includes('.mov') || str.includes('cloudinary');
};

// Modal Video Player Component with Loading Spinner
const ModalVideoPlayer = ({ mediaUrl, gameName }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-video w-full shrink-0 bg-black flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2">
          <div className="w-8 h-8 border-3 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-[#ccff00] font-mono tracking-wider uppercase">Loading Trailer...</span>
        </div>
      )}
      {isVideoUrl(mediaUrl) ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onPlaying={() => setIsLoading(false)}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <img
          src={mediaUrl}
          alt={gameName}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export const GamesLibrary = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlayers, setSelectedPlayers] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalGame, setActiveModalGame] = useState(null);

  // Carousel States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const checkPlayerMatch = (gamePlayers, selectedFilter) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === '1P') return gamePlayers.includes('1P');
    if (selectedFilter === '2P') return gamePlayers.includes('2P') || gamePlayers.includes('1-2P') || gamePlayers.includes('1-4P');
    if (selectedFilter === '3P-4P') return gamePlayers.includes('4P') || gamePlayers.includes('3P') || gamePlayers.includes('1-4P');
    return true;
  };

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter((game) => {
      const matchPlatform = selectedPlatform === 'all' || game.platforms.includes(selectedPlatform);
      const matchGenre = selectedGenre === 'All' || game.genre === selectedGenre;
      const matchPlayers = checkPlayerMatch(game.players, selectedPlayers);
      const matchSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPlatform && matchGenre && matchPlayers && matchSearch;
    });
  }, [selectedPlatform, selectedGenre, selectedPlayers, searchQuery]);

  const length = filteredGames.length;

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedPlatform, selectedGenre, selectedPlayers, searchQuery]);

  // Automatic Carousel Interval (Every 3.5 Seconds)
  useEffect(() => {
    if (isPaused || length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, length]);

  const handleNext = () => {
    if (length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrev = () => {
    if (length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const getCardIndex = (offset) => {
    if (length === 0) return 0;
    return (currentIndex + offset + length) % length;
  };

  return (
    <section id="games" className="py-10 sm:py-20 px-3 sm:px-6 max-w-7xl mx-auto border-t border-white/10 bg-[#0a0a0c] text-white font-sans overflow-hidden">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <span className="text-[#ccff00] text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
          BILL MART MALL AKOLA • PRE-INSTALLED GAME LIBRARY
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-white font-orbitron">
          GAME <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">COLLECTION</span>
        </h2>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {PLATFORMS.map((plat) => (
          <button
            key={plat.id}
            onClick={() => setSelectedPlatform(plat.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer font-mono ${
              selectedPlatform === plat.id
                ? 'bg-[#ccff00] text-black border-[#ccff00] font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                : 'bg-[#101014] text-gray-400 border-white/10 hover:border-[#ccff00]/40 hover:text-white'
            }`}
          >
            {plat.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-[#101014] border border-white/10 p-3.5 sm:p-5 rounded-2xl mb-6 sm:mb-8 space-y-3.5 sm:space-y-4 shadow-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search game title (e.g. Tekken, GTA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ccff00] transition font-mono"
          />
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-3.5 sm:top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Genre Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          <span className="text-[10px] sm:text-xs text-gray-500 font-mono shrink-0 mr-1">Genre:</span>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition whitespace-nowrap shrink-0 sm:shrink cursor-pointer font-mono ${
                selectedGenre === genre
                  ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40 font-bold'
                  : 'bg-[#181920] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Player Count Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          <span className="text-[10px] sm:text-xs text-gray-500 font-mono shrink-0 mr-1">Players:</span>
          {PLAYER_COUNTS.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlayers(p)}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition whitespace-nowrap shrink-0 sm:shrink cursor-pointer font-mono ${
                selectedPlayers === p
                  ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40 font-bold'
                  : 'bg-[#181920] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] sm:text-xs text-gray-400 mb-3 sm:mb-4 font-mono text-center">
        Showing Game <span className="text-[#ccff00] font-bold">{length > 0 ? currentIndex + 1 : 0}</span> of <span className="text-white font-bold">{length}</span> matching games
      </div>

      {/* GAMES WIDESCREEN 16:9 3D ELASTIC COVERFLOW CAROUSEL */}
      {length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-mono text-xs sm:text-sm bg-[#101014] border border-white/10 rounded-3xl">
          No games found matching your filters.
        </div>
      ) : (
        <div 
          className="relative max-w-6xl mx-auto py-6 px-2 flex flex-col items-center justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-[40%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
            aria-label="Previous Game"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-[40%] -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/20 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer shadow-2xl"
            aria-label="Next Game"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {/* Widescreen 3D Stage with Touch/Mouse Drag & Swipe */}
          <div 
            className="relative w-full h-[400px] sm:h-[480px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
            style={{ perspective: '1600px' }}
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
                const game = filteredGames[itemIndex];
                if (!game) return null;

                const isCenter = offset === 0;

                return (
                  <motion.div
                    key={`${game.id}-${offset}`}
                    initial={{ opacity: 0, x: direction > 0 ? 120 : -120, scale: 0.85 }}
                    animate={{
                      x: offset * (window.innerWidth < 640 ? 290 : 470),
                      scale: isCenter ? 1 : 0.82,
                      rotateY: offset * -28,
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
                      } else {
                        setActiveModalGame(game);
                      }
                    }}
                    className={`absolute w-[320px] sm:w-[540px] bg-[#101014] border rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl select-none ${
                      isCenter 
                        ? 'border-[#ccff00]/90 shadow-[0_0_65px_rgba(204,255,0,0.35)] cursor-pointer' 
                        : 'border-white/10 hover:opacity-60 cursor-pointer'
                    }`}
                  >
                    {/* 16:9 Widescreen Image Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        loading="lazy"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-transparent to-transparent" />

                      {game.isPopular && (
                        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-600/90 text-white text-[10px] sm:text-xs font-bold uppercase px-3 py-1 rounded-xl shadow-lg z-20 font-mono">
                          Popular 🔥
                        </span>
                      )}

                      <span className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[#ccff00] text-[10px] sm:text-xs font-mono font-bold border border-[#ccff00]/40 shadow-lg">
                        {game.genre}
                      </span>
                    </div>

                    {/* Widescreen Game Info Box */}
                    <div className="p-4 sm:p-5 bg-[#101014] text-left flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-xl font-black font-orbitron text-white line-clamp-1">
                          {game.name}
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">👥 {game.players}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalGame(game);
                        }}
                        className="w-full py-2.5 bg-[#ccff00]/10 hover:bg-[#ccff00] text-[#ccff00] hover:text-black border border-[#ccff00]/40 font-bold text-xs sm:text-sm rounded-xl transition duration-200 cursor-pointer font-orbitron uppercase tracking-wider mt-1"
                      >
                        View Details & Consoles
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2.5 mt-4 flex-wrap max-w-xl">
            {filteredGames.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-10 bg-[#ccff00]' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to game ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal Details */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-[#101014] border border-[#ccff00]/40 rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.2)] max-h-[90vh] flex flex-col relative">
            
            <button
              onClick={() => setActiveModalGame(null)}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-11 h-11 flex items-center justify-center bg-black/90 backdrop-blur-md text-white border-2 border-white/30 rounded-full hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all cursor-pointer z-50 shadow-2xl text-lg font-black"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="relative w-full">
              <ModalVideoPlayer mediaUrl={activeModalGame.mediaUrl} gameName={activeModalGame.name} />
            </div>

            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white font-orbitron">{activeModalGame.name}</h3>
                <div className="flex items-center gap-2.5 mt-1.5 text-[11px] sm:text-xs text-gray-400 font-mono">
                  <span className="bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] px-2 py-0.5 rounded font-bold">
                    {activeModalGame.genre}
                  </span>
                  <span>👥 {activeModalGame.players}</span>
                </div>
              </div>

              {/* Game Description */}
              <div className="bg-[#0a0a0c] p-3.5 rounded-xl border border-white/5">
                <h4 className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 mb-1">About Game:</h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-mono">
                  {activeModalGame.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] sm:text-xs font-mono uppercase text-gray-400 mb-2">Available On Consoles:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {activeModalGame.platforms.map((platId) => {
                    const platName = PLATFORMS.find((p) => p.id === platId)?.label;
                    return (
                      <span
                        key={platId}
                        className="bg-[#181a22] border border-white/10 text-white text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono"
                      >
                        📺 {platName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setActiveModalGame(null)}
                className="w-full py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer font-orbitron shadow-lg shadow-[#ccff00]/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
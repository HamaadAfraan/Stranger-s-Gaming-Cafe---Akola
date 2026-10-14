import React, { useState, useMemo } from 'react';
import mortalTrailer from '../assets/trailer/mortal_kombat.gif';

// Helper function: Resolves local asset image path (Vite / React support)
const getCoverImage = (filename) => {
  try {
    return new URL(`../assets/games/${filename}`, import.meta.url).href;
  } catch (e) {
    // Fallback placeholder image if local asset is missing
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

const GAMES_DATA = [
  // --- RACING & SIMULATION ---
  {
    id: 1,
    name: "Forza Horizon 5",
    genre: "Racing",
    players: "1P",
    isPopular: true,
    platforms: ['car-simulator', 'pc-arena', 'ps5-vip-55'],
    description: "High-speed open-world racing game featuring breathtaking Mexican landscapes and ultimate supercar drives.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("forza.jpg")
  },
  {
    id: 2,
    name: "Gran Turismo 7",
    genre: "Simulation",
    players: "1-2P",
    isPopular: true,
    platforms: ['car-simulator', 'ps5-vip-55', 'ps5-reg-43'],
    description: "Ultra-realistic driving simulator delivering authentic motorsport racing across real-world circuits.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("gran-tourismo.jpg")
  },
  {
    id: 32,
    name: "Euro Truck Simulator 2",
    genre: "Simulation",
    players: "1P",
    isPopular: true,
    platforms: ['truck-simulator', 'pc-arena'],
    description: "Drive heavy trucks across European highways, deliver cargo, and expand your freight company.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("ets2.jpg")
  },
  {
    id: 3,
    name: "Bus Simulator 21: Next Stop",
    genre: "Simulation",
    players: "1P",
    isPopular: false,
    platforms: ['car-simulator', 'pc-arena', 'ps5-vip-55', 'ps5-reg-43'],
    description: "Operate city buses, manage timetable routes, and follow realistic city traffic regulations.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("bus.jpg")
  },
  {
    id: 4,
    name: "SnowRunner",
    genre: "Simulation",
    players: "1P",
    isPopular: false,
    platforms: ['truck-simulator', 'pc-arena'],
    description: "Conquer hazardous terrain with heavy off-road vehicles through deep mud, snow, and steep inclines.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("snow.jpg")
  },
  {
    id: 21,
    name: "Asphalt Legends Unite",
    genre: "Racing",
    players: "1-4P",
    isPopular: true,
    platforms: ['car-simulator', 'ps5-vip-55', 'ps5-reg-43', 'ps4', 'pc-arena'],
    description: "High-octane arcade racing featuring wild stunts, nitro boosts, and local split-screen multiplayer action.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("asphalt.jpg")
  },

  // --- SPORTS & WRESTLING ---
  {
    id: 5,
    name: "EA Sports FC 26",
    genre: "Sports",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Premier football simulation featuring world-class clubs and competitive local multiplayer matches.",
    mediaUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("fc26.jpg")
  },
  {
    id: 6,
    name: "WWE SmackDown! Here Comes the Pain",
    genre: "Co-Op / Arcade",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps4'],
    description: "Nostalgic arcade wrestling classic featuring legendary WWE superstars and chaotic ring action.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("wwe-pain.avif")
  },
  {
    id: 7,
    name: "WWE 2K26",
    genre: "Sports",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Modern professional wrestling simulator built with realistic combat physics and stunning visuals.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("wwe.jpg")
  },

  // --- FIGHTING GAMES ---
  {
    id: 28,
    name: "Urban Reign",
    genre: "Fighting",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps4', 'ps5-vip-55', 'ps5-reg-43'],
    description: "Fast-paced street brawl game featuring multi-fighter team battles and devastating combo moves.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("urban.jpg")
  },
  {
    id: 9,
    name: "Tekken 8",
    genre: "Fighting",
    players: "1-2P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Next-gen 3D fighting tournament with aggressive Heat System mechanics and legendary martial artists.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("tekken.webp")
  },
  {
    id: 10,
    name: "Mortal Kombat 1",
    genre: "Fighting",
    players: "1-2P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Visceral 1v1 fighter featuring cinematic Fatalities, Kameo assistance, and a rebooted universe story.",
    mediaUrl: mortalTrailer,
    coverImage: getCoverImage("mortal.avif")
  },

  // --- ESPORTS & FPS ---
  {
    id: 12,
    name: "Valorant",
    genre: "FPS",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena'],
    description: "5v5 character-based tactical shooter combining precise gunplay with tactical character abilities.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("valorant.jpg")
  },
  {
    id: 14,
    name: "Call of Duty: Black Ops",
    genre: "FPS",
    players: "1-4P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43'],
    description: "Action-packed tactical shooter with thrilling stealth combat, military campaign, and zombie survival.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("call-of-duty.jpg")
  },
  {
    id: 29,
    name: "Call of Duty: Modern Warfare III",
    genre: "FPS",
    players: "1-2P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Modern military shooter delivering high-speed gunfights, campaign missions, and multiplayer warfare.",
    mediaUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("call_of_duty_mw3.webp")
  },

  // --- OPEN WORLD & GTA TITLES ---
  {
    id: 15,
    name: "GTA V",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Massive open-world action title filled with driving, shooting, bank heists, and vast exploration.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("gta-v.jpg")
  },
  {
    id: 30,
    name: "GTA: San Andreas",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Iconic crime saga where CJ navigates gang warfare, drive-bys, and story missions across San Andreas.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("gta-sa.jpg")
  },
  {
    id: 31,
    name: "GTA: Vice City",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "80s-themed crime adventure following Tommy Vercetti's rise through neon-lit Vice City.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("gtavc.png")
  },

  // --- CO-OP, PARTY & ARCADE ---
  {
    id: 24,
    name: "Rocket League",
    genre: "Co-Op / Arcade",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4', 'pc-arena'],
    description: "High-octane hybrid of arcade-style soccer and rocket-powered vehicular mayhem.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("rocket.jpg")
  },
  {
    id: 16,
    name: "It Takes Two",
    genre: "Co-Op / Arcade",
    players: "2P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'pc-arena'],
    description: "Pure cooperative platformer adventure designed strictly for two players to solve creative puzzles.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("it2.webp")
  },
  {
    id: 19,
    name: "A Way Out",
    genre: "Co-Op / Arcade",
    players: "2P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Split-screen story adventure centered around two inmates attempting a daring prison breakout.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("a_way_out.jpg")
  },
  {
    id: 25,
    name: "Overcooked! All You Can Eat",
    genre: "Co-Op / Arcade",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4', 'pc-arena'],
    description: "Chaotic party cooking action where players team up to prepare meals in absurd, moving kitchens.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("overcook.webp")
  },
  {
    id: 26,
    name: "Sackboy: A Big Adventure",
    genre: "Co-Op / Arcade",
    players: "1-4P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Charming 3D platforming adventure filled with fun obstacle courses and multiplayer co-op.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("sack.jpg")
  },

  // --- STORY & ACTION / ADVENTURE ---
  {
    id: 17,
    name: "God of War Ragnarök",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Epic Norse saga following Kratos and Atreus as they battle legendary gods and mythical monsters.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("god-of-war.webp")
  },
  {
    id: 76,
    name: "God of War 2",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps4'],
    description: "Classic hack-and-slash adventure featuring Kratos' vengeance against the Greek Olympian gods.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("god2.jpg")
  },
  {
    id: 18,
    name: "Spider-Man 2",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Swing through Marvel's New York as Peter Parker & Miles Morales to fight formidable villains like Venom.",
    mediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
    coverImage: getCoverImage("spiderman.jpeg")
  }
];

export const GamesLibrary = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlayers, setSelectedPlayers] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalGame, setActiveModalGame] = useState(null);

  // Accurate Player Filter Logic
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

  return (
    <section id="games" className="py-10 sm:py-20 px-3 sm:px-6 max-w-7xl mx-auto border-t border-white/10 bg-[#070709] text-white font-sans">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <span className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
          Pre-Installed Gaming Arena Titles
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-white">
          GAME <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">LIBRARY</span>
        </h2>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {PLATFORMS.map((plat) => (
          <button
            key={plat.id}
            onClick={() => setSelectedPlatform(plat.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${
              selectedPlatform === plat.id
                ? 'bg-cyan-400 text-black border-cyan-400 font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'bg-[#121318] text-gray-400 border-white/10 hover:border-cyan-400/40 hover:text-white'
            }`}
          >
            {plat.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-[#0e0f14] border border-white/10 p-3 sm:p-4 rounded-2xl mb-6 sm:mb-8 space-y-3 sm:space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search game title (e.g. Tekken, GTA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16171f] border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          {/* Fixed SVG Path Command Error */}
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
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
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
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition whitespace-nowrap shrink-0 sm:shrink cursor-pointer ${
                selectedPlayers === p
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                  : 'bg-[#181920] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] sm:text-xs text-gray-400 mb-3 sm:mb-4 font-mono">
        Showing <span className="text-cyan-400 font-bold">{filteredGames.length}</span> games
      </div>

      {/* Game Cards Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-mono text-xs sm:text-sm">
          No games found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-[#0d0e12] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/50 transition duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black/50">
                <img
                  src={game.coverImage}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:hidden transition-opacity duration-300"
                />
                <img
                  src={game.mediaUrl}
                  alt={`${game.name} Preview`}
                  className="w-full h-full object-cover hidden group-hover:block transition-opacity duration-300"
                />

                {game.isPopular && (
                  <span className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">
                    Popular 🔥
                  </span>
                )}

                <span className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-cyan-400 border border-cyan-400/30 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded">
                  {game.genre}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <div className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span>👥 {game.players}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalGame(game)}
                  className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-400/30 font-semibold text-xs rounded-xl transition duration-200 mt-1 cursor-pointer"
                >
                  View Details & Consoles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Details */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f1015] border border-cyan-400/40 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)] max-h-[90vh] flex flex-col">
            <div className="relative h-44 sm:h-56 w-full shrink-0">
              <img
                src={activeModalGame.mediaUrl}
                alt={activeModalGame.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalGame(null)}
                className="absolute top-2.5 right-2.5 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{activeModalGame.name}</h3>
                <div className="flex items-center gap-2.5 mt-1.5 text-[11px] sm:text-xs text-gray-400">
                  <span className="bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded">
                    {activeModalGame.genre}
                  </span>
                  <span>👥 {activeModalGame.players}</span>
                </div>
              </div>

              {/* Game Description */}
              <div className="bg-[#14151c] p-3 rounded-xl border border-white/5">
                <h4 className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 mb-1">About Game:</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activeModalGame.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] sm:text-xs font-mono uppercase text-gray-500 mb-2">Available On Consoles:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {activeModalGame.platforms.map((platId) => {
                    const platName = PLATFORMS.find((p) => p.id === platId)?.label;
                    return (
                      <span
                        key={platId}
                        className="bg-[#181a22] border border-white/10 text-white text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg"
                      >
                        📺 {platName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setActiveModalGame(null)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer"
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
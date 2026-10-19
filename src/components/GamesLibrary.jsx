import React, { useState, useMemo, useRef } from 'react';

// ==========================================
// ALL TRAILER VIDEO / GIF IMPORTS
// ==========================================
import forzaTrailer from '../assets/trailer/forza.mp4';
import gt7Trailer from '../assets/trailer/gran tourismo.mp4';
import ets2Trailer from '../assets/trailer/Euro Truck Simulator.mp4';

import fc26Trailer from '../assets/trailer/fc.mp4';
import wwePainTrailer from '../assets/trailer/wwe htwp.mp4';
import wwe2k26Trailer from '../assets/trailer/wwe 2k26.mp4';
import cricketTrailer from '../assets/trailer/Cricket.mp4';

import tekken from '../assets/trailer/tekken.mp4';
import mortalTrailer from '../assets/trailer/mortal kombat.mp4'; 

import valorantTrailer from '../assets/trailer/valorant.mp4';
import pubgTrailer from '../assets/trailer/pubg.mp4';
import codBoTrailer from '../assets/trailer/Call_of_Duty.mp4';
import codMw3Trailer from '../assets/trailer/Call_of_Duty.mp4';

import gta5Trailer from '../assets/trailer/gta v.mp4';
import gta6Trailer from '../assets/trailer/gta v.mp4';
import gtaSaTrailer from '../assets/trailer/gta sa.mp4';
import gtaVcTrailer from '../assets/trailer/gta vc.mp4';
import rdr2Trailer from '../assets/trailer/red dead.mp4';
import farCry6Trailer from '../assets/trailer/Far_Cry.mp4';
import assassinTrailer from '../assets/trailer/Assassins_Creed.mp4';

import it2Trailer from '../assets/trailer/it takes two.mp4';
import aWayOutTrailer from '../assets/trailer/A_Way_Out.mp4';

import gowRagTrailer from '../assets/trailer/god of war ragnarok.mp4';
import gow2Trailer from '../assets/trailer/god of war 3 remastered.mp4';
import spiderman2Trailer from '../assets/trailer/spiderman.mp4';
import ghostTrailer from '../assets/trailer/ghost.mp4';
import unchartedTrailer from '../assets/trailer/unchartered.mp4';

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

// --- SORTED WITH TRENDING / POPULAR GAMES FIRST ---
const GAMES_DATA = [
  /*
  {
    id: 2,
    name: "GTA 6",
    genre: "Action/Adventure",
    players: "1P",
    isPopular: true,
    platforms: ['ps5-vip-55', 'ps5-reg-43'],
    description: "Experience the open-world action and adventure of the next installment in the Grand Theft Auto series.",
    mediaUrl: gta6Trailer,
    coverImage: getCoverImage("gta-6.avif")
  },
  */
  {
    id: 2,
    name: "GTA V",
    genre: "Open World",
    players: "1P",
    isPopular: true,
    platforms: ['pc-arena', 'ps5-vip-55', 'ps5-reg-43', 'ps4'],
    description: "Massive open-world action title filled with driving, shooting, bank heists, and vast exploration at Stranger's Gaming Cafe Akola.",
    mediaUrl: gta5Trailer,
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
    mediaUrl: tekken,
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
    mediaUrl: spiderman2Trailer,
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
    mediaUrl: gowRagTrailer,
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
    mediaUrl: rdr2Trailer,
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
    mediaUrl: valorantTrailer,
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
    mediaUrl: pubgTrailer,
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
    mediaUrl: forzaTrailer,
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
    mediaUrl: gt7Trailer,
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
    mediaUrl: ets2Trailer,
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
    mediaUrl: fc26Trailer,
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
    mediaUrl: cricketTrailer,
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
    mediaUrl: wwePainTrailer,
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
    mediaUrl: wwe2k26Trailer,
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
    mediaUrl: mortalTrailer,
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
    mediaUrl: codBoTrailer,
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
    mediaUrl: codMw3Trailer,
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
    mediaUrl: gtaSaTrailer,
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
    mediaUrl: gtaVcTrailer,
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
    mediaUrl: farCry6Trailer,
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
    mediaUrl: assassinTrailer,
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
    mediaUrl: it2Trailer,
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
    mediaUrl: aWayOutTrailer,
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
    mediaUrl: gow2Trailer,
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
    mediaUrl: ghostTrailer,
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
    mediaUrl: unchartedTrailer,
    coverImage: getCoverImage("uncharted.jpg")
  }
];

const isVideoUrl = (url) => {
  if (!url) return false;
  const str = String(url).toLowerCase();
  return str.endsWith('.mp4') || str.includes('.mp4?') || str.includes('data:video/mp4');
};

const GameCard = ({ game, onOpenModal }) => {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="bg-[#0d0e12] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/50 transition duration-300 group flex flex-col justify-between"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black/50">
        <img
          src={game.coverImage}
          alt={game.name}
          className="w-full h-full object-cover group-hover:hidden transition-opacity duration-300"
        />

        {isVideoUrl(game.mediaUrl) ? (
          <video
            ref={videoRef}
            src={game.mediaUrl}
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover hidden group-hover:block transition-opacity duration-300 pointer-events-none"
          />
        ) : (
          <img
            src={game.mediaUrl}
            alt={`${game.name} Preview`}
            className="w-full h-full object-cover hidden group-hover:block transition-opacity duration-300"
          />
        )}

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
          onClick={() => onOpenModal(game)}
          className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-400/30 font-semibold text-xs rounded-xl transition duration-200 mt-1 cursor-pointer"
        >
          View Details & Consoles
        </button>
      </div>
    </div>
  );
};

export const GamesLibrary = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlayers, setSelectedPlayers] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalGame, setActiveModalGame] = useState(null);
  const [showAll, setShowAll] = useState(false);

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

  const isFilteringActive = selectedPlatform !== 'all' || selectedGenre !== 'All' || selectedPlayers !== 'All' || searchQuery.trim() !== '';
  const displayedGames = showAll || isFilteringActive ? filteredGames : filteredGames.slice(0, 8);

  return (
    <section id="games" className="py-10 sm:py-20 px-3 sm:px-6 max-w-7xl mx-auto border-t border-white/10 bg-[#070709] text-white font-sans">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <span className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1">
          BILL MART MALL AKOLA • PRE-INSTALLED GAME LIBRARY
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight text-white font-orbitron">
          GAME <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">COLLECTION</span>
        </h2>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
        {PLATFORMS.map((plat) => (
          <button
            key={plat.id}
            onClick={() => { setSelectedPlatform(plat.id); setShowAll(false); }}
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
            onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false); }}
            className="w-full bg-[#16171f] border border-white/10 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
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
              onClick={() => { setSelectedGenre(genre); setShowAll(false); }}
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
              onClick={() => { setSelectedPlayers(p); setShowAll(false); }}
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
        Showing <span className="text-cyan-400 font-bold">{displayedGames.length}</span> of <span className="text-white font-bold">{filteredGames.length}</span> games
      </div>

      {/* Game Cards Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-mono text-xs sm:text-sm">
          No games found matching your filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {displayedGames.map((game) => (
              <GameCard key={game.id} game={game} onOpenModal={setActiveModalGame} />
            ))}
          </div>

          {/* Show More / Show Less Button */}
          {!isFilteringActive && filteredGames.length > 8 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-3 bg-[#121318] hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-400/40 font-bold text-xs sm:text-sm rounded-xl transition duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-pointer"
              >
                {showAll ? "Show Less ⬆️" : `Show More (${filteredGames.length - 8} More Games) ⬇️`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Details */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f1015] border border-cyan-400/40 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)] max-h-[90vh] flex flex-col">
            <div className="relative h-44 sm:h-56 w-full shrink-0 bg-black">
              {isVideoUrl(activeModalGame.mediaUrl) ? (
                <video
                  src={activeModalGame.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <img
                  src={activeModalGame.mediaUrl}
                  alt={activeModalGame.name}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => setActiveModalGame(null)}
                className="absolute top-2.5 right-2.5 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-600 transition cursor-pointer z-10"
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
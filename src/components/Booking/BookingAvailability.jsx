import React, { useState, useEffect } from 'react';
import { Monitor, Calendar, Clock, Car, Gamepad2 } from 'lucide-react';
import { supabase } from "../../supabaseClient";

const BookingAvailability = ({
  bookingDate,
  setBookingDate,
  selectedCategory,
  setSelectedCategory,
  selectedScreen,
  setSelectedScreen,
  selectedTeam,
  setSelectedTeam,
  selectedGame,
  setSelectedGame,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  showEndPicker,
  setShowEndPicker,
  currentMinutes,
  bookedSlots,
  stations,
  maxCapacities,
  currentStation,
  formatDurationText,
  minutesToTimeString,
  totalAmount,
  onNext,
}) => {
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureMaxDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Aaj se 7 din aage tak ki booking allowed
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();
  const maxDateStr = getFutureMaxDateString();

  // Dynamic Cafe Timing state (Default: 11:00 AM to 11:00 PM)
  const [openingMinutes, setOpeningMinutes] = useState(660);
  const [closingMinutes, setClosingMinutes] = useState(1380);

  const timeStringToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      setSelectedTeam('1 Player');
    }
  }, [selectedCategory, selectedGame, setSelectedTeam]);

  // Fetch dynamic Cafe Timing from Supabase based on Regular (id: 1) or Friday (id: 2)
  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
    setShowEndPicker(false);

    const fetchCafeTimingFromSupabase = async () => {
      try {
        const selectedD = new Date(bookingDate);
        const isFriday = !isNaN(selectedD.getTime()) && selectedD.getDay() === 5;
        const targetId = isFriday ? 2 : 1; // Friday ke liye id = 2, baaki dino ke liye id = 1

        const { data, error } = await supabase
          .from('cafe_settings')
          .select('open_time, close_time')
          .eq('id', targetId)
          .maybeSingle();

        if (error) {
          console.warn("Supabase timing fetch warning, fallback to defaults:", error);
          return;
        }

        if (data) {
          const openMins = timeStringToMinutes(data.open_time);
          const closeMins = timeStringToMinutes(data.close_time);

          if (openMins !== null) setOpeningMinutes(openMins);
          if (closeMins !== null) {
            setClosingMinutes(closeMins <= (openMins || 660) ? closeMins + 1440 : closeMins);
          }
        }
      } catch (e) {
        console.error("Failed to load cafe timing from Supabase:", e);
      }
    };

    fetchCafeTimingFromSupabase();
  }, [bookingDate]);

  // Available games list for PS5
  const gameOptions = [
    { id: 'GTA 6', name: 'GTA VI (Special)', badge: 'HOT' },
    { id: 'Standard', name: 'Other Games (FC 24, Spider-Man 2, Tekken etc.)', badge: 'REGULAR' }
  ];

  const calculateFinalPrice = () => {
    if (!startTime || !endTime) return 0;
    const durationMins = endTime - startTime;

    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      const hours = durationMins / 60;
      if (selectedScreen?.includes('55"')) {
        if (durationMins === 30) return 150;
        return Math.round(hours * 250);
      } else {
        if (durationMins === 30) return 120;
        return Math.round(hours * 200);
      }
    }

    return totalAmount;
  };

  const dynamicTotalAmount = calculateFinalPrice();

  const generate15MinSlots = () => {
    const slots = [];
    for (let m = openingMinutes; m <= closingMinutes; m += 15) {
      slots.push(m);
    }
    return slots;
  };

  const parseTimeToMinutes = (timeStr) => {
    try {
      const parts = timeStr.trim().split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const modifier = parts[1];

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    } catch (e) {
      return 0;
    }
  };

  const parseSlotRange = (slotString) => {
    if (!slotString || !slotString.includes('-')) {
      return { start: 0, end: 0 };
    }
    const parts = slotString.split('-');
    return {
      start: parseTimeToMinutes(parts[0]),
      end: parseTimeToMinutes(parts[1]),
    };
  };

  const isSlotPast = (startMins) => {
    if (bookingDate === todayStr || bookingDate === 'Today') {
      return startMins < currentMinutes;
    }
    return false;
  };

  const get15MinBlockStatus = (startMins) => {
    if (isSlotPast(startMins)) return 'EXPIRED';

    const endMins = startMins + 15;
    const capacityKey = currentStation?.hasScreens
      ? `${selectedCategory}_${selectedScreen}`
      : selectedCategory;

    const maxCapacity = maxCapacities[capacityKey] || 1;

    let approvedCount = 0;
    let pendingCount = 0;

    bookedSlots.forEach((booking) => {
      const status = (booking.status || '').toString().toUpperCase();
      if (status !== 'APPROVED' && status !== 'PENDING') return;

      const bDay = (booking.bookingDate || booking.booking_date || booking.day || '')
        .toString().trim().toLowerCase();
      if (bDay !== bookingDate.trim().toLowerCase()) return;

      const bCat = (booking.station_id || booking.category || '').toString().trim().toLowerCase();
      if (bCat !== selectedCategory.toLowerCase()) return;

      if (currentStation?.hasScreens) {
        const bScreen = (booking.screen || '').toString().trim().toLowerCase();
        if (bScreen !== selectedScreen.toLowerCase()) return;
      }

      const bSlot = (booking.slot_time || booking.slot || '').toString();
      const bRange = parseSlotRange(bSlot);

      const overlaps = startMins < bRange.end && endMins > bRange.start;

      if (overlaps) {
        if (status === 'APPROVED') approvedCount++;
        else if (status === 'PENDING') pendingCount++;
      }
    });

    if (approvedCount >= maxCapacity) return 'APPROVED';
    if (approvedCount + pendingCount >= maxCapacity) return 'PENDING';

    return 'FREE';
  };

  const getPlayerOptions = () => {
    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      return ['1 Player'];
    }
    if (selectedCategory === 'PS5' && selectedScreen === '43" Standard') {
      return ['1 Player', '2 Players', '3 Players'];
    }
    return ['1 Player', '2 Players', '3 Players', '4 Players'];
  };

  const handleStartSelect = (startMins) => {
    setStartTime(startMins);
    setEndTime(null);
    setShowEndPicker(true);
  };

  const getDurationOptions = () => {
    if (startTime === null) return [];

    const options = [];
    const maxClosingTime = closingMinutes;

    for (let duration = 30; startTime + duration <= maxClosingTime; duration += 30) {
      const proposedEnd = startTime + duration;

      let isPathClear = true;
      for (let check = startTime; check < proposedEnd; check += 15) {
        if (get15MinBlockStatus(check) !== 'FREE') {
          isPathClear = false;
          break;
        }
      }

      if (!isPathClear) {
        break;
      }

      options.push({
        durationMins: duration,
        endMins: proposedEnd,
      });
    }

    return options;
  };

  const allBlocks = generate15MinSlots().slice(0, -1);

  return (
    <div className="w-full text-white">
      {/* DATE SELECTOR (7 Days Advance Allowed) */}
      <div className="mt-3 sm:mt-4">
        <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Select Date (Up to 7 Days)
        </label>
        <div className="relative">
          <input
            type="date"
            min={todayStr}
            max={maxDateStr}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer shadow-sm [color-scheme:dark]"
          />
        </div>
      </div>

      {/* PLATFORM */}
      <div className="mt-4 sm:mt-5">
        <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
          1. Select Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => {
                setSelectedCategory(station.id);
                setStartTime(null);
                setEndTime(null);
                setShowEndPicker(false);

                if (station.hasScreens) {
                  setSelectedScreen(station.screens[0]);
                }
                if (station.multiplayer) {
                  setSelectedTeam('1 Player');
                }
                if (setSelectedGame) setSelectedGame('Standard');
              }}
              className={`p-2.5 sm:p-3 rounded-xl font-orbitron text-[11px] sm:text-xs font-bold transition-all border cursor-pointer truncate ${selectedCategory === station.id
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
                }`}
            >
              {station.id}
            </button>
          ))}
        </div>
      </div>

      {/* SUB CATEGORY / SCREEN */}
      {currentStation?.hasScreens && (
        <div className="mt-4 sm:mt-5">
          <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
            2. Select {selectedCategory === 'Simulator' ? 'Vehicle Type' : 'Display Size'}
          </label>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1.5">
            {currentStation.screens.map((screen) => (
              <button
                key={screen}
                onClick={() => {
                  setSelectedScreen(screen);
                  setStartTime(null);
                  setEndTime(null);
                  setShowEndPicker(false);

                  if (screen === '43" Standard' && selectedTeam === '4 Players') {
                    setSelectedTeam('3 Players');
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold font-orbitron text-left cursor-pointer transition-all flex items-center ${selectedScreen === screen
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                  }`}
              >
                {selectedCategory === 'Simulator' ? (
                  <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                ) : (
                  <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
                )}
                <span className="truncate">{screen} {selectedCategory === 'Simulator' ? '' : 'Zone'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME SELECTION OPTION */}
      {/* GAME SELECTION OPTION */}
      {selectedCategory === 'PS5' && (
        <div className="mt-4 sm:mt-5">
          <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
            2. Select Game / Edition
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setSelectedGame('Standard')}
              className={`p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${selectedGame === 'Standard'
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
                }`}
            >
              Standard Games
            </button>

            <div className="relative group">
              <button
                type="button"
                disabled={true}
                className="w-full h-full p-2.5 sm:p-3 rounded-xl border text-[11px] sm:text-xs font-bold bg-zinc-900/80 border-amber-500/30 text-amber-400/50 cursor-not-allowed flex items-center justify-center gap-1.5 font-orbitron"
              >
                <span>🔒 GTA 6 (Locked)</span>
              </button>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-amber-400 text-[10px] px-2 py-1 rounded border border-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-mono z-20">
                Revealing on Launch Day!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAYERS */}
      {currentStation?.multiplayer && (
        <div className="mt-4 sm:mt-5">
          <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
            {selectedCategory === 'PS5' ? '4.' : '3.'} Select Players
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
            {getPlayerOptions().map((playerOption) => (
              <button
                key={playerOption}
                onClick={() => setSelectedTeam(playerOption)}
                className={`p-2.5 sm:p-3 rounded-xl border text-center cursor-pointer transition-all ${selectedTeam === playerOption
                    ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                  }`}
              >
                <div className="text-[11px] sm:text-xs font-bold font-orbitron text-cyan-400">
                  {playerOption}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE BAR */}
      <div className="mt-5 sm:mt-6">
        <label className="text-[11px] sm:text-xs font-sans text-zinc-400 font-semibold block mb-2">
          Slide horizontally to check timeline availability
        </label>

        <div className="relative overflow-x-auto pb-3 pt-1 touch-pan-x scrollbar-thin scrollbar-thumb-zinc-700">
          <div className="min-w-[580px] sm:min-w-[650px] px-1">
            <div className="flex justify-between items-end mb-1">
              {allBlocks.map((block) => {
                const isFullHour = block % 60 === 0;
                return (
                  <div key={block} className="flex flex-col items-center min-w-[12px] sm:min-w-[14px]">
                    <div className="h-3 sm:h-4 flex items-center justify-center">
                      {isFullHour && (
                        <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-300 font-sans tracking-tight">
                          {minutesToTimeString(block).replace(':00', '')}
                        </span>
                      )}
                    </div>
                    <div className={`w-[1px] rounded-full transition-all mt-1 ${isFullHour ? 'h-2.5 sm:h-3 bg-zinc-300' : 'h-1 sm:h-1.5 bg-zinc-600'
                      }`} />
                  </div>
                );
              })}
            </div>

            <div className="relative w-full h-2.5 sm:h-3 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 rounded-sm overflow-hidden flex shadow-inner">
              {allBlocks.map((block) => {
                const blockStatus = get15MinBlockStatus(block);
                const isSelected = startTime !== null && endTime !== null && block >= startTime && block < endTime;

                return (
                  <div
                    key={block}
                    className={`flex-1 h-full border-r border-black/20 transition-all ${isSelected
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : blockStatus === 'EXPIRED'
                          ? 'bg-zinc-800/80 opacity-40'
                          : blockStatus === 'APPROVED'
                            ? 'bg-red-500/90 shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]'
                            : blockStatus === 'PENDING'
                              ? 'bg-amber-400/90 shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]'
                              : 'bg-transparent'
                      }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* START TIME SLOTS */}
      <div className="mt-4 sm:mt-5">
        <label className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400">
          Available Start Slots
        </label>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 mt-2 max-h-44 sm:max-h-48 overflow-y-auto pr-1">
          {allBlocks.map((block) => {
            const blockStatus = get15MinBlockStatus(block);
            const isOccupied = blockStatus !== 'FREE';
            const isSelected = startTime === block;

            return (
              <button
                key={block}
                disabled={isOccupied}
                onClick={() => handleStartSelect(block)}
                className={`p-2 sm:p-2.5 min-h-[40px] rounded-lg border text-[11px] sm:text-xs font-bold font-mono transition-all flex items-center justify-center ${isSelected
                    ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-md'
                    : blockStatus === 'EXPIRED'
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-600 cursor-not-allowed line-through opacity-50'
                      : blockStatus === 'APPROVED'
                        ? 'bg-red-950/20 border-red-900/40 text-red-500/50 cursor-not-allowed line-through'
                        : blockStatus === 'PENDING'
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-500/60 cursor-not-allowed line-through'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:border-cyan-400 cursor-pointer'
                  }`}
              >
                {minutesToTimeString(block)}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECT DURATION */}
      {showEndPicker && startTime !== null && (
        <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-2xl bg-zinc-900 border border-cyan-500/40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] sm:text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Select Duration
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
              Start: <strong className="text-white">{minutesToTimeString(startTime)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 sm:max-h-48 overflow-y-auto pr-1">
            {getDurationOptions().map(({ durationMins, endMins }) => {
              const isSelected = endTime === endMins;

              return (
                <button
                  key={endMins}
                  onClick={() => setEndTime(endMins)}
                  className={`p-2 sm:p-2.5 rounded-lg border text-[11px] sm:text-xs font-bold font-mono transition-all text-center ${isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:border-emerald-400 cursor-pointer'
                    }`}
                >
                  <div>{formatDurationText(durationMins)}</div>
                  <span className="block text-[8px] sm:text-[9px] opacity-80 font-normal">
                    (Till {minutesToTimeString(endMins)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUMMARY BAR */}
      {startTime !== null && endTime !== null && (
        <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border border-cyan-500/40 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] text-cyan-300 font-mono truncate">
              {bookingDate} • {selectedCategory} {currentStation?.hasScreens ? `(${selectedScreen})` : ''}
              {selectedCategory === 'PS5' && selectedGame ? ` • ${selectedGame}` : ''}
            </div>

            <div className="text-sm sm:text-base font-black font-orbitron truncate">
              {minutesToTimeString(startTime)} - {minutesToTimeString(endTime)}
            </div>

            <div className="text-[11px] sm:text-xs font-bold font-mono text-emerald-400 mt-0.5">
              Total: ₹{dynamicTotalAmount} ({formatDurationText(endTime - startTime)})
            </div>
          </div>

          <button
            onClick={onNext}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-orbitron text-xs font-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer transition-all shrink-0"
          >
            NEXT &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingAvailability;
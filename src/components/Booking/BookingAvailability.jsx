import React, { useState, useEffect } from "react";
import { Monitor, Calendar, Clock, Car, Lock } from "lucide-react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

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

  const todayStr = getTodayDateString();

  const [openingMinutes, setOpeningMinutes] = useState(750);
  const [closingMinutes, setClosingMinutes] = useState(1320);

  const timeStringToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
    setShowEndPicker(false);

    const fetchCafeTimingFromFirebase = async () => {
      try {
        const selectedD = new Date(bookingDate);
        if (isNaN(selectedD.getTime())) return;

        const dayIndex = selectedD.getDay(); 
        const targetId = dayIndex === 0 ? "7" : dayIndex.toString();

        const docRef = doc(db, 'cafe_settings', targetId);
        const docSnap = await getDoc(docRef);

        const getDefaultDayTimings = (dIdx) => {
          if (dIdx === 1) return { open: 960, close: 1320 };
          if (dIdx >= 2 && dIdx <= 4) return { open: 750, close: 1320 };
          if (dIdx === 5) return { open: 900, close: 1320 };
          return { open: 870, close: 1320 };
        };

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.open_time && data.close_time) {
            const openMins = timeStringToMinutes(data.open_time);
            const closeMins = timeStringToMinutes(data.close_time);

            if (openMins !== null) setOpeningMinutes(openMins);
            if (closeMins !== null) setClosingMinutes(closeMins);
          } else {
            const defaults = getDefaultDayTimings(dayIndex);
            setOpeningMinutes(defaults.open);
            setClosingMinutes(defaults.close);
          }
        } else {
          const defaults = getDefaultDayTimings(dayIndex);
          setOpeningMinutes(defaults.open);
          setClosingMinutes(defaults.close);
        }
      } catch (e) {
        console.error("Failed to load cafe timing from Firebase:", e);
        setOpeningMinutes(750);
        setClosingMinutes(1320);
      }
    };

    fetchCafeTimingFromFirebase();
  }, [bookingDate]);

  const isGta6Locked = () => {
    if (bookingDate < "2026-11-19") return true;
    if (bookingDate > "2026-11-19") return false;

    if (bookingDate === "2026-11-19") {
      const now = new Date();
      const isToday19th = now.getFullYear() === 2026 && now.getMonth() === 10 && now.getDate() === 19;
      
      if (isToday19th) {
        const currentMinsOfDay = now.getHours() * 60 + now.getMinutes();
        if (currentMinsOfDay < 720) return true;
      }
    }
    return false;
  };

  const gtaLocked = isGta6Locked();

  useEffect(() => {
    if (gtaLocked && selectedGame === 'GTA 6') {
      setSelectedGame('Standard');
    }
  }, [gtaLocked, selectedGame, setSelectedGame]);

  useEffect(() => {
    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      setSelectedTeam('1 Player');
    }
  }, [selectedCategory, selectedGame, setSelectedTeam]);

  const getDates = () => {
    const chronoDates = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      chronoDates.push({
        dateString: `${year}-${month}-${day}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return chronoDates;
  };

  const datesList = getDates();

  const calculateFinalPrice = () => {
    if (!startTime || !endTime) return 0;
    const durationMins = endTime - startTime;

    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      const isVIP = selectedScreen?.includes('55"');
      const base3HourPrice = isVIP ? 650 : 500;
      const hourlyExtraRate = isVIP ? 250 : 200;
      const halfHourExtraRate = isVIP ? 150 : 120;

      if (durationMins > 0 && durationMins % 180 === 0) {
        const blocksOf3Hours = durationMins / 180;
        return blocksOf3Hours * base3HourPrice;
      }

      if (durationMins > 180) {
        const remainderMins = durationMins % 180;
        const baseBlocksPrice = Math.floor(durationMins / 180) * base3HourPrice;

        const extraHours = Math.floor(remainderMins / 60);
        const remainingMins = remainderMins % 60;

        let extraCost = extraHours * hourlyExtraRate;
        if (remainingMins === 30) {
          extraCost += halfHourExtraRate;
        }
        return baseBlocksPrice + extraCost;
      }

      const fullHours = Math.floor(durationMins / 60);
      const remainingMins = durationMins % 60;

      let price = fullHours * hourlyExtraRate;
      if (remainingMins === 30) price += halfHourExtraRate;
      return price;
    }

    return totalAmount;
  };

  const dynamicTotalAmount = calculateFinalPrice();

  const getOriginalComparisonPrice = () => {
    if (!startTime || !endTime) return null;
    const durationMins = endTime - startTime;
    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6' && durationMins >= 180) {
      const isVIP = selectedScreen?.includes('55"');
      const hrRate = isVIP ? 250 : 200;
      const min30Rate = isVIP ? 150 : 120;
      
      const fullHours = Math.floor(durationMins / 60);
      const remainingMins = durationMins % 60;
      let regularPrice = fullHours * hrRate;
      if (remainingMins === 30) regularPrice += min30Rate;
      return regularPrice;
    }
    return null;
  };

  const originalComparisonPrice = getOriginalComparisonPrice();

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
    if (!slotString) {
      return { start: 0, end: 0 };
    }
    const parts = slotString.split(/[-–\n]/);
    if (parts.length < 2) {
      return { start: 0, end: 0 };
    }
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
      if (status !== 'APPROVED' && status !== 'PENDING' && status !== 'CONFIRMED') return;

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
        if (status === 'APPROVED' || status === 'CONFIRMED') approvedCount++;
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
    <div className="w-full text-white pb-32">
      {/* Date Carousel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 font-bold">
            <Calendar className="w-4 h-4 text-[#ccff00]" /> Select Date
          </label>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2 w-fit mx-auto min-w-full justify-start sm:justify-center px-2">
            {datesList.map((d) => {
              const isSelected = bookingDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  onClick={() => setBookingDate(d.dateString)}
                  className={`flex flex-col items-center justify-center text-center min-w-[62px] py-2 px-2 rounded-xl border transition-all cursor-pointer font-mono shrink-0 ${isSelected
                    ? 'bg-[#ccff00] text-black border-[#ccff00] font-bold shadow-[0_0_15px_rgba(204,255,0,0.45)] scale-105'
                    : 'bg-[#181922] text-zinc-400 border-white/10 hover:border-[#ccff00]/40 hover:text-white'
                    }`}
                >
                  <span className="text-[9px] uppercase leading-none">{d.dayName}</span>
                  <span className="text-base font-black font-orbitron my-1 leading-none">{d.dayNum}</span>
                  <span className="text-[9px] uppercase leading-none">{d.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2.5">
          1. Select Platform
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {stations.map((station) => {
            const isSelected = selectedCategory === station.id;
            return (
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
                className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold transition-all border cursor-pointer text-left flex items-center justify-between ${isSelected
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-zinc-300 border-white/10 hover:border-white/30'
                  }`}
              >
                <div>
                  <div className="text-xs font-black">{station.id}</div>
                  <div className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-black/80' : 'text-zinc-400'}`}>
                    {station.name.split(' ')[0]}
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-600'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Selection */}
      {currentStation?.hasScreens && (
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2.5">
            2. Select {selectedCategory === 'Simulator' ? 'Vehicle Type' : 'Display Size'}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {currentStation.screens.map((screen) => {
              const isSelected = selectedScreen === screen;
              return (
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
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold font-orbitron text-left cursor-pointer transition-all flex items-center gap-2.5 ${isSelected
                    ? 'border-[#ccff00] bg-[#ccff00]/15 text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.35)] font-black'
                    : 'border-white/10 bg-[#181922] text-zinc-400 hover:border-white/20'
                    }`}
                >
                  {selectedCategory === 'Simulator' ? (
                    <Car className="w-4 h-4 text-[#ccff00] shrink-0" />
                  ) : (
                    <Monitor className="w-4 h-4 text-[#ccff00] shrink-0" />
                  )}
                  <span className="truncate">{screen}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Selection */}
      {selectedCategory === 'PS5' && (
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2.5">
            2. Select Game / Edition
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedGame('Standard')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer font-orbitron ${selectedGame === 'Standard'
                ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                : 'bg-[#181922] text-zinc-300 border-white/10 hover:border-white/30'
                }`}
            >
              Standard Games
            </button>

            {gtaLocked ? (
              <button
                type="button"
                disabled={true}
                className="py-2.5 px-3 rounded-xl border text-xs font-bold bg-zinc-900 border-amber-500/30 text-amber-400/50 cursor-not-allowed font-orbitron flex items-center justify-center gap-1.5"
                title="Select 19 November (After 12 PM) to unlock"
              >
                <Lock className="w-3.5 h-3.5" /> GTA VI 🔥
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedGame('GTA 6')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer font-orbitron ${selectedGame === 'GTA 6'
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-zinc-300 border-white/10 hover:border-white/30'
                  }`}
              >
                🔥 GTA 6 
              </button>
            )}
          </div>
          {gtaLocked && (
            <p className="text-[10px] text-amber-400/80 font-mono mt-1.5 text-center">
              🔒 Select 19 November (12:00 PM onwards) from above to unlock GTA 6 bookings.
            </p>
          )}
        </div>
      )}

      {/* Players */}
      {currentStation?.multiplayer && (
        <div className="mb-6">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2.5">
            Select Players
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {getPlayerOptions().map((playerOption) => {
              const isSelected = selectedTeam === playerOption;
              return (
                <button
                  key={playerOption}
                  onClick={() => setSelectedTeam(playerOption)}
                  className={`py-2.5 px-3 rounded-xl border text-center cursor-pointer transition-all font-mono text-xs ${isSelected
                    ? 'border-[#ccff00] bg-[#ccff00]/20 text-[#ccff00] font-bold shadow-md'
                    : 'border-white/10 bg-[#181922] text-zinc-400 hover:border-white/20'
                    }`}
                >
                  {playerOption}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Bar */}
      <div className="mb-5 bg-[#181922] border border-white/10 p-2.5 rounded-xl shadow-inner">
        <label className="text-xs font-sans text-zinc-300 font-bold block mb-1.5">
          Timeline Availability
        </label>
        <div className="relative overflow-x-auto pb-0.5 pt-0 no-scrollbar">
          <div className="min-w-[620px] px-1">
            <div className="flex justify-between items-end mb-1">
              {allBlocks.map((block) => {
                const isFullHour = block % 60 === 0;
                return (
                  <div key={block} className="flex flex-col items-center min-w-[16px]">
                    <div className="h-3 flex items-center justify-center">
                      {isFullHour && (
                        <span className="text-[9px] font-bold text-[#ccff00] font-mono">
                          {minutesToTimeString(block).replace(':00', '')}
                        </span>
                      )}
                    </div>
                    <div className={`w-[1px] rounded-full mt-0.5 ${isFullHour ? 'h-2.5 bg-[#ccff00]/60' : 'h-1.5 bg-zinc-600'}`} />
                  </div>
                );
              })}
            </div>

            <div className="relative w-full h-2.5 bg-zinc-800 rounded-sm overflow-hidden flex shadow-inner">
              {allBlocks.map((block) => {
                const blockStatus = get15MinBlockStatus(block);
                const isSelected = startTime !== null && endTime !== null && block >= startTime && block < endTime;

                return (
                  <div
                    key={block}
                    className={`flex-1 h-full border-r border-black/30 transition-all ${isSelected
                      ? 'bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.9)]'
                      : blockStatus === 'EXPIRED'
                        ? 'bg-zinc-900 opacity-40'
                        : blockStatus === 'APPROVED'
                          ? 'bg-red-500/90'
                          : blockStatus === 'PENDING'
                            ? 'bg-amber-400/90'
                            : 'bg-transparent'
                      }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Start Slots */}
      <div className="mb-6">
        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2.5">
          Available Start Slots
        </label>
        <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
          {allBlocks.map((block) => {
            const blockStatus = get15MinBlockStatus(block);
            const isOccupied = blockStatus !== 'FREE';
            const isSelected = startTime === block;

            return (
              <button
                key={block}
                disabled={isOccupied}
                onClick={() => handleStartSelect(block)}
                className={`py-2 px-2 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center ${isSelected
                  ? 'bg-[#ccff00] text-black border-[#ccff00] font-black shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                  : blockStatus === 'EXPIRED'
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through opacity-40'
                    : blockStatus === 'APPROVED' || blockStatus === 'PENDING'
                      ? 'bg-red-950/20 border-red-900/40 text-red-400/50 cursor-not-allowed line-through'
                      : 'bg-[#181922] border-white/10 text-zinc-300 hover:border-[#ccff00] cursor-pointer'
                  }`}
              >
                {minutesToTimeString(block)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      {showEndPicker && startTime !== null && (
        <div className="mb-4 p-2.5 rounded-xl bg-[#181922] border border-[#ccff00]/40 shadow-[0_0_15px_rgba(204,255,0,0.12)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#ccff00] font-bold uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#ccff00]" /> Select Duration
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Start: <strong className="text-white">{minutesToTimeString(startTime)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {getDurationOptions().map(({ durationMins, endMins }) => {
              const isSelected = endTime === endMins;
              return (
                <button
                  key={endMins}
                  onClick={() => setEndTime(endMins)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-bold font-mono transition-all text-center ${isSelected
                    ? 'bg-[#ccff00] text-black border-[#ccff00] font-black shadow-[0_0_12px_rgba(204,255,0,0.45)]'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:border-[#ccff00] cursor-pointer'
                    }`}
                >
                  <div>{formatDurationText(durationMins)}</div>
                  <span className="block text-[8px] opacity-70 font-normal mt-0.2">
                    (Till {minutesToTimeString(endMins)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      {startTime !== null && endTime !== null && (
        <div className="sticky bottom-3 mt-6 bg-[#181922]/95 backdrop-blur-md border border-white/15 p-3 rounded-2xl z-40 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div>
            <div className="text-[9px] font-mono text-zinc-400 uppercase leading-none mb-1">Selected Slot</div>
            <div className="text-[11px] font-bold font-orbitron text-[#ccff00] leading-tight">
              {minutesToTimeString(startTime)} - {minutesToTimeString(endTime)}
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              {originalComparisonPrice ? (
                <>
                  <span className="text-zinc-500 line-through text-xs font-mono">₹{originalComparisonPrice}</span>
                  <span className="text-sm font-black font-orbitron text-[#ccff00]">₹{dynamicTotalAmount}</span>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-mono">
                    {endTime - startTime === 180 ? '3-HR OFF' : '3-HR + EXTRA OFF'}
                  </span>
                </>
              ) : (
                <span className="text-sm font-black font-orbitron text-white">₹{dynamicTotalAmount}</span>
              )}
            </div>
          </div>
          <button
            onClick={onNext}
            className="px-5 py-2.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer transition-all active:scale-95 shrink-0"
          >
            Proceed to Pay &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingAvailability;
import React from 'react';
import { Monitor, Calendar, Clock, Car } from 'lucide-react';

const BookingAvailability = ({
  bookingDate,
  setBookingDate,
  selectedCategory,
  setSelectedCategory,
  selectedScreen,
  setSelectedScreen,
  selectedTeam,
  setSelectedTeam,
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
  // 15-minute interval blocks generation (11:00 AM to 10:00 PM)
  const generate15MinSlots = () => {
    const slots = [];
    for (let m = 660; m <= 1320; m += 15) {
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
    if (bookingDate === 'Today' && startMins < currentMinutes) {
      return true;
    }
    return false;
  };

  // Checks status for a 15-minute block
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

      const bDay = (booking.bookingDate || booking.booking_date || booking.day || 'Today')
        .toString()
        .trim()
        .toLowerCase();

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

  // Duration steps: 30m, 1h, 1h 30m, 2h (30m increments)
  // Stops if any 15-minute block inside or at the end boundary is occupied
  const getDurationOptions = () => {
    if (startTime === null) return [];

    const options = [];
    const maxClosingTime = 1320; // 10:00 PM

    for (let duration = 30; startTime + duration <= maxClosingTime; duration += 30) {
      const proposedEnd = startTime + duration;

      // Ensure every 15-min chunk within this duration is FREE
      let isPathClear = true;
      for (let check = startTime; check < proposedEnd; check += 15) {
        if (get15MinBlockStatus(check) !== 'FREE') {
          isPathClear = false;
          break;
        }
      }

      if (!isPathClear) {
        break; // Stop providing higher durations once collision occurs
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
    <>
      {/* DATE */}
      <div className="mt-5">
        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Select Date
        </label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {['Today', 'Tomorrow'].map((day) => (
            <button
              key={day}
              onClick={() => {
                setBookingDate(day);
                setStartTime(null);
                setEndTime(null);
                setShowEndPicker(false);
              }}
              className={`p-3 rounded-xl font-orbitron text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                bookingDate === day
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* PLATFORM */}
      <div className="mt-5">
        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          1. Select Platform
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
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
              }}
              className={`p-3 rounded-xl font-orbitron text-xs font-bold transition-all border cursor-pointer ${
                selectedCategory === station.id
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
              }`}
            >
              {station.id}
            </button>
          ))}
        </div>
      </div>

      {/* SUB CATEGORY / SCREEN / SIMULATOR TYPE */}
      {currentStation?.hasScreens && (
        <div className="mt-5">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            2. Select {selectedCategory === 'Simulator' ? 'Vehicle Type' : 'Display Size'}
          </label>

          <div className="grid grid-cols-2 gap-3 mt-2">
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
                className={`p-3 rounded-xl border text-xs font-bold font-orbitron text-left cursor-pointer transition-all ${
                  selectedScreen === screen
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                }`}
              >
                {selectedCategory === 'Simulator' ? (
                  <Car className="w-4 h-4 inline mr-2 mb-0.5" />
                ) : (
                  <Monitor className="w-4 h-4 inline mr-2 mb-0.5" />
                )}
                {screen} {selectedCategory === 'Simulator' ? '' : 'Zone'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PLAYERS */}
      {currentStation?.multiplayer && (
        <div className="mt-5">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            3. Select Players
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {getPlayerOptions().map((playerOption) => (
              <button
                key={playerOption}
                onClick={() => setSelectedTeam(playerOption)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  selectedTeam === playerOption
                    ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold font-orbitron text-cyan-400">
                  {playerOption}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE BAR */}
      <div className="mt-6">
        <label className="text-xs font-sans text-zinc-400 font-semibold block mb-3">
          Slide to check availability
        </label>

        <div className="relative overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div className="min-w-[650px] px-2">
            <div className="flex justify-between items-end mb-1">
              {allBlocks.map((block) => {
                const isFullHour = block % 60 === 0;
                return (
                  <div key={block} className="flex flex-col items-center min-w-[14px]">
                    <div className="h-4 flex items-center justify-center">
                      {isFullHour && (
                        <span className="text-[10px] font-semibold text-zinc-300 font-sans tracking-tight">
                          {minutesToTimeString(block).replace(':00', '')}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-[1px] rounded-full transition-all mt-1 ${
                        isFullHour ? 'h-3 bg-zinc-300' : 'h-1.5 bg-zinc-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="relative w-full h-3 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 rounded-sm overflow-hidden flex shadow-inner">
              {allBlocks.map((block) => {
                const blockStatus = get15MinBlockStatus(block);
                const isSelected =
                  startTime !== null &&
                  endTime !== null &&
                  block >= startTime &&
                  block < endTime;

                return (
                  <div
                    key={block}
                    className={`flex-1 h-full border-r border-black/20 transition-all ${
                      isSelected
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

        <div className="flex flex-wrap gap-3 mt-1 text-[10px] font-mono text-zinc-400 justify-end px-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Selected
          </span>
        </div>
      </div>

      {/* START TIME (15-MIN INTERVAL BOXES) */}
      <div className="mt-5">
        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Available Start Slots
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
          {allBlocks.map((block) => {
            const blockStatus = get15MinBlockStatus(block);
            const isOccupied = blockStatus !== 'FREE';
            const isSelected = startTime === block;

            return (
              <button
                key={block}
                disabled={isOccupied}
                onClick={() => handleStartSelect(block)}
                className={`p-2.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                  isSelected
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

      {/* SELECT DURATION (30m, 1h, 1h 30m, 2h...) */}
      {showEndPicker && startTime !== null && (
        <div className="mt-5 p-4 rounded-2xl bg-zinc-900 border border-cyan-500/40 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-4 h-4" /> Select Duration
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Start: <strong className="text-white">{minutesToTimeString(startTime)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {getDurationOptions().map(({ durationMins, endMins }) => {
              const isSelected = endTime === endMins;

              return (
                <button
                  key={endMins}
                  onClick={() => setEndTime(endMins)}
                  className={`p-2.5 rounded-lg border text-xs font-bold font-mono transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:border-emerald-400 cursor-pointer'
                  }`}
                >
                  {formatDurationText(durationMins)}
                  <span className="block text-[9px] opacity-75 font-normal">
                    (Till {minutesToTimeString(endMins)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {startTime !== null && endTime !== null && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/40 flex items-center justify-between animate-fade-in">
          <div>
            <div className="text-[11px] text-cyan-300 font-mono">
              {bookingDate} • {selectedCategory}{' '}
              {currentStation?.hasScreens ? `(${selectedScreen})` : ''}
            </div>

            <div className="text-base font-black font-orbitron">
              {minutesToTimeString(startTime)} to {minutesToTimeString(endTime)}
            </div>

            <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
              Total: ₹{totalAmount} ({formatDurationText(endTime - startTime)})
            </div>
          </div>

          <button
            onClick={onNext}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-orbitron text-xs font-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer transition-all"
          >
            NEXT &gt;
          </button>
        </div>
      )}
    </>
  );
};

export default BookingAvailability;
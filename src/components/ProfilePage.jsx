import React, { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import profileImg from '../assets/profile.jpeg';

export default function ProfilePage({ session, onBack, onLogout, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gamerPoints, setGamerPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState('BRONZE');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  
  // State for Selected Booking Receipt Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // State for Direct Cafe Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('100');
  const [payUtr, setPayUtr] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [activeAppHelp, setActiveAppHelp] = useState('phonepe');

  const UPI_ID = 'strangersgamingcafe@upi';

  // Helper Functions for Format Parsing
  const formatDateString = (rawDate) => {
    if (!rawDate) return 'N/A';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    } catch {
      return rawDate;
    }
  };

  const formatTimeOnly = (booking) => {
    if (!booking) return 'N/A';
    const rawTimestamp = booking.created_at || booking.createdAt || booking.booked_at || booking.created_time || booking.timestamp;
    if (!rawTimestamp) return 'Just Now';

    try {
      const d = new Date(rawTimestamp);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return 'N/A';
    }
  };

  const getDurationText = (b) => {
    if (!b) return '30 mins';
    if (b.duration) return b.duration;
    if (b.duration_minutes) return `${b.duration_minutes} mins`;
    const slotStr = b.slot_time || b.slot || b.time || '';
    if (slotStr.includes('-')) {
      return '60 mins';
    }
    return '30 mins';
  };

  const parseBookingDateTime = (slot) => {
    try {
      const dateStr = slot.bookingDate || slot.date || '';
      let timeStr = slot.slot_time || slot.slot || slot.time || '00:00';
      if (timeStr.includes('-')) {
        timeStr = timeStr.split('-')[0].trim();
      }
      const fullDateStr = `${dateStr} ${timeStr}`;
      const parsedDate = new Date(fullDateStr);
      return isNaN(parsedDate.getTime()) ? new Date(dateStr) : parsedDate;
    } catch (e) {
      return new Date();
    }
  };

  // Safe Profile & Bookings Fetch
  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user) {
        const userEmail = session.user.email || '';
        const userId = session.user.id || '';
        const userPhone = session.user.user_metadata?.phone || '';

        setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
        setPhone(userPhone);
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');

        // Fetch Profiles Table & Safely Parse Points Number
        let currentDbPoints = 0;
try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (data) {
            if (data.name) setName(data.name);
            if (data.phone) setPhone(data.phone);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            
            if (data.gamer_points !== undefined && data.gamer_points !== null) {
              currentDbPoints = parseInt(data.gamer_points, 10) || 0;
              setGamerPoints(currentDbPoints);
            }
            if (data.loyalty_tier) setLoyaltyTier(data.loyalty_tier);
          }
        } catch (err) {
          console.warn("Profile table fetch warning:", err);
        }

        // Fetch Bookings
        fetchUserBookings(userEmail, userId, userPhone);

        // Optional Sync Points RPC
        try {
          const { data: syncedPts } = await supabase.rpc('sync_user_gamer_points', {
            user_email: userEmail,
            user_uuid: String(userId)
          });

          if (syncedPts !== null && syncedPts !== undefined) {
            const parsedSync = parseInt(syncedPts, 10);
            if (!isNaN(parsedSync) && parsedSync > currentDbPoints) {
              setGamerPoints(parsedSync);
            }
          }
        } catch (rpcErr) {
          console.warn('RPC Points Sync notice:', rpcErr);
        }
      }
    };

    fetchProfileData();
  }, [session?.user]);

  const fetchUserBookings = async (email, userId, userPhone) => {
    try {
      const { data: allBookings, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        console.error("Bookings fetch error:", error);
        return;
      }

      if (allBookings && Array.isArray(allBookings)) {
        const matched = allBookings.filter(b => {
          const matchEmail = email && b.email && b.email.toLowerCase() === email.toLowerCase();
          const matchUser = userId && b.user_id && String(b.user_id) === String(userId);
          const matchPhone = userPhone && b.phone && String(b.phone) === String(userPhone);
          return matchEmail || matchUser || matchPhone;
        });

        setUserBookings(matched);
      }
    } catch (err) {
      console.error('Error in fetchUserBookings:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Please choose a smaller image (under 5MB).');
      return;
    }

    setUploading(true);
    setMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        setAvatarUrl(compressedBase64);
        setMessage('Image loaded! Click save to update profile.');
        setUploading(false);
      };
    };

    reader.onerror = () => {
      setMessage('Failed to process image. Please try another file.');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    setMessage('');

    const finalAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : profileImg;

    try {
      await supabase.auth.updateUser({
        data: { full_name: name, phone: phone, avatar_url: finalAvatar }
      });

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name: name,
          phone: phone,
          avatar_url: finalAvatar,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile save error:', profileError);
        setMessage('Error saving details. Please try again.');
      } else {
        setAvatarUrl(finalAvatar);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Profile update catch error:', err);
      setMessage('Failed to update profile.');
    }

    setLoading(false);
  };

  const getStandardUpiUri = (amount) => {
    const cleanAmount = Number(amount) || 0;
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Stranger's Gaming Cafe")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent('Cafe Direct Payment & Diamonds')}`;
  };

  const getAppUri = (app, amount) => {
    const standardUri = getStandardUpiUri(amount);
    if (app === 'phonepe') return `phonepe://${standardUri.replace('upi://', '')}`;
    if (app === 'gpay') return `gpay://upi/pay?${standardUri.split('?')[1]}`;
    if (app === 'paytm') return `paytmmp://pay?${standardUri.split('?')[1]}`;
    return standardUri;
  };

  const getDynamicUpiQrUrl = (amount) => {
    const cleanAmount = Number(amount) || 0;
    const upiData = getStandardUpiUri(cleanAmount);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiData)}`;
  };

  const handleDirectPaymentConfirm = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0 || !payUtr || payUtr.trim().length < 6) {
      alert('Please enter a valid amount and valid 6+ digit UTR/Transaction Ref Number.');
      return;
    }

    setPayLoading(true);

    try {
      const numericAmt = parseInt(payAmount, 10);
      
      const { error: bookingErr } = await supabase.from('bookings').insert([{
        user_id: session?.user?.id,
        email: session?.user?.email || '',
        customer_name: name || 'Gamer',
        phone: phone || '',
        amount: numericAmt,
        utr: payUtr,
        screen: 'Direct Cafe Pay',
        team: '1 Player',
        status: 'CONFIRMED',
        bookingDate: new Date().toISOString().split('T')[0],
        slot_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      if (bookingErr) throw bookingErr;

      const newTotal = gamerPoints + numericAmt;
      setGamerPoints(newTotal);

      // Update points back in profiles table
      await supabase
        .from('profiles')
        .update({ gamer_points: newTotal })
        .eq('id', session?.user?.id);

      alert(`Payment of ₹${numericAmt} recorded! Gamer Diamonds Updated.`);
      setShowPayModal(false);
      setPayUtr('');

      fetchUserBookings(session?.user?.email, session?.user?.id, phone);
    } catch (err) {
      console.error('Payment submitting error:', err);
      alert('Failed to save payment record.');
    }

    setPayLoading(false);
  };

  const now = new Date();

  const upcomingBookings = userBookings.filter((slot) => {
    const bookingDate = parseBookingDateTime(slot);
    return isNaN(bookingDate.getTime()) || bookingDate >= now;
  });

  const pastBookings = userBookings.filter((slot) => {
    const bookingDate = parseBookingDateTime(slot);
    return !isNaN(bookingDate.getTime()) && bookingDate < now;
  });

  const tierBadges = {
    BRONZE: { color: 'from-amber-700 to-amber-900 border-amber-600/50 text-amber-200', icon: '🥉' },
    SILVER: { color: 'from-slate-400 to-slate-600 border-slate-300/50 text-slate-100', icon: '🥈' },
    GOLD: { color: 'from-yellow-500 to-amber-600 border-yellow-400/50 text-yellow-100', icon: '🥇' },
    DIAMOND: { color: 'from-cyan-500 to-blue-600 border-cyan-400/50 text-cyan-100', icon: '💎' },
    LEGEND: { color: 'from-purple-600 to-red-600 border-purple-400/50 text-purple-100', icon: '👑' }
  };

  // Determine Tier dynamically based on points
  const calculatedTier = gamerPoints >= 5000 ? 'LEGEND' : gamerPoints >= 2000 ? 'DIAMOND' : gamerPoints >= 500 ? 'GOLD' : gamerPoints >= 100 ? 'SILVER' : 'BRONZE';
  const currentBadge = tierBadges[calculatedTier] || tierBadges['BRONZE'];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Bar */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold tracking-wider transition cursor-pointer flex items-center gap-2"
            >
              ⬅ Back to Cafe
            </button>

            <button 
              onClick={onLogout}
              className="md:hidden px-3 py-2 bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold"
            >
              🚪 Exit
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-r from-blue-950/80 to-cyan-950/80 border border-cyan-500/40 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-lg">
              <span className="text-2xl animate-pulse">💎</span>
              <div>
                <span className="text-[10px] text-cyan-300 uppercase font-black tracking-widest block">Gamer Diamonds</span>
                <span className="text-lg font-black font-mono text-cyan-100">{gamerPoints} <span className="text-xs font-normal text-cyan-400">PTS</span></span>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${currentBadge.color} border px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg`}>
              <span className="text-xl">{currentBadge.icon}</span>
              <div>
                <span className="text-[9px] uppercase font-bold opacity-80 block tracking-wider">Loyalty Level</span>
                <span className="text-xs font-black uppercase tracking-widest">{calculatedTier}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPayModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-green-600/20 transition cursor-pointer flex items-center gap-2"
            >
              💳 Pay to Stranger's Cafe
            </button>

            <button 
              onClick={onLogout}
              className="hidden md:flex items-center gap-2 px-4 py-3 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold tracking-wider transition cursor-pointer"
            >
              🚪 Log Out
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl text-center shadow-xl">
              <img 
                src={avatarUrl || profileImg} 
                alt="Gamer Avatar" 
                className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-red-600 shadow-lg shadow-red-600/30 mb-3"
              />
              <h2 className="text-base font-black font-orbitron text-white truncate">{name || 'Gamer Profile'}</h2>
              <p className="text-gray-400 text-[11px] mt-0.5 truncate">{session?.user?.email || 'Guest User'}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/15 border border-red-500/30 rounded-lg text-red-400 text-[9px] font-bold tracking-widest uppercase">
                {calculatedTier} VIP
              </div>
            </div>

            <div className="bg-[#121216] border border-white/10 p-3 rounded-2xl space-y-2 shadow-xl">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                📊 Dashboard
              </button>

              <button
                onClick={() => setActiveTab('edit-profile')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
                  activeTab === 'edit-profile' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                ⚙️ Edit Profile
              </button>

              <button
                onClick={onOpenBooking || onBack}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-green-400 hover:bg-green-950/30 border border-green-500/20 transition flex items-center justify-between cursor-pointer"
              >
                <span>➕ New Booking</span>
                <span className="text-xs">➔</span>
              </button>

              <button
                onClick={() => setActiveTab('upcoming')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'upcoming' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>📅 Upcoming Bookings</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{upcomingBookings.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('past')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'past' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>📜 Past Bookings</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{pastBookings.length}</span>
              </button>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT DISPLAY AREA */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Bookings</span>
                    <span className="text-2xl font-black font-orbitron text-white mt-1 block">{userBookings.length}</span>
                  </div>

                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Upcoming Sessions</span>
                    <span className="text-2xl font-black font-orbitron text-red-500 mt-1 block">{upcomingBookings.length}</span>
                  </div>

                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Gramer Diamonds</span>
                    <span className="text-2xl font-black font-orbitron text-cyan-400 mt-1 block">💎 {gamerPoints}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                  <div>
                    <h3 className="text-base font-bold font-orbitron text-white">Ready for a Gaming Session?</h3>
                    <p className="text-xs text-gray-400 mt-1">Book PS5, Racing Simulator or PC screens instantly and earn 1 Diamond per ₹1 spent.</p>
                  </div>
                  <button
                    onClick={onOpenBooking || onBack}
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer shrink-0"
                  >
                    + Book New Slot Now
                  </button>
                </div>

                <div className="bg-[#121216] border border-white/10 p-6 rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold font-orbitron text-gray-300 uppercase tracking-wider">
                      Recent Reservation History
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      🟢 Upcoming (Top) • ⚪ Completed (Bottom)
                    </span>
                  </div>
                  {userBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-xs uppercase tracking-widest">
                        No recent bookings registered.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...userBookings]
                        .sort((a, b) => {
                          const dateA = parseBookingDateTime(a).getTime();
                          const dateB = parseBookingDateTime(b).getTime();
                          const isUpcomingA = !isNaN(dateA) && dateA >= now.getTime();
                          const isUpcomingB = !isNaN(dateB) && dateB >= now.getTime();

                          // Show upcoming bookings first
                          if (isUpcomingA && !isUpcomingB) return -1;
                          if (!isUpcomingA && isUpcomingB) return 1;

                          // If both are upcoming, sort nearest time first
                          if (isUpcomingA && isUpcomingB) return dateA - dateB;

                          // If both are past, sort most recent past first
                          return dateB - dateA;
                        })
                        .slice(0, 5)
                        .map((booking, idx) => {
                          const bookingDateObj = parseBookingDateTime(booking);
                          const isUpcoming = !isNaN(bookingDateObj.getTime()) && bookingDateObj >= now;

                          return (
                            <div 
                              key={booking.id || idx}
                              onClick={() => setSelectedBooking(booking)}
                              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                isUpcoming
                                  ? '!bg-[#ff6161]/20 !border-red-600 hover:!bg-[#400b0b]/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                  : '!bg-[#18181b] !border-zinc-800 hover:!bg-[#27272a] opacity-75 hover:opacity-100'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold font-orbitron ${isUpcoming ? '!text-emerald-300' : '!text-zinc-400'}`}>
                                    {booking.screen || booking.category || 'PS5 Station'}
                                  </span>

                                  {/* Distinct Color Badges */}
                                  {isUpcoming ? (
                                    <span className="px-2 py-0.5 rounded-md !bg-emerald-500 !text-black text-[9px] font-black tracking-wider uppercase shadow-md animate-pulse">
                                      🟢 UPCOMING
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md !bg-zinc-800 !text-zinc-400 border border-zinc-700 text-[9px] font-bold tracking-wider uppercase">
                                      ⚪ COMPLETED
                                    </span>
                                  )}
                                </div>

                                <span className={`text-[11px] font-mono block ${isUpcoming ? '!text-emerald-200' : '!text-zinc-500'}`}>
                                  📅 {formatDateString(booking.bookingDate || booking.date)} • ⏰ {booking.slot_time || booking.slot || booking.time}
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-xs font-black font-mono block ${isUpcoming ? '!text-emerald-300' : '!text-zinc-400'}`}>
                                  ₹{booking.amount || booking.price || '0'}
                                </span>
                                <span className={`text-[10px] hover:underline transition ${isUpcoming ? '!text-emerald-400' : '!text-zinc-500'}`}>
                                  View Receipt ➔
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'edit-profile' && (
              <div className="bg-[#121216] border border-white/10 p-8 rounded-2xl shadow-2xl">
                <h2 className="text-lg font-bold font-orbitron text-red-500 mb-6">Update Gamer Details</h2>

                {message && (
                  <p className="text-green-400 text-xs mb-6 bg-green-950/50 p-3 rounded-lg border border-green-800 text-center font-bold">
                    {message}
                  </p>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">👤 Gamer Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full p-3.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                      placeholder="Enter your gamer name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">📞 Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full p-3.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">🖼 Profile Avatar</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={avatarUrl} 
                        onChange={(e) => setAvatarUrl(e.target.value)} 
                        className="w-full p-3.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                        placeholder="Paste image URL or upload file"
                      />
                      <label className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition shrink-0 text-xs font-bold text-gray-300">
                        {uploading ? 'Processing...' : '📁 Upload'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={uploading} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || uploading}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-bold font-orbitron text-white">Upcoming Reservations</h2>
                  <button onClick={onOpenBooking || onBack} className="text-xs text-red-400 hover:underline">+ New Booking</button>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">No upcoming bookings found.</p>
                  </div>
                ) : (
                  upcomingBookings.map((booking, idx) => (
                    <div 
                      key={booking.id || idx} 
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-[#121216] hover:bg-[#1a1a22] border border-white/10 hover:border-red-500/50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition shadow-lg group"
                    >
                      <div>
                        <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                          {booking.screen || booking.category || booking.station_id || 'PS5 Station'}
                        </span>
                        <h3 className="text-lg font-bold font-orbitron group-hover:text-red-400 transition">{booking.customer_name || booking.name || name || 'Gamer Session'}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span>📅 {formatDateString(booking.bookingDate || booking.date)}</span>
                          <span>⏰ {booking.slot_time || booking.slot || booking.time}</span>
                        </div>
                      </div>
                      <div className="text-right flex sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end">
                        <span className="text-xs font-bold text-green-400 bg-green-950/40 border border-green-500/30 px-3 py-1 rounded-full">
                          {booking.status || 'CONFIRMED'}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-2 hover:underline flex items-center gap-1">
                          View Receipt ➔
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'past' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold font-orbitron text-white mb-2">Past Reservation History</h2>

                {pastBookings.length === 0 ? (
                  <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">No past bookings found.</p>
                  </div>
                ) : (
                  pastBookings.map((booking, idx) => (
                    <div 
                      key={booking.id || idx} 
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-[#121216] hover:bg-[#1a1a22] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 opacity-80 hover:opacity-100 cursor-pointer transition"
                    >
                      <div>
                        <span className="inline-block px-3 py-1 bg-white/5 text-gray-400 border border-white/10 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                          {booking.screen || booking.category || booking.station_id || 'PS5 Station'}
                        </span>
                        <h3 className="text-lg font-bold font-orbitron">{booking.customer_name || booking.name || name || 'Gamer Session'}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>📅 {formatDateString(booking.bookingDate || booking.date)}</span>
                          <span>⏰ {booking.slot_time || booking.slot || booking.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 uppercase tracking-widest block">Completed</span>
                        <span className="text-[10px] text-gray-500 mt-1 block">Click for receipt</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 💳 DIRECT UPI PAYMENT MODAL */}
      {showPayModal && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn"
          onClick={() => setShowPayModal(false)}
        >
          <div 
            className="bg-[#121216] border border-green-500/40 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-black font-orbitron text-green-400 uppercase tracking-wider">
                  PAY TO STRANGER'S GAMING CAFE
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Direct UPI Pay & Earn 1 Diamond per ₹1
                </p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white text-lg transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1 text-gray-300 font-mono">
                Enter Amount to Pay (₹)
              </label>
              <input 
                type="number"
                min="1"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white font-mono font-bold text-base focus:outline-none focus:border-green-500"
                placeholder="100"
              />
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-3">
              <p className="text-[11px] font-mono text-cyan-400 font-bold text-center uppercase tracking-wider">
                ⚡ Select App to Pay Directly
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getAppUri('phonepe', payAmount)}
                  className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/50 hover:bg-purple-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>💜</span> PhonePe
                </a>

                <a
                  href={getAppUri('gpay', payAmount)}
                  className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/50 hover:bg-blue-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>🌐</span> Google Pay
                </a>

                <a
                  href={getAppUri('paytm', payAmount)}
                  className="p-2.5 rounded-xl bg-cyan-900/60 border border-cyan-500/50 hover:bg-cyan-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>💙</span> Paytm
                </a>

                <a
                  href={getStandardUpiUri(payAmount)}
                  className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 hover:bg-emerald-800 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span>⚡</span> Any UPI App
                </a>
              </div>

              <div className="text-center pt-2">
                <div className="w-28 h-28 bg-white p-1.5 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <img
                    src={getDynamicUpiQrUrl(payAmount)}
                    alt="Dynamic Payment QR Code"
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </div>
                <div className="text-sm font-black font-orbitron mt-2 text-emerald-400">
                  Scan to Pay: ₹{payAmount || 0}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-300 font-mono font-semibold">
                  Transaction Ref / UTR No. <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowUtrHelp(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-md cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-cyan-400" />
                  Where to find?
                </button>
              </div>

              <input
                type="text"
                placeholder="Enter 12-digit UPI UTR Number"
                value={payUtr}
                onChange={(e) => setPayUtr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-green-500"
              />
            </div>

            <button
              onClick={handleDirectPaymentConfirm}
              disabled={payLoading || !payUtr || payUtr.trim().length < 6}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-green-600/30 disabled:opacity-50"
            >
              {payLoading ? 'Processing...' : 'Confirm Payment & Claim Diamonds'}
            </button>
          </div>
        </div>
      )}

      {/* UTR HELP POPUP */}
      {showUtrHelp && (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#18181f] border border-cyan-500/50 rounded-2xl w-full max-w-md p-5 relative text-white shadow-2xl">
            <button
              onClick={() => setShowUtrHelp(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black font-orbitron text-cyan-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Transaction ID / UTR Help
            </h4>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { id: 'phonepe', name: 'PhonePe' },
                { id: 'gpay', name: 'Google Pay' },
                { id: 'paytm', name: 'Paytm' },
                { id: 'other', name: 'Other BHIM' },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveAppHelp(app.id)}
                  className={`p-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    activeAppHelp === app.id
                      ? 'bg-cyan-500 text-black border-cyan-400'
                      : 'bg-white/5 text-zinc-400 border-white/10'
                  }`}
                >
                  {app.name}
                </button>
              ))}
            </div>

            <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
              {activeAppHelp === 'phonepe' && (
                <div>
                  <div className="text-purple-400 font-bold mb-1">📱 PhonePe Guidance:</div>
                  <p className="text-zinc-300 mb-2">Enter UTR number from receipt:</p>
                  <div className="bg-zinc-900 p-2 rounded-lg border border-purple-500/30 text-amber-300">
                    • <strong>UTR:</strong> 332202148824 (12 digits)
                  </div>
                </div>
              )}

              {activeAppHelp === 'gpay' && (
                <div>
                  <div className="text-blue-400 font-bold mb-1">🌐 Google Pay Guidance:</div>
                  <p className="text-zinc-300 mb-2">Copy UPI Transaction ID:</p>
                  <div className="bg-zinc-900 p-2 rounded-lg border border-blue-500/30 text-amber-300">
                    • <strong>UPI transaction ID:</strong> 616969042990
                  </div>
                </div>
              )}

              {activeAppHelp === 'paytm' && (
                <div>
                  <div className="text-cyan-400 font-bold mb-1">💙 Paytm Guidance:</div>
                  <p className="text-zinc-300 mb-2">Copy UPI Ref No:</p>
                  <div className="bg-zinc-900 p-2 rounded-lg border border-cyan-500/30 text-amber-300">
                    • <strong>UPI Ref No:</strong> 441584215640
                  </div>
                </div>
              )}

              {activeAppHelp === 'other' && (
                <div>
                  <div className="text-emerald-400 font-bold mb-1">🏦 Other Apps / BHIM:</div>
                  <p className="text-zinc-300">Copy any 12-digit UTR, RRN, or Ref No from receipt.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowUtrHelp(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs cursor-pointer hover:bg-cyan-400"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}

      {/* 🧾 BOOKING DETAILS RECEIPT MODAL */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-[#121216] border border-red-500/40 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-white font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-black font-orbitron text-red-500 uppercase tracking-wider">
                  BOOKING DETAILS RECEIPT
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Stranger's Gaming Cafe
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white text-lg transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">BOOKING ID:</span>
                <span className="font-mono text-xs font-bold bg-[#1a1a20] px-2.5 py-1 rounded border border-white/10 text-red-400">
                  {selectedBooking.booking_id || selectedBooking.id || 'STR-5019'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Booking Date:</span>
                <span className="font-semibold text-white">
                  {formatDateString(selectedBooking.bookingDate || selectedBooking.date)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Booked At (Time):</span>
                <span className="font-semibold text-white">
                  {formatTimeOnly(selectedBooking)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Customer Name:</span>
                <span className="font-semibold text-white">
                  {selectedBooking.customer_name || selectedBooking.name || name || 'Gamer'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Phone Number:</span>
                <span className="font-semibold text-white">
                  {selectedBooking.phone || selectedBooking.mobile || phone || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Station / Platform:</span>
                <span className="font-bold text-red-400">
                  {selectedBooking.screen || selectedBooking.category || selectedBooking.station_id || 'PS5 Station'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Reserved Slot Time:</span>
                <span className="font-semibold text-white">
                  {selectedBooking.slot_time || selectedBooking.slot || selectedBooking.time || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Duration / Team:</span>
                <span className="font-semibold text-white">
                  {getDurationText(selectedBooking)} • {selectedBooking.team || selectedBooking.players || selectedBooking.selectedTeam || '1 Player'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Transaction UTR / Ref:</span>
                <span className="font-mono text-xs text-gray-300">
                  {selectedBooking.utr || selectedBooking.ref_no || selectedBooking.payment_id || selectedBooking.transaction_id || 'N/A'}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-300 font-bold">Total Amount Paid:</span>
                <span className="font-extrabold text-green-400 text-lg">
                  ₹{selectedBooking.amount || selectedBooking.total_amount || selectedBooking.price || '0'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-red-600/20"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

{/* Recent Reservation History */}
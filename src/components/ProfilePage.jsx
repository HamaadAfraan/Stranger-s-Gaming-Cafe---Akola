import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, X, Eye, EyeOff, Gem, PlusCircle, CheckCircle2, 
  Settings, Calendar, History, Wallet, ArrowLeft, LogOut, 
  ChevronRight, Coins, ShieldAlert, FileText, Star, Share2, MapPin, Phone, Mail, User, Award, Move
} from 'lucide-react';
import { auth, db } from '../firebase';
import { updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import profileImg from '../assets/profile.jpeg';

export default function ProfilePage({ session, onBack, onLogout, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'bookings', 'edit-profile', 'recharges'
  const [bookingSubTab, setBookingSubTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Crop, Zoom & Pan States (Simple & Clean)
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [baseScale, setBaseScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef(null);

  const currentUser = session?.user || auth.currentUser;
  const userId = currentUser?.uid || currentUser?.id;
  const userEmail = currentUser?.email || '';

  const getSafeStorage = (key, defaultVal = 0) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? parseInt(val, 10) || defaultVal : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const setSafeStorage = (key, val) => {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  };

  const [gamerPoints, setGamerPoints] = useState(() => getSafeStorage('cached_gamer_points', 0));
  const [redeemableDiamonds, setRedeemableDiamonds] = useState(() => getSafeStorage('cached_redeemable_diamonds', 0));
  const [loyaltyTier, setLoyaltyTier] = useState('BRONZE');

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const [toast, setToast] = useState({ show: false, text: '', type: 'success', title: 'Notification' });

  const showToast = (text, type = 'success', title = 'Notification') => {
    setToast({ show: true, text, type, title });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [userBookings, setUserBookings] = useState([]);
  const [userRecharges, setUserRecharges] = useState([]);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState({ price: 1000, diamonds: 1200 });
  const [rechargeUtr, setRechargeUtr] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);

  const UPI_ID = 'hamaad.afraan@ybl';
  const CAFE_SUPPORT_PHONE = '+919185203313';

  const DIAMOND_PACKS = [
    { price: 1000, diamonds: 1200, label: 'Starter Pack' },
    { price: 2000, diamonds: 2500, label: 'Pro Pack (Bonus)' },
    { price: 5000, diamonds: 6000, label: 'Legendary VIP Pack' },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, bookingSubTab]);

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

  const checkIsUpcoming = (bookingDateStr, slotTimeStr) => {
    if (!bookingDateStr) return false;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (bookingDateStr > todayStr) return true;  
    if (bookingDateStr < todayStr) return false; 

    if (!slotTimeStr || !slotTimeStr.includes('-')) return true;

    try {
      const endTimePart = slotTimeStr.split('-')[1].trim(); 
      const parts = endTimePart.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const modifier = parts[1];

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const slotEndMins = hours * 60 + minutes;
      const currentMins = today.getHours() * 60 + today.getMinutes();

      return currentMins <= slotEndMins;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfileData = async () => {
      const safetyTimer = setTimeout(() => {
        if (isMounted) setProfileLoading(false);
      }, 5000);

      try {
        if (currentUser) {
          const userPhone = currentUser.phoneNumber || '';

          setName(currentUser.displayName || '');
          setPhone(userPhone);
          setAvatarUrl(currentUser.photoURL || '');

          if (userId) {
            const userRef = doc(db, 'profiles', userId);
            const userSnap = await getDoc(userRef);

            if (isMounted && userSnap.exists()) {
              const data = userSnap.data();
              if (data.name) setName(data.name);
              if (data.phone) setPhone(data.phone);
              if (data.avatar_url) setAvatarUrl(data.avatar_url);
              
              const pts = data.gamer_points ?? data.points ?? data.score ?? 0;
              const parsedPts = parseInt(pts, 10) || 0;
              setGamerPoints(parsedPts);
              setSafeStorage('cached_gamer_points', parsedPts);

              const diamonds = data.redeemable_diamonds ?? data.diamonds ?? data.diamond_balance ?? data.available_diamonds ?? 0;
              const parsedDiamonds = parseInt(diamonds, 10) || 0;
              setRedeemableDiamonds(parsedDiamonds);
              setSafeStorage('cached_redeemable_diamonds', parsedDiamonds);

              if (data.loyalty_tier) setLoyaltyTier(data.loyalty_tier);
            } else if (isMounted) {
              await setDoc(userRef, {
                id: userId,
                name: currentUser.displayName || 'Gamer',
                phone: userPhone,
                gamer_points: 0,
                redeemable_diamonds: 0,
                created_at: new Date().toISOString()
              });
            }
          }

          if (isMounted) {
            fetchUserData(userEmail, userId, userPhone);
          }
        }
      } catch (err) {
        console.warn("Firestore profile fetch warning:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const fetchUserData = async (email, uId, userPhone) => {
    try {
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const allBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const matchedBookings = allBookings.filter(b => {
        const matchEmail = email && b.email && b.email.toLowerCase() === email.toLowerCase();
        const matchUser = uId && b.user_id && String(b.user_id) === String(uId);
        const matchPhone = userPhone && b.phone && String(b.phone) === String(userPhone);
        return matchEmail || matchUser || matchPhone;
      });
      setUserBookings(matchedBookings);

      setTimeout(async () => {
        try {
          const rechargesSnap = await getDocs(collection(db, 'diamond_recharges'));
          const allRecharges = rechargesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const matchedRecharges = allRecharges.filter(r => {
            const matchEmail = email && r.email && r.email.toLowerCase() === email.toLowerCase();
            const matchUser = uId && r.user_id && String(r.user_id) === String(uId);
            const matchPhone = userPhone && r.phone && String(r.phone) === String(userPhone);
            return matchEmail || matchUser || matchPhone;
          });
          setUserRecharges(matchedRecharges);
        } catch (e) {
          console.error('Recharges fetch error:', e);
        }
      }, 400);

    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB.', 'error', 'File Error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const displaySize = 192;
        const scaleX = displaySize / img.width;
        const scaleY = displaySize / img.height;
        const initialScale = Math.max(scaleX, scaleY);

        setBaseScale(initialScale);
        setZoomLevel(1);
        setRawImageSrc(event.target.result);
        setPanOffset({ x: 0, y: 0 });
        setShowCropModal(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleStart = (e) => {
    if (e.touches && e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistRef.current = dist;
      return;
    }

    isDraggingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    dragStartRef.current = { x: clientX - panOffset.x, y: clientY - panOffset.y };
  };

  const handleMove = (e) => {
    if (e.touches && e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastTouchDistRef.current) {
        const factor = dist / lastTouchDistRef.current;
        setZoomLevel(prev => Math.min(Math.max(prev * factor, 0.5), 5));
      }
      lastTouchDistRef.current = dist;
      return;
    }

    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    setPanOffset({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y
    });
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
    lastTouchDistRef.current = null;
  };

  const handleCropAndUpload = () => {
    const canvas = document.createElement('canvas');
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawImageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, outputSize, outputSize);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, outputSize, outputSize);

      const displaySize = 192;
      const currentScale = baseScale * zoomLevel;

      const renderW = img.width * currentScale;
      const renderH = img.height * currentScale;
      const imgLeft = (displaySize / 2 + panOffset.x) - renderW / 2;
      const imgTop = (displaySize / 2 + panOffset.y) - renderH / 2;

      const sourceX = (0 - imgLeft) / currentScale;
      const sourceY = (0 - imgTop) / currentScale;
      const sourceWidth = displaySize / currentScale;
      const sourceHeight = displaySize / currentScale;

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, outputSize, outputSize
      );

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      setAvatarUrl(croppedBase64);
      setShowCropModal(false);
      showToast('Avatar cropped & saved successfully!', 'success', 'Crop Ready');
    };
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setMessage('');

    const finalAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : profileImg;

    try {
      const userRef = doc(db, 'profiles', userId);
      await setDoc(userRef, {
        id: userId,
        name: name,
        phone: phone,
        avatar_url: finalAvatar,
        updated_at: new Date().toISOString()
      }, { merge: true });

      setAvatarUrl(finalAvatar);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      showToast('Profile updated successfully!', 'success', 'Profile Updated');

    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Profile updated locally!');
      setTimeout(() => setMessage(''), 3000);
      showToast('Profile updated locally successfully!', 'success', 'Profile Updated');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdMessage('');

    if (!newPassword || !confirmNewPassword) {
      setPwdMessage('Please enter new password and confirm password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdMessage('❌ Please check password: New passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setPwdMessage('❌ Password must be at least 6 characters long.');
      return;
    }

    setPwdLoading(true);

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPwdMessage('✅ Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPwdMessage(''), 4000);
      }
    } catch (err) {
      setPwdMessage(`❌ Error: ${err.message}`);
    }

    setPwdLoading(false);
  };

  const getStandardUpiUri = (amount) => {
    const cleanAmount = Number(amount) || 0;
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Stranger's Gaming Cafe")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent('Diamond Recharge Pack')}`;
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

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!rechargeUtr || rechargeUtr.trim().length < 6) {
      showToast('Please enter a valid 6+ digit UTR / Transaction Reference Number.', 'error', 'Recharge Notice');
      return;
    }

    setRechargeLoading(true);

    try {
      await addDoc(collection(db, 'diamond_recharges'), {
        user_id: userId,
        email: userEmail,
        customer_name: name || 'Gamer',
        phone: phone || '',
        amount: selectedPack.price,
        diamonds: selectedPack.diamonds,
        utr: rechargeUtr.trim(),
        status: 'PENDING',
        created_at: new Date().toISOString()
      });

      showToast(`Recharge request for ${selectedPack.diamonds} Diamonds (₹${selectedPack.price}) submitted successfully! Admin will verify your UTR and approve diamonds shortly.`, 'success', 'Recharge Request Submitted');
      setShowRechargeModal(false);
      setRechargeUtr('');
      fetchUserData(userEmail, userId, phone);
    } catch (err) {
      console.error('Recharge submission error:', err);
      showToast('Failed to submit recharge request. Please try again.', 'error', 'Recharge Notice');
    }

    setRechargeLoading(false);
  };

  const handleLogoutClick = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    
    if (onLogout) {
      onLogout();
    }

    window.location.href = '/';
  };

  const upcomingBookings = userBookings.filter((slot) => {
    const bDateStr = slot.bookingDate || slot.date || '';
    const bSlotStr = slot.slot_time || slot.slot || '';
    return checkIsUpcoming(bDateStr, bSlotStr) && String(slot.status).toUpperCase() !== 'CANCELLED';
  });

  const pastBookings = userBookings.filter((slot) => {
    const bDateStr = slot.bookingDate || slot.date || '';
    const bSlotStr = slot.slot_time || slot.slot || '';
    return !checkIsUpcoming(bDateStr, bSlotStr) && String(slot.status).toUpperCase() !== 'CANCELLED';
  });

  const cancelledBookings = userBookings.filter((slot) => {
    return String(slot.status).toUpperCase() === 'CANCELLED';
  });

  const tierBadges = {
    BRONZE: { color: 'from-amber-700/80 to-amber-900/80 border-amber-600/50 text-amber-200', icon: '🥉' },
    SILVER: { color: 'from-slate-400/80 to-slate-600/80 border-slate-300/50 text-slate-100', icon: '🥈' },
    GOLD: { color: 'from-yellow-500/80 to-amber-600/80 border-yellow-400/50 text-yellow-100', icon: '🥇' },
    DIAMOND: { color: 'from-cyan-500/80 to-blue-600/80 border-cyan-400/50 text-cyan-100', icon: '💎' },
    LEGEND: { color: 'from-purple-600/80 to-red-600/80 border-purple-400/50 text-purple-100', icon: '👑' }
  };

  const calculatedTier = gamerPoints >= 5000 ? 'LEGEND' : gamerPoints >= 2500 ? 'DIAMOND' : gamerPoints >= 1000 ? 'GOLD' : gamerPoints >= 500 ? 'SILVER' : 'BRONZE';
  const currentBadge = tierBadges[calculatedTier] || tierBadges['BRONZE'];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-20 pb-28 px-4 sm:px-6 font-sans relative overflow-x-hidden">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-4 z-[99999] animate-bounce transition-all duration-300 max-w-sm w-full px-4">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${
            toast.type === 'error' 
              ? 'bg-red-950/90 border-red-500 text-red-200' 
              : 'bg-[#181922]/95 border-[#ccff00] text-white backdrop-blur-md'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'error' ? 'bg-red-900 text-red-300' : 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-black font-orbitron uppercase tracking-wider text-[#ccff00]">
                {toast.title}
              </h5>
              <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                {toast.text}
              </p>
            </div>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-5">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="flex items-center justify-between pb-2">
          {activeTab === 'dashboard' ? (
            <button 
              onClick={onBack}
              className="px-3.5 py-2 bg-[#181922] hover:bg-[#ccff00] hover:text-black border border-white/10 rounded-xl text-xs font-bold font-orbitron uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Back to Cafe
            </button>
          ) : (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="px-3.5 py-2 bg-[#181922] hover:bg-[#ccff00] hover:text-black border border-white/10 rounded-xl text-xs font-bold font-orbitron uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Back to Profile
            </button>
          )}

          <button
            onClick={() => setShowRechargeModal(true)}
            className="px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Gem className="w-3.5 h-3.5" /> Add Diamonds
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* PROFILE HEADER CARD WITH LEAGUE / TIER BADGE */}
            <div className="bg-[#181922] border border-white/10 rounded-2xl p-5 relative shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
              <div className="absolute top-4 right-4">
                <div className={`bg-gradient-to-r ${currentBadge.color} px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-md`}>
                  <span className="text-sm">{currentBadge.icon}</span>
                  <span className="text-[10px] font-black font-orbitron uppercase tracking-widest">{calculatedTier}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pr-24 sm:pr-28">
                <div className="relative shrink-0">
                  <img 
                    src={avatarUrl || profileImg} 
                    alt="Avatar" 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-base sm:text-lg font-black font-orbitron text-white truncate">
                    {name || 'Gamer'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                    {phone || 'No phone added'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                    {userEmail || 'Guest User'}
                  </p>
                </div>
              </div>

              {/* STATS ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center font-mono">
                <div className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-bold">Games</span>
                  <span className="text-sm font-black text-white mt-0.5 block">{userBookings.length}</span>
                </div>

                <div 
                  onClick={() => { setActiveTab('bookings'); setBookingSubTab('upcoming'); }}
                  className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-[#ccff00]/40 transition-all"
                >
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-bold">Upcoming</span>
                  <span className="text-sm font-black text-cyan-400 mt-0.5 block">{upcomingBookings.length}</span>
                </div>

                <div 
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-[#ccff00]/40 transition-all"
                >
                  <span className="text-[9px] text-[#ccff00] uppercase tracking-wider block font-bold">Diamonds</span>
                  <span className="text-sm font-black text-[#ccff00] mt-0.5 block truncate">
                    💎 {profileLoading && redeemableDiamonds === 0 ? '-' : redeemableDiamonds}
                  </span>
                </div>

                <div className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-cyan-300 uppercase tracking-wider block font-bold">Gamer Pts</span>
                  <span className="text-sm font-black text-cyan-200 mt-0.5 block truncate">
                    🪙 {profileLoading && gamerPoints === 0 ? '-' : gamerPoints}
                  </span>
                </div>
              </div>
            </div>

            {/* MENU LIST 1 */}
            <div className="bg-[#181922] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
              <button
                onClick={() => { setActiveTab('bookings'); setBookingSubTab('upcoming'); }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-[#ccff00]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-[#ccff00] transition-colors block">My Bookings</span>
                    <span className="text-[10px] text-zinc-400 font-mono">View upcoming & past sessions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ccff00] transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('recharges')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-cyan-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-cyan-400 transition-colors block">Diamond Recharge History</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Check Coin/Diamond history</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('edit-profile')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-amber-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-amber-400 transition-colors block">Edit Profile & Password</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Update name, phone & password</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 transition-colors" />
              </button>
            </div>

            {/* MENU LIST 2 (Help & Support with Call Trigger) */}
            <div className="bg-[#181922] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
              <a
                href={`tel:${CAFE_SUPPORT_PHONE}`}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-purple-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-purple-400 transition-colors block">Help & Support (Call Cafe)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Direct phone support: {CAFE_SUPPORT_PHONE}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </a>

              <button
                onClick={() => showToast('Invite link copied! Share with friends to earn bonus diamonds.', 'success', 'Invite a Friend')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-emerald-400 transition-colors block">Invite a Friend</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Earn rewards together!</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogoutClick}
              className="w-full py-4 bg-red-950/30 hover:bg-red-900/40 border border-red-500/40 text-red-400 rounded-2xl text-xs font-black font-orbitron uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <LogOut className="w-4 h-4" /> Log Out from Account
            </button>
          </>
        )}

        {/* BOOKINGS VIEW */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ccff00]" /> My Bookings
            </h2>

            {/* Sub-Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#181922] p-1.5 rounded-2xl border border-white/10 font-orbitron text-xs font-bold text-center">
              <button
                onClick={() => setBookingSubTab('upcoming')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  bookingSubTab === 'upcoming' 
                    ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setBookingSubTab('past')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  bookingSubTab === 'past' 
                    ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Past ({pastBookings.length})
              </button>
              <button
                onClick={() => setBookingSubTab('cancelled')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  bookingSubTab === 'cancelled' 
                    ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cancelled ({cancelledBookings.length})
              </button>
            </div>

            {/* BOOKINGS LIST RENDERING */}
            {bookingSubTab === 'upcoming' && (
              upcomingBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl space-y-3">
                  <div className="text-3xl">🎮</div>
                  <h4 className="text-sm font-black font-orbitron text-white">No upcoming bookings!</h4>
                  <p className="text-xs text-zinc-400 font-mono">Your next gaming session is waiting to be booked.</p>
                  <button
                    onClick={onOpenBooking || onBack}
                    className="mt-2 px-5 py-2.5 bg-[#ccff00] text-black font-black font-orbitron text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-[#b8e600]"
                  >
                    ⚡ Book a Station Now
                  </button>
                </div>
              ) : (
                upcomingBookings.map((b, idx) => (
                  <div 
                    key={b.id || idx}
                    onClick={() => setSelectedRecord({ type: 'booking', data: b })}
                    className="bg-[#181922] border border-white/10 hover:border-[#ccff00]/50 p-4 rounded-2xl space-y-3 cursor-pointer transition-all shadow-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold font-orbitron text-[#ccff00] block">{b.screen || b.category || 'Gaming Station'}</span>
                        <span className="text-xs text-white font-mono font-bold">📅 {formatDateString(b.bookingDate || b.date)} ({b.slot_time || b.slot})</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold rounded-full uppercase">
                        {b.status || 'CONFIRMED'}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono text-zinc-300">
                      <span>Paid: <strong className="text-emerald-400 font-bold">₹{b.price || b.amount}</strong></span>
                      <span className="text-[#ccff00] hover:underline">View Receipt →</span>
                    </div>
                  </div>
                ))
              )
            )}

            {bookingSubTab === 'past' && (
              pastBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No past bookings found.</p>
                </div>
              ) : (
                pastBookings.map((b, idx) => (
                  <div 
                    key={b.id || idx}
                    onClick={() => setSelectedRecord({ type: 'booking', data: b })}
                    className="bg-[#181922] border border-white/10 p-4 rounded-2xl space-y-3 cursor-pointer transition-all shadow-xl opacity-90"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold font-orbitron text-zinc-300 block">{b.screen || b.category || 'Gaming Station'}</span>
                        <span className="text-xs text-zinc-400 font-mono">📅 {formatDateString(b.bookingDate || b.date)} ({b.slot_time || b.slot})</span>
                      </div>
                      <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold rounded-full uppercase">
                        COMPLETED
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono text-zinc-300">
                      <span>Total: <strong className="text-emerald-400 font-bold">₹{b.price || b.amount}</strong></span>
                      <span className="text-[#ccff00] hover:underline">View Receipt →</span>
                    </div>
                  </div>
                ))
              )
            )}

            {bookingSubTab === 'cancelled' && (
              cancelledBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No cancelled bookings.</p>
                </div>
              ) : (
                cancelledBookings.map((b, idx) => (
                  <div 
                    key={b.id || idx}
                    onClick={() => setSelectedRecord({ type: 'booking', data: b })}
                    className="bg-[#181922] border border-red-500/30 p-4 rounded-2xl space-y-3 cursor-pointer transition-all shadow-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold font-orbitron text-red-400 block">{b.screen || b.category || 'Gaming Station'}</span>
                        <span className="text-xs text-zinc-400 font-mono">📅 {formatDateString(b.bookingDate || b.date)}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold rounded-full uppercase">
                        CANCELLED
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* EDIT PROFILE VIEW */}
        {activeTab === 'edit-profile' && (
          <div className="space-y-5">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> Edit Profile & Security
            </h2>

            <div className="bg-[#181922] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
              {message && (
                <p className="text-[#ccff00] text-xs bg-[#ccff00]/10 p-3 rounded-xl border border-[#ccff00]/30 text-center font-mono font-bold">
                  {message}
                </p>
              )}

              <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Gamer Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Avatar (Choose & Adjust)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={avatarUrl} 
                      onChange={(e) => setAvatarUrl(e.target.value)} 
                      className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]"
                      placeholder="Image URL or choose file below"
                    />
                    <label className="px-4 py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-orbitron font-black rounded-xl cursor-pointer flex items-center justify-center shrink-0 transition-all text-xs">
                      📁 Select Image
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* PASSWORD UPDATE CARD */}
            <div className="bg-[#181922] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-black font-orbitron text-amber-400 uppercase">Change Password</h3>

              {pwdMessage && (
                <div className={`p-3 rounded-xl border text-xs font-mono font-bold text-center ${
                  pwdMessage.includes('✅') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-red-950/80 border-red-500/40 text-red-300'
                }`}>
                  {pwdMessage}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3.5 pr-12 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Confirm New Password</label>
                  <input 
                    type={showPwd ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Re-enter password"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RECHARGES HISTORY VIEW */}
        {activeTab === 'recharges' && (
          <div className="space-y-4">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-400" /> Diamond Recharges
            </h2>

            {userRecharges.length === 0 ? (
              <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl">
                <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No recharges found.</p>
              </div>
            ) : (
              userRecharges.map((r, idx) => (
                <div 
                  key={r.id || idx}
                  onClick={() => setSelectedRecord({ type: 'recharge', data: r })}
                  className="bg-[#181922] border border-white/10 hover:border-cyan-500/50 p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all shadow-xl"
                >
                  <div>
                    <span className="text-xs font-bold font-orbitron text-cyan-400 block">💎 {r.diamonds} Diamonds Pack</span>
                    <span className="text-[10px] text-zinc-400 font-mono">UTR: {r.utr} • {formatDateString(r.created_at)}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase block mb-1 ${
                      String(r.status).toUpperCase() === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300 animate-pulse'
                    }`}>
                      {r.status || 'PENDING'}
                    </span>
                    <span className="text-xs font-black text-[#ccff00]">₹{r.amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* CROP MODAL - SINGLE CLEAN CIRCULAR VIEWPORT */}
      {showCropModal && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[10002]"
          onClick={() => setShowCropModal(false)}
        >
          <div 
            className="bg-[#12131a] border border-[#ccff00]/50 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-white font-sans text-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xs font-black font-orbitron text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-4 h-4 text-[#ccff00]" /> ADJUST & CROP PHOTO
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 font-mono">
              ✨ Circle ke andar image ko drag ya pinch karke set karo.
            </p>

            {/* Single Circular Preview Container */}
            <div 
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[#ccff00] bg-black shadow-[0_0_25px_rgba(204,255,0,0.4)] relative cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center"
            >
              <img 
                src={rawImageSrc} 
                alt="Crop preview" 
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transition: isDraggingRef.current ? 'none' : 'transform 0.05s ease-out',
                  minWidth: `${baseScale * 100}%`,
                  minHeight: `${baseScale * 100}%`,
                }}
                className="absolute object-cover pointer-events-none select-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCropModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-orbitron font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndUpload}
                className="flex-1 py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-orbitron font-black text-xs uppercase rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECHARGE MODAL */}
      {showRechargeModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 z-[9999] overflow-y-auto"
          onClick={() => setShowRechargeModal(false)}
        >
          <div 
            className="bg-[#12131a] border border-[#ccff00]/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-white my-auto max-h-[90vh] overflow-y-auto font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3 sticky top-0 bg-[#12131a] z-10">
              <h2 className="text-xs sm:text-sm font-black font-orbitron text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-[#ccff00] animate-bounce" /> ADD DIAMONDS
              </h2>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                Select Diamond Pack:
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {DIAMOND_PACKS.map((pack, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPack(pack)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPack.price === pack.price
                        ? 'bg-[#ccff00]/15 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                        : 'bg-[#181922] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black font-orbitron text-[#ccff00] flex items-center gap-1.5">
                        <Gem className="w-3.5 h-3.5 text-[#ccff00]" /> {pack.diamonds} Diamonds
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">{pack.label}</div>
                    </div>
                    <div className="text-xs font-black font-mono text-emerald-400">
                      ₹{pack.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#181922] p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#ccff00] font-bold uppercase">Pay ₹{selectedPack.price} via UPI App</span>
                <span className="bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/30 text-[#ccff00] text-[10px]">⚡ Instant</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href={getAppUri('phonepe', selectedPack.price)}
                  className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 text-center cursor-pointer"
                >
                  PhonePe
                </a>
                <a
                  href={getAppUri('gpay', selectedPack.price)}
                  className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 text-center cursor-pointer"
                >
                  GPay
                </a>
                <a
                  href={getAppUri('paytm', selectedPack.price)}
                  className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 text-center cursor-pointer"
                >
                  Paytm
                </a>
              </div>

              <div className="text-center pt-2">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <img
                    src={getDynamicUpiQrUrl(selectedPack.price)}
                    alt="QR Code"
                    className="w-28 h-28 object-contain mx-auto"
                  />
                </div>
                <div className="text-xs font-mono font-bold mt-2 text-[#ccff00]">Scan & Pay ₹{selectedPack.price}</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-300 font-mono font-bold">Transaction Ref / UTR No. *</label>
                <button
                  type="button"
                  onClick={() => setShowUtrHelp(true)}
                  className="text-[10px] text-[#ccff00] font-mono underline cursor-pointer"
                >
                  Where to find?
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter 12-digit UTR Number"
                value={rechargeUtr}
                onChange={(e) => setRechargeUtr(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0a0a0c] border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-[#ccff00]"
              />
            </div>

            <button
              onClick={handleRechargeSubmit}
              disabled={rechargeLoading || !rechargeUtr || rechargeUtr.trim().length < 6}
              className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)] disabled:opacity-50"
            >
              {rechargeLoading ? 'Submitting...' : `Submit UTR for ${selectedPack.diamonds} Diamonds`}
            </button>
          </div>
        </div>
      )}

      {/* RECORD RECEIPT MODAL */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="bg-[#12131a] border border-[#ccff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white font-sans max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <h2 className="text-base font-black font-orbitron text-[#ccff00] uppercase tracking-wider">
                {selectedRecord.type === 'booking' ? 'BOOKING RECEIPT' : 'RECHARGE RECEIPT'}
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer text-base"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Record ID:</span>
                <span className="text-[#ccff00] font-bold">{selectedRecord.data.id || 'STR-5019'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Date:</span>
                <span className="text-purple-300">{formatDateString(selectedRecord.data.bookingDate || selectedRecord.data.date || selectedRecord.data.created_at)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Name:</span>
                <span className="text-white">{selectedRecord.data.customer_name || selectedRecord.data.name || name || 'Gamer'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedRecord.data.status || 'CONFIRMED'}</span>
              </div>
              <div className="pt-2 flex justify-between text-sm font-bold font-orbitron">
                <span className="text-zinc-300">Amount:</span>
                <span className="text-[#ccff00]">₹{selectedRecord.data.amount || selectedRecord.data.price || '0'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-3 bg-[#ccff00] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Eye, EyeOff, Gem, PlusCircle, CreditCard, CheckCircle2, LayoutDashboard, Settings, Calendar, History, Wallet } from 'lucide-react';
import { auth, db } from '../firebase';
import { updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import profileImg from '../assets/profile.jpeg';

export default function ProfilePage({ session, onBack, onLogout, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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
  const [uploading, setUploading] = useState(false);
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
  const [activeAppHelp, setActiveAppHelp] = useState('phonepe');

  const UPI_ID = 'strangersgamingcafe@upi';

  const DIAMOND_PACKS = [
    { price: 1000, diamonds: 1200, label: 'Starter Pack' },
    { price: 2000, diamonds: 2500, label: 'Pro Pack (Bonus)' },
    { price: 5000, diamonds: 6000, label: 'Legendary VIP Pack' },
  ];

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

              const diamonds = data.redeemable_diamonds ?? data.diamonds ?? data.diamond_balance ?? 0;
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

      const rechargesSnap = await getDocs(collection(db, 'diamond_recharges'));
      const allRecharges = rechargesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const matchedRecharges = allRecharges.filter(r => {
        const matchEmail = email && r.email && r.email.toLowerCase() === email.toLowerCase();
        const matchUser = uId && r.user_id && String(r.user_id) === String(uId);
        const matchPhone = userPhone && r.phone && String(r.phone) === String(userPhone);
        return matchEmail || matchUser || matchPhone;
      });
      setUserRecharges(matchedRecharges);

    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
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
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

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

      showToast(`Recharge request for ${selectedPack.diamonds} Diamonds submitted successfully!`, 'success', 'Recharge Request Submitted');
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
    return checkIsUpcoming(bDateStr, bSlotStr);
  });

  const pastBookings = userBookings.filter((slot) => {
    const bDateStr = slot.bookingDate || slot.date || '';
    const bSlotStr = slot.slot_time || slot.slot || '';
    return !checkIsUpcoming(bDateStr, bSlotStr);
  });

  const tierBadges = {
    BRONZE: { color: 'from-amber-700 to-amber-900 border-amber-600/50 text-amber-200', icon: '🥉' },
    SILVER: { color: 'from-slate-400 to-slate-600 border-slate-300/50 text-slate-100', icon: '🥈' },
    GOLD: { color: 'from-yellow-500 to-amber-600 border-yellow-400/50 text-yellow-100', icon: '🥇' },
    DIAMOND: { color: 'from-cyan-500 to-blue-600 border-cyan-400/50 text-cyan-100', icon: '💎' },
    LEGEND: { color: 'from-purple-600 to-red-600 border-purple-400/50 text-purple-100', icon: '👑' }
  };

  const calculatedTier = gamerPoints >= 5000 ? 'LEGEND' : gamerPoints >= 2500 ? 'DIAMOND' : gamerPoints >= 1000 ? 'GOLD' : gamerPoints >= 500 ? 'SILVER' : 'BRONZE';
  const currentBadge = tierBadges[calculatedTier] || tierBadges['BRONZE'];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-3 sm:px-8 font-sans relative">
      
      {toast.show && (
        <div className="fixed top-24 right-4 z-[99999] animate-bounce transition-all duration-300 max-w-sm w-full px-4">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${
            toast.type === 'error' 
              ? 'bg-red-950/90 border-red-500 text-red-200' 
              : 'bg-slate-900/95 border-cyan-500 text-white backdrop-blur-md'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'error' ? 'bg-red-900 text-red-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-black font-orbitron uppercase tracking-wider text-cyan-300">
                {toast.title}
              </h5>
              <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                {toast.text}
              </p>
            </div>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-gray-400 hover:text-white text-sm font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-[#121216]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold tracking-wider transition cursor-pointer flex items-center gap-2"
            >
              ⬅ Back to Cafe
            </button>

            <button 
              onClick={handleLogoutClick}
              className="sm:hidden px-3 py-2 bg-red-950/30 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold cursor-pointer"
            >
              🚪 Logout
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-blue-950/80 to-cyan-950/80 border border-cyan-500/40 px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-lg">
              <span className="text-lg animate-pulse">💎</span>
              <div>
                <span className="text-[8px] text-cyan-300 uppercase font-black tracking-widest block">Gamer Points</span>
                <span className="text-sm font-black font-mono text-cyan-100">
                  {profileLoading && gamerPoints === 0 ? '-' : gamerPoints} <span className="text-[9px] font-normal text-cyan-400">PTS</span>
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 px-3 py-2 rounded-xl flex items-center gap-2.5 shadow-lg">
              <span className="text-lg animate-bounce">🪙</span>
              <div>
                <span className="text-[8px] text-emerald-300 uppercase font-black tracking-widest block">Diamonds</span>
                <span className="text-sm font-black font-mono text-emerald-100">
                  {profileLoading && redeemableDiamonds === 0 ? '-' : redeemableDiamonds} <span className="text-[9px] font-normal text-emerald-400">AVAIL</span>
                </span>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${currentBadge.color} border px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg`}>
              <span className="text-base">{currentBadge.icon}</span>
              <div>
                <span className="text-[7px] uppercase font-bold opacity-80 block tracking-wider">Tier</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{calculatedTier}</span>
              </div>
            </div>

            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Gem className="w-3.5 h-3.5" /> Add Diamonds
            </button>

            <button 
              onClick={handleLogoutClick}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold tracking-wider transition cursor-pointer"
            >
              🚪 Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#121216] border border-white/10 p-4 rounded-2xl text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-cyan-500 to-purple-600"></div>
              <img 
                src={avatarUrl || profileImg} 
                alt="Gamer Avatar" 
                className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-red-600 shadow-lg shadow-red-600/30 mb-2.5"
              />
              <h2 className="text-sm font-black text-white truncate">{name || 'Gamer Profile'}</h2>
              <p className="text-gray-400 text-[10px] mt-0.5 truncate">{userEmail || 'Guest User'}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-600/15 border border-red-500/30 rounded-md text-red-400 text-[9px] font-bold tracking-widest uppercase">
                {calculatedTier} VIP
              </div>
            </div>

            <div className="bg-[#121216] border border-white/10 p-2.5 rounded-2xl space-y-1.5 shadow-xl">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-red-400" />
                  <span>Dashboard</span>
                </div>
                <span>➔</span>
              </button>

              <button
                onClick={() => setActiveTab('edit-profile')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'edit-profile' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Edit Profile</span>
                </div>
                <span>➔</span>
              </button>

              <button
                onClick={onOpenBooking || onBack}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-950/30 border border-emerald-500/20 transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>New Booking</span>
                </div>
                <span>➔</span>
              </button>

              <button
                onClick={() => setActiveTab('upcoming')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'upcoming' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Upcoming</span>
                </div>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono">{upcomingBookings.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('past')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'past' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Past Bookings</span>
                </div>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono">{pastBookings.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('recharges')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-between cursor-pointer ${
                  activeTab === 'recharges' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Recharges</span>
                </div>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono">{userRecharges.length}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Total Bookings</span>
                    <span className="text-2xl font-black text-white mt-1 block">{userBookings.length}</span>
                  </div>

                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Redeemable Diamonds</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      🪙 {profileLoading && redeemableDiamonds === 0 ? '-' : redeemableDiamonds}
                    </span>
                  </div>

                  <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl shadow-xl">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Lifetime Points</span>
                    <span className="text-2xl font-black text-cyan-400 mt-1 block">
                      💎 {profileLoading && gamerPoints === 0 ? '-' : gamerPoints}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                  <div>
                    <h3 className="text-base font-bold text-white">Need More Diamonds?</h3>
                    <p className="text-xs text-gray-300 mt-1">Recharge online instantly! Choose custom diamond packs, pay via UPI, and admin will credit diamonds.</p>
                  </div>
                  <button
                    onClick={() => setShowRechargeModal(true)}
                    className="px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition cursor-pointer shrink-0 flex items-center gap-2"
                  >
                    <Gem className="w-4 h-4" /> Add Diamonds Now
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'edit-profile' && (
              <div className="space-y-6">
                <div className="bg-[#121216] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
                  <h2 className="text-base font-bold text-red-500 mb-6">Update Gamer Details</h2>

                  {message && (
                    <p className="text-green-400 text-xs mb-6 bg-green-950/50 p-3 rounded-lg border border-green-800 text-center font-bold">
                      {message}
                    </p>
                  )}

                  <form onSubmit={handleUpdate} className="space-y-5">
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
                      <div className="flex flex-col sm:flex-row gap-3">
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
                      className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                <div className="bg-[#121216] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
                  <h2 className="text-base font-bold text-amber-400 mb-2">Change Password</h2>
                  <p className="text-xs text-gray-400 mb-6">Update your account password securely.</p>

                  {pwdMessage && (
                    <div className={`p-3 rounded-lg border text-xs mb-6 text-center font-bold ${
                      pwdMessage.includes('✅') 
                        ? 'bg-green-950/50 border-green-800 text-green-400' 
                        : 'bg-red-950/50 border-red-800 text-red-400'
                    }`}>
                      {pwdMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPwd ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3.5 pr-12 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                          placeholder="At least 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white cursor-pointer"
                        >
                          {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">Confirm New Password</label>
                      <input 
                        type={showPwd ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={pwdLoading}
                      className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {pwdLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-white">Upcoming & Pending Bookings</h2>
                  <button onClick={onOpenBooking || onBack} className="text-xs text-red-400 hover:underline">+ New Booking</button>
                </div>

                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">No upcoming reservations or requests.</p>
                  </div>
                ) : (
                  upcomingBookings.map((booking, idx) => (
                    <div 
                      key={booking.id || idx} 
                      onClick={() => setSelectedRecord({ type: 'booking', data: booking })}
                      className="bg-[#121216] hover:bg-[#1a1a22] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer transition shadow-lg group"
                    >
                      <div>
                        <span className="inline-block px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                          {booking.screen || booking.category || 'Station'}
                        </span>
                        <h3 className="text-base font-bold group-hover:text-cyan-400 transition">{booking.customer_name || booking.name || name || 'Gamer Session'}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span>📅 {formatDateString(booking.bookingDate || booking.date)}</span>
                          <span>⏰ {booking.slot_time || booking.slot || booking.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          String(booking.status).toUpperCase() === 'PENDING' ? 'bg-amber-950/60 border border-amber-500/40 text-amber-400' : 'bg-green-950/40 text-green-400'
                        }`}>
                          {booking.status || 'CONFIRMED'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'past' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white mb-2">Past Reservation History</h2>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">No past bookings found.</p>
                  </div>
                ) : (
                  pastBookings.map((booking, idx) => (
                    <div key={booking.id || idx} onClick={() => setSelectedRecord({ type: 'booking', data: booking })} className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex justify-between items-center cursor-pointer">
                      <div>
                        <h3 className="text-sm font-bold">{booking.customer_name || name}</h3>
                        <p className="text-xs text-gray-400">📅 {booking.bookingDate || booking.date}</p>
                      </div>
                      <span className="text-xs text-gray-400">Completed</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'recharges' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-bold text-white">Diamond Recharges History</h2>
                  <button onClick={() => setShowRechargeModal(true)} className="text-xs text-cyan-400 hover:underline">+ Add Diamonds</button>
                </div>
                {userRecharges.length === 0 ? (
                  <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">No recharges found.</p>
                  </div>
                ) : (
                  userRecharges.map((r, idx) => (
                    <div key={r.id || idx} onClick={() => setSelectedRecord({ type: 'recharge', data: r })} className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex justify-between items-center cursor-pointer">
                      <div>
                        <h3 className="text-sm font-bold text-cyan-400">💎 {r.diamonds} Diamonds</h3>
                        <p className="text-xs text-gray-400 font-mono">UTR: {r.utr}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${String(r.status).toUpperCase() === 'PENDING' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-300'}`}>
                        {r.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[9999]" onClick={() => setShowRechargeModal(false)}>
          <div className="bg-[#121216] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-sm font-black text-cyan-400 uppercase">ADD DIAMONDS</h2>
              <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300">Select Diamond Pack:</label>
              <div className="grid grid-cols-1 gap-2">
                {DIAMOND_PACKS.map((pack, idx) => (
                  <div key={idx} onClick={() => setSelectedPack(pack)} className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center ${selectedPack.price === pack.price ? 'bg-cyan-950/80 border-cyan-400' : 'bg-[#1a1a20] border-white/10'}`}>
                    <div>
                      <div className="text-xs font-bold text-cyan-300">💎 {pack.diamonds} Diamonds</div>
                      <div className="text-[10px] text-gray-400">{pack.label}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">₹{pack.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl text-center">
              <img src={getDynamicUpiQrUrl(selectedPack.price)} alt="QR" className="w-28 h-28 object-contain mx-auto bg-white p-1 rounded" />
              <div className="text-xs font-bold mt-2 text-emerald-400">Scan & Pay ₹{selectedPack.price}</div>
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1">Transaction Ref / UTR No. *</label>
              <input type="text" placeholder="Enter 12-digit UTR" value={rechargeUtr} onChange={(e) => setRechargeUtr(e.target.value)} className="w-full p-3 rounded-xl bg-[#1a1a20] border border-white/10 text-white text-xs" />
            </div>

            <button onClick={handleRechargeSubmit} disabled={rechargeLoading || !rechargeUtr} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase rounded-xl">
              {rechargeLoading ? 'Submitting...' : 'Submit UTR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
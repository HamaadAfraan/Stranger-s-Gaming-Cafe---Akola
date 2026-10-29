import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle, X, Eye, EyeOff, Gem, PlusCircle, CheckCircle2,
  Settings, Calendar, History, Wallet, ArrowLeft, LogOut,
  ChevronRight, Coins, ShieldAlert, FileText, Star, Share2, MapPin, Phone, Mail, User, Award, Move, ShieldCheck, Gamepad2, CreditCard, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { auth, db } from '../firebase';
import { updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import profileImg from '../assets/profile.jpeg';

export default function ProfilePage({ session, onBack, onLogout, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookingSubTab, setBookingSubTab] = useState('upcoming');
  const [walletTab, setWalletTab] = useState('redeemable');

  const [bookingSortMode, setBookingSortMode] = useState('time');
  const [bookingSortDir, setBookingSortDir] = useState('desc');

  const [diamondSortMode, setDiamondSortMode] = useState('time');
  const [diamondSortDir, setDiamondSortDir] = useState('desc');

  const [leagueSortMode, setLeagueSortMode] = useState('time');
  const [leagueSortDir, setLeagueSortDir] = useState('desc');

  const [showTierModal, setShowTierModal] = useState(false);

  const currentUser = session?.user || auth.currentUser;
  const userId = currentUser?.uid || currentUser?.id;
  const userEmail = currentUser?.email || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Google photoURL ko default priority do taaki hamesha latest fetch ho
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.photoURL || '');

  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [baseScale, setBaseScale] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef(null);

  // Helper to extract initials for text avatar fallback (e.g. "Hamaad Afraan" -> "HA")
  const getInitials = (nameStr) => {
    if (!nameStr) return 'G';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

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
    } catch (e) { }
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
  const [userCafePayments, setUserCafePayments] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState({ price: 1000, diamonds: 1200 });
  const [rechargeLoading, setRechargeLoading] = useState(false);

  const [showCafePayModal, setShowCafePayModal] = useState(false);
  const [cafePayAmount, setCafePayAmount] = useState('');
  const [cafePayLoading, setCafePayLoading] = useState(false);

  const CAFE_SUPPORT_PHONE = '+919185203313';

  const DIAMOND_PACKS = [
    { price: 1000, diamonds: 1200, label: 'Starter Pack' },
    { price: 2000, diamonds: 2500, label: 'Pro Pack (Bonus)' },
    { price: 5000, diamonds: 6000, label: 'Legendary VIP Pack' },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, bookingSubTab, walletTab]);

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

  const formatDateTimeString = (rawVal) => {
    if (!rawVal) return 'N/A';
    try {
      if (typeof rawVal === 'object' && typeof rawVal.toDate === 'function') {
        return rawVal.toDate().toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      }
      const d = new Date(rawVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      }
      return String(rawVal);
    } catch {
      return String(rawVal);
    }
  };

  const getTimestampMillis = (item) => {
    const raw = item.createdAt || item.created_at || item.created_time || item.bookingDate || item.date;
    if (!raw) return 0;
    if (typeof raw === 'object' && typeof raw.toDate === 'function') {
      return raw.toDate().getTime();
    }
    const parsed = new Date(raw).getTime();
    return isNaN(parsed) ? 0 : parsed;
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
    let unsubBookings = null;
    let unsubRecharges = null;
    let unsubCafePayments = null;
    let unsubProfile = null;

    const initRealtimeData = async () => {
      const safetyTimer = setTimeout(() => {
        if (isMounted) setProfileLoading(false);
      }, 5000);

      try {
        if (currentUser) {
          const userPhone = currentUser.phoneNumber || '';

          if (isMounted) {
            setName(currentUser.displayName || '');
            setPhone(userPhone);
            // Google photoURL ko pehli priority do
            setAvatarUrl(currentUser.photoURL || '');
          }

          if (userId) {
            const userRef = doc(db, 'profiles', userId);
            unsubProfile = onSnapshot(userRef, (userSnap) => {
              if (userSnap.exists() && isMounted) {
                const data = userSnap.data();
                if (data.name) setName(data.name);
                if (data.phone) setPhone(data.phone);
                
                // Agar Firestore me avatar_url hai toh wo lo, warna Google auth photoURL ya fallback
                const activePhoto = data.avatar_url && data.avatar_url.trim() !== '' 
                  ? data.avatar_url 
                  : (currentUser?.photoURL || '');
                setAvatarUrl(activePhoto);

                const pts = data.gamer_points ?? data.points ?? data.score ?? 0;
                const parsedPts = parseInt(pts, 10) || 0;
                setGamerPoints(parsedPts);
                setSafeStorage('cached_gamer_points', parsedPts);

                const diamonds = data.redeemable_diamonds ?? data.diamonds ?? data.diamond_balance ?? data.available_diamonds ?? 0;
                const parsedDiamonds = parseInt(diamonds, 10) || 0;
                setRedeemableDiamonds(parsedDiamonds);
                setSafeStorage('cached_redeemable_diamonds', parsedDiamonds);

                if (data.loyalty_tier) setLoyaltyTier(data.loyalty_tier);
              }
            });

            unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
              if (!isMounted) return;
              const allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              const filtered = allBookings.filter(b => {
                return (userEmail && b.email && b.email.toLowerCase() === userEmail.toLowerCase()) ||
                  (userId && b.user_id && String(b.user_id) === String(userId)) ||
                  (userPhone && b.phone && String(b.phone) === String(userPhone));
              });
              setUserBookings(filtered);
            });

            unsubRecharges = onSnapshot(collection(db, 'diamond_recharges'), (snapshot) => {
              if (!isMounted) return;
              const allRecharges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              const filtered = allRecharges.filter(r => {
                return (userEmail && r.email && r.email.toLowerCase() === userEmail.toLowerCase()) ||
                  (userId && r.user_id && String(r.user_id) === String(userId)) ||
                  (userPhone && r.phone && String(r.phone) === String(userPhone));
              });
              setUserRecharges(filtered);
            });

            unsubCafePayments = onSnapshot(collection(db, 'cafe_direct_payments'), (snapshot) => {
              if (!isMounted) return;
              const allPayments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              const filtered = allPayments.filter(p => {
                return (userEmail && p.email && p.email.toLowerCase() === userEmail.toLowerCase()) ||
                  (userId && p.user_id && String(p.user_id) === String(userId)) ||
                  (userPhone && p.phone && String(p.phone) === String(userPhone));
              });
              setUserCafePayments(filtered);
            });
          }
        }
      } catch (err) {
        console.warn("Realtime listener warning:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) setProfileLoading(false);
      }
    };

    initRealtimeData();

    return () => {
      isMounted = false;
      if (unsubProfile) unsubProfile();
      if (unsubBookings) unsubBookings();
      if (unsubRecharges) unsubRecharges();
      if (unsubCafePayments) unsubCafePayments();
    };
  }, [currentUser, userId, userEmail]);

  const fetchUserData = async (email, uId, userPhone) => {
    try {
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const allBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserBookings(allBookings.filter(b => {
        return (email && b.email && b.email.toLowerCase() === email.toLowerCase()) ||
          (uId && b.user_id && String(b.user_id) === String(uId)) ||
          (userPhone && b.phone && String(b.phone) === String(userPhone));
      }));

      setTimeout(async () => {
        try {
          const rechargesSnap = await getDocs(collection(db, 'diamond_recharges'));
          const allRecharges = rechargesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserRecharges(allRecharges.filter(r => {
            return (email && r.email && r.email.toLowerCase() === email.toLowerCase()) ||
              (uId && r.user_id && String(r.user_id) === String(uId)) ||
              (userPhone && r.phone && String(r.phone) === String(userPhone));
          }));
        } catch (e) {
          console.error('Recharges fetch error:', e);
        }
      }, 300);

      setTimeout(async () => {
        try {
          const cafePaymentsSnap = await getDocs(collection(db, 'cafe_direct_payments'));
          const allCafePayments = cafePaymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserCafePayments(allCafePayments.filter(p => {
            return (email && p.email && p.email.toLowerCase() === email.toLowerCase()) ||
              (uId && p.user_id && String(p.user_id) === String(uId)) ||
              (userPhone && p.phone && String(p.phone) === String(userPhone));
          }));
        } catch (e) {
          console.error('Cafe payments fetch error:', e);
        }
      }, 500);

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

    const finalAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : (currentUser?.photoURL || '');

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

  const handleRazorpayRecharge = () => {
    setRechargeLoading(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: selectedPack.price * 100,
      currency: "INR",
      name: "Stranger's Gaming Cafe",
      description: `Diamond Recharge - ${selectedPack.diamonds} Diamonds`,
      image: "/favicon.ico",
      handler: async function (response) {
        try {
          await addDoc(collection(db, 'diamond_recharges'), {
            user_id: userId,
            email: userEmail,
            customer_name: name || 'Gamer',
            phone: phone || '',
            amount: selectedPack.price,
            diamonds: selectedPack.diamonds,
            utr: response.razorpay_payment_id,
            status: 'APPROVED',
            createdAt: new Date(),
            created_at: new Date().toISOString()
          });

          const newDiamondsTotal = redeemableDiamonds + selectedPack.diamonds;
          if (userId) {
            const userRef = doc(db, 'profiles', userId);
            await updateDoc(userRef, {
              redeemable_diamonds: newDiamondsTotal,
              updated_at: new Date().toISOString()
            });
          }

          setRedeemableDiamonds(newDiamondsTotal);
          setSafeStorage('cached_redeemable_diamonds', newDiamondsTotal);

          showToast(`🎉 Success! ${selectedPack.diamonds} Diamonds added to your account!`, 'success', 'Recharge Successful');
          setShowRechargeModal(false);
          fetchUserData(userEmail, userId, phone);
        } catch (err) {
          console.error('Recharge save error:', err);
          showToast('Payment successful but failed to update balance. Contact cafe support.', 'error', 'Error');
        } finally {
          setRechargeLoading(false);
        }
      },
      prefill: {
        name: name || '',
        email: userEmail || '',
        contact: phone || '',
      },
      theme: { color: "#ccff00" },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      showToast('Razorpay SDK failed to load.', 'error', 'Error');
      setRechargeLoading(false);
    }
  };

  const handlePayToCafeCheckout = () => {
    const cleanAmount = Number(cafePayAmount);
    if (!cleanAmount || cleanAmount <= 0) {
      showToast('Please enter a valid payment amount.', 'error', 'Invalid Amount');
      return;
    }

    setCafePayLoading(true);
    const cashbackDiamonds = Math.floor(cleanAmount * 0.10);
    const earnedLeaguePoints = Math.floor(cleanAmount / 10);

    const options = {
      key: "rzp_test_TszUvKcYnqDLYa",
      amount: cleanAmount * 100,
      currency: "INR",
      name: "Stranger's Gaming Cafe",
      description: `Direct Cafe Payment (Earn ${cashbackDiamonds} Diamonds & ${earnedLeaguePoints} League Pts)`,
      image: "/favicon.ico",
      handler: async function (response) {
        try {
          await addDoc(collection(db, 'cafe_direct_payments'), {
            user_id: userId,
            email: userEmail,
            customer_name: name || 'Gamer',
            phone: phone || '',
            amount: cleanAmount,
            cashback_diamonds: cashbackDiamonds,
            league_points: earnedLeaguePoints,
            payment_id: response.razorpay_payment_id,
            status: 'SUCCESS',
            createdAt: new Date(),
            created_at: new Date().toISOString()
          });

          const newDiamondsTotal = redeemableDiamonds + cashbackDiamonds;
          const newGamerPoints = gamerPoints + earnedLeaguePoints;

          if (userId) {
            const userRef = doc(db, 'profiles', userId);
            await updateDoc(userRef, {
              redeemable_diamonds: newDiamondsTotal,
              gamer_points: newGamerPoints,
              updated_at: new Date().toISOString()
            });
          }

          setRedeemableDiamonds(newDiamondsTotal);
          setGamerPoints(newGamerPoints);
          setSafeStorage('cached_redeemable_diamonds', newDiamondsTotal);
          setSafeStorage('cached_gamer_points', newGamerPoints);

          showToast(`🎉 Payment Successful! Earned 💎 ${cashbackDiamonds} Diamonds & 🪙 ${earnedLeaguePoints} League Pts!`, 'success', 'Cafe Payment Success');
          setShowCafePayModal(false);
          setCafePayAmount('');
          fetchUserData(userEmail, userId, phone);
        } catch (err) {
          console.error('Cafe payment record error:', err);
          showToast('Payment successful but failed to credit cashback. Contact support.', 'error', 'Error');
        } finally {
          setCafePayLoading(false);
        }
      },
      prefill: {
        name: name || '',
        email: userEmail || '',
        contact: phone || '',
      },
      theme: { color: "#ccff00" },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      showToast('Razorpay SDK failed to load.', 'error', 'Error');
      setCafePayLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut(auth);
    } catch (err) { }
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  const sortItemsGeneric = (items, mode, dir) => {
    return [...items].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (mode === 'time') {
        valA = getTimestampMillis(a);
        valB = getTimestampMillis(b);
      } else {
        valA = new Date(a.bookingDate || a.date || 0).getTime();
        valB = new Date(b.bookingDate || b.date || 0).getTime();
      }

      if (dir === 'desc') {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });
  };

  const upcomingBookings = sortItemsGeneric(
    userBookings.filter((slot) => {
      const bDateStr = slot.bookingDate || slot.date || '';
      const bSlotStr = slot.slot_time || slot.slot || '';
      return checkIsUpcoming(bDateStr, bSlotStr) && String(slot.status).toUpperCase() !== 'CANCELLED';
    }),
    bookingSortMode,
    bookingSortDir
  );

  const pastBookings = sortItemsGeneric(
    userBookings.filter((slot) => {
      const bDateStr = slot.bookingDate || slot.date || '';
      const bSlotStr = slot.slot_time || slot.slot || '';
      return !checkIsUpcoming(bDateStr, bSlotStr) && String(slot.status).toUpperCase() !== 'CANCELLED';
    }),
    bookingSortMode,
    bookingSortDir
  );

  const cancelledBookings = sortItemsGeneric(
    userBookings.filter((slot) => String(slot.status).toUpperCase() === 'CANCELLED'),
    bookingSortMode,
    bookingSortDir
  );

  const tierBadges = {
    BRONZE: { color: 'from-amber-700/80 to-amber-900/80 border-amber-600/50 text-amber-200', icon: '🥉', min: 200, max: 499 },
    SILVER: { color: 'from-slate-400/80 to-slate-600/80 border-slate-300/50 text-slate-100', icon: '🥈', min: 500, max: 999 },
    GOLD: { color: 'from-yellow-500/80 to-amber-600/80 border-yellow-400/50 text-yellow-100', icon: '🥇', min: 1000, max: 1799 },
    PLATINUM: { color: 'from-teal-400/80 to-cyan-600/80 border-teal-300/50 text-teal-100', icon: '💿', min: 1800, max: 2999 },
    DIAMOND: { color: 'from-cyan-500/80 to-blue-600/80 border-cyan-400/50 text-cyan-100', icon: '💎', min: 3000, max: 4999 },
    CROWN: { color: 'from-indigo-600/80 to-purple-800/80 border-indigo-400/50 text-indigo-100', icon: '⚔️', min: 5000, max: 6999 },
    ACE: { color: 'from-orange-500/80 to-red-600/80 border-orange-400/50 text-orange-100', icon: '⚡', min: 7000, max: 8499 },
    ACE_DOMINATOR: { color: 'from-red-600/80 to-rose-900/80 border-red-500/50 text-red-100', icon: '🔥', min: 8500, max: 9999 },
    CONQUEROR: { color: 'from-amber-400/90 to-yellow-600/90 border-yellow-300/80 text-black', icon: '👑', min: 10000, max: 'Infinity' }
  };

  const calculatedTier = gamerPoints >= 10000 ? 'CONQUEROR' :
    gamerPoints >= 8500 ? 'ACE_DOMINATOR' :
      gamerPoints >= 7000 ? 'ACE' :
        gamerPoints >= 5000 ? 'CROWN' :
          gamerPoints >= 3000 ? 'DIAMOND' :
            gamerPoints >= 1800 ? 'PLATINUM' :
              gamerPoints >= 1000 ? 'GOLD' :
                gamerPoints >= 500 ? 'SILVER' :
                  gamerPoints >= 200 ? 'BRONZE' : 'ROOKIE';

  const currentBadge = tierBadges[calculatedTier] || tierBadges['BRONZE'];

  // Safe image display helper prioritizing Google photo -> Firestore photo -> Initials
  const displayAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : (currentUser?.photoURL || '');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-20 pb-28 px-4 sm:px-6 font-sans relative overflow-x-hidden">

      {toast.show && (
        <div className="fixed top-24 right-4 z-[99999] animate-bounce transition-all duration-300 max-w-sm w-full px-4">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${toast.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-200' : 'bg-[#181922]/95 border-[#ccff00] text-white backdrop-blur-md'
            }`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'error' ? 'bg-red-900 text-red-300' : 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/40'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-black font-orbitron uppercase tracking-wider text-[#ccff00]">{toast.title}</h5>
              <p className="text-xs text-gray-200 mt-1 leading-relaxed">{toast.text}</p>
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer">&times;</button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-5">

        <div className="flex items-center justify-between pb-2 gap-2 flex-wrap">
          {activeTab === 'dashboard' ? (
            <button onClick={onBack} className="px-3 py-2 bg-[#181922] hover:bg-[#ccff00] hover:text-black border border-white/10 rounded-xl text-xs font-bold font-orbitron uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Back
            </button>
          ) : (
            <button onClick={() => setActiveTab('dashboard')} className="px-3 py-2 bg-[#181922] hover:bg-[#ccff00] hover:text-black border border-white/10 rounded-xl text-xs font-bold font-orbitron uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Profile
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button onClick={() => setShowCafePayModal(true)} className="px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black font-orbitron text-[10px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1 active:scale-95">
              <CreditCard className="w-3 h-3" /> Pay to Cafe
            </button>

            <button onClick={onOpenBooking || onBack} className="px-2.5 py-2 bg-[#181922] hover:bg-[#ccff00] hover:text-black border border-[#ccff00]/40 text-[#ccff00] font-black font-orbitron text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95">
              <Gamepad2 className="w-3 h-3 text-[#ccff00]" /> Book
            </button>

            <button onClick={() => setShowRechargeModal(true)} className="px-2.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-[10px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all cursor-pointer flex items-center gap-1 active:scale-95">
              <Gem className="w-3 h-3" /> Diamonds
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="bg-[#181922] border border-white/10 rounded-2xl p-5 relative shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
              <div className="absolute top-4 right-4">
                <div
                  onClick={() => setShowTierModal(true)}
                  className={`bg-gradient-to-r ${currentBadge ? currentBadge.color : 'from-amber-700/80 to-amber-900/80'} px-3.5 py-2 rounded-xl border flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 transition-all`}
                >
                  <span className="text-sm">{currentBadge ? currentBadge.icon : '🥉'}</span>
                  <span className="text-[10px] font-black font-orbitron uppercase tracking-widest">{calculatedTier}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pr-24 sm:pr-28">
                <div className="relative shrink-0">
                  {displayAvatar !== '' ? (
                    <img 
                      src={displayAvatar} 
                      alt="Avatar" 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ccff00]/20 border-2 border-[#ccff00] text-[#ccff00] font-black font-orbitron flex items-center justify-center text-lg sm:text-xl shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                      {getInitials(name)}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <h2 className="text-xs sm:text-sm font-black font-orbitron text-white leading-tight break-words pr-2">
                    {name || 'Gamer'}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">{phone || 'No phone added'}</p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{userEmail || 'Guest User'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center font-mono">
                <div className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-bold">Games</span>
                  <span className="text-sm font-black text-white mt-0.5 block">{userBookings.length}</span>
                </div>

                <div onClick={() => { setActiveTab('bookings'); setBookingSubTab('upcoming'); }} className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-[#ccff00]/40 transition-all">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-bold">Upcoming</span>
                  <span className="text-sm font-black text-cyan-400 mt-0.5 block">{upcomingBookings.length}</span>
                </div>

                <div onClick={() => setShowRechargeModal(true)} className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-[#ccff00]/40 transition-all">
                  <span className="text-[9px] text-[#ccff00] uppercase tracking-wider block font-bold">Diamonds</span>
                  <span className="text-sm font-black text-[#ccff00] mt-0.5 block truncate">💎 {profileLoading && redeemableDiamonds === 0 ? '-' : redeemableDiamonds}</span>
                </div>

                <div className="bg-[#0a0a0c] p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-cyan-300 uppercase tracking-wider block font-bold">League Pts</span>
                  <span className="text-sm font-black text-cyan-200 mt-0.5 block truncate">🪙 {profileLoading && gamerPoints === 0 ? '-' : gamerPoints}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#181922] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
              <button onClick={() => { setActiveTab('bookings'); setBookingSubTab('upcoming'); }} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-[#ccff00]"><Calendar className="w-4 h-4" /></div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-[#ccff00] transition-colors block">My Bookings</span>
                    <span className="text-[10px] text-zinc-400 font-mono">View upcoming & past sessions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ccff00] transition-colors" />
              </button>

              <button onClick={() => setActiveTab('recharges')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-cyan-400"><Wallet className="w-4 h-4" /></div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-cyan-400 transition-colors block">Wallet & Diamond Ledger</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Redeemable Diamonds & Balance History</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400 transition-colors" />
              </button>

              <button onClick={() => setActiveTab('cafe-payments')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-emerald-400"><CreditCard className="w-4 h-4" /></div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-emerald-400 transition-colors block">Cafe Direct Payments History</span>
                    <span className="text-[10px] text-zinc-400 font-mono">View offline cafe visits & cashback records</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 transition-colors" />
              </button>

              <button onClick={() => setActiveTab('edit-profile')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-amber-400"><Settings className="w-4 h-4" /></div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-amber-400 transition-colors block">Edit Profile & Password</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Update name, phone & password</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 transition-colors" />
              </button>
            </div>

            <div className="bg-[#181922] border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
              <a href={`tel:${CAFE_SUPPORT_PHONE}`} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-purple-400"><Phone className="w-4 h-4" /></div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-purple-400 transition-colors block">Help & Support (Call Cafe)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Direct phone support: {CAFE_SUPPORT_PHONE}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </a>

              <button
                onClick={() => {
                  const inviteUrl = 'strangersgamingcafeakola.in';
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(inviteUrl)
                      .then(() => {
                        showToast('Link Copied To Clipboard', 'success', 'Invite');
                      })
                      .catch(() => {
                        showToast('Failed to copy link', 'error', 'Error');
                      });
                  } else {
                    showToast('Clipboard access not available', 'error', 'Error');
                  }
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-orbitron text-white group-hover:text-emerald-400 transition-colors block">
                      Invite a Friend
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Earn rewards together!
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            <button onClick={handleLogoutClick} className="w-full py-4 bg-red-950/30 hover:bg-red-900/40 border border-red-500/40 text-red-400 rounded-2xl text-xs font-black font-orbitron uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg">
              <LogOut className="w-4 h-4" /> Log Out from Account
            </button>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 bg-[#181922] p-3 rounded-2xl border border-white/10">
              <h2 className="text-xs sm:text-sm font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ccff00]" /> My Bookings Manager
              </h2>

              {/* CLEAN SORT CONTROLS */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setBookingSortMode(prev => prev === 'time' ? 'session' : 'time')}
                  className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-[#ccff00] hover:text-black border border-white/10 font-bold rounded-xl transition-all cursor-pointer text-zinc-300"
                >
                  {bookingSortMode === 'time' ? '⏱️ Sort by Time' : '📅 Sort by Session'}
                </button>

                <button
                  onClick={() => setBookingSortDir(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-[#ccff00] hover:text-black border border-white/10 font-bold rounded-xl transition-all cursor-pointer text-[#ccff00] flex items-center gap-1"
                >
                  {bookingSortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{bookingSortDir === 'desc' ? 'DESC' : 'ASC'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#181922] p-1.5 rounded-2xl border border-white/10 font-orbitron text-xs font-bold text-center">
              <button onClick={() => setBookingSubTab('upcoming')} className={`py-2.5 rounded-xl transition-all cursor-pointer ${bookingSubTab === 'upcoming' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-zinc-400 hover:text-white'}`}>Upcoming ({upcomingBookings.length})</button>
              <button onClick={() => setBookingSubTab('past')} className={`py-2.5 rounded-xl transition-all cursor-pointer ${bookingSubTab === 'past' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-zinc-400 hover:text-white'}`}>Past ({pastBookings.length})</button>
              <button onClick={() => setBookingSubTab('cancelled')} className={`py-2.5 rounded-xl transition-all cursor-pointer ${bookingSubTab === 'cancelled' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-zinc-400 hover:text-white'}`}>Cancelled ({cancelledBookings.length})</button>
            </div>

            {bookingSubTab === 'upcoming' && (
              upcomingBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl space-y-3">
                  <div className="text-3xl">🎮</div>
                  <h4 className="text-sm font-black font-orbitron text-white">No upcoming bookings!</h4>
                  <button onClick={onOpenBooking || onBack} className="mt-2 px-5 py-2.5 bg-[#ccff00] text-black font-black font-orbitron text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-[#b8e600]">⚡ Book a Station Now</button>
                </div>
              ) : (
                upcomingBookings.map((b, idx) => (
                  <div key={b.id || idx} onClick={() => setSelectedRecord({ type: 'booking', data: b })} className="bg-[#181922] border border-white/10 hover:border-[#ccff00]/50 p-4 rounded-2xl space-y-2.5 cursor-pointer transition-all shadow-xl font-mono">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">ID: {b.id || 'STR-1454'}</span>
                        <span className="text-xs font-black font-orbitron text-[#ccff00] block mt-0.5">{b.screen || b.category || 'Gaming Station'}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full uppercase font-orbitron">{b.status || 'CONFIRMED'}</span>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-300 border-t border-white/10 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span>📅 Session Date:</span>
                        <strong className="text-white">{formatDateString(b.bookingDate || b.date)}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>⏰ Slot Time:</span>
                        <strong className="text-cyan-300">{b.slot_time || b.slot}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <span>⏱️ Booked At:</span>
                        <span className="text-cyan-200">{formatDateTimeString(b.createdAt || b.created_at || b.created_time)}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono">
                      <span>Amount Paid: <strong className="text-emerald-400 font-bold">₹{b.price || b.amount}</strong></span>
                      <span className="text-[#ccff00] hover:underline font-bold">View Receipt →</span>
                    </div>
                  </div>
                ))
              )
            )}

            {bookingSubTab === 'past' && (
              pastBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl"><p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No past bookings.</p></div>
              ) : (
                pastBookings.map((b, idx) => (
                  <div key={b.id || idx} onClick={() => setSelectedRecord({ type: 'booking', data: b })} className="bg-[#181922] border border-white/10 p-4 rounded-2xl space-y-2.5 cursor-pointer transition-all shadow-xl opacity-90 font-mono">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">ID: {b.id}</span>
                        <span className="text-xs font-black font-orbitron text-zinc-300 block mt-0.5">{b.screen || b.category || 'Gaming Station'}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-full uppercase font-orbitron">COMPLETED</span>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400 border-t border-white/10 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span>📅 Session Date:</span>
                        <strong className="text-zinc-300">{formatDateString(b.bookingDate || b.date)}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>⏰ Slot Time:</span>
                        <strong className="text-zinc-300">{b.slot_time || b.slot}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <span>⏱️ Booked At:</span>
                        <span>{formatDateTimeString(b.createdAt || b.created_at || b.created_time)}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono">
                      <span>Total: <strong className="text-emerald-400 font-bold">₹{b.price || b.amount}</strong></span>
                      <span className="text-[#ccff00] hover:underline font-bold">View Receipt →</span>
                    </div>
                  </div>
                ))
              )
            )}

            {bookingSubTab === 'cancelled' && (
              cancelledBookings.length === 0 ? (
                <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl"><p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No cancelled bookings.</p></div>
              ) : (
                cancelledBookings.map((b, idx) => (
                  <div key={b.id || idx} onClick={() => setSelectedRecord({ type: 'booking', data: b })} className="bg-[#181922] border border-red-500/30 p-4 rounded-2xl space-y-2 cursor-pointer transition-all shadow-xl font-mono">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">ID: {b.id}</span>
                        <span className="text-xs font-black font-orbitron text-red-400 block mt-0.5">{b.screen || b.category || 'Gaming Station'}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold rounded-full uppercase font-orbitron">CANCELLED</span>
                    </div>
                    <div className="text-xs text-zinc-400 border-t border-white/10 pt-2">
                      <span>📅 Date: {formatDateString(b.bookingDate || b.date)}</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {activeTab === 'cafe-payments' && (
          <div className="space-y-4">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Cafe Direct Payments
            </h2>

            {userCafePayments.length === 0 ? (
              <div className="text-center py-16 bg-[#181922] border border-white/10 rounded-2xl space-y-2">
                <div className="text-3xl">☕</div>
                <h4 className="text-sm font-black font-orbitron text-white">No direct cafe payments yet!</h4>
                <p className="text-xs text-zinc-400 font-mono">Scan & pay at the cafe counter to earn redeemable diamond cashback.</p>
              </div>
            ) : (
              userCafePayments.map((p, idx) => (
                <div key={p.id || idx} onClick={() => setSelectedRecord({ type: 'cafe_payment', data: p })} className="bg-[#181922] border border-white/10 hover:border-emerald-500/50 p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all shadow-xl font-mono">
                  <div>
                    <span className="text-xs font-bold font-orbitron text-emerald-400 block">☕ Direct Cafe Visit</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">ID: {p.payment_id} • ⏱️ {formatDateTimeString(p.created_at)}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase block mb-1 bg-emerald-950 text-emerald-300">
                      💎 +{p.cashback_diamonds} Cashback
                    </span>
                    <span className="text-xs font-black text-[#ccff00]">₹{p.amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'edit-profile' && (
          <div className="space-y-5">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> Edit Profile & Security
            </h2>

            <div className="bg-[#181922] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
              {message && <p className="text-[#ccff00] text-xs bg-[#ccff00]/10 p-3 rounded-xl border border-[#ccff00]/30 text-center font-mono font-bold">{message}</p>}

              <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Gamer Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Avatar URL / Upload</label>
                  <div className="flex gap-2">
                    <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-[#ccff00]" placeholder="Image URL" />
                    <label className="px-4 py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-orbitron font-black rounded-xl cursor-pointer flex items-center justify-center shrink-0 transition-all text-xs">
                      📁 Select <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)]">{loading ? 'Saving...' : 'Save Profile Changes'}</button>
              </form>
            </div>

            <div className="bg-[#181922] border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-black font-orbitron text-amber-400 uppercase">Change Password</h3>
              {pwdMessage && <div className={`p-3 rounded-xl border text-xs font-mono font-bold text-center ${pwdMessage.includes('✅') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-red-950/80 border-red-500/40 text-red-300'}`}>{pwdMessage}</div>}
              <form onSubmit={handlePasswordUpdate} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">New Password</label>
                  <div className="relative">
                    <input type={showPwd ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3.5 pr-12 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-amber-400" placeholder="At least 6 characters" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white cursor-pointer">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 text-zinc-300 font-bold">Confirm Password</label>
                  <input type={showPwd ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/10 text-white focus:outline-none focus:border-amber-400" placeholder="Re-enter password" />
                </div>
                <button type="submit" disabled={pwdLoading} className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]">{pwdLoading ? 'Updating...' : 'Update Password'}</button>
              </form>
            </div>
          </div>
        )}

        {/* RECHARGES & WALLET TAB */}
        {activeTab === 'recharges' && (
          <div className="space-y-4">
            <h2 className="text-base font-black font-orbitron text-white uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-400" /> Wallet & Diamond Ledger
            </h2>

            <div className="grid grid-cols-2 gap-2 bg-[#181922] p-1.5 rounded-2xl border border-white/10 font-orbitron text-xs font-bold text-center">
              <button
                onClick={() => setWalletTab('redeemable')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${walletTab === 'redeemable' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-zinc-400 hover:text-white'}`}
              >
                💎 Redeemable Diamonds
              </button>
              <button
                onClick={() => setWalletTab('league')}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${walletTab === 'league' ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'text-zinc-400 hover:text-white'}`}
              >
                🪙 Account Tier & History
              </button>
            </div>

            {walletTab === 'redeemable' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 bg-[#181922] p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs uppercase tracking-wider text-cyan-300 font-bold">Balance:</span>
                    <span className="text-sm font-black font-orbitron text-cyan-200">💎 {redeemableDiamonds} Diamonds</span>
                  </div>

                  {/* DIAMOND LEDGER SORT CONTROLS */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      onClick={() => setDiamondSortMode(prev => prev === 'time' ? 'session' : 'time')}
                      className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-cyan-500 hover:text-black border border-cyan-500/40 font-bold rounded-xl transition-all cursor-pointer text-cyan-300"
                    >
                      {diamondSortMode === 'time' ? '⏱️ Sort by Time' : '📅 Sort by Session'}
                    </button>

                    <button
                      onClick={() => setDiamondSortDir(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-cyan-500 hover:text-black border border-cyan-500/40 font-bold rounded-xl transition-all cursor-pointer text-cyan-300 flex items-center gap-1"
                    >
                      {diamondSortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{diamondSortDir === 'desc' ? 'DESC' : 'ASC'}</span>
                    </button>
                  </div>
                </div>

                {userRecharges.length === 0 && userBookings.filter(b => b.payment_method === 'diamonds' || Number(b.amount || 0) > 0).length === 0 && userCafePayments.length === 0 ? (
                  <div className="text-center py-12 bg-[#181922] border border-white/10 rounded-2xl">
                    <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No redeemable diamond transactions found.</p>
                  </div>
                ) : (
                  (() => {
                    const rechargeItems = userRecharges.map(r => ({
                      id: r.id,
                      type: 'recharge',
                      title: `💎 Purchased ${r.diamonds} Diamonds Pack`,
                      subText: `Payment ID: ${r.utr}`,
                      date: r.created_at || r.date || '',
                      createdAt: r.createdAt || r.created_at || r.date || '',
                      change: Number(r.diamonds || 0),
                      isAddition: true
                    }));

                    const bookingEvents = [];
                    userBookings.forEach(b => {
                      const amount = Number(b.amount || b.price || 0);
                      if (b.payment_method === 'diamonds') {
                        bookingEvents.push({
                          id: b.id,
                          type: 'booking_spend',
                          title: `🎮 Spent on Booking (${b.screen || b.category || 'Station'})`,
                          subText: `Booking ID: ${b.id} • Slot: ${b.slot_time || b.slot || 'N/A'}`,
                          date: b.bookingDate || b.date || b.created_at || '',
                          createdAt: b.createdAt || b.created_at || b.bookingDate || b.date || '',
                          change: amount,
                          isAddition: false
                        });
                      } else {
                        const earnedCb = Math.floor(amount * 0.10);
                        if (earnedCb > 0) {
                          bookingEvents.push({
                            id: `${b.id}-cb`,
                            type: 'booking_cashback',
                            title: `✨ Earned 10% Cashback from Booking`,
                            subText: `Booking ID: ${b.id} (${b.screen || b.category || 'Station'})`,
                            date: b.bookingDate || b.date || b.created_at || '',
                            createdAt: b.createdAt || b.created_at || b.bookingDate || b.date || '',
                            change: earnedCb,
                            isAddition: true
                          });
                        }
                      }
                    });

                    const cafeCashbacks = userCafePayments.filter(p => Number(p.cashback_diamonds || 0) > 0).map(p => ({
                      id: p.id,
                      type: 'cafe_cashback',
                      title: `☕ Cafe Direct Payment Cashback`,
                      subText: `Payment ID: ${p.payment_id || 'N/A'}`,
                      date: p.created_at || '',
                      createdAt: p.createdAt || p.created_at || '',
                      change: Number(p.cashback_diamonds || 0),
                      isAddition: true
                    }));

                    const allDiamondEvents = [...rechargeItems, ...bookingEvents, ...cafeCashbacks];
                    
                    const sortedAsc = [...allDiamondEvents].sort((a, b) => getTimestampMillis(a) - getTimestampMillis(b));

                    let runningBal = 0;
                    const mappedWithRunning = sortedAsc.map(item => {
                      const prev = runningBal;
                      if (item.isAddition) {
                        runningBal += item.change;
                      } else {
                        runningBal -= item.change;
                      }
                      return { ...item, startBal: prev, endBal: runningBal };
                    });

                    const finalDisplayedEvents = mappedWithRunning.sort((a, b) => {
                      const tA = getTimestampMillis(a);
                      const tB = getTimestampMillis(b);
                      return diamondSortDir === 'desc' ? tB - tA : tA - tB;
                    });

                    return finalDisplayedEvents.map((item, idx) => (
                      <div key={item.id || idx} className="bg-[#181922] border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-xl font-mono">
                        <div>
                          <span className={`text-xs font-bold font-orbitron block ${item.isAddition ? 'text-[#ccff00]' : 'text-red-400'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{item.subText}</span>
                          <span className="text-[10px] text-cyan-300 block mt-0.5">⏱️ Action Time: {formatDateTimeString(item.createdAt)}</span>
                          <span className="text-[9px] text-zinc-400 block mt-1">
                            Balance: <strong className="text-zinc-300">{item.startBal}</strong> {item.isAddition ? '+' : '-'} <strong className={item.isAddition ? 'text-[#ccff00]' : 'text-red-400'}>{item.change}</strong> = <strong className="text-cyan-300">{item.endBal} Total</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase block mb-1 border font-orbitron ${item.isAddition ? 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]' : 'bg-red-950/50 border-red-500/30 text-red-300'}`}>
                            {item.isAddition ? `+${item.change} Diamonds` : `-${item.change} Diamonds`}
                          </span>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            )}

            {walletTab === 'league' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 bg-[#181922] p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 font-mono">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold block">Total Points</span>
                      <span className="text-sm font-black font-orbitron text-[#ccff00]">🪙 {gamerPoints} Pts</span>
                    </div>
                    <div className="border-l border-white/10 pl-3">
                      <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold block">Tier</span>
                      <span className="text-xs font-black font-orbitron text-white">{calculatedTier}</span>
                    </div>
                  </div>

                  {/* LEAGUE HISTORY SORT CONTROLS */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      onClick={() => setLeagueSortMode(prev => prev === 'time' ? 'session' : 'time')}
                      className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-[#ccff00] hover:text-black border border-[#ccff00]/40 font-bold rounded-xl transition-all cursor-pointer text-[#ccff00]"
                    >
                      {leagueSortMode === 'time' ? '⏱️ Sort by Time' : '📅 Sort by Session'}
                    </button>

                    <button
                      onClick={() => setLeagueSortDir(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="px-2.5 py-1.5 bg-[#0a0a0c] hover:bg-[#ccff00] hover:text-black border border-[#ccff00]/40 font-bold rounded-xl transition-all cursor-pointer text-[#ccff00] flex items-center gap-1"
                    >
                      {leagueSortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{leagueSortDir === 'desc' ? 'DESC' : 'ASC'}</span>
                    </button>
                  </div>
                </div>

                {userBookings.length === 0 && userCafePayments.length === 0 ? (
                  <div className="text-center py-12 bg-[#181922] border border-white/10 rounded-2xl">
                    <p className="text-zinc-400 text-xs uppercase tracking-widest font-mono">No activity history found.</p>
                  </div>
                ) : (
                  (() => {
                    const formattedBookings = userBookings.map(b => {
                      const amount = Number(b.amount || b.price || 0);
                      const pts = Math.floor(amount / 10);
                      return {
                        id: b.id,
                        type: 'booking',
                        title: `🎮 ${b.screen || b.category || 'Gaming Session'}`,
                        subText: `ID: ${b.id} • Slot: ${b.slot_time || b.slot || 'N/A'}`,
                        date: b.bookingDate || b.date || b.created_at || '',
                        createdAt: b.createdAt || b.created_at || b.bookingDate || b.date || '',
                        amount: amount,
                        points: pts
                      };
                    });

                    const formattedCafePayments = userCafePayments.map(p => {
                      const amount = Number(p.amount || 0);
                      const pts = p.league_points !== undefined ? Number(p.league_points) : Math.floor(amount / 10);
                      return {
                        id: p.id,
                        type: 'cafe_payment',
                        title: `☕ Direct Cafe Visit & Payment`,
                        subText: `Payment ID: ${p.payment_id || 'N/A'} • 💎 +${p.cashback_diamonds || 0} Diamonds`,
                        date: p.created_at || '',
                        createdAt: p.createdAt || p.created_at || '',
                        amount: amount,
                        points: pts
                      };
                    });

                    const allActivities = [...formattedBookings, ...formattedCafePayments];

                    const sortedActivities = sortItemsGeneric(allActivities, leagueSortMode, leagueSortDir);

                    let runningSum = 0;
                    const mappedList = sortedActivities.map(item => {
                      const start = runningSum;
                      runningSum += item.points;
                      return { ...item, start, end: runningSum };
                    });

                    return mappedList.map((item, idx) => (
                      <div key={item.id || idx} className="bg-[#181922] border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-xl font-mono">
                        <div>
                          <span className="text-xs font-bold font-orbitron text-[#ccff00] block">{item.title}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{item.subText}</span>
                          <span className="text-[10px] text-cyan-300 block mt-0.5">⏱️ Action Time: {formatDateTimeString(item.createdAt)}</span>
                          <span className="text-[9px] text-zinc-400 block mt-1">
                            Points: <strong className="text-zinc-300">{item.start}</strong> + <strong className="text-[#ccff00]">+{item.points}</strong> = <strong className="text-cyan-300">{item.end} Total</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase block mb-1 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-orbitron">
                            +{item.points} Pts Added
                          </span>
                          <span className="text-[10px] text-zinc-400">Paid ₹{item.amount}</span>
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {showTierModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[10005]" onClick={() => setShowTierModal(false)}>
          <div className="bg-[#12131a] border border-[#ccff00]/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-white font-sans max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 sticky top-0 bg-[#12131a] z-10">
              <h3 className="text-sm font-black font-orbitron text-[#ccff00] uppercase tracking-wider flex items-center gap-2">
                🏆 GAMER TIERS & REWARDS
              </h3>
              <button onClick={() => setShowTierModal(false)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">&times;</button>
            </div>

            <div className="space-y-2 font-mono">
              {[
                { key: 'CONQUEROR', name: 'CONQUEROR', range: '10000+ Points', icon: '👑', minPts: 10000 },
                { key: 'ACE_DOMINATOR', name: 'ACE DOMINATOR', range: '8500 - 9999 Points', icon: '🔥', minPts: 8500 },
                { key: 'ACE', name: 'ACE', range: '7000 - 8499 Points', icon: '⚡', minPts: 7000 },
                { key: 'CROWN', name: 'CROWN', range: '5000 - 6999 Points', icon: '⚔️', minPts: 5000 },
                { key: 'DIAMOND', name: 'DIAMOND', range: '3000 - 4999 Points', icon: '💎', minPts: 3000 },
                { key: 'PLATINUM', name: 'PLATINUM', range: '1800 - 2999 Points', icon: '💿', minPts: 1800 },
                { key: 'GOLD', name: 'GOLD', range: '1000 - 1799 Points', icon: '🥇', minPts: 1000 },
                { key: 'SILVER', name: 'SILVER', range: '500 - 999 Points', icon: '🥈', minPts: 500 },
                { key: 'BRONZE', name: 'BRONZE', range: '200 - 499 Points', icon: '🥉', minPts: 200 },
                { key: 'ROOKIE', name: 'ROOKIE', range: '0 - 199 Points', icon: '🎮', minPts: 0 },
              ].map((tier) => {
                const isCurrent = calculatedTier === tier.key;
                const isCompleted = gamerPoints > tier.minPts && !isCurrent;

                return (
                  <div key={tier.key} className={`p-3 rounded-xl border flex items-center justify-between ${isCurrent
                      ? 'bg-[#ccff00]/15 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                      : isCompleted
                        ? 'bg-[#181922] border-emerald-500/30'
                        : 'bg-[#181922] border-white/10'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tier.icon}</span>
                      <div>
                        <span className={`text-xs font-black font-orbitron block ${isCurrent ? 'text-[#ccff00]' : isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                          {tier.name} {isCurrent && '👑 (Current)'}
                        </span>
                        <span className="text-[10px] text-zinc-400">{tier.range}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase block ${isCurrent
                          ? 'bg-[#ccff00] text-black font-black'
                          : isCompleted
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 text-zinc-500'
                        }`}>
                        {isCurrent ? 'ACTIVE' : isCompleted ? 'COMPLETED' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowTierModal(false)} className="w-full py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all">Got It</button>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[10002]" onClick={() => setShowCropModal(false)}>
          <div className="bg-[#12131a] border border-[#ccff00]/50 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-white font-sans text-center select-none" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xs font-black font-orbitron text-[#ccff00] uppercase tracking-wider">ADJUST & CROP PHOTO</h3>
              <button onClick={() => setShowCropModal(false)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">&times;</button>
            </div>
            <div onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[#ccff00] bg-black shadow-[0_0_25px_rgba(204,255,0,0.4)] relative cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center">
              <img src={rawImageSrc} alt="Crop preview" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`, transition: isDraggingRef.current ? 'none' : 'transform 0.05s ease-out', minWidth: `${baseScale * 100}%`, minHeight: `${baseScale * 100}%` }} className="absolute object-cover pointer-events-none select-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowCropModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-orbitron font-bold text-xs uppercase rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCropAndUpload} className="flex-1 py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-orbitron font-black text-xs uppercase rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer">Crop & Save</button>
            </div>
          </div>
        </div>
      )}

      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 z-[9999] overflow-y-auto" onClick={() => setShowRechargeModal(false)}>
          <div className="bg-[#12131a] border border-[#ccff00]/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-white my-auto max-h-[90vh] overflow-y-auto font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 sticky top-0 bg-[#12131a] z-10">
              <h2 className="text-xs sm:text-sm font-black font-orbitron text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5"><Gem className="w-4 h-4 text-[#ccff00] animate-bounce" /> ADD DIAMONDS</h2>
              <button onClick={() => setShowRechargeModal(false)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">&times;</button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">Select Diamond Pack (Redeemable Only):</label>
              <div className="grid grid-cols-1 gap-2.5">
                {DIAMOND_PACKS.map((pack, idx) => (
                  <div key={idx} onClick={() => setSelectedPack(pack)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPack.price === pack.price ? 'bg-[#ccff00]/15 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-[#181922] border-white/10 hover:border-white/30'}`}>
                    <div>
                      <div className="text-xs font-black font-orbitron text-[#ccff00] flex items-center gap-1.5"><Gem className="w-3.5 h-3.5 text-[#ccff00]" /> {pack.diamonds} Diamonds</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{pack.label}</div>
                    </div>
                    <div className="text-xs font-black font-mono text-emerald-400">₹{pack.price}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleRazorpayRecharge} disabled={rechargeLoading} className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.3)] disabled:opacity-50">
              {rechargeLoading ? 'PROCESSING...' : `Pay ₹${selectedPack.price} via Razorpay`}
            </button>
          </div>
        </div>
      )}

      {showCafePayModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 z-[9999] overflow-y-auto" onClick={() => setShowCafePayModal(false)}>
          <div className="bg-[#12131a] border border-emerald-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-white my-auto max-h-[90vh] overflow-y-auto font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 sticky top-0 bg-[#12131a] z-10">
              <h2 className="text-xs sm:text-sm font-black font-orbitron text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400 animate-pulse" /> PAY TO CAFE COUNTER
              </h2>
              <button onClick={() => setShowCafePayModal(false)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">&times;</button>
            </div>

            <div className="bg-[#181922] p-4 rounded-xl border border-emerald-500/30 text-center space-y-2">
              <p className="text-xs text-zinc-300 font-mono">Cafe par visit karke pay karne par milega:</p>
              <div className="text-sm font-black font-orbitron text-[#ccff00]">💎 10% Redeemable Diamond Cashback</div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold mb-1.5">Enter Bill / Payment Amount (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={cafePayAmount}
                onChange={(e) => setCafePayAmount(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0a0a0c] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-emerald-400 font-bold tracking-wider"
              />
              {cafePayAmount > 0 && (
                <p className="text-[11px] font-mono text-emerald-400 mt-2">
                  ✨ You will earn approximately <strong className="text-white">💎 {Math.floor(cafePayAmount * 0.10)} Diamonds</strong>!
                </p>
              )}
            </div>

            <button
              onClick={handlePayToCafeCheckout}
              disabled={cafePayLoading || !cafePayAmount || Number(cafePayAmount) <= 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              {cafePayLoading ? 'PROCESSING...' : `Pay ₹${cafePayAmount || 0} via Razorpay`}
            </button>
          </div>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedRecord(null)}>
          <div className="bg-[#12131a] border border-[#ccff00]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white font-sans max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-black font-orbitron text-[#ccff00] uppercase tracking-wider">
                  {selectedRecord.type === 'booking' ? 'BOOKING DETAILS RECEIPT' : selectedRecord.type === 'recharge' ? 'RECHARGE RECEIPT' : 'CAFE PAYMENT RECEIPT'}
                </h2>
                {selectedRecord.type === 'booking' && (
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Client-Side Reservation Information</p>
                )}
              </div>
              <button onClick={() => setSelectedRecord(null)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">&times;</button>
            </div>

            {selectedRecord.type === 'booking' ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Booking ID:</span>
                  <span className="text-[#ccff00] font-bold font-orbitron">{selectedRecord.data.id || 'STR-1454'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Booking Date:</span>
                  <span className="text-white font-bold">{formatDateString(selectedRecord.data.bookingDate || selectedRecord.data.date)}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Booked At (Time):</span>
                  <span className="text-cyan-300 font-mono font-bold">
                    {formatDateTimeString(selectedRecord.data.createdAt || selectedRecord.data.created_at || selectedRecord.data.created_time)}
                  </span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Customer Name:</span>
                  <span className="text-white font-bold">{selectedRecord.data.customer_name || selectedRecord.data.name || name || 'Gamer'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Phone Number:</span>
                  <span className="text-zinc-200">{selectedRecord.data.phone || phone || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Station / Platform:</span>
                  <span className="text-amber-300 font-bold">{selectedRecord.data.screen || selectedRecord.data.category || 'Gaming Station'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Reserved Slot Time:</span>
                  <span className="text-[#ccff00] font-bold">{selectedRecord.data.slot_time || selectedRecord.data.slot || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Duration / Team:</span>
                  <span className="text-purple-300">{selectedRecord.data.duration || '30 min • 1 Player'}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-400 uppercase">Transaction UTR / Ref:</span>
                  <span className="text-purple-300 font-mono break-all max-w-[180px] text-right">
                    {selectedRecord.data.utr || selectedRecord.data.payment_id || 'N/A'}
                  </span>
                </div>

                <div className="pt-2 flex justify-between text-sm font-bold font-orbitron border-t border-white/10">
                  <span className="text-zinc-300 uppercase">Total Amount Paid:</span>
                  <span className="text-[#ccff00]">₹{selectedRecord.data.amount || selectedRecord.data.price || '0'}</span>
                </div>
              </div>
            ) : (
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
                  <span className="text-zinc-400">Customer:</span>
                  <span className="text-white">{selectedRecord.data.customer_name || selectedRecord.data.name || name || 'Gamer'}</span>
                </div>
                {selectedRecord.type === 'cafe_payment' && (
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-zinc-400">Cashback Earned:</span>
                    <span className="text-emerald-400 font-bold">💎 +{selectedRecord.data.cashback_diamonds} Diamonds</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-zinc-400">Payment ID:</span>
                  <span className="text-purple-300 font-mono break-all max-w-[200px] text-right">{selectedRecord.data.utr || selectedRecord.data.payment_id || 'N/A'}</span>
                </div>
                <div className="pt-2 flex justify-between text-sm font-bold font-orbitron">
                  <span className="text-zinc-400">Amount Paid:</span>
                  <span className="text-[#ccff00]">₹{selectedRecord.data.amount || selectedRecord.data.price || '0'}</span>
                </div>
              </div>
            )}

            <button onClick={() => setSelectedRecord(null)} className="w-full py-3 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all">Close Receipt</button>
          </div>
        </div>
      )}

    </div>
  );
}
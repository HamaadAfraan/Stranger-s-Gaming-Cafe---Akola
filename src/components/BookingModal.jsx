import React, { useEffect, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import BookingAvailability from './Booking/BookingAvailability';
import BookingPayment from './Booking/BookingPayment';
import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const maxCapacities = {
  'PS5_55" VIP': 2,
  'PS5_43" Standard': 2,
  PS4: 1,
  'Simulator_Car': 2,
  'Simulator_Truck': 1,
  PC: 2,
};

const stations = [
  {
    id: 'PS5',
    name: 'PlayStation 5 Console',
    hasScreens: true,
    screens: ['55" VIP', '43" Standard'],
    multiplayer: true,
    rates: {
      '55" VIP': {
        '1 Player': { min30: 100, hr1: 180 },
        '2 Players': { min30: 160, hr1: 250 },
        '3 Players': { min30: 210, hr1: 320 },
        '4 Players': { min30: 260, hr1: 400 },
      },
      '43" Standard': {
        '1 Player': { min30: 80, hr1: 150 },
        '2 Players': { min30: 120, hr1: 200 },
        '3 Players': { min30: 150, hr1: 280 },
      },
    },
  },
  {
    id: 'PS4',
    name: 'PlayStation 4 Console',
    hasScreens: false,
    multiplayer: true,
    rates: {
      '1 Player': { min30: 50, hr1: 100 },
      '2 Players': { min30: 100, hr1: 160 },
      '3 Players': { min30: 140, hr1: 240 },
      '4 Players': { min30: 180, hr1: 280 },
    },
  },
  {
    id: 'Simulator',
    name: 'Racing Simulator Pro',
    hasScreens: true,
    screens: ['Car', 'Truck'],
    multiplayer: false,
    rates: {
      min10: 50,
      min30: 150,
      hr1: 250,
    },
  },
  {
    id: 'PC',
    name: 'Esports PC Gaming Arena',
    hasScreens: false,
    multiplayer: false,
    rates: {
      min30: 70,
      hr1: 120,
    },
  },
];

const minutesToTimeString = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const strMins = mins < 10 ? `0${mins}` : mins;
  const strHours = hours < 10 ? `0${hours}` : hours;

  return `${strHours}:${strMins} ${modifier}`;
};

const formatDurationText = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;

  return `${hours} hr ${mins} min`;
};

const calculateBookingPrice = ({
  stations,
  selectedCategory,
  selectedScreen,
  selectedTeam,
  selectedGame,
  startTime,
  endTime,
}) => {
  if (startTime === null || endTime === null) return 0;

  const totalMinutes = endTime - startTime;

  if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
    const fullHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;

    if (selectedScreen === '55" VIP') {
      let price = fullHours * 250;
      if (remainingMins === 30) price += 150;
      return price;
    } else {
      let price = fullHours * 200;
      if (remainingMins === 30) price += 120;
      return price;
    }
  }

  const currentStation = stations.find((s) => s.id === selectedCategory);
  if (!currentStation) return 0;

  let rateObj = null;

  if (selectedCategory === 'PS5') {
    rateObj = currentStation.rates[selectedScreen]?.[selectedTeam] || null;
  } else if (selectedCategory === 'PS4') {
    rateObj = currentStation.rates[selectedTeam] || null;
  } else {
    rateObj = currentStation.rates;
  }

  if (!rateObj) return 0;

  if (selectedCategory === 'Simulator' && totalMinutes === 10) {
    return rateObj.min10 || 50;
  }

  const fullHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  let totalPrice = fullHours * rateObj.hr1;

  if (remainingMins === 30) {
    totalPrice += rateObj.min30;
  }

  return totalPrice;
};

export const BookingModal = ({
  isOpen,
  onClose,
  bookedSlots = [],
  onBookingCreated,
}) => {
  const [bookingDate, setBookingDate] = useState(getTodayDateString());
  const [selectedCategory, setSelectedCategory] = useState('PS5');
  const [selectedScreen, setSelectedScreen] = useState('55" VIP');
  const [selectedTeam, setSelectedTeam] = useState('1 Player');
  const [selectedGame, setSelectedGame] = useState('Standard');

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [paymentStep, setPaymentStep] = useState(1);

  const [userGamerPoints, setUserGamerPoints] = useState(0);
  const [userRedeemableDiamonds, setUserRedeemableDiamonds] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen) {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userId = currentUser.uid;
            try {
              const docRef = doc(db, 'profiles', userId);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData((prev) => ({
                  ...prev,
                  name: data.name || currentUser.displayName || '',
                  phone: data.phone || currentUser.phoneNumber || '',
                }));
                setUserGamerPoints(parseInt(data.gamer_points, 10) || 0);
                setUserRedeemableDiamonds(parseInt(data.redeemable_diamonds, 10) || 0);
              } else {
                setFormData((prev) => ({
                  ...prev,
                  name: currentUser.displayName || '',
                  phone: currentUser.phoneNumber || '',
                }));
              }
            } catch (profileError) {
              console.warn("Firestore profile fetch error:", profileError);
            }
          }
        } catch (authError) {
          console.warn("Auth session error:", authError);
        }
      }
    };

    fetchUserData();
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory === 'PS5' && selectedGame === 'GTA 6') {
      setSelectedTeam('1 Player');
    }
  }, [selectedGame, selectedCategory]);

  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
    setStartTime(null);
    setEndTime(null);
    setShowEndPicker(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const currentStation = stations.find((s) => s.id === selectedCategory);

  const rawTotalAmount = calculateBookingPrice({
    stations,
    selectedCategory,
    selectedScreen,
    selectedTeam,
    selectedGame,
    startTime,
    endTime,
  });

  const handleNameChange = (e) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData((prev) => ({ ...prev, name: rawValue }));
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9+\-\s]/g, '');
    if (rawValue.length <= 20) {
      setFormData((prev) => ({ ...prev, phone: rawValue }));
    }
  };

  const isNameValid = formData.name.trim().length >= 2;
  const isPhoneValid = formData.phone.trim().replace(/[\s+\-]/g, '').length >= 7;

  // Main Booking Confirmation & Razorpay integration
  const handleConfirmBooking = async ({ paymentMethod, finalPayAmount }) => {
    setErrorMessage('');

    if (!isNameValid || !isPhoneValid) {
      setErrorMessage('Kripya apna naam aur valid mobile number bharein.');
      return;
    }

    if (paymentMethod === 'diamonds' && userRedeemableDiamonds < finalPayAmount) {
      setErrorMessage(`Aapke paas पर्याप्त diamonds nahi hain! Aapke paas ${userRedeemableDiamonds} hain, lekin ${finalPayAmount} chahiye.`);
      return;
    }

    const bookingId = `STR-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeSlotString = `${minutesToTimeString(startTime)}\n${minutesToTimeString(endTime)}`;
    const now = new Date();
    const createdTimeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let userEmail = '';
    let currentUserId = null;
    try {
      const currentUser = auth.currentUser;
      userEmail = currentUser?.email || '';
      currentUserId = currentUser?.uid || null;
    } catch (e) {
      console.warn('Auth warning:', e);
    }

    const bookingPrice = typeof finalPayAmount === 'number' ? finalPayAmount : rawTotalAmount;

    // Rules:
    // 1. If paid via Diamonds: Redeemable diamonds decrease, League points INCREASE (e.g. 10% or bookingPrice/10)
    // 2. If paid via UPI/Razorpay: Redeemable diamonds increase by 10% cashback, League points INCREASE by 10%
    const earnedGamerPoints = Math.floor(Number(bookingPrice) / 10);
    const earnedCashbackDiamonds = paymentMethod === 'diamonds' ? 0 : Math.floor(Number(bookingPrice) * 0.10);

    // BookingModal.jsx ke andar saveBookingToFirebase function ka updated logic:
    const saveBookingToFirebase = async (paymentIdVal) => {
      setIsSubmitting(true);
      let finalUtRDisplay = '';
      if (paymentMethod === 'diamonds') {
        const remainingDiamonds = userRedeemableDiamonds - bookingPrice;
        finalUtRDisplay = `${userRedeemableDiamonds}-${bookingPrice}=${remainingDiamonds} (diamond)`;
      } else {
        finalUtRDisplay = paymentIdVal || 'ONLINE_PAID';
      }

      const bookingDetails = {
        id: bookingId,
        user_id: currentUserId,
        name: formData.name.trim(),
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: userEmail,
        utr: finalUtRDisplay,
        bookingDate,
        category: selectedCategory,
        station_id: selectedCategory,
        screen: currentStation?.hasScreens ? selectedScreen : '',
        team: currentStation?.multiplayer ? selectedTeam : '1 Player',
        selectedGame: selectedCategory === 'PS5' ? selectedGame : '',
        duration: formatDurationText(endTime - startTime),
        slot: timeSlotString,
        slot_time: timeSlotString,
        price: bookingPrice,
        amount: bookingPrice,
        payment_method: paymentMethod,
        created_time: createdTimeString,
        status: 'CONFIRMED',
        payment_status: 'PAID',
        createdAt: serverTimestamp(),
      };

      try {
        // 1. Save Booking Document
        await addDoc(collection(db, 'bookings'), bookingDetails);

        if (currentUserId) {
          let newGamerPoints = userGamerPoints + earnedGamerPoints;
          let newRedeemableDiamonds = userRedeemableDiamonds;

          if (paymentMethod === 'diamonds') {
            newRedeemableDiamonds = Math.max(0, userRedeemableDiamonds - bookingPrice);
          } else {
            // Cash / UPI booking par 10% Diamond Cashback add hoga
            newRedeemableDiamonds = userRedeemableDiamonds + earnedCashbackDiamonds;
          }

          // 2. Update User Profile Balances
          const userDocRef = doc(db, 'profiles', currentUserId);
          await updateDoc(userDocRef, {
            gamer_points: newGamerPoints,
            redeemable_diamonds: newRedeemableDiamonds,
            updated_at: new Date().toISOString()
          });

          setUserGamerPoints(newGamerPoints);
          setUserRedeemableDiamonds(newRedeemableDiamonds);
        }

        if (typeof onBookingCreated === 'function') onBookingCreated(bookingDetails);
        setConfirmedBookingDetails(bookingDetails);
        setPaymentStep(3);
      } catch (error) {
        console.error('Firestore Booking error:', error);
        setErrorMessage('Connection failed. Kripya apna internet check karke dobara koshish karein.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (paymentMethod === 'diamonds') {
      await saveBookingToFirebase('DIAMOND_REDEEM');
    } else {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: bookingPrice * 100,
        currency: "INR",
        name: "Stranger's Gaming Cafe",
        description: `Station Booking - ${selectedCategory}`,
        image: "/favicon.ico",
        handler: async function (response) {
          await saveBookingToFirebase(response.razorpay_payment_id);
        },
        prefill: {
          name: formData.name.trim(),
          email: userEmail,
          contact: formData.phone.trim(),
        },
        theme: {
          color: "#ccff00",
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setErrorMessage(`Payment Failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        setErrorMessage('Razorpay SDK failed to load. Please check your connection.');
      }
    }
  };

  const handleModalClose = () => {
    setPaymentStep(1);
    setFormData({ name: '', phone: '' });
    setStartTime(null);
    setEndTime(null);
    setShowEndPicker(false);
    setConfirmedBookingDetails(null);
    setBookingDate(getTodayDateString());
    setSelectedGame('Standard');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#0a0a0c] overflow-y-auto w-full min-h-screen font-sans">
      <div className="w-full max-w-xl mx-auto px-4 py-6 sm:px-6 min-h-screen flex flex-col justify-start">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10 sticky top-0 bg-[#0a0a0c]/95 backdrop-blur-md z-40 pt-2">
          <div>
            <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest font-bold block">
              {paymentStep === 1 ? 'STEP 1 OF 2: SLOT SELECTION' : paymentStep === 2 ? 'STEP 2 OF 2: SECURE CHECKOUT' : 'BOOKING CONFIRMATION'}
            </span>
            <h2 className="text-lg sm:text-xl font-black font-orbitron text-white tracking-wide uppercase mt-0.5">
              {paymentStep === 1 ? 'SELECT TIMINGS & RIG' : paymentStep === 2 ? 'COMPLETE PAYMENT' : 'BOOKING SUMMARY'}
            </h2>
          </div>

          <button
            onClick={handleModalClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:text-black hover:bg-[#ccff00] transition-all cursor-pointer font-bold shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            aria-label="Close booking page"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStep === 1 && (
          <div className="w-full">
            <BookingAvailability
              bookingDate={bookingDate}
              setBookingDate={handleDateChange}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedScreen={selectedScreen}
              setSelectedScreen={setSelectedScreen}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              showEndPicker={showEndPicker}
              setShowEndPicker={setShowEndPicker}
              currentMinutes={currentMinutes}
              bookedSlots={bookedSlots}
              stations={stations}
              maxCapacities={maxCapacities}
              currentStation={currentStation}
              formatDurationText={formatDurationText}
              minutesToTimeString={minutesToTimeString}
              totalAmount={rawTotalAmount}
              onNext={() => setPaymentStep(2)}
            />
          </div>
        )}

        {paymentStep === 2 && (
          <div className="w-full">
            <BookingPayment
              bookingDate={bookingDate}
              selectedCategory={selectedCategory}
              selectedScreen={selectedScreen}
              selectedTeam={selectedTeam}
              selectedGame={selectedGame}
              currentStation={currentStation}
              startTime={startTime}
              endTime={endTime}
              totalAmount={rawTotalAmount}
              userRedeemableDiamonds={userRedeemableDiamonds}
              formatDurationText={formatDurationText}
              minutesToTimeString={minutesToTimeString}
              formData={formData}
              handleNameChange={handleNameChange}
              handlePhoneChange={handlePhoneChange}
              isNameValid={isNameValid}
              isPhoneValid={isPhoneValid}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
              onBack={() => setPaymentStep(1)}
              onConfirm={handleConfirmBooking}
            />
          </div>
        )}

        {paymentStep === 3 && confirmedBookingDetails && (
          <div className="text-center py-4 w-full font-sans">
            <div className="w-20 h-20 bg-[#ccff00]/15 text-[#ccff00] border-2 border-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(204,255,0,0.5)] animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <h3 className="text-2xl font-black font-orbitron text-white uppercase tracking-wider">
              BOOKING CONFIRMED!
            </h3>

            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Show this ID at the cafe counter to access your station. Payment successful!
            </p>

            <div className="mt-5 p-3.5 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/40 inline-flex items-center gap-3 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
              <span className="text-xs font-mono text-zinc-400 font-bold">BOOKING ID:</span>
              <span className="text-lg font-black font-orbitron text-[#ccff00] tracking-widest">
                {confirmedBookingDetails.id}
              </span>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-[#12131a] border border-white/10 text-left space-y-3 font-mono text-xs shadow-inner">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Booking Date:</span>
                <span className="text-[#ccff00] font-bold">{confirmedBookingDetails.bookingDate}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Booked At:</span>
                <span className="text-white font-bold">{confirmedBookingDetails.created_time || 'Just now'}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Customer Name:</span>
                <span className="text-white font-bold">{confirmedBookingDetails.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Phone Number:</span>
                <span className="text-white font-bold">{confirmedBookingDetails.phone}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Platform & Game:</span>
                <span className="text-[#ccff00] font-bold">
                  {confirmedBookingDetails.category}{' '}
                  {confirmedBookingDetails.screen ? `(${confirmedBookingDetails.screen})` : ''}
                  {confirmedBookingDetails.selectedGame ? ` - ${confirmedBookingDetails.selectedGame}` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-emerald-400 font-bold">Reserved Slot:</span>
                <span className="text-emerald-400 font-bold whitespace-pre-line text-right">{confirmedBookingDetails.slot}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Duration & Perks:</span>
                <span className="text-emerald-300 font-bold">{confirmedBookingDetails.duration}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-zinc-400">Payment ID:</span>
                <span className="text-purple-300 font-mono break-all max-w-[200px] text-right">
                  {confirmedBookingDetails.utr}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-zinc-400 font-bold">Total Amount:</span>
                <span className="text-[#ccff00] font-black text-sm font-orbitron">
                  ₹{confirmedBookingDetails.price}
                </span>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="mt-6 w-full py-4 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-orbitron font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(204,255,0,0.4)] cursor-pointer transition-all active:scale-95"
            >
              DONE & CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;

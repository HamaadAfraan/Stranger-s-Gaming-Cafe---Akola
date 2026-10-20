import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, Bike } from 'lucide-react';
import BookingAvailability from './Booking/BookingAvailability';
import BookingPayment from './Booking/BookingPayment';
// Supabase ki jagah Firebase auth aur db import kiya
import { auth, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const UPI_ID = 'hamaad.afraan@ybl';
const PAYEE_NAME = 'Strangers Gaming Cafe';

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
    utr: '',
  });

  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Fetch User Data from Firestore 'profiles' collection
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

  const getStandardUpiUri = (amount) => {
    return (
      `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
      `&pn=${encodeURIComponent(PAYEE_NAME)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent('Cafe Booking with Parking')}`
    );
  };

  const getAppUri = (appType, customAmount) => {
    const payAmount = customAmount || rawTotalAmount;
    switch (appType) {
      case 'phonepe':
        return `phonepe://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${payAmount}&cu=INR`;
      case 'gpay':
        return `tez://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${payAmount}&cu=INR`;
      case 'paytm':
        return `paytmmp://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${payAmount}&cu=INR`;
      default:
        return getStandardUpiUri(payAmount);
    }
  };

  const getDynamicUpiQrUrl = (customAmount) => {
    const payAmount = customAmount || rawTotalAmount;
    const uri = getStandardUpiUri(payAmount);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  };

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

  const handleUtrChange = (e) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (rawValue.length <= 35) {
      setFormData((prev) => ({ ...prev, utr: rawValue }));
    }
  };

  const isNameValid = formData.name.trim().length >= 2;
  const isPhoneValid = formData.phone.trim().replace(/[\s+\-]/g, '').length >= 7;

  // Handle Booking Confirmation and Save to Firestore
  const handleConfirmBooking = async ({ paymentMethod, finalPayAmount, utrValue }) => {
    setErrorMessage('');

    if (!isNameValid || !isPhoneValid) {
      setErrorMessage('Kripya apna naam aur valid mobile number bharein.');
      return;
    }

    if (paymentMethod === 'upi' && (!utrValue || utrValue.trim().length < 6)) {
      setErrorMessage('Kripya valid 6+ digit UTR/Transaction Ref Number darj karein.');
      return;
    }

    if (paymentMethod === 'diamonds' && userRedeemableDiamonds < finalPayAmount) {
      setErrorMessage(`Aapke paas पर्याप्त diamonds nahi hain! Aapke paas ${userRedeemableDiamonds} hain, lekin ${finalPayAmount} chahiye.`);
      return;
    }

    setIsSubmitting(true);
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
    const earnedDiamonds = paymentMethod === 'upi' ? Math.floor(Number(bookingPrice) * 0.1) : 5;

    let finalUtRDisplay = '';
    if (paymentMethod === 'diamonds') {
      const remainingDiamonds = userRedeemableDiamonds - bookingPrice;
      finalUtRDisplay = `${userRedeemableDiamonds}-${bookingPrice}=${remainingDiamonds} (diamond)`;
    } else {
      finalUtRDisplay = utrValue.trim();
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
      created_time: createdTimeString,
      status: paymentMethod === 'diamonds' ? 'CONFIRMED' : 'PENDING',
      createdAt: serverTimestamp(),
    };

    try {
      // Save booking in Firestore 'bookings' collection
      await addDoc(collection(db, 'bookings'), bookingDetails);

      // Update User Profile points in Firestore if logged in
      if (currentUserId) {
        let newGamerPoints = userGamerPoints;
        let newRedeemableDiamonds = userRedeemableDiamonds;

        if (paymentMethod === 'diamonds') {
          newRedeemableDiamonds = Math.max(0, userRedeemableDiamonds - bookingPrice) + earnedDiamonds;
          newGamerPoints = userGamerPoints + earnedDiamonds;
        } else {
          newGamerPoints = userGamerPoints + earnedDiamonds;
          newRedeemableDiamonds = userRedeemableDiamonds + earnedDiamonds;
        }

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

  const handleModalClose = () => {
    setPaymentStep(1);
    setFormData({ name: '', phone: '', utr: '' });
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
    <div className="fixed inset-0 z-[10000] bg-[#08080a] sm:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto w-full max-w-full min-h-screen sm:min-h-0">
      <div className="bg-[#101014] border border-cyan-500/30 rounded-none sm:rounded-2xl w-full max-w-lg p-4 sm:p-6 relative shadow-2xl my-auto text-white min-h-screen sm:min-h-0 sm:max-h-[92vh] overflow-y-auto font-sans flex flex-col justify-start">
        
        {/* Close / Back Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Free Parking Included Notification Badge */}
        <div className="mb-3 mt-8 sm:mt-0 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs font-mono">
          <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Parking Include: 1 Two Wheeler Free with booking!</span>
        </div>

        {paymentStep === 1 && (
          <div className="w-full">
            <h3 className="text-base sm:text-lg font-black font-orbitron text-cyan-400 flex items-center gap-2 mb-3 pr-10">
              <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
              SELECT TIMINGS & RIG
            </h3>

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
              handleUtrChange={handleUtrChange}
              isNameValid={isNameValid}
              isPhoneValid={isPhoneValid}
              errorMessage={errorMessage}
              isSubmitting={isSubmitting}
              getAppUri={getAppUri}
              standardUpiUri={getStandardUpiUri}
              getDynamicUpiQrUrl={getDynamicUpiQrUrl}
              UPI_ID={UPI_ID}
              onBack={() => setPaymentStep(1)}
              onConfirm={handleConfirmBooking}
            />
          </div>
        )}

        {paymentStep === 3 && confirmedBookingDetails && (
          <div className="text-center py-4 w-full">
            <div className="w-14 h-14 bg-cyan-500/20 text-cyan-400 border border-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black font-orbitron text-white">
              BOOKING SUBMITTED!
            </h3>

            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Cafe counter par yeh Booking ID dikhayein.
            </p>

            <div className="mt-4 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 inline-flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">BOOKING ID:</span>
              <span className="text-base font-black font-orbitron text-cyan-300 tracking-wider">
                {confirmedBookingDetails.id}
              </span>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Booking Date:</span>
                <span className="text-purple-300 font-bold">{confirmedBookingDetails.bookingDate}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Booked At:</span>
                <span className="text-cyan-300 font-bold">{confirmedBookingDetails.created_time || 'Just now'}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Customer Name:</span>
                <span className="text-white font-bold">{confirmedBookingDetails.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Phone Number:</span>
                <span className="text-white font-bold">{confirmedBookingDetails.phone}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Platform & Game:</span>
                <span className="text-cyan-400 font-bold">
                  {confirmedBookingDetails.category}{' '}
                  {confirmedBookingDetails.screen ? `(${confirmedBookingDetails.screen})` : ''}
                  {confirmedBookingDetails.selectedGame ? ` - ${confirmedBookingDetails.selectedGame}` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-red-400 font-bold">Reserved Slot:</span>
                <span className="text-red-400 font-bold whitespace-pre-line">{confirmedBookingDetails.slot}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Duration & Perks:</span>
                <span className="text-emerald-300 font-bold">{confirmedBookingDetails.duration} + Free Parking (1 Bike)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">UTR / Mode:</span>
                <span className="text-purple-300 font-bold font-mono tracking-wider break-all">
                  {confirmedBookingDetails.utr}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-zinc-400">Total Amount:</span>
                <span className="text-emerald-400 font-black text-sm font-orbitron">
                  ₹{confirmedBookingDetails.price}
                </span>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="mt-4 w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer transition-all"
            >
              DONE / CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
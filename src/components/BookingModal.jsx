import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import BookingAvailability from './Booking/BookingAvailability';
import BookingPayment from './Booking/BookingPayment';

const UPI_ID = 'hamaad.afraan@ybl';
const PAYEE_NAME = 'Strangers Gaming Cafe';

// Helper: Local Today's Date String in YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${day}-${month}`; // YYYY-MM-DD format
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
  startTime,
  endTime,
}) => {
  if (startTime === null || endTime === null) return 0;

  const currentStation = stations.find((s) => s.id === selectedCategory);
  if (!currentStation) return 0;

  const totalMinutes = endTime - startTime;
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
  // Hardcoded 'Today' ki jagah dynamic date set karein
  const [bookingDate, setBookingDate] = useState(getTodayDateString());
  const [selectedCategory, setSelectedCategory] = useState('PS5');
  const [selectedScreen, setSelectedScreen] = useState('55" VIP');
  const [selectedTeam, setSelectedTeam] = useState('1 Player');

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [paymentStep, setPaymentStep] = useState(1);

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

  // Date change hone par timings reset karein
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
    startTime,
    endTime,
  });

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const envUrl = import.meta.env?.VITE_API_BASE_URL;
      if (envUrl) return envUrl;
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return 'http://localhost:5000';
  };

  const getStandardUpiUri = (amount) => {
    return (
      `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
      `&pn=${encodeURIComponent(PAYEE_NAME)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent('Cafe Booking')}`
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
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length <= 10) {
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
  const isPhoneValid = formData.phone.trim().length === 10;
  const isUtrValid = formData.utr.trim().length >= 6;

  const handleConfirmBooking = async (finalPayAmount) => {
    setErrorMessage('');

    if (!isNameValid || !isPhoneValid || !isUtrValid) {
      alert('Please fill all details correctly!');
      return;
    }

    setIsSubmitting(true);
    const bookingId = `STR-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeSlotString = `${minutesToTimeString(startTime)} - ${minutesToTimeString(endTime)}`;
    const now = new Date();
    const createdTimeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const bookingDetails = {
      id: bookingId,
      name: formData.name.trim(),
      customer_name: formData.name.trim(),
      phone: formData.phone.trim(),
      utr: formData.utr.trim(),
      bookingDate, // Dynamic selected date YYYY-MM-DD yahan pass hogi
      category: selectedCategory,
      station_id: selectedCategory,
      screen: currentStation?.hasScreens ? selectedScreen : '',
      team: currentStation?.multiplayer ? selectedTeam : '1 Player',
      duration: formatDurationText(endTime - startTime),
      slot: timeSlotString,
      slot_time: timeSlotString,
      price: typeof finalPayAmount === 'number' ? finalPayAmount : rawTotalAmount,
      created_time: createdTimeString,
      status: 'PENDING',
      createdAt: now.toISOString(),
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(bookingDetails),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setErrorMessage(data.message || 'Booking failed. Slot may already be taken.');
        setIsSubmitting(false);
        return;
      }

      const finalSavedBooking = data.booking || bookingDetails;
      if (typeof onBookingCreated === 'function') onBookingCreated(finalSavedBooking);
      setConfirmedBookingDetails(finalSavedBooking);
      setPaymentStep(3);
    } catch (error) {
      if (typeof onBookingCreated === 'function') onBookingCreated(bookingDetails);
      setConfirmedBookingDetails(bookingDetails);
      setPaymentStep(3);
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
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto w-full max-w-full">
      <div className="bg-[#101014] border border-white/20 rounded-2xl sm:rounded-3xl w-full max-w-2xl p-4 sm:p-8 relative shadow-2xl my-auto text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleModalClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 text-zinc-300 hover:text-white cursor-pointer transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1 */}
        {paymentStep === 1 && (
          <div className="w-full">
            <h3 className="text-lg sm:text-2xl font-black font-orbitron text-cyan-400 flex items-center gap-2 mb-2 pr-8">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
              SELECT TIMINGS & RIG
            </h3>

            <BookingAvailability
              bookingDate={bookingDate}
              setBookingDate={handleDateChange} // Date change handler pass kiya
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedScreen={selectedScreen}
              setSelectedScreen={setSelectedScreen}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
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

        {/* STEP 2 */}
        {paymentStep === 2 && (
          <div className="w-full">
            <BookingPayment
              bookingDate={bookingDate}
              selectedCategory={selectedCategory}
              selectedScreen={selectedScreen}
              selectedTeam={selectedTeam}
              currentStation={currentStation}
              startTime={startTime}
              endTime={endTime}
              totalAmount={rawTotalAmount}
              formatDurationText={formatDurationText}
              minutesToTimeString={minutesToTimeString}
              formData={formData}
              handleNameChange={handleNameChange}
              handlePhoneChange={handlePhoneChange}
              handleUtrChange={handleUtrChange}
              isNameValid={isNameValid}
              isPhoneValid={isPhoneValid}
              isUtrValid={isUtrValid}
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

        {/* STEP 3 */}
        {paymentStep === 3 && confirmedBookingDetails && (
          <div className="text-center py-2 sm:py-4 w-full">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 text-cyan-400 border border-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white">
              BOOKING SUBMITTED!
            </h3>

            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 font-mono">
              Show this Booking ID at the cafe counter.
            </p>

            <div className="mt-4 p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/40 inline-flex items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs font-mono text-zinc-400">BOOKING ID:</span>
              <span className="text-base sm:text-lg font-black font-orbitron text-cyan-300 tracking-wider">
                {confirmedBookingDetails.id}
              </span>
            </div>

            <div className="mt-5 p-3.5 sm:p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 font-mono text-[11px] sm:text-xs">
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Booking Date:</span>
                <span className="text-purple-300 font-bold">{confirmedBookingDetails.bookingDate}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Booked At (Time):</span>
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
                <span className="text-zinc-400">Platform:</span>
                <span className="text-cyan-400 font-bold">
                  {confirmedBookingDetails.category}{' '}
                  {confirmedBookingDetails.screen ? `(${confirmedBookingDetails.screen})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-red-400 font-bold">Reserved Slot:</span>
                <span className="text-red-400 font-bold">{confirmedBookingDetails.slot}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Duration:</span>
                <span className="text-amber-300 font-bold">{confirmedBookingDetails.duration}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-zinc-400">Transaction Ref / UTR:</span>
                <span className="text-purple-300 font-bold font-mono tracking-wider break-all">
                  {confirmedBookingDetails.utr}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-zinc-400">Total Amount Paid:</span>
                <span className="text-emerald-400 font-black text-sm font-orbitron">
                  ₹{confirmedBookingDetails.price}
                </span>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="mt-5 w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-black text-xs shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer transition-all"
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
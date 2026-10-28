import React, { useState } from 'react';
import { X, Info, ArrowLeft, ShieldCheck } from 'lucide-react';

const BookingPayment = ({
  bookingDate,
  selectedCategory,
  selectedScreen,
  selectedTeam,
  currentStation,
  startTime,
  endTime,
  totalAmount: rawTotalAmount,
  userRedeemableDiamonds = 0,
  formatDurationText,
  minutesToTimeString,
  formData,
  handleNameChange,
  handlePhoneChange,
  isNameValid,
  isPhoneValid,
  errorMessage,
  isSubmitting,
  onBack,
  onConfirm,
}) => {
  const [showPlatformChargeHelp, setShowPlatformChargeHelp] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const PLATFORM_FEE = 20;
  const baseAmount = Number(rawTotalAmount) || 0;
  const finalTotalAmount = baseAmount + PLATFORM_FEE;
  const finalPayAmount = finalTotalAmount;

  const hasEnoughDiamonds = userRedeemableDiamonds >= finalTotalAmount;

  return (
    <div className="w-full text-white pb-48 font-sans relative">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#ccff00] cursor-pointer mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Back to slot selection
      </button>

      <div>
        <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white uppercase tracking-wide">
          SECURE <span className="text-[#ccff00]">CHECKOUT</span>
        </h3>

        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 font-mono">
          Booking Date:{' '}
          <span className="text-[#ccff00] font-bold">
            {bookingDate}
          </span>
        </p>

        {errorMessage && (
          <div className="mt-3.5 p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs font-mono text-red-300 font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* BOOKING SUMMARY */}
        <div className="mt-4 p-4 rounded-2xl bg-[#181922] border border-white/10 space-y-2.5 text-xs font-mono shadow-md">
          <div className="flex justify-between text-zinc-300">
            <span className="text-zinc-400">Platform / Zone:</span>
            <span className="font-bold text-[#ccff00] font-orbitron truncate ml-2">
              {selectedCategory}{' '}
              {currentStation?.hasScreens ? `(${selectedScreen})` : ''}
            </span>
          </div>

          <div className="flex justify-between text-zinc-300">
            <span className="text-zinc-400">Selected Time Slot:</span>
            <span className="font-bold text-white">
              {minutesToTimeString(startTime)} - {minutesToTimeString(endTime)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-300">
            <span className="text-zinc-400">Duration / Players:</span>
            <span className="text-zinc-300">
              {formatDurationText(endTime - startTime)} • {selectedTeam}
            </span>
          </div>

          <div className="border-t border-white/10 pt-2.5 flex justify-between items-center text-sm sm:text-base font-bold font-orbitron text-[#ccff00]">
            <div className="flex items-center gap-1.5">
              <span>Total Amount:</span>
              <button
                type="button"
                onClick={() => setShowPlatformChargeHelp(true)}
                title="Platform Charge Info"
                className="inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-[#ccff00] hover:bg-white/10 transition-all cursor-pointer"
              >
                <Info className="w-4 h-4 text-[#ccff00]" />
              </button>
            </div>
            <span>₹{finalTotalAmount}</span>
          </div>
        </div>

        {/* CUSTOMER FORM */}
        <div className="mt-4 p-4.5 rounded-2xl bg-[#181922] border border-white/10 space-y-3.5 shadow-md">
          <h4 className="text-xs font-mono uppercase text-[#ccff00] font-bold">Player Details</h4>
          <div>
            <label className="text-xs text-zinc-400 font-mono block mb-1.5">
              Full Name <span className="text-[#ccff00]">*</span>
            </label>
            <input
              type="text"
              placeholder="Letters only (e.g. Hamaad Afraan)"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full p-3.5 rounded-xl bg-[#0a0a0c] border text-xs text-white placeholder:text-zinc-600 outline-none font-mono transition-all ${formData.name.length > 0 && !isNameValid
                  ? 'border-amber-500/80'
                  : isNameValid
                    ? 'border-[#ccff00] focus:border-[#ccff00] bg-[#ccff00]/5'
                    : 'border-white/10 focus:border-[#ccff00]'
                }`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-zinc-400 font-mono block">
                Mobile Number <span className="text-[#ccff00]">*</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-zinc-500">
                {formData.phone.length}/10
              </span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Exact 10-digit mobile number"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full p-3.5 rounded-xl bg-[#0a0a0c] border text-xs text-white placeholder:text-zinc-600 outline-none font-mono tracking-wider transition-all ${formData.phone.length > 0 && !isPhoneValid
                  ? 'border-amber-500/80 focus:border-amber-500'
                  : isPhoneValid
                    ? 'border-[#ccff00] focus:border-[#ccff00] bg-[#ccff00]/5'
                    : 'border-white/10 focus:border-[#ccff00]'
                }`}
            />
          </div>
        </div>

        {/* PAYMENT METHOD SELECTION TABS */}
        <div className="mt-5">
          <label className="text-xs text-[#ccff00] font-mono font-bold block mb-2.5 uppercase tracking-wider">
            ⚡ Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-2xl font-orbitron text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2.5 ${paymentMethod === 'upi'
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-zinc-400 border-white/10 hover:bg-white/10'
                }`}
            >
              <span>⚡</span> Razorpay UPI / Cards
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('diamonds')}
              className={`p-4 rounded-2xl font-orbitron text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2.5 ${paymentMethod === 'diamonds'
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-[#ccff00] border-white/10 hover:bg-white/10'
                }`}
            >
              <span>💎</span> Diamonds ({userRedeemableDiamonds})
            </button>
          </div>
        </div>

        {paymentMethod === 'upi' ? (
          <div className="mt-4 bg-[#181922] p-5 rounded-2xl border border-white/10 text-center space-y-3 shadow-md">
            <div className="w-12 h-12 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-full flex items-center justify-center mx-auto text-[#ccff00]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-orbitron font-bold text-white text-sm">Instant Automated Payment</h4>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Click below to open Razorpay secure checkout. Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Netbanking. Slot confirms instantly!
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-[#181922] p-4.5 rounded-2xl border border-[#ccff00]/30 text-center space-y-3.5 shadow-md">
            <div className="text-2xl animate-bounce">💎</div>
            <h4 className="font-orbitron font-bold text-[#ccff00] text-sm">
              Redeemable Diamonds Payment
            </h4>
            <p className="text-xs text-zinc-300 font-mono">
              You are paying <span className="text-[#ccff00] font-bold">₹{finalPayAmount}</span> using your redeemable diamonds balance.
            </p>
            <div className="p-3 bg-[#0a0a0c] rounded-xl border border-white/10 flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Your Balance:</span>
              <span className="text-[#ccff00] font-bold">{userRedeemableDiamonds} Diamonds</span>
            </div>
            {!hasEnoughDiamonds && (
              <p className="text-xs text-red-400 font-mono font-bold">
                ❌ Insufficient diamonds! Please choose Razorpay UPI.
              </p>
            )}
          </div>
        )}

        {/* STICKY BOTTOM CONFIRM BUTTON */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 flex items-center justify-between max-w-xl mx-auto shadow-2xl">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">Payable Amount</div>
            <div className="text-base font-black font-orbitron text-[#ccff00]">₹{finalPayAmount}</div>
          </div>
          <button
            type="button"
            disabled={
              !isNameValid ||
              !isPhoneValid ||
              isSubmitting ||
              (paymentMethod === 'diamonds' && !hasEnoughDiamonds)
            }
            onClick={() =>
              onConfirm &&
              onConfirm({
                paymentMethod,
                finalPayAmount: finalTotalAmount,
              })
            }
            className="px-8 py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.45)] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? 'PROCESSING...'
              : paymentMethod === 'diamonds'
                ? 'REDEEM & CONFIRM'
                : `Pay ₹${finalPayAmount} via Razorpay`}
          </button>
        </div>
      </div>

      {/* PLATFORM CHARGE HELP POPUP */}
      {showPlatformChargeHelp && (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-[#ccff00]/50 rounded-2xl w-full max-w-sm p-5 relative text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPlatformChargeHelp(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black font-orbitron text-[#ccff00] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#ccff00]" />
              Payment Breakdown
            </h4>

            <div className="mt-4 p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-2.5">
              <div className="flex justify-between text-zinc-300">
                <span>Slot Base Fare:</span>
                <span className="font-bold text-white">₹{baseAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Platform Charge:</span>
                <span className="font-bold text-[#ccff00]">₹{PLATFORM_FEE}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-emerald-400">
                <span>Total Payable:</span>
                <span>₹{finalTotalAmount}</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-zinc-400 mt-3 leading-relaxed">
              - A standard ₹20 platform charge is added to support system updates & instant slot reservations.
            </p>

            <button
              type="button"
              onClick={() => setShowPlatformChargeHelp(false)}
              className="mt-4 w-full py-3 rounded-xl bg-[#ccff00] text-black font-orbitron font-bold text-xs cursor-pointer hover:bg-[#b8e600]"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPayment;
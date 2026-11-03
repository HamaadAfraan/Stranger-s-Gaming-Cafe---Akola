import React, { useState } from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';

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

  // PLATFORM / CONVENIENCE FEE SET TO ₹10
  const PLATFORM_FEE = 10;
  const baseAmount = Number(rawTotalAmount) || 0;
  const finalTotalAmount = baseAmount + PLATFORM_FEE;
  const finalPayAmount = finalTotalAmount;

  const hasEnoughDiamonds = userRedeemableDiamonds >= finalTotalAmount;

  return (
    <div className="w-full text-white pb-6 font-sans relative">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#ccff00] cursor-pointer mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#ccff00]" /> Back to slot selection
      </button>

      <div>
        <h3 className="text-lg sm:text-xl font-black font-orbitron text-white uppercase tracking-wide">
          PAYMENT & <span className="text-[#ccff00]">DETAILS</span>
        </h3>

        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-mono">
          Booking Date:{' '}
          <span className="text-[#ccff00] font-bold">
            {bookingDate}
          </span>
        </p>

        {errorMessage && (
          <div className="mt-3 p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-xs font-mono text-red-300 font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* BOOKING SUMMARY */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#181922] border border-white/10 space-y-2 text-xs font-mono shadow-md">
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

          {/* BASE AMOUNT */}
          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono text-zinc-300">
            <span className="text-zinc-400">Base Amount:</span>
            <span className="text-white font-bold">₹{baseAmount}</span>
          </div>

          {/* PLATFORM / CONVENIENCE FEE */}
          <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Platform / Convenience Fee:</span>
              <button
                type="button"
                onClick={() => setShowPlatformChargeHelp(!showPlatformChargeHelp)}
                title="Platform Charge Info"
                className="inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-[#ccff00] hover:bg-white/10 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#ccff00]" />
              </button>
            </div>
            <span className="text-white font-bold">₹{PLATFORM_FEE}</span>
          </div>

          {showPlatformChargeHelp && (
            <div className="text-[10px] text-zinc-400 bg-[#0a0a0c] p-2 rounded-lg border border-white/10 mt-1 font-mono">
              Platform Charges !
            </div>
          )}

          {/* TOTAL AMOUNT */}
          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-bold font-orbitron text-[#ccff00]">
            <span>Total Amount:</span>
            <span>₹{finalTotalAmount}</span>
          </div>
        </div>

        {/* CUSTOMER FORM */}
        <div className="mt-3.5 p-3.5 rounded-xl bg-[#181922] border border-white/10 space-y-3 shadow-md">
          <h4 className="text-xs font-mono uppercase text-[#ccff00] font-bold">Player Details</h4>
          <div>
            <label className="text-xs text-zinc-400 font-mono block mb-1">
              Full Name <span className="text-[#ccff00]">*</span>
            </label>
            <input
              type="text"
              placeholder="Letters only (e.g. John Doe)"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full py-2.5 px-3 rounded-xl bg-[#0a0a0c] border text-xs text-white placeholder:text-zinc-600 outline-none font-mono transition-all ${
                formData.name.length > 0 && !isNameValid
                  ? 'border-amber-500/80'
                  : isNameValid
                  ? 'border-[#ccff00] focus:border-[#ccff00] bg-[#ccff00]/5'
                  : 'border-white/10 focus:border-[#ccff00]'
              }`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
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
              className={`w-full py-2.5 px-3 rounded-xl bg-[#0a0a0c] border text-xs text-white placeholder:text-zinc-600 outline-none font-mono tracking-wider transition-all ${
                formData.phone.length > 0 && !isPhoneValid
                  ? 'border-amber-500/80 focus:border-amber-500'
                  : isPhoneValid
                  ? 'border-[#ccff00] focus:border-[#ccff00] bg-[#ccff00]/5'
                  : 'border-white/10 focus:border-[#ccff00]'
              }`}
            />
          </div>
        </div>

        {/* PAYMENT METHOD SELECTION TABS */}
        <div className="mt-4">
          <label className="text-xs text-[#ccff00] font-mono font-bold block mb-2 uppercase tracking-wider">
            ⚡ Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMethod === 'upi'
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-zinc-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>💳</span> Razorpay / Online
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('diamonds')}
              className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                paymentMethod === 'diamonds'
                  ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.45)]'
                  : 'bg-[#181922] text-[#ccff00] border-white/10 hover:bg-white/10'
              }`}
            >
              <span>💎</span> Diamonds ({userRedeemableDiamonds})
            </button>
          </div>
        </div>

        {/* CONDITIONAL DIAMONDS INFO VIEW */}
        {paymentMethod === 'diamonds' && (
          <div className="mt-3.5 bg-[#181922] p-3.5 rounded-xl border border-[#ccff00]/30 text-center space-y-2.5 shadow-md">
            <div className="text-xl animate-bounce">💎</div>
            <h4 className="font-orbitron font-bold text-[#ccff00] text-xs">
              Redeemable Diamonds Payment
            </h4>
            <p className="text-xs text-zinc-300 font-mono">
              You are paying <span className="text-[#ccff00] font-bold">₹{finalPayAmount}</span> using your redeemable diamonds balance.
            </p>
            <div className="py-2 px-3 bg-[#0a0a0c] rounded-lg border border-white/10 flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Your Balance:</span>
              <span className="text-[#ccff00] font-bold">{userRedeemableDiamonds} Diamonds</span>
            </div>
            {!hasEnoughDiamonds && (
              <p className="text-[11px] text-red-400 font-mono font-bold">
                ❌ Insufficient diamonds! Please choose Online Payment.
              </p>
            )}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="mt-5">
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
                paymentMethod: paymentMethod === 'upi' ? 'razorpay' : 'diamonds',
                finalPayAmount: finalTotalAmount,
                utrValue: 'ONLINE_RAZORPAY',
              })
            }
            className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? 'PROCESSING...'
              : paymentMethod === 'diamonds'
              ? 'REDEEM & CONFIRM'
              : `PAY ₹{finalPayAmount} VIA RAZORPAY`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;
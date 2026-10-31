import React, { useState } from 'react';
import { X, HelpCircle, Info, ArrowLeft } from 'lucide-react';

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
  handleUtrChange,
  isNameValid,
  isPhoneValid,
  errorMessage,
  isSubmitting,
  getAppUri,
  standardUpiUri,
  getDynamicUpiQrUrl,
  UPI_ID,
  onBack,
  onConfirm,
}) => {
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [showPlatformChargeHelp, setShowPlatformChargeHelp] = useState(false);
  const [activeAppHelp, setActiveAppHelp] = useState('phonepe');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // PLATFORM CHARGE REMOVED (Set to 0 as requested)
  const PLATFORM_FEE = 0;
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

          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-bold font-orbitron text-[#ccff00]">
            <div className="flex items-center gap-1.5">
              <span>Total Amount:</span>
              {PLATFORM_FEE > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPlatformChargeHelp(true)}
                  title="Platform Charge Info"
                  className="inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-[#ccff00] hover:bg-white/10 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#ccff00]" />
                </button>
              )}
            </div>
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
              <span>💳</span> UPI / QR Pay
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

        {/* CONDITIONAL PAYMENT VIEW */}
        {paymentMethod === 'upi' ? (
          <div className="mt-3.5 bg-[#181922] p-3.5 rounded-xl border border-white/10 space-y-3 shadow-md">
            <div className="bg-[#181922] p-4 rounded-xl border border-emerald-500/30 text-center space-y-2">
                    <p className="text-xs text-zinc-300 font-mono">RULE</p>
                    <div className="text-sm font-black font-orbitron text-[#ccff00]">Take A Screenshot of QR & Pay From Your Favourite UPI App & Enter Tarnsaction ID</div>
                  </div>

            {/* QR */}
            <div className="text-center pt-0.5">
              <div className="w-36 h-36 bg-white p-2.5 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                <img
                  src={getDynamicUpiQrUrl(finalPayAmount)}
                  alt="Dynamic Payment QR Code"
                  className="w-32 h-32 object-contain mx-auto"
                />
              </div>

              <div className="text-sm font-black font-orbitron mt-2 text-[#ccff00]">
                Scan to Pay : ₹{finalPayAmount}
              </div>

          {/*}    <p className="text-[10px] font-mono text-zinc-400 mt-1">
                🔒 Paying to (<span className="text-white font-bold">{UPI_ID}</span>). Enter UTR below after payment.
              </p> */}
            </div>
          </div>
        ) : (
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
                ❌ Insufficient diamonds! Please choose UPI.
              </p>
            )}
          </div>
        )}

        {/* UTR Input Section */}
        {paymentMethod === 'upi' && (
          <div className="mt-4 relative z-10 p-3 rounded-xl bg-[#181922] border border-[#ccff00]/40 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-300 font-mono font-bold flex items-center gap-1">
                Transaction ID / UTR <span className="text-[#ccff00]">*</span>
              </label>

              <button
                type="button"
                onClick={() => setShowUtrHelp(true)}
                className="text-[10px] text-[#ccff00] hover:text-[#b8e600] font-mono flex items-center gap-1 bg-[#ccff00]/10 border border-[#ccff00]/30 px-2 py-0.5 rounded-md cursor-pointer transition-all shrink-0"
              >
                <HelpCircle className="w-3 h-3 text-[#ccff00]" />
                Where to find?
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter 12-digit UTR or Ref No."
              value={formData.utr}
              onChange={handleUtrChange}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0a0a0c] border border-white/20 text-xs text-white placeholder:text-zinc-500 outline-none font-mono tracking-wider focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all"
            />
          </div>
        )}

        {/* STICKY BOTTOM FLOATING CONFIRM BUTTON */}
        <div className="sticky bottom-3 mt-5 bg-[#181922]/95 backdrop-blur-md border border-white/15 p-3 rounded-2xl z-40 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div>
            <div className="text-[9px] font-mono text-zinc-400 uppercase leading-none mb-1">Payable Amount</div>
            <div className="text-sm font-black font-orbitron text-[#ccff00]">₹{finalPayAmount}</div>
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
                utrValue: formData.utr,
              })
            }
            className="px-5 py-2.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black font-orbitron text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isSubmitting
              ? 'PROCESSING...'
              : paymentMethod === 'diamonds'
              ? 'REDEEM & CONFIRM'
              : `PAY ₹${finalPayAmount} NOW`}
          </button>
        </div>
      </div>

      {/* UTR HELP POPUP */}
      {showUtrHelp && (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-[#ccff00]/50 rounded-2xl w-full max-w-md p-4 relative text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowUtrHelp(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base font-black font-orbitron text-[#ccff00] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#ccff00]" />
              Transaction ID / UTR Help
            </h4>

            <p className="text-xs text-zinc-300 font-mono mt-1.5">
              Which app did you use? Copy any of these fields from your payment receipt:
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { id: 'phonepe', name: 'PhonePe' },
                { id: 'gpay', name: 'Google Pay' },
                { id: 'paytm', name: 'Paytm' },
                { id: 'other', name: 'Other / BHIM' },
              ].map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setActiveAppHelp(app.id)}
                  className={`py-2 px-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    activeAppHelp === app.id
                      ? 'bg-[#ccff00] text-black border-[#ccff00] font-extrabold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
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
                  <p className="text-zinc-300 mb-1.5">You can enter either field under Payment Details:</p>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-purple-500/30 text-amber-300 space-y-1 text-xs">
                    <div><strong>UTR:</strong> 332202148824 (12 digits)</div>
                    <div className="break-all"><strong>PhonePe Transaction ID:</strong> T260901152...</div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'gpay' && (
                <div>
                  <div className="text-blue-400 font-bold mb-1">🌐 Google Pay Guidance:</div>
                  <p className="text-zinc-300 mb-1.5">Copy either of these IDs from your transaction screen:</p>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-blue-500/30 text-amber-300 space-y-1 text-xs">
                    <div><strong>UPI transaction ID:</strong> 616969042990 (12 digits)</div>
                    <div className="break-all"><strong>Google transaction ID:</strong> CICAgJj-ItfINg</div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'paytm' && (
                <div>
                  <div className="text-cyan-400 font-bold mb-1">💙 Paytm Guidance:</div>
                  <p className="text-zinc-300 mb-1.5">Use either field shown on your payment status screen:</p>
                  <div className="bg-zinc-900 p-2.5 rounded-xl border border-cyan-500/30 text-amber-300 space-y-1 text-xs">
                    <div><strong>UPI Ref No:</strong> 441584215640 (12 digits)</div>
                    <div className="break-all"><strong>Order ID:</strong> 202402181928050066</div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'other' && (
                <div>
                  <div className="text-emerald-400 font-bold mb-1">🏦 Other Apps / Banking:</div>
                  <p className="text-zinc-300">Copy any Reference Number, RRN, or Transaction ID from your payment receipt.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowUtrHelp(false)}
              className="mt-3.5 w-full py-2.5 rounded-xl bg-[#ccff00] text-black font-orbitron font-bold text-xs cursor-pointer hover:bg-[#b8e600]"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPayment;
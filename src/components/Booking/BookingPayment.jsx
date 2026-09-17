import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Info,
} from 'lucide-react';

const BookingPayment = ({
  bookingDate,
  selectedCategory,
  selectedScreen,
  selectedTeam,
  currentStation,
  startTime,
  endTime,
  totalAmount: rawTotalAmount, // Base rate (e.g. 100)
  formatDurationText,
  minutesToTimeString,
  formData,
  handleNameChange,
  handlePhoneChange,
  handleUtrChange,
  isNameValid,
  isPhoneValid,
  isUtrValid,
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

  // Add platform fee on this step
  const PLATFORM_FEE = 20;
  const baseAmount = Number(rawTotalAmount) || 0;
  const finalTotalAmount = baseAmount + PLATFORM_FEE;

  return (
    <div className="w-full text-white">
      <div>
        <h3 className="text-xl sm:text-2xl font-black font-orbitron text-red-500">
          PAYMENT & DETAILS
        </h3>

        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 font-mono">
          Booking Date:{' '}
          <span className="text-purple-400 font-bold">
            {bookingDate}
          </span>
        </p>

        {errorMessage && (
          <div className="mt-3 p-2.5 sm:p-3 bg-red-900/40 border border-red-500 rounded-xl text-[11px] sm:text-xs font-mono text-red-300 font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* BOOKING SUMMARY */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-[11px] sm:text-xs font-mono">
          <div className="flex justify-between text-zinc-300">
            <span>Platform / Zone:</span>

            <span className="font-bold text-cyan-400 truncate ml-2">
              {selectedCategory}{' '}
              {currentStation?.hasScreens
                ? `(${selectedScreen})`
                : ''}
            </span>
          </div>

          <div className="flex justify-between text-zinc-300">
            <span>Selected Time Slot:</span>

            <span className="font-bold text-amber-300">
              {minutesToTimeString(startTime)} - {minutesToTimeString(endTime)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-300">
            <span>Duration / Players:</span>

            <span className="text-white">
              {formatDurationText(endTime - startTime)} • {selectedTeam}
            </span>
          </div>

          <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm sm:text-base font-bold font-orbitron text-emerald-400">
            <div className="flex items-center gap-1.5">
              <span>Total Amount:</span>
              <button
                type="button"
                onClick={() => setShowPlatformChargeHelp(true)}
                title="Platform Charge Info"
                className="inline-flex items-center justify-center p-0.5 rounded-full text-zinc-400 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </button>
            </div>

            <span>₹{finalTotalAmount}</span>
          </div>
        </div>

        {/* CUSTOMER FORM */}
        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          <div>
            <label className="text-[11px] sm:text-xs text-zinc-400 font-mono block mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              placeholder="Letters only (e.g. John Doe)"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full p-2.5 sm:p-3 rounded-xl bg-white/5 border text-xs text-white placeholder:text-zinc-600 outline-none font-mono transition-all ${
                formData.name.length > 0 && !isNameValid
                  ? 'border-amber-500/80'
                  : isNameValid
                  ? 'border-emerald-500 focus:border-emerald-400 bg-emerald-950/10'
                  : 'border-white/10 focus:border-cyan-400'
              }`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] sm:text-xs text-zinc-400 font-mono block">
                Mobile Number <span className="text-red-500">*</span>
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
              className={`w-full p-2.5 sm:p-3 rounded-xl bg-white/5 border text-xs text-white placeholder:text-zinc-600 outline-none font-mono tracking-wider transition-all ${
                formData.phone.length > 0 && !isPhoneValid
                  ? 'border-amber-500/80 focus:border-amber-500'
                  : isPhoneValid
                  ? 'border-emerald-500 focus:border-emerald-400 bg-emerald-950/10'
                  : 'border-white/10 focus:border-cyan-400'
              }`}
            />

            {formData.phone.length > 0 && !isPhoneValid && (
              <p className="text-[10px] text-amber-400 font-mono mt-1">
                ⚠️ Enter a valid 10-digit mobile number.
              </p>
            )}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="mt-3 sm:mt-4 bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10 space-y-3 sm:space-y-4">
          <div>
            <p className="text-[11px] sm:text-xs font-mono text-cyan-400 font-bold mb-2 text-center uppercase tracking-wider">
              ⚡ Pay Directly via App / UPI Deep Link
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={getAppUri('phonepe', finalTotalAmount)}
                className="p-2 sm:p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/50 hover:bg-purple-800 text-white font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>💜</span>
                PhonePe
              </a>

              <a
                href={getAppUri('gpay', finalTotalAmount)}
                className="p-2 sm:p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/50 hover:bg-blue-800 text-white font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>🌐</span>
                Google Pay
              </a>

              <a
                href={getAppUri('paytm', finalTotalAmount)}
                className="p-2 sm:p-2.5 rounded-xl bg-cyan-900/60 border border-cyan-500/50 hover:bg-cyan-800 text-white font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>💙</span>
                Paytm
              </a>

              <a
                href={typeof standardUpiUri === 'function' ? standardUpiUri(finalTotalAmount) : standardUpiUri}
                className="p-2 sm:p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/50 hover:bg-emerald-800 text-white font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>⚡</span>
                Any UPI App
              </a>
            </div>

            <div className="relative my-2.5 sm:my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>

              <span className="relative bg-[#101014] px-2 text-[9px] sm:text-[10px] text-zinc-500 font-mono">
                OR SCAN QR CODE
              </span>
            </div>
          </div>

          {/* QR */}
          <div className="text-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white p-1.5 sm:p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <img
                src={getDynamicUpiQrUrl(finalTotalAmount)}
                alt="Dynamic Payment QR Code"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain mx-auto"
              />
            </div>

            <div className="text-sm sm:text-base font-black font-orbitron mt-2 text-emerald-400">
              Scan to Pay : ₹{finalTotalAmount}
            </div>

            <p className="text-[9px] sm:text-[10px] font-mono text-zinc-400 mt-1">
              🔒 Amount is paying to ({UPI_ID}).
              After Payment Enter the Transaction
              ID / UTR / Ref No. below.
            </p>
          </div>
        </div>

        {/* UTR */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] sm:text-xs text-zinc-400 font-mono font-semibold flex items-center gap-1">
              Payment Transaction ID / UTR / Ref No.
              <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowUtrHelp(true)}
              className="text-[10px] sm:text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-md cursor-pointer transition-all shrink-0"
            >
              <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              Where to find?
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter Transaction ID, UTR, or Ref No."
            value={formData.utr}
            onChange={handleUtrChange}
            className={`w-full p-2.5 sm:p-3 rounded-xl bg-white/5 border text-xs text-white placeholder:text-zinc-600 outline-none font-mono tracking-wider transition-all ${
              formData.utr.length > 0 && !isUtrValid
                ? 'border-amber-500/80 focus:border-amber-500'
                : isUtrValid
                ? 'border-emerald-500 focus:border-emerald-400 bg-emerald-950/10'
                : 'border-white/10 focus:border-cyan-400'
            }`}
          />

          {formData.utr.length > 0 && !isUtrValid && (
            <p className="text-[10px] text-amber-400 font-mono mt-1">
              ⚠️ Enter valid Transaction ID / UTR (min 6 chars).
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="w-1/3 py-2.5 sm:py-3 rounded-xl bg-white/10 font-orbitron text-xs font-bold text-zinc-300 cursor-pointer hover:bg-white/20 disabled:opacity-50"
          >
            &lt; BACK
          </button>

          <button
            type="button"
            disabled={
              !isNameValid ||
              !isPhoneValid ||
              !isUtrValid ||
              isSubmitting
            }
            onClick={() => onConfirm && onConfirm(finalTotalAmount)}
            className="w-2/3 py-2.5 sm:py-3 rounded-xl bg-red-500 hover:bg-red-600 font-orbitron text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'SUBMITTING...' : 'CONFIRM BOOKING'}
          </button>
        </div>
      </div>

      {/* PLATFORM CHARGE HELP POPUP */}
      {showPlatformChargeHelp && (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#18181f] border border-cyan-500/50 rounded-2xl w-full max-w-sm p-4 sm:p-5 relative text-white shadow-2xl">
            <button
              onClick={() => setShowPlatformChargeHelp(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm sm:text-base font-black font-orbitron text-cyan-400 flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              Payment Breakdown
            </h4>

            <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-2">
              <div className="flex justify-between text-zinc-300">
                <span>Slot Base Fare:</span>
                <span className="font-bold text-white">₹{baseAmount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Platform Charge:</span>
                <span className="font-bold text-cyan-400">₹{PLATFORM_FEE}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-emerald-400">
                <span>Total Payable:</span>
                <span>₹{finalTotalAmount}</span>
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 mt-2.5 leading-relaxed">
              * A standard ₹20 platform charge is added to support system updates & instant slot reservations.
            </p>

            <button
              onClick={() => setShowPlatformChargeHelp(false)}
              className="mt-3 sm:mt-4 w-full py-2.5 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs cursor-pointer hover:bg-cyan-400"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

      {/* UTR HELP POPUP */}
      {showUtrHelp && (
        <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#18181f] border border-cyan-500/50 rounded-2xl w-full max-w-md p-4 sm:p-5 relative text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUtrHelp(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-base sm:text-lg font-black font-orbitron text-cyan-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              Transaction ID / UTR Help
            </h4>

            <p className="text-[11px] sm:text-xs text-zinc-300 font-mono mt-1">
              Which app did you use? Copy any of these fields from your payment receipt:
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4">
              {[
                { id: 'phonepe', name: 'PhonePe' },
                { id: 'gpay', name: 'Google Pay' },
                { id: 'paytm', name: 'Paytm' },
                { id: 'other', name: 'Other / BHIM' },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveAppHelp(app.id)}
                  className={`p-2 sm:p-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    activeAppHelp === app.id
                      ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  {app.name}
                </button>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
              {activeAppHelp === 'phonepe' && (
                <div>
                  <div className="text-purple-400 font-bold mb-1">
                    📱 PhonePe Guidance:
                  </div>
                  <p className="text-zinc-300 mb-2">
                    You can enter either field under Payment Details:
                  </p>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-purple-500/30 text-amber-300 space-y-1 text-[11px] sm:text-xs">
                    <div>
                      • <strong>UTR:</strong> 332202148824 (12 digits)
                    </div>
                    <div className="break-all">
                      • <strong>PhonePe Transaction ID:</strong> T260901152...
                    </div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'gpay' && (
                <div>
                  <div className="text-blue-400 font-bold mb-1">
                    🌐 Google Pay Guidance:
                  </div>
                  <p className="text-zinc-300 mb-2">
                    Copy either of these IDs from your transaction screen:
                  </p>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-blue-500/30 text-amber-300 space-y-1 text-[11px] sm:text-xs">
                    <div>
                      • <strong>UPI transaction ID:</strong> 616969042990 (12 digits)
                    </div>
                    <div className="break-all">
                      • <strong>Google transaction ID:</strong> CICAgJj-ItfINg
                    </div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'paytm' && (
                <div>
                  <div className="text-cyan-400 font-bold mb-1">
                    💙 Paytm Guidance:
                  </div>
                  <p className="text-zinc-300 mb-2">
                    Use either field shown on your payment status screen:
                  </p>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-cyan-500/30 text-amber-300 space-y-1 text-[11px] sm:text-xs">
                    <div>
                      • <strong>UPI Ref No:</strong> 441584215640 (12 digits)
                    </div>
                    <div className="break-all">
                      • <strong>Order ID:</strong> 202402181928050066
                    </div>
                  </div>
                </div>
              )}

              {activeAppHelp === 'other' && (
                <div>
                  <div className="text-emerald-400 font-bold mb-1">
                    🏦 Other Apps / Banking:
                  </div>
                  <p className="text-zinc-300 mb-2">
                    Copy any Reference Number, RRN, or Transaction ID from your payment receipt.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowUtrHelp(false)}
              className="mt-3 sm:mt-4 w-full py-2.5 rounded-xl bg-cyan-500 text-black font-orbitron font-bold text-xs cursor-pointer hover:bg-cyan-400"
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
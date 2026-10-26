import React from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';

// Custom SVG Instagram Icon to fix missing export error in lucide-react
const InstagramIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Location = () => {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4407.924815902445!2d76.98327577524749!3d20.69399978087287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd731d1edf12f5f%3A0xd229468e97ef3e53!2sSTRANGER%E2%80%99S%20GAMING%20CAFE!5e1!3m2!1sen!2sin!4v1787936398027!5m2!1sen!2sin";

  return (
    <section id="location" className="py-12 sm:py-24 px-3.5 sm:px-6 max-w-6xl mx-auto border-t border-white/10 font-sans">
      {/* Header */}
      <div className="mb-6 sm:mb-10 text-center">
        <span className="text-[#ccff00] text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1 font-mono">
          BILL MART MALL AKOLA • GAMING LOUNGE LOCATION
        </span>
        <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tight font-orbitron text-white">
          VISIT <span className="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">STRANGER'S GAMING CAFE</span>
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto leading-relaxed font-mono">
          Located at Bill Mart Mall, Akola. Drop in for high-speed esports sessions, PS5 gaming, and racing simulators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-stretch">
        {/* Information Card Container */}
        <div className="bg-[#101014] border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between space-y-5 sm:space-y-6 shadow-xl">
          <div className="space-y-4 sm:space-y-6">
            
            {/* Address */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xl sm:rounded-2xl shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-[#ccff00]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-lg text-white font-orbitron">Address</h4>
                <p className="text-red-200 italic uppercase text-xs leading-relaxed mt-0.5">
                  Stranger's Gaming Cafe, 3rd Floor, Bill Mart Mall, Washim Bypass Road, Akola, Maharashtra.
                </p>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xl sm:rounded-2xl shrink-0 mt-0.5">
                <Navigation className="w-4 h-4 sm:w-6 sm:h-6 text-[#ccff00]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-lg text-white font-orbitron">Timings</h4>
                <p className="text-[#ccff00] text-xs sm:text-sm mt-0.5 font-mono font-bold whitespace-nowrap overflow-x-auto">
                  Daily 12PM - 10PM <span className="text-gray-300 font-normal">(Fri 3PM - 10PM)</span>
                </p>
              </div>
            </div>

            {/* Call / WhatsApp */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xl sm:rounded-2xl shrink-0 mt-0.5">
                <Phone className="w-4 h-4 sm:w-6 sm:h-6 text-[#ccff00]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-lg text-white font-orbitron">Call / WhatsApp</h4>
                <a 
                  href="https://wa.me/919185203313" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#ccff00] font-mono text-xs sm:text-sm font-bold hover:underline mt-0.5 block"
                >
                  +91 9185203313
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-xl sm:rounded-2xl shrink-0 mt-0.5">
                <InstagramIcon className="w-4 h-4 sm:w-6 sm:h-6 text-[#ccff00]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-lg text-white font-orbitron">Follow Us</h4>
                <a 
                  href="https://instagram.com/strangers_gaming_cafe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#ccff00] text-xs sm:text-sm font-bold hover:underline mt-0.5 inline-block font-mono break-all"
                >
                  @strangers_gaming_cafe
                </a>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <a 
            href="https://maps.app.goo.gl/ePevuQZMXxJEpyUV9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-black py-3 sm:py-3.5 rounded-xl text-xs uppercase tracking-widest text-center transition active:scale-95 block mt-2 font-orbitron shadow-lg shadow-[#ccff00]/15"
          >
            OPEN IN GOOGLE MAPS APP &gt;
          </a>
        </div>  

        {/* Live Satellite Google Maps Container */}
        <div className="w-full h-[260px] xs:h-[300px] sm:h-auto min-h-[260px] sm:min-h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#ccff00]/30 shadow-xl shadow-[#ccff00]/10 relative">
          <iframe
            title="Stranger's Gaming Cafe Satellite Location Akola"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            className="w-full h-full border-0 min-h-[260px] sm:min-h-[400px]"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};
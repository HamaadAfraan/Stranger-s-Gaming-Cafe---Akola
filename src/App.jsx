import React, { useState, useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Perks } from './components/Perks';
import { Zones } from './components/Zones';
import { Pricing } from './components/Pricing';
import { GamesLibrary } from './components/GamesLibrary';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import { supabase } from './supabaseClient';
import { GalleryExperience } from './components/GalleryExperience';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'profile'
  const [session, setSession] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Direct Supabase se latest booked slots fetch karne ka function
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        console.error('Error fetching bookings from Supabase:', error);
      } else {
        setBookedSlots(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch booked slots in App.jsx:', error);
    }
  };

  // Initial load aur Realtime Subscription
  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Modal open hote hi body scroll prevent karna
  useEffect(() => {
    if (isBookingOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isBookingOpen]);

  const handleOpenBooking = () => {
    fetchBookings();
    setIsBookingOpen(true);
  };

  const handleBookingCreated = (newBooking) => {
    setBookedSlots((prevSlots) => [...prevSlots, newBooking]);
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white relative font-sans selection:bg-red-600 selection:text-white w-full overflow-x-hidden">
      {/* Custom Cursor only on Desktop/Pointer devices */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenLogin={() => setShowLoginModal(true)}
        session={session}
        onOpenProfile={() => setCurrentView('profile')}
      />

      {/* Conditionally render Profile Page or Homepage */}
      {currentView === 'profile' && session ? (
        <ProfilePage
          session={session}
          bookedSlots={bookedSlots}
          onBack={() => setCurrentView('home')}
          onOpenBooking={handleOpenBooking} // Fixed: Prop connected for opening booking modal
          onLogout={async () => {
            await supabase.auth.signOut();
            setSession(null);
            setCurrentView('home');
          }}
        />
      ) : (
        <main className="w-full overflow-x-hidden">
          <section id="home" className="w-full">
            <Hero onOpenBooking={handleOpenBooking} />
            <Stats />
          </section>

          <section id="zones" className="w-full">
            <Zones />
          </section>

          <section id="gallery" className="w-full">
            <GalleryExperience />
          </section>
          
          <section id="pricing" className="w-full">
            <Pricing onOpenBooking={handleOpenBooking} />
            <Perks />
          </section>

          <section id="games" className="w-full">
            <GamesLibrary />
          </section>

          <section id="location" className="w-full">
            <Location />
          </section>
        </main>
      )}

      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          fetchBookings();
        }}
        bookedSlots={bookedSlots}
        onBookingCreated={handleBookingCreated}
      />

      {/* Login / Signup Modal */}
      {showLoginModal && (
        <Login
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(user) => {
            setSession(user);
            setShowLoginModal(false);
          }}
        />
      )}
    </div>
  );
}

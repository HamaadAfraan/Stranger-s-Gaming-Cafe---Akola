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
import { GalleryExperience } from './components/GalleryExperience';

// Firebase imports (Unchanged)
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

export default function App() {
  // 1️⃣ CHANGE: Page refresh hone par localStorage se purana view check karega
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('current_app_view') || 'home';
  });

  const [session, setSession] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  // 2️⃣ CHANGE: Jab bhi currentView badlega, usko localStorage me save kar denge
  useEffect(() => {
    localStorage.setItem('current_app_view', currentView);
  }, [currentView]);

  // 📱 iOS Safari Double-Tap Zoom Prevent Listener
  useEffect(() => {
    let lastTouchEnd = 0;
    const handleTouchEnd = (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, []);

  // Firebase Auth State Listener (Safari Safe)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setSession(user);
    });

    return () => unsubscribeAuth();
  }, []);

  // Firestore bookings fetch function
  const fetchBookings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      const bookingsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookedSlots(bookingsList);
    } catch (error) {
      console.error('Error fetching bookings from Firestore:', error);
    }
  };

  // Real-time listener for bookings using Firestore onSnapshot
  useEffect(() => {
    fetchBookings();

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookedSlots(bookingsList);
    }, (error) => {
      console.error('Firestore real-time sync error:', error);
    });

    return () => unsubscribeBookings();
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
    // Agar user logged in nahi hai, toh Login modal open karo aur booking roko
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    // Agar logged in hai, tabhi booking khulegi
    fetchBookings();
    setIsBookingOpen(true);
  };

  const handleBookingCreated = (newBooking) => {
    setBookedSlots((prevSlots) => [...prevSlots, newBooking]);
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white relative font-sans selection:bg-[#ccff00] selection:text-black w-full overflow-x-hidden pb-16 md:pb-0">
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      <Navbar
  onOpenBooking={handleOpenBooking}
  onOpenLogin={() => setShowLoginModal(true)}
  session={session}
  onOpenProfile={() => setCurrentView('profile')}
  onGoHome={() => setCurrentView('home')}  // <-- Yeh line add karni hai
/>

      {currentView === 'profile' && session ? (
        <ProfilePage
          session={session}
          bookedSlots={bookedSlots}
          onBack={() => setCurrentView('home')}
          onOpenBooking={handleOpenBooking}
          onLogout={async () => {
            try {
              await signOut(auth);
              setSession(null);
              setCurrentView('home');
            } catch (error) {
              console.error('Logout error:', error);
            }
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

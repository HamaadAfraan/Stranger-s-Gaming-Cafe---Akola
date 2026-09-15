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

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Backend se latest booked slots fetch karne ka complete function
  const fetchBookings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://handiwork-pegboard-rebuild.ngrok-free.dev';
      
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Ngrok initial warning bypass
        }
      });

      if (response.ok) {
        const data = await response.json();
        // API response format normalization
        const slotsArray = Array.isArray(data) ? data : (data.bookings || data.data || []);
        console.log('SYNCED BOOKINGS DATA:', slotsArray);
        setBookedSlots(slotsArray);
      } else {
        console.error('Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch booked slots in App.jsx:', error);
    }
  };

  // Initial load aur 5-second interval automatic background re-sync
  useEffect(() => {
    fetchBookings();

    const intervalId = setInterval(() => {
      fetchBookings();
    }, 5000); // Har 5 second me auto update

    return () => clearInterval(intervalId);
  }, []);

  // Modal open hote hi body scroll prevent karna
  useEffect(() => {
    if (isBookingOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBookingOpen]);

  const handleOpenBooking = () => {
    fetchBookings(); // Modal open hone se pehle fast re-fetch
    setIsBookingOpen(true);
  };

  // Nayi booking confirmation par instant state update callback
  const handleBookingCreated = (newBooking) => {
    setBookedSlots((prevSlots) => [...prevSlots, newBooking]);
    fetchBookings(); // Immediate background re-fetch for perfect sync
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white relative font-sans selection:bg-red-600 selection:text-white">
      <CustomCursor />
      <Navbar onOpenBooking={handleOpenBooking} />
      
      {/* Har section ke liye specific ID yahan add kar di gayi hai */}
      <section id="home">
        <Hero onOpenBooking={handleOpenBooking} />
        <Stats />
      </section>

      <section id="zones">
        <Zones />
      </section>

      <section id="pricing">
        <Pricing onOpenBooking={handleOpenBooking} />
        <Perks />
      </section>

      <section id="games">
        <GamesLibrary />
      </section>

      <section id="location">
        <Location />
      </section>

      <Footer />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          fetchBookings(); // Modal close hone par turant re-sync
        }} 
        bookedSlots={bookedSlots} 
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
}
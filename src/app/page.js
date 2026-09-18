"use client";
import React, { useState } from "react";
import BrandAnnouncementBar from "@/components/BrandAnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BrandPartners from "@/components/BrandPartners";
import RoyalExperience from "@/components/RoyalExperience";
import CelebrityArtists from "@/components/CelebrityArtists";
import PassTiers, { PASS_OPTIONS } from "@/components/PassTiers";
import EventSchedule from "@/components/EventSchedule";
import GalleryShowcase from "@/components/GalleryShowcase";
import RulesAndFaq from "@/components/RulesAndFaq";
import Footer from "@/components/Footer";
import RegistrationModal from "@/components/RegistrationModal";
import DigitalPass from "@/components/DigitalPass";
import PassLookupModal from "@/components/PassLookupModal";
import AdminDashboard from "@/components/Admin/AdminDashboard";

export default function Home() {
  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPassTier, setSelectedPassTier] = useState(PASS_OPTIONS[1]); // Default to Gold Couple
  const [activePassData, setActivePassData] = useState(null); // For DigitalPass view
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Handlers
  const handleOpenRegister = (tier = null) => {
    if (tier) {
      setSelectedPassTier(tier);
    }
    setIsRegisterOpen(true);
  };

  const handleRegistrationSuccess = (newPass) => {
    setIsRegisterOpen(false);
    setActivePassData(newPass);
  };

  const handleSelectFromLookup = (pass) => {
    setIsLookupOpen(false);
    setActivePassData(pass);
  };

  return (
    <main className="min-h-screen bg-[#07020f] text-white selection:bg-amber-400 selection:text-black">
      {/* 1. Top Brand Announcement Marquee */}
      <BrandAnnouncementBar />

      {/* 2. Top Luxury Navigation */}
      <Navbar
        onOpenRegister={() => handleOpenRegister()}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 3. Majestic Hero Section with Live Glass Countdown */}
      <Hero
        onOpenRegister={() => handleOpenRegister()}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* 4. Brand Partners & Media Marquee */}
      <BrandPartners />

      {/* 5. The Royal Experience (Production Infrastructure & Amenities) */}
      <RoyalExperience />

      {/* 6. Celebrity Star Headliners Lineup */}
      <CelebrityArtists />

      {/* 7. Pass Collection & VIP Emperor Tiers */}
      <PassTiers onSelectPass={(tier) => handleOpenRegister(tier)} />

      {/* 8. Curated Event Itinerary */}
      <EventSchedule />

      {/* 9. Visual Splendor Gallery & Social Proof */}
      <GalleryShowcase />

      {/* 10. Royal Protocol Guidelines & FAQ */}
      <RulesAndFaq />

      {/* 11. Luxury Brand Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRegister={() => handleOpenRegister()}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Registration & Payment Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        initialPass={selectedPassTier}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* 2. VIP Concert Laminate E-Ticket Badge */}
      {activePassData && (
        <DigitalPass
          passData={activePassData}
          onClose={() => setActivePassData(null)}
        />
      )}

      {/* 3. Pass Retrieval / Find My Pass */}
      <PassLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onSelectPass={handleSelectFromLookup}
      />

      {/* 4. Admin Management & Gate Check-in Center */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onViewPass={(pass) => {
          setIsAdminOpen(false);
          setActivePassData(pass);
        }}
      />
    </main>
  );
}

"use client";
import React from "react";
import { Mic2, Music, Disc3, Radio, Sparkles } from "lucide-react";

export default function CelebrityArtists() {
  const artists = [
    {
      name: "DJ NYK & The Raas Collective",
      role: "Electronic Folk & EDM Headliner",
      genre: "Bollywood EDM • High-Voltage Synth Raas",
      tag: "Day 2 & 3 Finale",
      icon: Disc3,
      badge: "India's #1 Bollywood DJ",
      time: "10:00 PM – Midnight"
    },
    {
      name: "Saurabh & The 100-Dhol Symphony",
      role: "Acoustic Percussion Masterminds",
      genre: "Puneri Dhol • Gujarati Nagada • Tasha Percussion",
      tag: "All 3 Nights Opening",
      icon: Music,
      badge: "World Record Percussionists",
      time: "08:15 PM – 09:45 PM"
    },
    {
      name: "Radhika Vyas & Folk Ensemble",
      role: "Traditional Dayro & Raas Vocalist",
      genre: "3-Taali Classical • Sanedo • Heritage Garbi",
      tag: "Day 1 Cultural Special",
      icon: Mic2,
      badge: "Gujarat State Sangeet Ratna",
      time: "07:30 PM – 09:30 PM"
    },
    {
      name: "BeatDrop Navratri Collective",
      role: "Club Dandiya & Bass Specialists",
      genre: "Bass-Heavy Folk Mashups • Global Beats",
      tag: "Midnight After-Hours",
      icon: Radio,
      badge: "Radio Mirchi Festival Resident",
      time: "Midnight – 01:00 AM"
    }
  ];

  return (
    <section id="artists" className="py-24 relative bg-[#090412]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#160829] border border-[#e5b869]/30 text-[#e5b869] text-xs font-semibold uppercase tracking-widest mb-3">
            <Mic2 className="w-3.5 h-3.5" />
            Headline Performances
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif-royal">
            Star <span className="text-gold-gradient font-sans-modern font-black">Headliners & Artists</span>
          </h2>
          <p className="mt-4 text-slate-300 text-base font-light">
            A curated lineup of celebrated live percussionists, classical folk vocalists, and premier Bollywood EDM headliners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist, idx) => {
            const Icon = artist.icon;
            return (
              <div
                key={idx}
                className="editorial-card rounded-3xl p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Icon Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e5b869] group-hover:border-[#e5b869] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#e5b869]/10 text-[#e5b869] border border-[#e5b869]/20">
                      {artist.tag}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {artist.badge}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-serif-royal group-hover:text-[#e5b869] transition-colors">
                    {artist.name}
                  </h3>

                  <p className="text-xs text-slate-400 mb-3">
                    {artist.role}
                  </p>

                  <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[#e5b869] font-medium block mb-0.5">Style:</span>
                    {artist.genre}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>Slot: {artist.time}</span>
                  <span className="text-emerald-400 font-semibold">Confirmed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

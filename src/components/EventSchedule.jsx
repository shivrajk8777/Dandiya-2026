"use client";
import React from "react";
import { Clock, Music, Flame, Sparkles, Award, Star, Crown } from "lucide-react";

export default function EventSchedule() {
  const scheduleItems = [
    {
      time: "07:00 PM",
      title: "Royal Red Carpet Entry & Welcome Tilak",
      desc: "Traditional welcome with Chandan & Kesar tilak, complimentary handcrafted Dandiya sticks distribution & 360 photo studio access.",
      icon: Sparkles,
      tag: "Doors Open"
    },
    {
      time: "07:30 PM",
      title: "Maa Ambe Maha Aarti & 108 Deepotsav",
      desc: "Auspicious Navratri prayer, sacred Sanskrit chanting and synchronized 108-diya lighting ceremony with live shehnai.",
      icon: Flame,
      tag: "Spiritual Sacred"
    },
    {
      time: "08:15 PM",
      title: "Phase 1: 100-Dhol Symphony & 3-Taali Classical Raas",
      desc: "Authentic Gujarati folk melodies, rhythmic claps, and massive concentric circles with live Puneri & Nagada percussionists.",
      icon: Music,
      tag: "Folk Raas"
    },
    {
      time: "09:45 PM",
      title: "Phase 2: Celebrity DJ NYK & EDM Laser Dandiya",
      desc: "High-voltage Bollywood & EDM Dandiya fusion sets, synchronized 3D laser arches, and pulsating bass drop beats.",
      icon: Star,
      tag: "EDM Fusion"
    },
    {
      time: "11:15 PM",
      title: "Phase 3: 500-Drone Aerial Show & Grand Awards",
      desc: "Spectacular aerial drone formation above the arena, followed by presentation of ₹5,00,000 trophies, gold coins & grand finale.",
      icon: Crown,
      tag: "Grand Finale"
    }
  ];

  return (
    <section id="schedule" className="py-24 relative bg-festive-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Clock className="w-3.5 h-3.5" />
            Curated Festival Itinerary
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif-royal">
            Evening <span className="gold-foil-text font-sans-modern font-black">Timeline & Flow</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base font-light">
            6 hours of non-stop traditional spirituality, thunderous live percussion, and electric modern fusion.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-amber-500/30 ml-4 sm:ml-32 space-y-8">
          {scheduleItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative pl-6 sm:pl-10 group">
                {/* Node icon */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-[#0e031c] border-2 border-amber-400 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black transition-all shadow-lg shadow-amber-500/20">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Time label on desktop */}
                <div className="hidden sm:block absolute -left-32 top-2 text-right w-24 font-black text-amber-400 text-sm font-sans-modern">
                  {item.time}
                </div>

                {/* Content Card */}
                <div className="luxury-glass rounded-2xl p-6 transition-all group-hover:border-amber-400/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="sm:hidden text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-sans-modern">
                      {item.time}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-serif-royal">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

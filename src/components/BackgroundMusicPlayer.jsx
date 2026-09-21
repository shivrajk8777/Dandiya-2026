"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles, Play, SkipForward, SkipBack } from "lucide-react";

// Continuous Back-to-Back Garba & Dandiya Playlist
const GARBA_PLAYLIST = [
  {
    id: 1,
    title: "Royal Garba Dhol Beat",
    subtitle: "Track 1 of 4 • Dhol Symphony",
    src: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3"
  },
  {
    id: 2,
    title: "Dandiya Raas Percussion",
    subtitle: "Track 2 of 4 • High Energy Loop",
    src: "https://cdn.pixabay.com/download/audio/2022/10/05/audio_73d2740fa1.mp3?filename=indian-dhol-drum-festive-loop-122498.mp3"
  },
  {
    id: 3,
    title: "Kathiyawadi Sanedo Beat",
    subtitle: "Track 3 of 4 • Sanedo Rhythm",
    src: "https://assets.mixkit.co/active_storage/sfx/2875/2875-preview.mp3"
  },
  {
    id: 4,
    title: "Garba Mahotsav Finale",
    subtitle: "Track 4 of 4 • Festive Percussion",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-percussion-festive-113271.mp3"
  }
];

// Web Audio API Garba Dhol Beat Synthesizer (100% Mobile & iOS Safari Compatible Fallback)
class GarbaDholSynthesizer {
  constructor() {
    this.ctx = null;
    this.timer = null;
    this.step = 0;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playBass(time) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.16);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.18);
    } catch (e) {}
  }

  playTaali(time) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(340, time);
      osc.frequency.exponentialRampToValueAtTime(150, time + 0.08);
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.1);
    } catch (e) {}
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;
    const tempo = 128; // Garba Dhol BPM
    const intervalMs = (60 / tempo / 2) * 1000;

    this.timer = setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const bassPattern = [1, 0, 1, 0, 0, 1, 0, 1];
      const taaliPattern = [0, 1, 0, 1, 1, 0, 1, 0];

      if (bassPattern[this.step % 8]) this.playBass(now);
      if (taaliPattern[this.step % 8]) this.playTaali(now);

      this.step++;
    }, intervalMs);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.suspend().catch(() => {});
    }
  }
}

export default function BackgroundMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true);
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  const currentTrack = GARBA_PLAYLIST[currentTrackIndex];

  // Initialize Audio & Playlist Handlers
  useEffect(() => {
    synthRef.current = new GarbaDholSynthesizer();

    const audio = new Audio(currentTrack.src);
    audio.volume = 0.5;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;

    // Auto-advance to next song back-to-back when current song finishes!
    const handleSongEnd = () => {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % GARBA_PLAYLIST.length);
    };

    audio.addEventListener("ended", handleSongEnd);

    // Attempt cold play
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });

    // Gesture unlock for iOS Safari & Android
    const handleGestureUnlock = () => {
      if (synthRef.current) synthRef.current.init();

      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            if (synthRef.current) {
              synthRef.current.start();
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }
          });
      }
    };

    const gestures = ["touchstart", "touchend", "click", "pointerdown", "scroll", "keydown"];
    gestures.forEach((evt) => document.addEventListener(evt, handleGestureUnlock, { passive: true }));

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      gestures.forEach((evt) => document.removeEventListener(evt, handleGestureUnlock));
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.stop();
        synthRef.current = null;
      }
    };
  }, []);

  // Update track audio source when track index changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = currentTrack.src;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current
        .play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => {
          if (synthRef.current) synthRef.current.start();
        });
    }
  }, [currentTrackIndex]);

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % GARBA_PLAYLIST.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + GARBA_PLAYLIST.length) % GARBA_PLAYLIST.length);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (synthRef.current) synthRef.current.stop();
      setIsPlaying(false);
    } else {
      if (synthRef.current) synthRef.current.start();
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    if (isMuted) {
      if (synthRef.current) synthRef.current.start();
    } else {
      if (synthRef.current) synthRef.current.stop();
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Floating Prompt Banner for iPhone / Mobile Autoplay */}
      {autoplayBlocked && !isPlaying && (
        <div
          onClick={togglePlay}
          className="fixed bottom-20 left-4 z-50 cursor-pointer animate-bounce flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-black font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-amber-300"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Tap to Start Garba Playlist 🎵</span>
        </div>
      )}

      {/* Floating Bottom-Left Continuous Garba Playlist Player */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <div className="relative group">
          {isPlaying && !isMuted && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 opacity-70 blur-md animate-pulse" />
          )}

          <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#110426]/90 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl transition-all">
            {/* Prev Song Button */}
            <button
              onClick={handlePrevTrack}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Garba Track"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Vinyl Disc Button */}
            <button
              onClick={togglePlay}
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-black shrink-0 shadow-md group-hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? "Pause Playlist" : "Play Playlist"}
            >
              <Music className={`w-4 h-4 text-black ${isPlaying ? "animate-spin" : ""}`} />
            </button>

            {/* Next Song Button */}
            <button
              onClick={handleNextTrack}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Garba Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Song Title & Equalizer Display */}
            <div className="flex flex-col text-left pr-1 cursor-pointer select-none max-w-[140px] sm:max-w-[180px]" onClick={togglePlay}>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 font-serif-royal truncate">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentTrack.title}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-300 font-medium truncate">
                  {isPlaying && !isMuted ? currentTrack.subtitle : "Playlist Paused"}
                </span>

                {isPlaying && !isMuted && (
                  <div className="flex items-end gap-0.5 h-3 shrink-0">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-2/3" />
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-4/5" />
                    <span className="w-0.5 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1/2" />
                  </div>
                )}
              </div>
            </div>

            {/* Mute/Unmute Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors border-l border-white/10 pl-2 ml-0.5"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

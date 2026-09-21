"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles, Play, Pause, SkipForward, SkipBack, ListMusic, ChevronUp } from "lucide-react";

// Trending Garba & Dandiya Playlist tracks with high quality MP3 streams
const TRENDING_GARBA_PLAYLIST = [
  {
    id: 1,
    title: "Nagada Sang Dhol - Energy Dandiya",
    artist: "Ram-Leela Festive Mix",
    src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=indian-instrumental-festive-19124.mp3",
    tag: "💥 High Energy"
  },
  {
    id: 2,
    title: "Chogada Tara - Top Trending Garba",
    artist: "Loveratri Special Garba",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-percussion-festive-113271.mp3",
    tag: "🔥 #1 Trending"
  },


  {
    id: 3,
    title: "Odhani & Sanedo - Non-Stop Dandiya",
    artist: "Traditional Folk Beats",
    src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8702c2e.mp3?filename=indian-fusion-festive-10254.mp3",
    tag: "💃 Non-Stop"
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
      this.ctx.resume().catch(() => { });
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
    } catch (e) { }
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
    } catch (e) { }
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
      this.ctx.suspend().catch(() => { });
    }
  }
}

export default function BackgroundMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  const currentTrack = TRENDING_GARBA_PLAYLIST[currentTrackIndex];

  // Initialize and handle track changes
  useEffect(() => {
    synthRef.current = new GarbaDholSynthesizer();

    const audio = new Audio(currentTrack.src);
    audio.volume = 0.6;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;

    // Handle track end -> auto play next track
    const handleEnded = () => {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % TRENDING_GARBA_PLAYLIST.length);
    };
    audio.addEventListener("ended", handleEnded);

    // If already playing when switching tracks, play immediately
    if (isPlaying) {
      audio.play().catch(() => {
        if (synthRef.current) synthRef.current.start();
      });
    } else {
      // Attempt cold play on initial mount
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
    }

    // Mobile / iOS Safari gesture unlock trigger
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
      audio.removeEventListener("ended", handleEnded);
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
  }, [currentTrackIndex]);

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

  const playNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRENDING_GARBA_PLAYLIST.length);
    setIsPlaying(true);
  };

  const playPrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRENDING_GARBA_PLAYLIST.length) % TRENDING_GARBA_PLAYLIST.length);
    setIsPlaying(true);
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylistMenu(false);
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
      {/* Floating Tap Prompt Banner for iPhone / Mobile Autoplay */}
      {autoplayBlocked && !isPlaying && (
        <div
          onClick={togglePlay}
          className="fixed bottom-24 left-4 z-50 cursor-pointer animate-bounce flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-black font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-amber-300"
        >
          <Play className="w-4 h-4 fill-black shrink-0" />
          <span>Tap to Start Trending Dandiya Songs 🎵</span>
        </div>
      )}

      {/* Floating Bottom-Left Garba Sound Player & Playlist Container */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
        {/* Playlist Selection Popup Menu */}
        {showPlaylistMenu && (
          <div className="w-80 p-3 rounded-2xl bg-[#13072b]/95 border border-amber-500/40 text-white backdrop-blur-2xl shadow-2xl mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 mb-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ListMusic className="w-4 h-4 text-amber-400" />
                <span>🔥 Trending Garba Tracks</span>
              </div>
              <button
                onClick={() => setShowPlaylistMenu(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/10"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
              {TRENDING_GARBA_PLAYLIST.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(idx)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${isSelected
                      ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/50 text-amber-300"
                      : "hover:bg-white/10 text-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] font-mono text-amber-400/70 w-4">{idx + 1}.</span>
                      <div className="truncate">
                        <p className="text-xs font-semibold truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-400">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 whitespace-nowrap ml-2">
                      {track.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Sticky Bottom Player Bar */}
        <div className="relative group">
          {isPlaying && !isMuted && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 opacity-70 blur-md animate-pulse" />
          )}

          <div className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-[#110426]/90 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl transition-all">
            {/* Play / Pause Vinyl Disc Button */}
            <button
              onClick={togglePlay}
              className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-black shrink-0 shadow-md group-hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              <Music className={`w-4 h-4 text-black ${isPlaying ? "animate-spin" : ""}`} />
            </button>

            {/* Song Title & Equalizer Display */}
            <div
              className="flex flex-col text-left pr-1 cursor-pointer select-none max-w-[140px] sm:max-w-[170px]"
              onClick={togglePlay}
            >
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300 truncate">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentTrack.title}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-300 font-medium truncate">
                  {isPlaying && !isMuted ? currentTrack.artist : "Music Paused"}
                </span>

                {isPlaying && !isMuted && (
                  <div className="flex items-end gap-0.5 h-3 shrink-0 ml-1">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-2/3" />
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-4/5" />
                    <span className="w-0.5 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1/2" />
                  </div>
                )}
              </div>
            </div>

            {/* Track Controls: Prev & Next */}
            <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
              <button
                onClick={playPrevTrack}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Previous Garba Song"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-1 rounded-full hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-400" /> : <Play className="w-3.5 h-3.5 fill-amber-400" />}
              </button>

              <button
                onClick={playNextTrack}
                className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Next Garba Song"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playlist Menu Toggle Button */}
            <button
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className={`p-1.5 rounded-full transition-colors ml-0.5 ${showPlaylistMenu ? "bg-amber-500/30 text-amber-300" : "hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
              title="View Trending Garba Playlist"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Mute/Unmute Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
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

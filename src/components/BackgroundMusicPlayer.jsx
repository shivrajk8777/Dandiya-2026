"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles, Play } from "lucide-react";

// Reliable Garba Dhol Percussion Audio URLs
const GARBA_AUDIO_SRCS = [
  "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
  "https://cdn.pixabay.com/download/audio/2022/10/05/audio_73d2740fa1.mp3?filename=indian-dhol-drum-festive-loop-122498.mp3"
];

// Web Audio API Garba Dhol Beat Synthesizer (100% Native iOS Safari & Mobile Compatible)
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true);
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Instantiate Synthesizer fallback for iOS Safari
    synthRef.current = new GarbaDholSynthesizer();

    // 1. Create HTML5 Audio
    const audio = new Audio(GARBA_AUDIO_SRCS[0]);
    audio.loop = true;
    audio.volume = 0.5;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;

    // 2. Master Audio Start Handler
    const startAllAudio = async () => {
      let mp3Started = false;
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          mp3Started = true;
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (e) {
          console.warn("HTML5 audio autoplay blocked by mobile OS:", e);
        }
      }

      // If MP3 audio didn't start (common on iPhone cold load), start Synth engine
      if (!mp3Started && synthRef.current) {
        try {
          synthRef.current.start();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (err) {
          setAutoplayBlocked(true);
        }
      }
    };

    // Cold attempt on load
    startAllAudio();

    // 3. iOS Gesture Unlocker (Fires on first touch / tap / scroll on iPhone screen)
    const handleGestureUnlock = () => {
      if (synthRef.current) {
        synthRef.current.init();
      }

      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            // Fallback to Synth engine on iPhone if MP3 is blocked by carrier/CORS
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
      } else {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (isMuted) {
      if (synthRef.current) synthRef.current.start();
    } else {
      if (synthRef.current) synthRef.current.stop();
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden HTML5 Audio for iOS Safari / Chrome */}
      <audio
        ref={audioRef}
        src={GARBA_AUDIO_SRCS[0]}
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
      />

      {/* Floating Prompt Banner for iPhone / Mobile Autoplay */}
      {autoplayBlocked && !isPlaying && (
        <div
          onClick={togglePlay}
          className="fixed bottom-20 left-4 z-50 cursor-pointer animate-bounce flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-black font-black text-xs uppercase tracking-wider shadow-2xl border-2 border-amber-300"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Tap to Start Garba Music 🎵</span>
        </div>
      )}

      {/* Floating Bottom-Left Music Controller */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <div className="relative group">
          {isPlaying && !isMuted && (
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 opacity-70 blur-md animate-pulse" />
          )}

          <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#110426]/90 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl transition-all">
            <button
              onClick={togglePlay}
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-black shrink-0 shadow-md group-hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? "Pause Garba Music" : "Play Garba Music"}
            >
              <Music className={`w-4 h-4 text-black ${isPlaying ? "animate-spin" : ""}`} />
            </button>

            <div className="flex flex-col text-left pr-1 cursor-pointer select-none" onClick={togglePlay}>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 font-serif-royal">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Garba Dhol Beat</span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-300 font-medium">
                  {isPlaying && !isMuted ? "Live Soundtrack" : "Tap to Play Music"}
                </span>

                {isPlaying && !isMuted && (
                  <div className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                    <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-2/3" />
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-4/5" />
                    <span className="w-0.5 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1/2" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? "Unmute Media" : "Mute Media"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles } from "lucide-react";

// Festive Garba & Dhol Percussion Soundtrack URL (Royalty-free Indian festive dhol beat)
const GARBA_AUDIO_SRC = "https://cdn.pixabay.com/download/audio/2022/10/05/audio_73d2740fa1.mp3?filename=indian-dhol-drum-festive-loop-122498.mp3";

export default function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(GARBA_AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.45; // Energetic background volume
    audioRef.current = audio;

    // Attempt cold autoplay on mount
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay waiting for first user interaction (browser policy)");
        setIsPlaying(false);
      }
    };

    tryAutoplay();

    // Fallback: Trigger audio on first user touch / click / scroll anywhere on screen
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((e) => console.log("Audio play error", e));
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("scroll", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error(err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
      <div className="relative group">
        {/* Pulsating glow background when playing */}
        {isPlaying && !isMuted && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 opacity-70 blur-md animate-pulse" />
        )}

        <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#110426]/90 border border-amber-500/40 text-white backdrop-blur-xl shadow-2xl transition-all">
          {/* Vinyl Disc Icon */}
          <button
            onClick={togglePlay}
            className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-black shrink-0 shadow-md group-hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pause Garba Music" : "Play Garba Music"}
          >
            <Music className={`w-4 h-4 text-black ${isPlaying ? "animate-spin" : ""}`} />
          </button>

          {/* Label & Animated Sound Equalizer */}
          <div className="flex flex-col text-left pr-1 cursor-pointer select-none" onClick={togglePlay}>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 font-serif-royal">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Garba Dhol Beat</span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-slate-300 font-medium">
                {isPlaying && !isMuted ? "Live Soundtrack" : "Music Paused"}
              </span>

              {/* Bounce Equalizer Bars */}
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
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { X, Tag, Percent, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { getDiscountConfig, saveDiscountConfig, subscribeToDiscountConfig } from "@/lib/discountService";

export default function DiscountManagerModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(getDiscountConfig());
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToDiscountConfig((cfg) => {
      setConfig(cfg);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSystem = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    saveDiscountConfig(updated);
    setStatusMsg({ type: "success", text: `Discount system ${updated.enabled ? "ENABLED" : "DISABLED"}.` });
  };

  const handleToggleDynamic = () => {
    const updated = { ...config, dynamicScheduleActive: !config.dynamicScheduleActive, overrideDiscountPercent: null, overrideDiscountFlat: null };
    setConfig(updated);
    saveDiscountConfig(updated);
    setStatusMsg({ type: "success", text: "Dynamic Date-Based Early Bird Schedule updated." });
  };

  const handleSetOverride = (type, val) => {
    let updated = { ...config };
    if (type === "percent") {
      updated.overrideDiscountPercent = val ? Number(val) : null;
      updated.overrideDiscountFlat = null;
    } else if (type === "flat") {
      updated.overrideDiscountFlat = val ? Number(val) : null;
      updated.overrideDiscountPercent = null;
    } else {
      updated.overrideDiscountPercent = null;
      updated.overrideDiscountFlat = null;
    }
    setConfig(updated);
    saveDiscountConfig(updated);
    setStatusMsg({ type: "success", text: "Ticket price override updated." });
  };

  const handleBasePriceChange = (e) => {
    const val = Number(e.target.value) || 1599;
    const updated = { ...config, basePrice: val };
    setConfig(updated);
    saveDiscountConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Tag className="w-3.5 h-3.5" />
            Pricing & Discounts Control
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            Ticket Discount Manager
          </h2>
          <p className="text-xs text-slate-400">
            Manage dynamic early-bird time discounts and manual price overrides.
          </p>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              statusMsg.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 1. Master System Toggle & Base Price */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-serif-royal">Master Discount System</h3>
              <p className="text-[11px] text-slate-400">Enable or disable all ticket discounts across website</p>
            </div>
            <button
              onClick={handleToggleSystem}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                config.enabled
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {config.enabled ? "Active (ON)" : "Disabled (OFF)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Base Ticket Price (₹)
              </label>
              <input
                type="number"
                value={config.basePrice}
                onChange={handleBasePriceChange}
                className="w-full bg-[#0d0317] border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-400 font-black font-sans focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Target Event Date
              </label>
              <div className="w-full bg-[#0d0317] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center justify-between">
                <span>Oct 17, 2026 (Navratri Mahotsav)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Dynamic Date-Based Discount Schedule */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-serif-royal flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Dynamic Date-Based Discount Reduction
              </h3>
              <p className="text-[11px] text-slate-400">
                Discount automatically decreases as event day gets closer
              </p>
            </div>
            <button
              onClick={handleToggleDynamic}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                config.dynamicScheduleActive && !config.overrideDiscountPercent && !config.overrideDiscountFlat
                  ? "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {config.dynamicScheduleActive && !config.overrideDiscountPercent && !config.overrideDiscountFlat
                ? "Active Schedule"
                : "Enable Schedule"}
            </button>
          </div>

          {/* Schedule Breakdown Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold text-sm">25% OFF</div>
              <div className="text-[10px] text-slate-400 font-medium">Final: ₹1199</div>
              <div className="text-[9px] opacity-80 mt-0.5">&gt; 15 Days Left</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="font-bold text-sm">20% OFF</div>
              <div className="text-[10px] text-slate-400 font-medium">Final: ₹1279</div>
              <div className="text-[9px] opacity-80 mt-0.5">10-15 Days Left</div>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
              <div className="font-bold text-sm">10% OFF</div>
              <div className="text-[10px] text-slate-400 font-medium">Final: ₹1439</div>
              <div className="text-[9px] opacity-80 mt-0.5">5-10 Days Left</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <div className="font-bold text-sm">5% OFF</div>
              <div className="text-[10px] text-slate-400 font-medium">Final: ₹1519</div>
              <div className="text-[9px] opacity-80 mt-0.5">1-5 Days Left</div>
            </div>
          </div>
        </div>

        {/* 3. Manual Override Discount Options */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white font-serif-royal flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-purple-400" />
            Manual Discount Override (Set Custom Discount)
          </h3>
          <p className="text-[11px] text-slate-400">
            Optionally set a fixed custom discount percentage or flat amount that overrides date schedules
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSetOverride("none")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !config.overrideDiscountPercent && !config.overrideDiscountFlat
                  ? "bg-amber-400 text-black"
                  : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              Use Date Schedule
            </button>

            <button
              onClick={() => handleSetOverride("percent", 20)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.overrideDiscountPercent === 20 ? "bg-purple-500 text-white" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              Fixed 20% OFF
            </button>

            <button
              onClick={() => handleSetOverride("percent", 30)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.overrideDiscountPercent === 30 ? "bg-purple-500 text-white" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              Fixed 30% OFF
            </button>

            <button
              onClick={() => handleSetOverride("flat", 400)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.overrideDiscountFlat === 400 ? "bg-emerald-500 text-black" : "bg-white/5 border border-white/10 text-slate-300"
              }`}
            >
              Flat ₹400 OFF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

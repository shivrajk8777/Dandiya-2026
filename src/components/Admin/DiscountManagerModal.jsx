"use client";
import React, { useState, useEffect } from "react";
import { X, Tag, Percent, CheckCircle2, AlertCircle, Clock, Save, Sparkles, RefreshCw } from "lucide-react";
import { getDiscountConfig, saveDiscountConfig, subscribeToDiscountConfig, calculateTicketPrice } from "@/lib/discountService";

export default function DiscountManagerModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(getDiscountConfig());
  const [saving, setSaving] = useState(false);
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

  const currentPricing = calculateTicketPrice(config);

  const handleSaveConfig = async (updatedConfig) => {
    const target = updatedConfig || config;
    setSaving(true);
    setStatusMsg(null);
    try {
      await saveDiscountConfig(target);
      setStatusMsg({ type: "success", text: "Discount settings saved & published LIVE across the website!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to save discount settings: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSystem = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const handleToggleDynamic = () => {
    const updated = {
      ...config,
      dynamicScheduleActive: true,
      overrideDiscountPercent: null,
      overrideDiscountFlat: null
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const handleSetPercentOverride = (percentVal) => {
    const val = percentVal !== "" && percentVal !== null ? Number(percentVal) : null;
    const updated = {
      ...config,
      overrideDiscountPercent: val,
      overrideDiscountFlat: null
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const handleSetFlatOverride = (flatVal) => {
    const val = flatVal !== "" && flatVal !== null ? Number(flatVal) : null;
    const updated = {
      ...config,
      overrideDiscountFlat: val,
      overrideDiscountPercent: null
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const handleClearOverride = () => {
    const updated = {
      ...config,
      dynamicScheduleActive: true,
      overrideDiscountPercent: null,
      overrideDiscountFlat: null
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  const handleBasePriceChange = (e) => {
    const val = Number(e.target.value);
    const updated = { ...config, basePrice: val > 0 ? val : 1599 };
    setConfig(updated);
    handleSaveConfig(updated);
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
        <div className="text-left mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Tag className="w-3.5 h-3.5" />
            Pricing & Discounts Control
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            Ticket Discount Manager
          </h2>
          <p className="text-xs text-slate-400">
            Control base ticket prices, dynamic early-bird schedules, and manual discount overrides in real time.
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

        {/* LIVE PRICING CALCULATOR PREVIEW CARD */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#210c3d] via-[#16072b] to-[#280d46] border border-amber-400/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Live Calculated Pass Price Preview
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                config.enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {config.enabled ? "System Active" : "Discounts Disabled"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center items-center py-2 bg-black/30 rounded-xl border border-white/10">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Base Price</div>
              <div className="text-base sm:text-lg font-bold text-slate-300">₹{currentPricing.basePrice}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Discount Offered</div>
              <div className="text-base sm:text-lg font-bold text-emerald-400">
                -₹{currentPricing.totalDiscountAmount}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">Final Ticket Price</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-sans">
                ₹{currentPricing.finalPrice}
              </div>
            </div>
          </div>

          {currentPricing.discountBadge && (
            <div className="mt-2 text-center text-xs font-bold text-amber-300 bg-amber-500/10 py-1 px-3 rounded-lg border border-amber-500/20">
              Active Badge on Site: {currentPricing.discountBadge}
            </div>
          )}
        </div>

        {/* 1. Master System Toggle & Base Price */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-serif-royal">1. Master Discount System</h3>
              <p className="text-[11px] text-slate-400">Turn all website ticket discounts ON or OFF</p>
            </div>
            <button
              onClick={handleToggleSystem}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-md ${
                config.enabled
                  ? "bg-emerald-500 text-black shadow-emerald-500/20"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {config.enabled ? "Active (ON)" : "Disabled (OFF)"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Base Pass Ticket Price (₹)
              </label>
              <input
                type="number"
                value={config.basePrice || 1599}
                onChange={handleBasePriceChange}
                className="w-full bg-[#0d0317] border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-400 font-black font-sans focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Event Target Date
              </label>
              <div className="w-full bg-[#0d0317] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center justify-between">
                <span>Oct 17, 2026 (Navratri)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Manual Custom Override (Percentage or Flat Amount) */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-serif-royal flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-purple-400" />
              2. Manual Custom Discount Override
            </h3>
            { (config.overrideDiscountPercent || config.overrideDiscountFlat) && (
              <button
                onClick={handleClearOverride}
                className="text-[10px] text-amber-300 underline font-semibold hover:text-white"
              >
                Clear Manual Override
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Enter a custom percentage (%) or flat amount (₹) to override date schedules:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-purple-300 mb-1 uppercase tracking-wider">
                Custom Percentage Discount (% OFF)
              </label>
              <input
                type="number"
                placeholder="e.g. 15, 20, 30, 50"
                value={config.overrideDiscountPercent !== null && config.overrideDiscountPercent !== undefined ? config.overrideDiscountPercent : ""}
                onChange={(e) => handleSetPercentOverride(e.target.value)}
                className="w-full bg-[#0d0317] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-300 mb-1 uppercase tracking-wider">
                Custom Flat Rupees Discount (₹ OFF)
              </label>
              <input
                type="number"
                placeholder="e.g. 200, 400, 500, 700"
                value={config.overrideDiscountFlat !== null && config.overrideDiscountFlat !== undefined ? config.overrideDiscountFlat : ""}
                onChange={(e) => handleSetFlatOverride(e.target.value)}
                className="w-full bg-[#0d0317] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Quick Preset Discount Buttons:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleClearOverride}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !config.overrideDiscountPercent && !config.overrideDiscountFlat
                    ? "bg-amber-400 text-black shadow-md"
                    : "bg-white/5 border border-white/10 text-slate-300"
                }`}
              >
                Auto Date Schedule
              </button>

              {[15, 20, 25, 30, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleSetPercentOverride(pct)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    config.overrideDiscountPercent === pct
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}

              {[200, 400, 500].map((flat) => (
                <button
                  key={flat}
                  onClick={() => handleSetFlatOverride(flat)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    config.overrideDiscountFlat === flat
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  ₹{flat} OFF
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Dynamic Date Schedule Overview */}
        <div className="p-4 rounded-2xl bg-[#180836] border border-white/10 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-serif-royal flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              3. Automatic Date-Based Early Bird Schedule
            </h3>
            <button
              onClick={handleToggleDynamic}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                config.dynamicScheduleActive && !config.overrideDiscountPercent && !config.overrideDiscountFlat
                  ? "bg-amber-400 text-black"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {config.dynamicScheduleActive && !config.overrideDiscountPercent && !config.overrideDiscountFlat
                ? "Active Now"
                : "Switch to Schedule"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold text-xs">25% OFF</div>
              <div className="text-[9px] opacity-80">&gt; 15 Days Left</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <div className="font-bold text-xs">20% OFF</div>
              <div className="text-[9px] opacity-80">10-15 Days Left</div>
            </div>
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300">
              <div className="font-bold text-xs">10% OFF</div>
              <div className="text-[9px] opacity-80">5-10 Days Left</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <div className="font-bold text-xs">5% OFF</div>
              <div className="text-[9px] opacity-80">1-5 Days Left</div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => handleSaveConfig()}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:opacity-95 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
          {saving ? "Publishing Updates..." : "Save & Apply Discount Live Across Website"}
        </button>
      </div>
    </div>
  );
}

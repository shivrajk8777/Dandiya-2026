import React, { useState, useEffect } from "react";
import { X, Ticket, CheckCircle, AlertCircle, Plus, Sparkles, RefreshCw } from "lucide-react";
import { getLocalInventoryConfig, updateInventoryLimit, addMoreTickets } from "@/lib/ticketInventoryService";

export default function TicketInventoryModal({ isOpen, onClose, totalSoldPasses = 0 }) {
  const [currentMax, setCurrentMax] = useState(300);
  const [addQuantity, setAddQuantity] = useState(50);
  const [exactMax, setExactMax] = useState(300);
  const [activeTab, setActiveTab] = useState("add"); // "add" or "set_exact"
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getLocalInventoryConfig();
      const max = cfg.maxTickets || 300;
      setCurrentMax(max);
      setExactMax(max);
      setAddQuantity(50);
      setStatusMsg({ type: "", text: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handler for adding extra tickets (+N)
  const handleAddTickets = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const addNum = Number(addQuantity);
      if (isNaN(addNum) || addNum < 1) {
        setStatusMsg({ type: "error", text: "Please enter a valid number of tickets to add (minimum 1)." });
        setLoading(false);
        return;
      }

      const updated = await addMoreTickets(addNum);
      const newTotal = updated.maxTickets;
      setCurrentMax(newTotal);
      setExactMax(newTotal);
      setStatusMsg({
        type: "success",
        text: `Successfully added +${addNum} tickets! New Total Capacity: ${newTotal} passes.`
      });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to add tickets: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Add preset handler
  const handleQuickAdd = async (amount) => {
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const updated = await addMoreTickets(amount);
      const newTotal = updated.maxTickets;
      setCurrentMax(newTotal);
      setExactMax(newTotal);
      setStatusMsg({
        type: "success",
        text: `Added +${amount} passes instantly! New Total Limit: ${newTotal} tickets.`
      });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to add tickets: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handler for setting exact total capacity
  const handleSetExact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const num = Number(exactMax);
      if (isNaN(num) || num < 1) {
        setStatusMsg({ type: "error", text: "Please enter a valid ticket limit." });
        setLoading(false);
        return;
      }

      await updateInventoryLimit(num);
      setCurrentMax(num);
      setStatusMsg({
        type: "success",
        text: `Total ticket capacity set to ${num} passes!`
      });
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to update limit: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, currentMax - totalSoldPasses);
  const isSoldOut = totalSoldPasses >= currentMax;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-md w-full bg-[#120524] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left space-y-1 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-serif-royal">
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            Ticket Capacity & Stock Manager
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            Add More Tickets to Stock
          </h2>
          <p className="text-xs text-slate-400">
            Aap 300 capacity me jitni chahe utni tickets add kar sakte hain. Website automatic stock update karegi.
          </p>
        </div>

        {/* Inventory Summary Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Capacity</span>
            <span className="text-lg font-black text-amber-400 font-sans">{currentMax}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Passes Sold</span>
            <span className="text-lg font-black text-emerald-400 font-sans">{totalSoldPasses}</span>
          </div>
          <div className={`p-3 rounded-2xl border ${isSoldOut ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
            <span className="text-[10px] uppercase font-bold block">Stock Remaining</span>
            <span className="text-lg font-black font-sans">{remaining}</span>
          </div>
        </div>

        {statusMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 ${
              statusMsg.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "add"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Add Extra Tickets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("set_exact")}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "set_exact"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>Set Exact Capacity</span>
          </button>
        </div>

        {/* TAB 1: ADD EXTRA TICKETS (+N) */}
        {activeTab === "add" && (
          <div className="space-y-4">
            {/* Quick 1-Click Add Buttons */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                1-Click Quick Add Extra Stock:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickAdd(num)}
                    disabled={loading}
                    className="py-2 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white active:scale-95 transition-all text-center font-mono font-bold"
                  >
                    +{num} Passes
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Additional Tickets Input Form */}
            <form onSubmit={handleAddTickets} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Or Type Custom Tickets Quantity To Add:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    required
                    placeholder="e.g. 50"
                    className="flex-1 bg-[#090214] border border-amber-500/40 rounded-xl px-4 py-2.5 text-base text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg active:scale-95 transition-all shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {loading ? "Adding..." : "Add to Capacity"}
                  </button>
                </div>
                <p className="text-[10px] text-amber-300/80 mt-1.5 font-medium">
                  💡 Calculation: Current Limit ({currentMax}) + ({Number(addQuantity) || 0}) = New Total:{" "}
                  <strong className="text-white">{currentMax + (Number(addQuantity) || 0)} Passes</strong>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SET EXACT TOTAL CAPACITY */}
        {activeTab === "set_exact" && (
          <form onSubmit={handleSetExact} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Set Exact Total Ticket Capacity:
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={exactMax}
                onChange={(e) => setExactMax(e.target.value)}
                required
                placeholder="e.g. 500"
                className="w-full bg-[#090214] border border-amber-500/40 rounded-xl px-4 py-3 text-base text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This will overwrite current total capacity to exact number specified above.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-xl active:scale-95 transition-all"
            >
              {loading ? "Updating..." : "Save Exact Capacity"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { X, Search, Ticket, ArrowRight, AlertCircle } from "lucide-react";
import { lookupPass } from "@/lib/registrationService";

export default function PassLookupModal({ isOpen, onClose, onSelectPass }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter your Phone Number or Pass ID");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const records = await lookupPass(searchQuery.trim());
      setResults(records);
      if (records.length === 0) {
        setErrorMsg("No passes found for the given Phone / Pass ID. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Search error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-lg w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Ticket className="w-3.5 h-3.5" />
            Pass Retrieval
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">Find My Pass</h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Enter your registered WhatsApp Mobile Number or Pass ID (e.g. DND-RAAS-XXXX)
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-3.5 mb-5">
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. 9876543210 or DND-RAAS-8942"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b0938] border border-amber-500/30 rounded-xl pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Search className="w-4 h-4 text-black" />
            {loading ? "Searching Passes..." : "Search My Pass"}
          </button>
        </form>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Results List */}
        {results && results.length > 0 && (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Matching Passes ({results.length}):
            </div>
            {results.map((pass) => (
              <div
                key={pass.id || pass.passId}
                onClick={() => {
                  onClose();
                  onSelectPass(pass);
                }}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#1d0a3d] border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between group hover:scale-[1.01]"
              >
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors font-serif-royal">
                    {pass.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {pass.passType} • {pass.quantity} {pass.quantity > 1 ? "Persons" : "Person"}
                  </div>
                  <div className="font-mono text-[10px] sm:text-[11px] text-amber-400 font-semibold mt-0.5">
                    {pass.passId}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold group-hover:translate-x-1 transition-transform">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

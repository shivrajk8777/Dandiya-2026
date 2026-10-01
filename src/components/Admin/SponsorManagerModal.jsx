"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Globe, Building2, Sparkles, CheckCircle2, AlertCircle, Edit2, RotateCcw } from "lucide-react";
import { subscribeToSponsors, addSponsor, updateSponsor, deleteSponsor } from "@/lib/sponsorService";

const SPONSOR_TIERS = [
  "Title Sponsor",
  "Powered By",
  "Co-Powered By",
  "Energy Partner",
  "Luxury Hospitality",
  "Beverage Partner",
  "Fashion & Style",
  "Headline Media",
  "Radio Partner",
  "Associate Partner",
  "Food & Beverage Partner"
];

export default function SponsorManagerModal({ isOpen, onClose }) {
  const [sponsors, setSponsors] = useState([]);
  const [isFirebaseLive, setIsFirebaseLive] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    tier: "Associate Partner",
    tagline: "",
    website: "",
    logoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToSponsors((data, isFb) => {
      setSponsors(data);
      setIsFirebaseLive(isFb);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (sp) => {
    setEditingId(sp.id);
    setFormData({
      name: sp.name || "",
      tier: sp.tier || "Associate Partner",
      tagline: sp.tagline || "",
      website: sp.website || "",
      logoUrl: sp.logoUrl || ""
    });
    setStatusMsg({ type: "success", text: `Editing sponsor "${sp.name}". Make changes below and click Save.` });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      tier: "Associate Partner",
      tagline: "",
      website: "",
      logoUrl: ""
    });
    setStatusMsg(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMsg({ type: "error", text: "Please enter sponsor / company name" });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      if (editingId) {
        // Edit mode
        const res = await updateSponsor(editingId, formData);
        if (res.success) {
          setStatusMsg({ type: "success", text: `Sponsor "${formData.name.toUpperCase()}" updated successfully!` });
          setEditingId(null);
          setFormData({
            name: "",
            tier: "Associate Partner",
            tagline: "",
            website: "",
            logoUrl: ""
          });
        }
      } else {
        // Add mode
        const res = await addSponsor(formData);
        if (res.success) {
          setStatusMsg({ type: "success", text: `Sponsor "${formData.name.toUpperCase()}" added successfully!` });
          setFormData({
            name: "",
            tier: "Associate Partner",
            tagline: "",
            website: "",
            logoUrl: ""
          });
        }
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: `Failed to ${editingId ? "update" : "add"} sponsor: ` + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove sponsor "${name}" from website?`)) {
      await deleteSponsor(id);
      if (editingId === id) {
        handleCancelEdit();
      }
      setStatusMsg({ type: "success", text: `Sponsor "${name}" removed.` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#110524] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-4 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-serif-royal">
            <Building2 className="w-3.5 h-3.5" />
            Brand Management
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">
            Manage Event Sponsors & Partners
          </h2>
          <p className="text-xs text-slate-400">
            Add or remove sponsors. Added partners appear instantly on the live website.
          </p>
        </div>

        {/* Status Alert */}
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

        {/* Add/Edit Sponsor Form */}
        <form onSubmit={handleFormSubmit} className={`p-4 sm:p-5 rounded-2xl border mb-6 space-y-3.5 transition-all ${editingId ? "bg-[#230f4a] border-amber-400 shadow-lg shadow-amber-500/10" : "bg-[#180836] border-white/10"}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              {editingId ? <Edit2 className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5" />}
              {editingId ? `Edit Sponsor Details (${formData.name})` : "Add New Sponsor / Partner"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[10px] font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Sponsor / Brand Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. AMUL, HYUNDAI, TATA"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-[#0e031c] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Category / Tier *
              </label>
              <select
                name="tier"
                value={formData.tier}
                onChange={handleInputChange}
                className="w-full bg-[#0e031c] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                {SPONSOR_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Tagline / Title
              </label>
              <input
                type="text"
                name="tagline"
                placeholder="e.g. Official Dairy & Taste Partner"
                value={formData.tagline}
                onChange={handleInputChange}
                className="w-full bg-[#0e031c] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Website URL (Optional)
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://brand.com"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full bg-[#0e031c] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Sponsor Logo Image URL / Upload (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="logoUrl"
                placeholder="https://... or upload image"
                value={formData.logoUrl}
                onChange={handleInputChange}
                className="flex-1 bg-[#0e031c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <label className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-amber-300 cursor-pointer shrink-0 transition-all">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setFormData((prev) => ({ ...prev, logoUrl: evt.target?.result || "" }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {formData.logoUrl && (
              <div className="mt-2 p-2 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-3">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Logo Preview:</span>
                <img src={formData.logoUrl} alt="Preview" className="h-7 w-auto object-contain bg-white/10 rounded p-1" />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              {editingId ? <Edit2 className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-black" />}
              {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Save Changes & Update Sponsor" : "Add Sponsor to Website"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 bg-white/10 hover:bg-white/20 border border-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Existing Sponsors List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Sponsors On Website ({sponsors.length}):
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Live Synchronized
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {sponsors.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">
                No sponsors added yet.
              </div>
            ) : (
              sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    editingId === sp.id ? "bg-amber-500/15 border-amber-400" : "bg-[#0e031c] border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sp.logoUrl && (
                      <img
                        src={sp.logoUrl}
                        alt={sp.name}
                        className="h-8 w-auto max-w-[80px] object-contain rounded bg-white/5 p-1 border border-white/10"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm font-serif-royal">
                          {sp.name}
                        </span>
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                          {sp.tier}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sp.tagline || "Official Partner"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {sp.website && (
                      <a
                        href={sp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-amber-400 bg-white/5 rounded-lg border border-white/10"
                        title="Visit Website"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEditClick(sp)}
                      className="p-1.5 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-all"
                      title="Edit Sponsor Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sp.id, sp.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg border border-white/10"
                      title="Delete Sponsor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { X, UserPlus, Trash2, ShieldCheck, Key, User, MapPin, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export const DEFAULT_STAFF_USERS = [
  {
    id: "staff-1",
    username: "gate1",
    password: "gatepass2026",
    name: "Main Gate Scanner",
    gate: "Main Gate 1"
  },
  {
    id: "staff-2",
    username: "gate2",
    password: "gatepass2026",
    name: "VIP Gate Scanner",
    gate: "VIP Lounge Entrance"
  }
];

export const getGateStaffUsers = () => {
  if (typeof window === "undefined") return DEFAULT_STAFF_USERS;
  try {
    const raw = localStorage.getItem("dandiya_gate_staff_users");
    if (!raw) {
      localStorage.setItem("dandiya_gate_staff_users", JSON.stringify(DEFAULT_STAFF_USERS));
      return DEFAULT_STAFF_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading gate staff users", e);
    return DEFAULT_STAFF_USERS;
  }
};

export const saveGateStaffUsers = (users) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("dandiya_gate_staff_users", JSON.stringify(users));
  } catch (e) {
    console.error("Error saving gate staff users", e);
  }
};

export default function GateStaffManagerModal({ isOpen, onClose }) {
  const [staffUsers, setStaffUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
    name: "",
    gate: "Main Gate"
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStaffUsers(getGateStaffUsers());
      setMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    const u = newStaff.username.trim().toLowerCase();
    const p = newStaff.password.trim();
    const n = newStaff.name.trim();

    if (!u || !p || !n) {
      setMsg("Please enter username, password, and staff name.");
      return;
    }

    if (staffUsers.some((item) => item.username.toLowerCase() === u)) {
      setMsg("This username already exists. Please choose a different username.");
      return;
    }

    const newUserObj = {
      id: `staff-${Date.now()}`,
      username: u,
      password: p,
      name: n,
      gate: newStaff.gate.trim() || "Main Gate"
    };

    const updated = [newUserObj, ...staffUsers];
    setStaffUsers(updated);
    saveGateStaffUsers(updated);
    setNewStaff({ username: "", password: "", name: "", gate: "Main Gate" });
    setShowAddForm(false);
    setMsg("✅ Gate staff account created successfully!");
  };

  const handleDeleteStaff = (id) => {
    if (confirm("Are you sure you want to delete this Gate Staff login?")) {
      const updated = staffUsers.filter((item) => item.id !== id);
      setStaffUsers(updated);
      saveGateStaffUsers(updated);
      setMsg("Gate staff user removed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#110424] border border-amber-500/40 rounded-3xl p-5 sm:p-8 shadow-2xl my-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Exclusive Tool
          </div>
          <h2 className="text-2xl font-black text-white font-serif-royal">Gate Staff Logins Manager</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Create & manage scanner logins for event entrance checkers (Gatekeepers).
          </p>
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            {msg}
          </div>
        )}

        {/* Create New Gate Staff Button / Form */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-black" />
            Create New Gate Staff Account
          </button>
        ) : (
          <form onSubmit={handleAddStaff} className="mb-6 p-4 rounded-2xl bg-white/5 border border-amber-500/30 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              New Gate Staff User Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                  className="w-full bg-[#180630] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gate / Entry Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Gate 1"
                  value={newStaff.gate}
                  onChange={(e) => setNewStaff({ ...newStaff, gate: e.target.value })}
                  className="w-full bg-[#180630] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gate Login ID *</label>
                <input
                  type="text"
                  placeholder="e.g. gate1"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  required
                  className="w-full bg-[#180630] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                <input
                  type="text"
                  placeholder="e.g. gatepass2026"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  required
                  className="w-full bg-[#180630] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95"
              >
                Save Staff Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Existing Gate Staff Users List */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Gatekeeper Staff Accounts ({staffUsers.length}):
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {staffUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 rounded-xl bg-white/5">
                No gate staff accounts created yet.
              </div>
            ) : (
              staffUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {user.name}
                      <span className="text-[10px] font-normal text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        📍 {user.gate || "Gate"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                      <span>ID: <strong className="text-white">{user.username}</strong></span>
                      <span>
                        Pass:{" "}
                        <strong className="text-emerald-400">
                          {visiblePasswords[user.id] ? user.password : "••••••••"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="p-2 text-slate-400 hover:text-amber-400 bg-white/5 rounded-xl border border-white/10"
                      title="Show/Hide Password"
                    >
                      {visiblePasswords[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(user.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 rounded-xl border border-white/10"
                      title="Delete Staff Login"
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

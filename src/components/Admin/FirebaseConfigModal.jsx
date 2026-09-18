"use client";
import React, { useState, useEffect } from "react";
import { X, Database, CheckCircle2, AlertCircle, Save, RefreshCw, Key, Shield } from "lucide-react";
import { getActiveFirebaseConfig, saveFirebaseConfigToStorage, initFirebase } from "@/lib/firebase";

export default function FirebaseConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  });
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState("form"); // 'form' or 'json'
  const [statusMessage, setStatusMessage] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveFirebaseConfig();
      setConfig(active);
      setJsonInput(JSON.stringify(active, null, 2));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleJsonPaste = (val) => {
    setJsonInput(val);
    try {
      // Clean up common JS object copy-pastes
      const cleaned = val.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
      const parsed = JSON.parse(cleaned);
      if (parsed.projectId || parsed.apiKey) {
        setConfig((prev) => ({ ...prev, ...parsed }));
        setStatusMessage({ type: "success", text: "Firebase config JSON parsed successfully!" });
      }
    } catch {
      // not strict JSON yet
    }
  };

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage(null);

    try {
      saveFirebaseConfigToStorage(config);
      const res = initFirebase();

      if (res.isConnected) {
        setStatusMessage({
          type: "success",
          text: `Connected to Firebase Firestore project "${config.projectId}" successfully!`
        });
        if (onConfigSaved) onConfigSaved(true);
      } else {
        setStatusMessage({
          type: "warning",
          text: "Config saved! Note: Running in local reactive store mode until Firebase credentials with Firestore enabled are validated."
        });
        if (onConfigSaved) onConfigSaved(false);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Connection error: " + err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-[#120626] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            Database Settings
          </div>
          <h2 className="text-2xl font-black text-white">Firebase Firestore Configuration</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Connect your live Google Firebase Firestore project to sync all Dandiya registrations in real-time.
          </p>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "warning"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("form")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "form" ? "bg-amber-500 text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Form Fields
          </button>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "json" ? "bg-amber-500 text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            Paste JSON Config
          </button>
        </div>

        {/* Form Mode */}
        {mode === "form" && (
          <form onSubmit={handleSaveAndTest} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  API Key
                </label>
                <input
                  type="text"
                  name="apiKey"
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Project ID
                </label>
                <input
                  type="text"
                  name="projectId"
                  placeholder="dandiya-raas-2026"
                  value={config.projectId}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Auth Domain
                </label>
                <input
                  type="text"
                  name="authDomain"
                  placeholder="your-project.firebaseapp.com"
                  value={config.authDomain}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  name="storageBucket"
                  placeholder="your-project.appspot.com"
                  value={config.storageBucket}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  name="messagingSenderId"
                  placeholder="82910482910"
                  value={config.messagingSenderId}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  App ID
                </label>
                <input
                  type="text"
                  name="appId"
                  placeholder="1:829104:web:9a8f2..."
                  value={config.appId}
                  onChange={handleChange}
                  className="w-full bg-[#1b0938] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                {testing ? "Connecting..." : "Save & Connect Firebase"}
              </button>
            </div>
          </form>
        )}

        {/* JSON Mode */}
        {mode === "json" && (
          <div className="space-y-4">
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => handleJsonPaste(e.target.value)}
              placeholder='Paste firebaseConfig = { apiKey: "...", projectId: "..." } here'
              className="w-full bg-[#1b0938] border border-white/15 rounded-xl p-3 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveAndTest}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                Save & Apply Config
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

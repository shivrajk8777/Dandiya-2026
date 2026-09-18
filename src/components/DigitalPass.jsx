"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Download, Printer, Share2, CheckCircle, Sparkles, MapPin, Calendar, Clock, Crown, ShieldCheck } from "lucide-react";

export default function DigitalPass({ passData, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    if (passData && passData.passId) {
      const payload = JSON.stringify({
        id: passData.passId,
        name: passData.fullName,
        type: passData.passType,
        qty: passData.quantity,
        status: passData.status,
        v: "utsav-raas-2026-auth"
      });

      QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0b0318",
          light: "#ffffff"
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation error", err));
    }
  }, [passData]);

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: "#07020f",
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `UtsavRaas_Pass_${passData.passId || "2026"}.png`;
      link.click();
    } catch (err) {
      console.error("Pass download error:", err);
      alert("Could not download pass image. You can take a screenshot.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Hey! I have booked my VIP pass for UTSAV RAAS 2026 (The Royal Heritage Dandiya & Garba Festival). Pass ID: ${passData.passId}. See you at the arena!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (!passData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative max-w-xl w-full my-4 sm:my-8 bg-[#0e041c] border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">Pass Issued Successfully!</h2>
          <p className="text-[11px] sm:text-xs text-amber-300 font-medium mt-0.5">
            Your Official UTSAV RAAS 2026 E-Pass is ready
          </p>
        </div>

        {/* Printable / Downloadable Luxury Concert Pass Badge */}
        <div
          ref={ticketRef}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c0836] via-[#100422] to-[#240a44] border-2 border-amber-400/60 shadow-2xl p-4 sm:p-6 text-white"
        >
          {/* Top Gold Foil Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300" />

          {/* Holographic Watermark Badge */}
          <div className="absolute right-3 bottom-3 text-7xl opacity-5 pointer-events-none select-none font-serif-royal hidden sm:block">
            👑
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b border-amber-500/30 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest font-serif-royal">
                <Crown className="w-3 h-3 text-amber-400" />
                Royal Heritage • Season 6
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-wider text-white font-serif-royal leading-tight">
                UTSAV <span className="gold-foil-text font-sans-modern font-black">RAAS</span>
              </h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase">
                Official Access Badge
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md">
                {passData.passType}
              </span>
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold mt-1 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" />
                AUTHENTICATED
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
            {/* Attendee Details */}
            <div className="sm:col-span-2 space-y-2.5 sm:space-y-3">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Pass Holder Name
                </span>
                <div className="text-lg sm:text-xl font-black text-white capitalize font-serif-royal leading-tight">
                  {passData.fullName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                    Phone / WhatsApp
                  </span>
                  <div className="font-semibold text-slate-200 text-xs sm:text-sm">{passData.phone}</div>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                    Tier Category
                  </span>
                  <div className="font-bold text-amber-300 text-xs sm:text-sm">{passData.passType}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                    Quantity
                  </span>
                  <div className="font-bold text-white text-xs sm:text-sm">
                    {passData.quantity} {passData.quantity > 1 ? "Persons" : "Person"}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                    Total Paid
                  </span>
                  <div className="font-black text-emerald-400 text-xs sm:text-sm">
                    ₹{passData.totalAmount || passData.unitPrice}
                  </div>
                </div>
              </div>

              {/* Location & Dates */}
              <div className="pt-2 border-t border-white/10 space-y-1 text-[10px] sm:text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Oct 18 - 20, 2026 (07:00 PM Onwards)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Royal Palace Lawns, Ahmedabad</span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-black shadow-xl mx-auto sm:mx-0 w-full max-w-[150px]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Pass QR Code"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center text-xs">Generating QR...</div>
              )}
              <div className="font-mono text-[10px] font-black tracking-widest text-purple-950 mt-1 uppercase text-center">
                {passData.passId}
              </div>
              <div className="text-[8px] text-slate-600 uppercase font-extrabold tracking-wider">
                Scan at Gate
              </div>
            </div>
          </div>

          {/* Bottom security strip */}
          <div className="mt-4 pt-2.5 border-t border-dashed border-amber-500/40 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono">
            <div>
              ID: <span className="text-amber-300 font-bold">{passData.passId}</span>
            </div>
            <div>STATUS: {passData.status || "CONFIRMED"}</div>
            <div>NON-TRANSFERABLE</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Saving..." : "Download PNG"}
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>

          <button
            onClick={handleShare}
            className="py-3 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share Pass
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          Close & Back to Festival Site
        </button>
      </div>
    </div>
  );
}

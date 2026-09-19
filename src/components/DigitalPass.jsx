"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Download, Printer, Share2, CheckCircle, Sparkles, MapPin, Calendar, Clock, Crown, ShieldCheck } from "lucide-react";

export default function DigitalPass({ passData, onClose }) {
  const [logoDataUrl, setLogoDataUrl] = useState("/logo.png");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  // Preload logo as Base64 Data URL to prevent CORS/taint issues in html2canvas
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/logo.png";
      img.onload = () => {
        try {
          const cvs = document.createElement("canvas");
          cvs.width = img.naturalWidth || img.width;
          cvs.height = img.naturalHeight || img.height;
          const ctx = cvs.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = cvs.toDataURL("image/png");
          setLogoDataUrl(dataUrl);
        } catch (e) {
          console.warn("Logo base64 conversion warning:", e);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (passData && passData.passId) {
      const payload = JSON.stringify({
        id: passData.passId,
        name: passData.fullName,
        type: passData.passType,
        qty: passData.quantity,
        status: passData.status,
        v: "rang-tarang-garba-2026-auth"
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

  // Native 2D Canvas Pass Generator (Produces exact ultra-HD print-matching design)
  const generateNativeCanvasPass = async () => {
    const cvs = document.createElement("canvas");
    cvs.width = 1200;
    cvs.height = 650;
    const ctx = cvs.getContext("2d");

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 650);
    bgGrad.addColorStop(0, "#1c0836");
    bgGrad.addColorStop(0.5, "#100422");
    bgGrad.addColorStop(1, "#240a44");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 650);

    // 2. Gold Top Bar
    const goldGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    goldGrad.addColorStop(0, "#fcd34d");
    goldGrad.addColorStop(0.5, "#fb7185");
    goldGrad.addColorStop(1, "#fcd34d");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, 1200, 14);

    // 3. Outer Border
    ctx.strokeStyle = "#e5b869";
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, 1176, 626);

    // 4. Draw Logo Image
    let textOffsetX = 60;
    if (logoDataUrl) {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = logoDataUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        setTimeout(resolve, 150);
      });
      ctx.drawImage(logoImg, 55, 38, 130, 75);
      textOffsetX = 200;
    }

    // 5. Header Title & Subtitle
    ctx.fillStyle = "#e5b869";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("GRAND HERITAGE • SEASON 6", textOffsetX, 54);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText("RANG TARANG GARBA", textOffsetX, 88);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px sans-serif";
    ctx.fillText("OFFICIAL DIGITAL ACCESS PASS 2026", textOffsetX, 110);

    // 6. Pass Category Badge (Right top)
    const badgeText = (passData.passType || "VIP PASS").toUpperCase();
    ctx.font = "bold 15px sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 36;
    const badgeX = 1145 - badgeWidth;

    const bGrad = ctx.createLinearGradient(badgeX, 0, 1145, 0);
    bGrad.addColorStop(0, "#fbbf24");
    bGrad.addColorStop(1, "#f97316");
    ctx.fillStyle = bGrad;

    ctx.beginPath();
    ctx.roundRect(badgeX, 50, badgeWidth, 38, 19);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(badgeText, badgeX + 18, 74);

    // 7. Horizontal Divider
    ctx.strokeStyle = "rgba(229, 184, 105, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 130);
    ctx.lineTo(1145, 130);
    ctx.stroke();

    // 8. Attendee Name Section
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("PASS HOLDER NAME", 60, 168);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Georgia, serif";
    ctx.fillText(passData.fullName || "Valued Guest", 60, 210);

    // 9. Meta Grid (Phone, Tier, Qty, Paid)
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("PHONE / WHATSAPP", 60, 260);
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 22px monospace";
    ctx.fillText(passData.phone || "-", 60, 292);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("TIER CATEGORY", 360, 260);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(passData.passType || "Single Entry", 360, 292);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("QUANTITY", 60, 335);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`${passData.quantity || 1} Persons`, 60, 367);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText("TOTAL PAID", 360, 335);
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`₹${passData.totalAmount || passData.unitPrice || 0}`, 360, 367);

    // 10. Venue & Date Box
    ctx.fillStyle = "#160729";
    ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(55, 400, 680, 105, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText("📅  Oct 17 - 19, 2026  (07:00 PM Onwards)", 80, 438);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "15px sans-serif";
    ctx.fillText("📍  Raj Vilas Garden, Main Highway Road, Chomu, Rajasthan", 80, 478);

    // 11. Draw QR Code Box (Right Side)
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        setTimeout(resolve, 200);
      });
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(790, 155, 355, 350, 20);
      ctx.fill();

      ctx.drawImage(qrImg, 825, 175, 285, 285);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 17px monospace";
      ctx.textAlign = "center";
      ctx.fillText(passData.passId || "", 967, 475);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("SCAN AT GATE FOR ENTRY", 967, 492);
      ctx.textAlign = "left";
    }

    // 12. Bottom Security Strip
    ctx.strokeStyle = "rgba(229, 184, 105, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(55, 535);
    ctx.lineTo(1145, 535);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px monospace";
    ctx.fillText(`PASS ID: ${passData.passId || "DND-2026"}`, 60, 575);
    ctx.fillText(`STATUS: ${passData.status || "CONFIRMED"}`, 450, 575);
    ctx.fillText("AUTHENTICATED • NON-TRANSFERABLE", 780, 575);

    // 13. Trigger PNG Download
    const image = cvs.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = `RangTarangGarba_Pass_${passData?.passId || "2026"}.png`;
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadImage = async () => {
    if (!passData) return;
    setDownloading(true);
    try {
      await generateNativeCanvasPass();
    } catch (err) {
      console.error("Pass download error:", err);
      alert("Could not download pass image automatically. Please take a screenshot.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open("", "_blank", "width=850,height=900");
      if (printWindow) {
        const logoSrc = logoDataUrl || "/logo.png";
        const qrSrc = qrDataUrl || "";

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Pass - ${passData.passId || "Rang Tarang Garba"}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                body {
                  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                  background-color: #ffffff;
                  color: #000000;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  padding: 10px;
                }
                .ticket-card {
                  width: 100%;
                  max-width: 680px;
                  background: linear-gradient(135deg, #1c0836 0%, #100422 50%, #240a44 100%);
                  border: 3px solid #e5b869;
                  border-radius: 20px;
                  padding: 24px;
                  color: #ffffff;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  position: relative;
                  overflow: hidden;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  page-break-inside: avoid;
                  page-break-after: avoid;
                }
                .top-bar {
                  height: 6px;
                  background: linear-gradient(to right, #fcd34d, #fb7185, #fcd34d);
                  margin: -24px -24px 20px -24px;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 1px solid rgba(229, 184, 105, 0.4);
                  padding-bottom: 14px;
                  margin-bottom: 20px;
                }
                .logo-img {
                  height: 48px;
                  width: auto;
                  object-fit: contain;
                }
                .badge {
                  background: linear-gradient(to right, #fbbf24, #f97316);
                  color: #000000;
                  font-weight: 900;
                  font-size: 11px;
                  padding: 6px 14px;
                  border-radius: 20px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: 2fr 1fr;
                  gap: 20px;
                  align-items: center;
                }
                .label {
                  font-size: 10px;
                  font-weight: 700;
                  color: #94a3b8;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 3px;
                }
                .val-title {
                  font-size: 26px;
                  font-weight: 900;
                  font-family: Georgia, serif;
                  color: #ffffff;
                  margin-bottom: 12px;
                }
                .val-meta {
                  font-size: 14px;
                  color: #f1f5f9;
                  font-weight: 600;
                  margin-bottom: 8px;
                }
                .meta-row {
                  display: flex;
                  gap: 20px;
                  margin-bottom: 12px;
                }
                .venue-box {
                  border-top: 1px solid rgba(255,255,255,0.15);
                  padding-top: 10px;
                  margin-top: 10px;
                  font-size: 12px;
                  color: #fcd34d;
                  font-weight: 600;
                }
                .qr-box {
                  background: #ffffff;
                  border-radius: 16px;
                  padding: 12px;
                  text-align: center;
                  color: #0f172a;
                }
                .qr-img {
                  width: 140px;
                  height: 140px;
                  object-fit: contain;
                }
                .pass-id {
                  font-family: monospace;
                  font-weight: 900;
                  font-size: 12px;
                  margin-top: 4px;
                  color: #1e1b4b;
                }
                .footer-strip {
                  border-top: 1px dashed rgba(229, 184, 105, 0.4);
                  margin-top: 16px;
                  padding-top: 10px;
                  display: flex;
                  justify-content: space-between;
                  font-family: monospace;
                  font-size: 11px;
                  color: #cbd5e1;
                }
              </style>
            </head>
            <body>
              <div class="ticket-card">
                <div class="top-bar"></div>
                <div class="header">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${logoSrc}" class="logo-img" />
                    <div>
                      <div style="font-size: 10px; color: #fcd34d; font-weight: 800; text-transform: uppercase;">Grand Heritage • Season 6</div>
                      <div style="font-size: 11px; color: #cbd5e1;">Official Access Badge 2026</div>
                    </div>
                  </div>
                  <div class="badge">${passData.passType || "VIP PASS"}</div>
                </div>

                <div class="details-grid">
                  <div>
                    <div class="label">Pass Holder Name</div>
                    <div class="val-title">${passData.fullName || "Valued Guest"}</div>

                    <div class="meta-row">
                      <div>
                        <div class="label">Phone / WhatsApp</div>
                        <div class="val-meta">${passData.phone || "-"}</div>
                      </div>
                      <div>
                        <div class="label">Total Paid</div>
                        <div class="val-meta" style="color: #4ade80;">₹${passData.totalAmount || passData.unitPrice || 0}</div>
                      </div>
                      <div>
                        <div class="label">Quantity</div>
                        <div class="val-meta">${passData.quantity || 1} Persons</div>
                      </div>
                    </div>

                    <div class="venue-box">
                      <div>📅 Oct 17 - 19, 2026 (07:00 PM Onwards)</div>
                      <div>📍 Raj Vilas Garden, Chomu, Rajasthan</div>
                    </div>
                  </div>

                  <div class="qr-box">
                    <img src="${qrSrc}" class="qr-img" />
                    <div class="pass-id">${passData.passId || "DND-2026"}</div>
                    <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-top: 2px;">Scan At Gate</div>
                  </div>
                </div>

                <div class="footer-strip">
                  <div>ID: <strong style="color: #fcd34d;">${passData.passId || "-"}</strong></div>
                  <div>STATUS: ${passData.status || "CONFIRMED"}</div>
                  <div>NON-TRANSFERABLE</div>
                </div>
              </div>

              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn("Popup window blocked, fallback to window.print()", e);
      window.print();
    }
  };

  const handleShare = () => {
    const text = `Hey! I have booked my VIP pass for RANG TARANG GARBA 2026 (The Grand Heritage Dandiya & Garba Mahotsav). Pass ID: ${passData.passId}. See you at the arena!`;
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
            Your Official RANG TARANG GARBA 2026 E-Pass is ready
          </p>
        </div>

        {/* Printable / Downloadable Luxury Concert Pass Badge */}
        <div
          id="printable-ticket"
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
            <div className="flex items-center gap-3">
              <img
                src={logoDataUrl}
                alt="Rang Tarang Garba"
                crossOrigin="anonymous"
                className="h-11 sm:h-13 w-auto object-contain drop-shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest font-serif-royal">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Grand Heritage • Season 6
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-wider text-white font-serif-royal leading-tight">
                  RANG TARANG <span className="gold-foil-text font-sans-modern font-black">GARBA</span>
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase">
                  Official Access Badge 2026
                </p>
              </div>
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
                  <span>Oct 17 - 19, 2026 (07:00 PM Onwards)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Raj Vilas Garden, Chomu, Rajasthan</span>
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

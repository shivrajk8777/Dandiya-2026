"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, Share2, CheckCircle, Sparkles, MapPin, Calendar, Crown, ShieldCheck, FileText, Info, Layers } from "lucide-react";
import { subscribeToSponsors, getLocalSponsors, generateDynamicLogoSvg } from "@/lib/sponsorService";

const DEFAULT_TERMS = [
  {
    num: "01",
    title: "DIGITAL ENTRY & VALID PHOTO ID",
    desc: "Entry permitted strictly upon presenting this official E-Pass QR code along with a valid Government Photo ID matching pass holder name."
  },
  {
    num: "02",
    title: "MANDATORY TRADITIONAL ATTIRE",
    desc: "Traditional ethnic wear (Chaniya Choli / Lehenga / Kurta Pajama / Kedia) is mandatory for venue admission & arena entry."
  },
  {
    num: "03",
    title: "ACCESS WRISTBAND MANDATORY",
    desc: "Official wristbands issued at entry gate must be worn at all times inside venue. Unsealed, torn, or tampered bands are void."
  },
  {
    num: "04",
    title: "STRICT SECURITY & PROHIBITED ITEMS",
    desc: "Outside food, drinks, alcohol, tobacco, weapons & sharp items prohibited. Strict security screening & frisking enforced at gates."
  },
  {
    num: "05",
    title: "NON-REFUNDABLE & NON-TRANSFERABLE",
    desc: "Passes are non-refundable and non-transferable under any circumstances, including weather conditions, delays, or emergency."
  },
  {
    num: "06",
    title: "FAMILY SAFE CODE OF CONDUCT",
    desc: "Zero-tolerance policy for harassment or misconduct. Organizers reserve full rights of admission and immediate ejection without refund."
  },
  {
    num: "07",
    title: "ORGANIZER LIABILITY LIMITATION",
    desc: "Organizers & venue management accept no liability for loss of personal valuables, property damage, or injury inside venue."
  },
  {
    num: "08",
    title: "MEDIA & BROADCAST CONSENT",
    desc: "Pass holder consents to photography, filming, and audio recording by event media team and official festival partners for promotion."
  }
];

export default function DigitalPass({ passData, onClose }) {
  const [logoDataUrl, setLogoDataUrl] = useState("/logo.png");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [activeTab, setActiveTab] = useState("both"); // 'front', 'back', 'both'
  const ticketRef = useRef(null);

  // Subscribe to real-time sponsors / partners (For Front Side banner)
  useEffect(() => {
    const unsubscribe = subscribeToSponsors((data) => {
      if (data && data.length > 0) {
        setSponsors(data);
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Preload logo as Base64 Data URL
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

  // Preload QR Code
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

  // Native 2D Canvas Pass Generator (Side A Front + Side B Back with Terms & Conditions only)
  const generateNativeCanvasPass = async () => {
    const canvasWidth = 1200;
    const canvasHeight = 1260;
    const cvs = document.createElement("canvas");
    cvs.width = canvasWidth;
    cvs.height = canvasHeight;
    const ctx = cvs.getContext("2d");

    // ==========================================
    // SIDE A: FRONT PASS (0 to 640 px)
    // ==========================================

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 640);
    bgGrad.addColorStop(0, "#1c0836");
    bgGrad.addColorStop(0.5, "#100422");
    bgGrad.addColorStop(1, "#240a44");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 640);

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
    ctx.strokeRect(12, 12, 1176, 616);

    // 4. Logo Image
    let textOffsetX = 60;
    if (logoDataUrl) {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = logoDataUrl;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        setTimeout(resolve, 150);
      });
      ctx.drawImage(logoImg, 55, 34, 120, 70);
      textOffsetX = 190;
    }

    // 5. Header Title & Subtitle
    ctx.fillStyle = "#e5b869";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("GRAND HERITAGE • SEASON 6", textOffsetX, 48);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("RANG TARANG GARBA", textOffsetX, 80);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px sans-serif";
    ctx.fillText("OFFICIAL DIGITAL ACCESS PASS 2026", textOffsetX, 100);

    // 6. Category Badge
    const badgeText = (passData.passType || "VIP PASS").toUpperCase();
    ctx.font = "bold 14px sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 36;
    const badgeX = 1145 - badgeWidth;

    const bGrad = ctx.createLinearGradient(badgeX, 0, 1145, 0);
    bGrad.addColorStop(0, "#fbbf24");
    bGrad.addColorStop(1, "#f97316");
    ctx.fillStyle = bGrad;

    ctx.beginPath();
    ctx.roundRect(badgeX, 44, badgeWidth, 36, 18);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(badgeText, badgeX + 18, 67);

    // 7. Horizontal Divider
    ctx.strokeStyle = "rgba(229, 184, 105, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 118);
    ctx.lineTo(1145, 118);
    ctx.stroke();

    // 8. Attendee Name & Details Grid
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("PASS HOLDER NAME", 60, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText(passData.fullName || "Valued Guest", 60, 188);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("PHONE / WHATSAPP", 60, 230);
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "bold 20px monospace";
    ctx.fillText(passData.phone || "-", 60, 258);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("TIER CATEGORY", 360, 230);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(passData.passType || "Single Entry", 360, 258);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("QUANTITY", 60, 295);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`${passData.quantity || 1} Persons`, 60, 323);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText("TOTAL PAID", 360, 295);
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`₹${passData.totalAmount || passData.unitPrice || 0}`, 360, 323);

    // 9. Venue & Date Box
    ctx.fillStyle = "#160729";
    ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(55, 350, 680, 95, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("📅  Oct 17 - 19, 2026  (07:00 PM Onwards)", 75, 385);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = "14px sans-serif";
    ctx.fillText("📍  Raj Vilas Garden, Main Highway Road, Chomu, Rajasthan", 75, 422);

    // 10. QR Code Box
    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        setTimeout(resolve, 150);
      });
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(785, 135, 360, 310, 18);
      ctx.fill();

      ctx.drawImage(qrImg, 825, 150, 280, 245);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText(passData.passId || "", 965, 415);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("SCAN AT GATE FOR ENTRY", 965, 432);
      ctx.textAlign = "left";
    }

    // 11. Front Side Partners Banner Strip with LOGOS
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.strokeStyle = "rgba(229, 184, 105, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(55, 452, 1090, 64, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e5b869";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("OFFICIAL FESTIVAL PARTNERS:", 70, 488);

    const activeSps = sponsors && sponsors.length > 0 ? sponsors : getLocalSponsors();
    const loadedLogos = await Promise.all(
      activeSps.slice(0, 6).map((sp) => {
        return new Promise((resolve) => {
          if (!sp.logoUrl) return resolve({ name: sp.name, img: null });
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = sp.logoUrl;
          img.onload = () => resolve({ name: sp.name, img });
          img.onerror = () => resolve({ name: sp.name, img: null });
          setTimeout(() => resolve({ name: sp.name, img: null }), 300);
        });
      })
    );

    const logoBoxW = 125;
    const logoBoxH = 34;
    const logoGap = 12;
    const startLogoX = 270;
    const startLogoY = 467;

    loadedLogos.forEach((item, idx) => {
      const lx = startLogoX + idx * (logoBoxW + logoGap);
      const ly = startLogoY;

      if (lx + logoBoxW <= 1130) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx, ly, logoBoxW, logoBoxH, 6);
        ctx.fill();
        ctx.stroke();

        if (item.img) {
          ctx.drawImage(item.img, lx + 4, ly + 3, logoBoxW - 8, logoBoxH - 6);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.name || "PARTNER", lx + logoBoxW / 2, ly + 21);
          ctx.textAlign = "left";
        }
      }
    });

    // 12. Bottom Security Strip (Front)
    ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(55, 528);
    ctx.lineTo(1145, 528);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px monospace";
    ctx.fillText(`PASS ID: ${passData.passId || "DND-2026"}`, 60, 560);
    ctx.fillText(`STATUS: ${passData.status || "CONFIRMED"}`, 450, 560);
    ctx.fillText("AUTHENTICATED • NON-TRANSFERABLE", 780, 560);

    // ==========================================
    // PERFORATION DIVIDER (640 to 685 px)
    // ==========================================
    ctx.fillStyle = "#0c0316";
    ctx.fillRect(0, 640, 1200, 45);

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(40, 662);
    ctx.lineTo(1160, 662);
    ctx.stroke();
    ctx.setLineDash([]);

    // Perforation Tag Badge
    ctx.fillStyle = "#1e1133";
    ctx.strokeStyle = "#e5b869";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(390, 645, 420, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✂️  FLIP SIDE  •  TERMS & CONDITIONS OF ENTRY  ✂️", 600, 666);
    ctx.textAlign = "left";

    // ==========================================
    // SIDE B: BACK PASS (685 to 1260 px) - TERMS & CONDITIONS ONLY
    // ==========================================

    // 13. Back Pass Background Gradient
    const bgGradBack = ctx.createLinearGradient(0, 685, 1200, 1260);
    bgGradBack.addColorStop(0, "#14052b");
    bgGradBack.addColorStop(0.5, "#0b0318");
    bgGradBack.addColorStop(1, "#1b0838");
    ctx.fillStyle = bgGradBack;
    ctx.fillRect(0, 685, 1200, 575);

    // 14. Back Outer Border
    ctx.strokeStyle = "#e5b869";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 695, 1176, 550);

    // 15. Back Side Header Bar
    const bHeaderGrad = ctx.createLinearGradient(0, 695, 1200, 0);
    bHeaderGrad.addColorStop(0, "#fbbf24");
    bHeaderGrad.addColorStop(0.5, "#f97316");
    bHeaderGrad.addColorStop(1, "#fbbf24");
    ctx.fillStyle = bHeaderGrad;
    ctx.fillRect(14, 697, 1172, 10);

    // Header Titles
    ctx.fillStyle = "#e5b869";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("RANG TARANG GARBA 2026 • OFFICIAL TICKET BACK SIDE", 55, 730);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 25px Georgia, serif";
    ctx.fillText("TERMS & CONDITIONS OF ENTRY", 55, 762);

    // Divider
    ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(55, 775);
    ctx.lineTo(1145, 775);
    ctx.stroke();

    // 16. TERMS AND CONDITIONS OF ENTRY (8 Rules in 2 Columns)
    const termW = 535;
    const termH = 80;
    const tColGap = 20;
    const tRowGap = 12;
    const tStartX = 55;
    const tStartY = 792;

    DEFAULT_TERMS.forEach((term, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tx = tStartX + col * (termW + tColGap);
      const ty = tStartY + row * (termH + tRowGap);

      // Rule Box Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(229, 184, 105, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, termW, termH, 10);
      ctx.fill();
      ctx.stroke();

      // Number Circle
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(tx + 26, ty + 26, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(term.num, tx + 26, ty + 30);
      ctx.textAlign = "left";

      // Rule Title
      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 12.5px sans-serif";
      ctx.fillText(term.title, tx + 52, ty + 26);

      // Rule Description (Wrapped into 2 lines)
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px sans-serif";

      const words = term.desc.split(" ");
      let line1 = "";
      let line2 = "";
      words.forEach(w => {
        if ((line1 + w).length < 66) {
          line1 += (line1 ? " " : "") + w;
        } else {
          line2 += (line2 ? " " : "") + w;
        }
      });

      ctx.fillText(line1, tx + 52, ty + 46);
      if (line2) {
        ctx.fillText(line2, tx + 52, ty + 63);
      }
    });

    // 17. Bottom Security Strip (Back)
    ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(55, 1180);
    ctx.lineTo(1145, 1180);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px monospace";
    ctx.fillText(`PASS SECURITY ID: ${passData.passId || "DND-2026"}`, 60, 1210);
    ctx.fillText("AUTHENTICATED BY RANG TARANG GARBA 2026 COMMITTEE", 380, 1210);
    ctx.fillText("RIGHTS OF ADMISSION RESERVED", 870, 1210);

    // 18. Trigger PNG Download
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
      const printWindow = window.open("", "_blank", "width=900,height=1000");
      if (printWindow) {
        const logoSrc = logoDataUrl || "/logo.png";
        const qrSrc = qrDataUrl || "";
        const partnersList = sponsors.length > 0 ? sponsors : [
          { name: "GUJARAT TOURISM" },
          { name: "RED BULL" },
          { name: "TAJ HOTELS" },
          { name: "TIMES OF INDIA" },
          { name: "VOGUE INDIA" },
          { name: "FEVER 104 FM" }
        ];

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Pass - ${passData.passId || "Rang Tarang Garba"}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 8mm;
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
                  padding: 10px;
                }
                .ticket-page {
                  width: 100%;
                  max-width: 700px;
                  margin: 0 auto 20px auto;
                  background: linear-gradient(135deg, #1c0836 0%, #100422 50%, #240a44 100%);
                  border: 3px solid #e5b869;
                  border-radius: 20px;
                  padding: 24px;
                  color: #ffffff;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  position: relative;
                  page-break-after: always;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .ticket-page:last-child {
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
                  font-size: 24px;
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
                .partners-front-strip {
                  background: rgba(0,0,0,0.3);
                  border: 1px solid rgba(229, 184, 105, 0.3);
                  border-radius: 10px;
                  padding: 8px 12px;
                  margin-top: 14px;
                  font-size: 10px;
                  color: #f1f5f9;
                }
                .terms-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 12px;
                  margin-top: 16px;
                }
                .term-box {
                  background: rgba(255,255,255,0.04);
                  border: 1px solid rgba(229, 184, 105, 0.25);
                  border-radius: 10px;
                  padding: 10px 12px;
                  display: flex;
                  gap: 10px;
                }
                .term-num {
                  background: #fbbf24;
                  color: #000;
                  font-weight: 900;
                  font-size: 10px;
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  shrink: 0;
                }
                .term-title {
                  font-size: 11.5px;
                  font-weight: bold;
                  color: #fcd34d;
                  margin-bottom: 3px;
                }
                .term-desc {
                  font-size: 10px;
                  color: #cbd5e1;
                  line-height: 1.35;
                }
                .footer-strip {
                  border-top: 1px dashed rgba(229, 184, 105, 0.4);
                  margin-top: 20px;
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
              <!-- PAGE 1: FRONT PASS -->
              <div class="ticket-page">
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

                <div class="partners-front-strip">
                  <div style="font-weight: 800; color: #e5b869; text-transform: uppercase; font-size: 10px; margin-bottom: 6px;">OFFICIAL FESTIVAL PARTNERS 2026:</div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    ${partnersList.slice(0, 6).map(p => p.logoUrl
                      ? `<img src="${p.logoUrl}" class="partner-logo-item" alt="${p.name}" />`
                      : `<span style="font-weight: bold; color: #fff; font-size: 11px; padding: 3px 8px; background: rgba(255,255,255,0.08); border-radius: 6px;">${p.name}</span>`
                    ).join("")}
                  </div>
                </div>

                <div class="footer-strip">
                  <div>ID: <strong style="color: #fcd34d;">${passData.passId || "-"}</strong></div>
                  <div>STATUS: ${passData.status || "CONFIRMED"}</div>
                  <div>NON-TRANSFERABLE</div>
                </div>
              </div>

              <!-- PAGE 2: BACK PASS (TERMS & CONDITIONS ONLY) -->
              <div class="ticket-page">
                <div class="top-bar"></div>
                <div style="border-bottom: 1px solid rgba(229,184,105,0.4); padding-bottom: 10px; margin-bottom: 16px;">
                  <div style="font-size: 10px; color: #e5b869; font-weight: 800; text-transform: uppercase;">RANG TARANG GARBA 2026 • TICKET BACK SIDE</div>
                  <div style="font-size: 20px; font-weight: 900; font-family: Georgia, serif; color: #fff;">TERMS & CONDITIONS OF ENTRY</div>
                </div>

                <div class="terms-grid">
                  ${DEFAULT_TERMS.map(t => `
                    <div class="term-box">
                      <div class="term-num">${t.num}</div>
                      <div>
                        <div class="term-title">${t.title}</div>
                        <div class="term-desc">${t.desc}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <div class="footer-strip" style="margin-top: 30px;">
                  <div>SECURITY ID: ${passData.passId || "-"}</div>
                  <div>AUTHENTICATED TICKET</div>
                  <div>RIGHTS OF ADMISSION RESERVED</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative max-w-2xl w-full my-4 sm:my-8 bg-[#0e041c] border border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Success Header */}
        <div className="text-center mb-3 sm:mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif-royal">Pass Issued Successfully!</h2>
          <p className="text-[11px] sm:text-xs text-amber-300 font-medium mt-0.5">
            Your Official RANG TARANG GARBA 2026 E-Pass is ready
          </p>
        </div>

        {/* Side View Switcher Tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 mb-4 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("front")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "front"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            🎟️ Front Side (Pass)
          </button>
          <button
            onClick={() => setActiveTab("back")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "back"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            📜 Back Side (Terms & Conditions)
          </button>
          <button
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "both"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Both Sides
          </button>
        </div>

        {/* Ticket Container */}
        <div id="printable-ticket" ref={ticketRef} className="space-y-4">
          {/* ========================================= */}
          {/* SIDE A: FRONT PASS */}
          {/* ========================================= */}
          {(activeTab === "front" || activeTab === "both") && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c0836] via-[#100422] to-[#240a44] border-2 border-amber-400/60 shadow-2xl p-4 sm:p-6 text-white">
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
                    className="h-10 sm:h-12 w-auto object-contain drop-shadow-md shrink-0"
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

              {/* Official Festival Partners Front Strip WITH LOGO IMAGES */}
              <div className="mt-3 p-2.5 rounded-2xl bg-black/50 border border-amber-500/35 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Official Festival Partners
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Season 2026</span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  {(sponsors && sponsors.length > 0 ? sponsors : getLocalSponsors()).slice(0, 6).map((sp, idx) => {
                    const logoSrc = sp.logoUrl || generateDynamicLogoSvg(sp.name, sp.tier);
                    return (
                      <div
                        key={sp.id || idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-amber-500/25 hover:border-amber-400/50 transition-colors shadow-sm"
                      >
                        <img
                          src={logoSrc}
                          alt={sp.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = generateDynamicLogoSvg(sp.name, sp.tier);
                          }}
                          className="h-6 w-auto max-w-[85px] object-contain drop-shadow"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom security strip */}
              <div className="mt-3 pt-2 border-t border-dashed border-amber-500/40 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono">
                <div>
                  ID: <span className="text-amber-300 font-bold">{passData.passId}</span>
                </div>
                <div>STATUS: {passData.status || "CONFIRMED"}</div>
                <div>NON-TRANSFERABLE</div>
              </div>
            </div>
          )}

          {/* Perforation Divider in Both View */}
          {activeTab === "both" && (
            <div className="relative py-1 flex items-center justify-center">
              <div className="w-full border-t-2 border-dashed border-amber-500/50" />
              <span className="absolute px-3 py-1 bg-[#1a0c30] border border-amber-400/50 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-widest shadow-md">
                ✂️ FLIP SIDE • TERMS & CONDITIONS ✂️
              </span>
            </div>
          )}

          {/* ========================================= */}
          {/* SIDE B: BACK PASS (TERMS & CONDITIONS ONLY) */}
          {/* ========================================= */}
          {(activeTab === "back" || activeTab === "both") && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#14052b] via-[#0b0318] to-[#1b0838] border-2 border-amber-400/60 shadow-2xl p-4 sm:p-6 text-white space-y-4">
              {/* Top Gold Foil Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />

              {/* Back Side Header */}
              <div className="border-b border-amber-500/30 pb-2">
                <div className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-serif-royal">
                  <FileText className="w-3.5 h-3.5" />
                  Official Ticket Back Side • Rang Tarang Garba 2026
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-serif-royal mt-0.5">
                  TERMS & CONDITIONS OF ENTRY
                </h3>
              </div>

              {/* TERMS AND CONDITIONS */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Rules & Event Guidelines
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] sm:text-[11px]">
                  {DEFAULT_TERMS.map((term) => (
                    <div
                      key={term.num}
                      className="p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-amber-500/25 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        {term.num}
                      </span>
                      <div>
                        <div className="font-bold text-amber-200 tracking-wide">
                          {term.title}
                        </div>
                        <div className="text-slate-300 leading-relaxed mt-0.5">
                          {term.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Footer (Back) */}
              <div className="pt-2 border-t border-dashed border-amber-500/40 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono">
                <div>PASS SECURITY ID: <span className="text-amber-300 font-bold">{passData.passId}</span></div>
                <div>AUTHENTICATED TICKET</div>
                <div>RIGHTS OF ADMISSION RESERVED</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating HD Ticket..." : "Download Ticket (PNG)"}
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Full Ticket
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

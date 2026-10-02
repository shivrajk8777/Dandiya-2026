"use client";
import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, Share2, CheckCircle, Sparkles, MapPin, Calendar, Crown, ShieldCheck, FileText, Info, Layers } from "lucide-react";
import { subscribeToSponsors, getLocalSponsors, generateDynamicLogoSvg } from "@/lib/sponsorService";
import { STATIC_SPONSORS } from "@/components/BrandPartners";
import { jsPDF } from "jspdf";

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
    title: "CHILD ENTRY POLICY (MAX 1 CHILD ≤ 5 YRS FREE)",
    desc: "Strictly max 1 child up to 5 years allowed FREE with Couple Pass. Children above 5 years or more than 1 child are strictly NOT ALLOWED."
  },
  {
    num: "07",
    title: "FAMILY SAFE CODE OF CONDUCT",
    desc: "Zero-tolerance policy for misconduct or harassment. Organizers reserve full rights of admission & immediate ejection without refund."
  },
  {
    num: "08",
    title: "MEDIA & ORGANIZER LIABILITY",
    desc: "Organizers accept no liability for loss of personal valuables. Pass holder consents to official event media & photography."
  }
];

// Helper to draw canvas images with aspect ratio contain (no stretching or distortion)
const drawCanvasAspectContain = (ctx, img, boxX, boxY, boxW, boxH, padding = 3) => {
  if (!img) return;
  const targetW = boxW - padding * 2;
  const targetH = boxH - padding * 2;
  const imgW = img.naturalWidth || img.width || targetW;
  const imgH = img.naturalHeight || img.height || targetH;

  const ratio = Math.min(targetW / imgW, targetH / imgH);
  const renderW = imgW * ratio;
  const renderH = imgH * ratio;

  const renderX = boxX + padding + (targetW - renderW) / 2;
  const renderY = boxY + padding + (targetH - renderH) / 2;

  ctx.drawImage(img, renderX, renderY, renderW, renderH);
};

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
  const generateNativeCanvasPass = async (scale = 2.0) => {
    const baseWidth = 1200;
    const baseHeight = 1260;
    const cvs = document.createElement("canvas");
    cvs.width = baseWidth * scale;
    cvs.height = baseHeight * scale;
    const ctx = cvs.getContext("2d");

    // Scale canvas context for 300DPI Ultra-HD sharpness
    ctx.scale(scale, scale);

    // ==========================================
    // SIDE A: FRONT PASS (0 to 640 px)
    // ==========================================

    // 1. Background gradient with 28px rounded corners (border radius)
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 640);
    bgGrad.addColorStop(0, "#1c0836");
    bgGrad.addColorStop(0.5, "#100422");
    bgGrad.addColorStop(1, "#240a44");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(12, 12, 1176, 616, 28);
    ctx.fill();

    // 2. Gold Top Bar (Clipped to rounded corners)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(12, 12, 1176, 616, 28);
    ctx.clip();
    const goldGrad = ctx.createLinearGradient(0, 0, 1200, 0);
    goldGrad.addColorStop(0, "#fcd34d");
    goldGrad.addColorStop(0.5, "#fb7185");
    goldGrad.addColorStop(1, "#fcd34d");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(12, 12, 1176, 14);
    ctx.restore();

    // 3. Outer Border with Rounded Corners
    ctx.strokeStyle = "#e5b869";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(12, 12, 1176, 616, 28);
    ctx.stroke();

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
      drawCanvasAspectContain(ctx, logoImg, 55, 34, 120, 70, 0);
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
    ctx.fillText("PASS HOLDER NAME & AADHAAR", 60, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(passData.fullName || "Valued Guest", 60, 182);

    if (Array.isArray(passData.attendees) && passData.attendees.length > 0) {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 12px monospace";
      const attSummary = passData.attendees
        .map((a, i) => `T${i + 1}: ${a.name} (${a.aadhaar})`)
        .concat(
          passData.childrenCount > 0 && Array.isArray(passData.children)
            ? passData.children.map((c) => `Child: ${c.name} (${c.aadhaar || c.age + "yr"})`)
            : []
        )
        .join("  •  ");
      const displaySummary = attSummary.length > 70 ? attSummary.slice(0, 68) + "..." : attSummary;
      ctx.fillText(displaySummary, 60, 204);
    }

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
    ctx.fillText("QUANTITY & ENTRY", 60, 295);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    const childPassStr = passData.childrenCount > 0 ? ` + ${passData.childrenCount} Free Child (≤5 Yrs)` : "";
    ctx.fillText(`${(passData.quantity || 1) * 2} Persons Entry${childPassStr}`, 60, 323);

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

      drawCanvasAspectContain(ctx, qrImg, 825, 150, 280, 245, 5);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText(passData.passId || "", 965, 415);

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("SCAN AT GATE FOR ENTRY", 965, 432);
      ctx.textAlign = "left";
    }

    // 11. Front Side Partners Banner Strip with LOGOS (Single Horizontal Row)
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.strokeStyle = "rgba(229, 184, 105, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(55, 452, 1090, 64, 12);
    ctx.fill();
    ctx.stroke();

    const activeSps = STATIC_SPONSORS;
    const loadedLogos = await Promise.all(
      activeSps.map((sp) => {
        return new Promise((resolve) => {
          if (!sp.logoUrl) return resolve({ ...sp, img: null });
          const img = new Image();
          if (sp.logoUrl.startsWith("http")) {
            img.crossOrigin = "anonymous";
          }
          img.src = sp.logoUrl;
          img.onload = () => resolve({ ...sp, img });
          img.onerror = () => resolve({ ...sp, img: null });
          setTimeout(() => resolve({ ...sp, img: null }), 3000);
        });
      })
    );

    const logoBoxW = 98;
    const logoBoxH = 38;
    const logoGap = 9;
    const startLogoX = 66;
    const startLogoY = 465;

    loadedLogos.forEach((item, idx) => {
      const lx = startLogoX + idx * (logoBoxW + logoGap);
      const ly = startLogoY;

      if (lx + logoBoxW <= 1140) {
        if (item.bgWhite) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#ffffff";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          ctx.strokeStyle = "rgba(229, 184, 105, 0.3)";
        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx, ly, logoBoxW, logoBoxH, 6);
        ctx.fill();
        ctx.stroke();

        if (item.img) {
          drawCanvasAspectContain(ctx, item.img, lx, ly, logoBoxW, logoBoxH, 4);
        } else {
          ctx.fillStyle = item.bgWhite ? "#000000" : "#ffffff";
          ctx.font = "bold 8.5px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.name || "PARTNER", lx + logoBoxW / 2, ly + 20);
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

    // 13. Back Pass Background Gradient with 28px rounded corners
    const bgGradBack = ctx.createLinearGradient(0, 685, 1200, 1260);
    bgGradBack.addColorStop(0, "#14052b");
    bgGradBack.addColorStop(0.5, "#0b0318");
    bgGradBack.addColorStop(1, "#1b0838");
    ctx.fillStyle = bgGradBack;
    ctx.beginPath();
    ctx.roundRect(12, 695, 1176, 550, 28);
    ctx.fill();

    // 14. Back Top Bar (Clipped to rounded corners)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(12, 695, 1176, 550, 28);
    ctx.clip();
    const bHeaderGrad = ctx.createLinearGradient(0, 695, 1200, 0);
    bHeaderGrad.addColorStop(0, "#fbbf24");
    bHeaderGrad.addColorStop(0.5, "#f97316");
    bHeaderGrad.addColorStop(1, "#fbbf24");
    ctx.fillStyle = bHeaderGrad;
    ctx.fillRect(12, 695, 1176, 10);
    ctx.restore();

    // 15. Back Outer Border with Rounded Corners
    ctx.strokeStyle = "#e5b869";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(12, 695, 1176, 550, 28);
    ctx.stroke();

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

    return cvs;
  };

  const handleDownloadPdf = async () => {
    if (!passData) return;
    setDownloading(true);
    try {
      const cvs = await generateNativeCanvasPass(2.0);
      const imgData = cvs.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210;
      const marginX = 10;
      const pdfWidth = pageWidth - marginX * 2; // 190mm
      const pdfHeight = (cvs.height / cvs.width) * pdfWidth; // ~199.5mm

      const startY = 12; // Top margin

      pdf.addImage(imgData, "JPEG", marginX, startY, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`RangTarangGarba_Pass_${passData?.passId || "2026"}.pdf`);
    } catch (err) {
      console.error("Pass PDF download error:", err);
      alert("Could not download PDF automatically. Please try the Print button.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!passData) return;
    setDownloading(true);
    try {
      const cvs = await generateNativeCanvasPass(2.0);
      const image = cvs.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `RangTarangGarba_Pass_${passData?.passId || "2026"}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Pass download error:", err);
      alert("Could not download pass image automatically. Please take a screenshot.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!passData) return;
    try {
      const cvs = await generateNativeCanvasPass(2.0);
      const imgData = cvs.toDataURL("image/png");

      const printIframe = document.createElement("iframe");
      printIframe.style.position = "fixed";
      printIframe.style.right = "0";
      printIframe.style.bottom = "0";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "0";
      document.body.appendChild(printIframe);

      const frameDoc = printIframe.contentWindow.document;
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Pass - ${passData.passId || "Rang Tarang Garba 2026"}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 5mm;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              img {
                width: 100%;
                max-width: 195mm;
                height: auto;
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          document.body.removeChild(printIframe);
        } catch (e) {}
      }, 60000);
    } catch (e) {
      console.error("Print error:", e);
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
      <div className="relative max-w-2xl w-full my-2 sm:my-6 bg-[#0e041c] border border-amber-500/40 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Success Header */}
        <div className="text-center mb-2.5 sm:mb-4 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white font-serif-royal leading-tight">Pass Issued Successfully!</h2>
          <p className="text-[10px] sm:text-xs text-amber-300 font-medium mt-0.5">
            Your Official RANG TARANG GARBA 2026 E-Pass is ready
          </p>
        </div>

        {/* Side View Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 mb-3 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("front")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "front"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="truncate">🎟️ Front</span>
          </button>
          <button
            onClick={() => setActiveTab("back")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "back"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="truncate">📜 Back (Rules)</span>
          </button>
          <button
            onClick={() => setActiveTab("both")}
            className={`py-1.5 px-1 sm:px-3 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "both"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-md"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span className="truncate">Both</span>
          </button>
        </div>

        {/* Ticket Container Scrollable Body */}
        <div id="printable-ticket" ref={ticketRef} className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3.5">
          {/* ========================================= */}
          {/* SIDE A: FRONT PASS */}
          {/* ========================================= */}
          {(activeTab === "front" || activeTab === "both") && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c0836] via-[#100422] to-[#240a44] border-2 border-amber-400/60 shadow-2xl p-3.5 sm:p-6 text-white">
              {/* Top Gold Foil Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300" />

              {/* Holographic Watermark Badge */}
              <div className="absolute right-3 bottom-3 text-7xl opacity-5 pointer-events-none select-none font-serif-royal hidden sm:block">
                👑
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-amber-500/30 pb-2.5 mb-3 gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={logoDataUrl}
                    alt="Rang Tarang Garba"
                    crossOrigin="anonymous"
                    className="h-9 sm:h-12 w-auto object-contain drop-shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest font-serif-royal">
                      <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                      Season 6 • Garba Mahotsav
                    </div>
                    <h3 className="text-base sm:text-xl font-black tracking-wider text-white font-serif-royal leading-tight">
                      RANG TARANG <span className="gold-foil-text font-sans-modern font-black">GARBA</span>
                    </h3>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/10 pt-1.5 sm:pt-0">
                  <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md">
                    {passData.passType}
                  </span>
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    AUTHENTICATED
                  </div>
                </div>
              </div>

              {/* Pass Body */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 items-center">
                {/* Attendee Details */}
                <div className="sm:col-span-2 space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Pass Holder Name & Aadhaar
                    </span>
                    <div className="text-base sm:text-xl font-black text-white capitalize font-serif-royal leading-tight">
                      {passData.fullName}
                    </div>
                    {Array.isArray(passData.attendees) && passData.attendees.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {passData.attendees.map((att, idx) => (
                          <div key={idx} className="text-[10px] sm:text-[11px] text-amber-300 font-mono">
                            T{idx + 1}: <strong className="text-white font-sans font-semibold">{att.name}</strong> • Aadhaar: {att.aadhaar ? att.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") : "N/A"}
                          </div>
                        ))}
                        {passData.childrenCount > 0 && Array.isArray(passData.children) && passData.children.length > 0 && (
                          passData.children.map((child, cIdx) => (
                            <div key={`c-${cIdx}`} className="text-[10px] sm:text-[11px] text-emerald-300 font-mono">
                              👶 Child #{cIdx + 1}: <strong className="text-white font-sans font-semibold">{child.name}</strong> ({child.age} Yrs - Free) • Aadhaar: {child.aadhaar ? child.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") : "N/A"}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
                        Phone / WhatsApp
                      </span>
                      <div className="font-semibold text-slate-200 text-xs sm:text-sm font-mono">{passData.phone}</div>
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
                        Quantity & Entry
                      </span>
                      <div className="font-bold text-white text-xs sm:text-sm">
                        {passData.quantity} {passData.quantity === 1 ? "Couple Pass" : "Couple Passes"} ({passData.quantity * 2} Pax)
                      </div>
                      {passData.childrenCount > 0 && (
                        <div className="text-[10px] sm:text-[11px] text-emerald-300 font-bold flex flex-wrap items-center gap-1 mt-0.5">
                          <span>👶 +{passData.childrenCount} Free Child (≤5 Yrs)</span>
                          {Array.isArray(passData.children) && passData.children.length > 0 && (
                            <span className="text-[9px] text-amber-200/90 font-mono font-normal">
                              ({passData.children.map((c) => `${c.name} ${c.age}yr`).join(", ")})
                            </span>
                          )}
                        </div>
                      )}
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
                <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white text-black shadow-xl mx-auto sm:mx-0 w-full max-w-[140px] sm:max-w-[150px]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Pass QR Code"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-xs">Generating QR...</div>
                  )}
                  <div className="font-mono text-[9px] sm:text-[10px] font-black tracking-widest text-purple-950 mt-1 uppercase text-center">
                    {passData.passId}
                  </div>
                  <div className="text-[8px] text-slate-600 uppercase font-extrabold tracking-wider">
                    Scan at Gate
                  </div>
                </div>
              </div>

              {/* Official Festival Partners Front Strip WITH LOGO IMAGES (Single Horizontal Line) */}
              <div className="mt-3 p-1.5 sm:p-2 rounded-2xl bg-black/50 border border-amber-500/35">
                <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar w-full">
                  {STATIC_SPONSORS.map((sp, idx) => (
                    <div
                      key={sp.id || idx}
                      className={`flex items-center justify-center shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border transition-colors shadow-sm ${
                        sp.bgWhite ? "bg-white border-white" : "bg-white/5 border-amber-500/25 hover:border-amber-400/50"
                      }`}
                    >
                      <img
                        src={sp.logoUrl}
                        alt={sp.name}
                        className="h-4 sm:h-6 w-auto max-w-[45px] sm:max-w-[70px] object-contain drop-shadow"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom security strip */}
              <div className="mt-2.5 pt-1.5 border-t border-dashed border-amber-500/40 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono">
                <div>
                  ID: <span className="text-amber-300 font-bold">{passData.passId}</span>
                </div>
                <div>STATUS: {passData.status || "CONFIRMED"}</div>
                <div className="hidden sm:block">NON-TRANSFERABLE</div>
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
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#14052b] via-[#0b0318] to-[#1b0838] border-2 border-amber-400/60 shadow-2xl p-3.5 sm:p-6 text-white space-y-3 sm:space-y-4">
              {/* Top Gold Foil Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />

              {/* Back Side Header */}
              <div className="border-b border-amber-500/30 pb-2">
                <div className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-serif-royal">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  Official Ticket Back Side • Rang Tarang Garba 2026
                </div>
                <h3 className="text-sm sm:text-lg font-black text-white font-serif-royal mt-0.5">
                  TERMS & CONDITIONS OF ENTRY
                </h3>
              </div>

              {/* TERMS AND CONDITIONS */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 sm:mb-3">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Rules & Event Guidelines
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-[10px] sm:text-[11px]">
                  {DEFAULT_TERMS.map((term) => (
                    <div
                      key={term.num}
                      className="p-2 sm:p-3 rounded-xl bg-white/[0.04] border border-amber-500/25 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-black font-black text-[8px] sm:text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
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
                <div>SECURITY ID: <span className="text-amber-300 font-bold">{passData.passId}</span></div>
                <div>AUTHENTICATED</div>
                <div className="hidden sm:block">RIGHTS RESERVED</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons (2x2 Grid on Mobile for height efficiency) */}
        <div className="shrink-0 pt-2 border-t border-white/10 space-y-2 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-black shrink-0" />
              <span className="truncate">{downloading ? "Generating..." : "Download PDF"}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="py-2.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Print Ticket</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Share Pass</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close & Back to Festival Site
          </button>
        </div>
      </div>
    </div>
  );

}

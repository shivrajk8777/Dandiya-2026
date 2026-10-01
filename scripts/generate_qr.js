const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const url = 'https://rangtarang.jkmsoftwares.com';
const publicDir = path.join(__dirname, '..', 'public');
const outPng = path.join(publicDir, 'rangtarang-qr.png');
const outSvg = path.join(publicDir, 'rangtarang-qr.svg');
const outCardSvg = path.join(publicDir, 'rangtarang-qr-card.svg');

const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\c417d9fe-cf6b-4694-957b-00ac88fbf2c0';
const artifactPng = path.join(artifactDir, 'rangtarang-qr.png');

async function main() {
  // 1. Generate High-Res Clean PNG (1024x1024)
  await QRCode.toFile(outPng, url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 1024,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log('High-res PNG created:', outPng);
  
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(outPng, artifactPng);
    console.log('Artifact PNG copied:', artifactPng);
  }

  // 2. Generate Vector SVG
  await QRCode.toFile(outSvg, url, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  console.log('Vector SVG created:', outSvg);

  // 3. Generate Styled Luxury Rang Tarang Card SVG
  const qrInnerSvg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#0d041c',
      light: '#ffffff'
    }
  });

  const innerPath = qrInnerSvg
    .replace(/<\?xml.*?\?>/g, '')
    .replace(/<!DOCTYPE.*?>/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '');

  const styledCard = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="700" viewBox="0 0 520 700">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#230940"/>
      <stop offset="40%" stop-color="#140428"/>
      <stop offset="100%" stop-color="#080112"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e5b869"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#fb7185"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Card Background -->
  <rect width="520" height="700" rx="32" fill="url(#cardBg)" stroke="#e5b869" stroke-width="2.5"/>
  <rect x="14" y="14" width="492" height="672" rx="22" fill="none" stroke="rgba(229,184,105,0.3)" stroke-width="1.2" stroke-dasharray="8,6"/>
  
  <!-- Top Badge -->
  <rect x="140" y="32" width="240" height="26" rx="13" fill="#17062e" stroke="#e5b869" stroke-width="1"/>
  <text x="260" y="49" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#e5b869" letter-spacing="2.5" text-anchor="middle">OFFICIAL EVENT PORTAL</text>
  
  <!-- Main Title -->
  <text x="260" y="94" font-family="Georgia, serif" font-size="26" font-weight="900" fill="url(#goldText)" text-anchor="middle">RANG TARANG GARBA</text>
  <text x="260" y="118" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#e2e8f0" letter-spacing="1.5" text-anchor="middle">SEASON 1 • OCT 17, 2026 • CHOMU, JAIPUR</text>
  <text x="260" y="138" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" fill="#cbd5e1" text-anchor="middle">Raj Vilas Garden, Chomu, Rajasthan</text>
  
  <!-- White QR Box Frame with Luxury Gold Border -->
  <g transform="translate(85, 155)">
    <rect width="350" height="350" rx="24" fill="#ffffff" stroke="#e5b869" stroke-width="4"/>
    <g transform="translate(18, 18) scale(8.5)">
      ${innerPath}
    </g>
  </g>
  
  <!-- Footer Call to Action -->
  <text x="260" y="545" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#ffffff" text-anchor="middle">SCAN TO BOOK VIP PASSES</text>
  <rect x="70" y="562" width="380" height="34" rx="12" fill="#16082e" stroke="rgba(229,184,105,0.4)" stroke-width="1"/>
  <text x="260" y="584" font-family="'Courier New', Courier, monospace" font-size="14" font-weight="bold" fill="#e5b869" text-anchor="middle">https://rangtarang.jkmsoftwares.com</text>
  
  <text x="260" y="630" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#38bdf8" text-anchor="middle">Instant Digital QR E-Ticket &amp; Red Carpet Access</text>
  <text x="260" y="652" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Organized by Rang Tarang Mahotsav Committee • Tech by JKM Softwares</text>
</svg>`;

  fs.writeFileSync(outCardSvg, styledCard);
  console.log('Luxury Card SVG created:', outCardSvg);
}

main().catch(console.error);

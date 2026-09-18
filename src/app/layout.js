import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap"
});

export const metadata = {
  title: "UTSAV RAAS 2026 | The Royal Heritage Dandiya & Garba Festival",
  description:
    "Step into India's most prestigious and electric Dandiya Mahotsav. Featuring celebrity headliners, 100-piece live Dhol symphony, royal VIP cabanas, and instant digital QR passes.",
  keywords: [
    "Utsav Raas 2026",
    "Royal Heritage Dandiya",
    "Luxury Garba Festival",
    "Dandiya Passes Online",
    "Navratri VIP Passes",
    "Celebrity Garba Night"
  ],
  authors: [{ name: "Royal Heritage Cultural Foundation" }],
  openGraph: {
    title: "UTSAV RAAS 2026 | Royal Heritage Dandiya & Garba Festival",
    description: "Book exclusive passes for India's biggest royal Dandiya & Garba celebration. Instant QR digital passes!",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth dark ${playfair.variable} ${jakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${jakarta.className} bg-[#07030e] text-slate-100 antialiased min-h-screen selection:bg-amber-500 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}

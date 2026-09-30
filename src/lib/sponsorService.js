import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { getFirebaseInstance } from "./firebase";

const LOCAL_SPONSORS_KEY = "dandiya_local_sponsors_v2";
const COLLECTION_NAME = "dandiya_sponsors";

const OLD_DEFAULT_NAMES = [
  "GUJARAT TOURISM",
  "RED BULL",
  "TAJ HOTELS",
  "TIMES OF INDIA",
  "VOGUE INDIA",
  "FEVER 104 FM"
];

// Helper to check if a logo URL is valid and browser ready
export const isValidLogoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  if (trimmed.startsWith("data:image/png") || trimmed.startsWith("data:image/jpeg") || trimmed.startsWith("data:image/webp")) return true;
  if (trimmed.startsWith("data:image/svg+xml;charset=utf-8,")) return true;
  if (trimmed.startsWith("/")) return true;
  return false;
};

// Dynamic SVG Logo Generator for any brand (Properly encoded Data URI)
export const generateDynamicLogoSvg = (name = "PARTNER", tier = "Official Partner") => {
  const cleanName = (name || "PARTNER").trim().toUpperCase();
  const cleanTier = (tier || "OFFICIAL PARTNER").trim().toUpperCase();
  
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hues = [285, 210, 345, 42, 165, 25]; // Luxury purple, royal blue, crimson, gold, emerald, bronze
  const selectedHue = hues[Math.abs(hash) % hues.length];
  const initial = cleanName.charAt(0) || "P";
  const gradId = `bgGrad_${Math.abs(hash)}`;
  
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70"><defs><linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${selectedHue}, 75%, 16%)"/><stop offset="100%" stop-color="hsl(${selectedHue}, 85%, 8%)"/></linearGradient></defs><rect width="220" height="70" rx="10" fill="url(#${gradId})" stroke="#e5b869" stroke-width="2"/><circle cx="35" cy="35" r="19" fill="#e5b869"/><text x="35" y="42" fill="#000000" font-family="Georgia, serif" font-weight="900" font-size="20" text-anchor="middle">${initial}</text><text x="66" y="34" fill="#ffffff" font-family="Georgia, serif" font-weight="900" font-size="14" letter-spacing="1">${cleanName.length > 14 ? cleanName.substring(0, 14) : cleanName}</text><text x="66" y="50" fill="#fcd34d" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="1">${cleanTier.length > 20 ? cleanTier.substring(0, 18) + '...' : cleanTier}</text></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
};

// Initial seed sponsors with the new 5 official logos
const DEFAULT_SPONSORS = [
  {
    id: "sp-1",
    name: "JKM SOFTWARES",
    tier: "Technology Partner",
    tagline: "IT & Software Solutions",
    website: "",
    logoUrl: "/sponsors/jkm-softwares.png"
  },
  {
    id: "sp-2",
    name: "KAKA-KAJOD",
    tier: "Entertainment Partner",
    tagline: "Official Comedy & Media",
    website: "",
    logoUrl: "/sponsors/kaka-kajod.jpg"
  },
  {
    id: "sp-3",
    name: "WE MAKE MEMORIES",
    tier: "Event Partner",
    tagline: "Creating Unforgettable Moments",
    website: "",
    logoUrl: "/sponsors/we-make-memories.png"
  },
  {
    id: "sp-4",
    name: "MAHAVEER",
    tier: "Industrial Partner",
    tagline: "Manufacturer & Exporter",
    website: "",
    logoUrl: "/sponsors/mahaveer.png"
  },
  {
    id: "sp-5",
    name: "QUEEN PERFORMING ART",
    tier: "Cultural Partner",
    tagline: "Dance Company",
    website: "",
    logoUrl: "/sponsors/queen-dance-company.jpg"
  }
];

export const getLocalSponsors = () => {
  if (typeof window === "undefined") return DEFAULT_SPONSORS;
  try {
    const stored = localStorage.getItem(LOCAL_SPONSORS_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(DEFAULT_SPONSORS));
      return DEFAULT_SPONSORS;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(DEFAULT_SPONSORS));
      return DEFAULT_SPONSORS;
    }
    // Purge old default sponsors if present in cache
    const filtered = parsed.filter(sp => !OLD_DEFAULT_NAMES.includes(sp.name));
    if (filtered.length === 0) {
      localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(DEFAULT_SPONSORS));
      return DEFAULT_SPONSORS;
    }
    const updated = filtered.map((sp) => {
      if (!isValidLogoUrl(sp.logoUrl)) {
        const match = DEFAULT_SPONSORS.find(d => d.name === sp.name || d.id === sp.id);
        const logo = (match && isValidLogoUrl(match.logoUrl)) ? match.logoUrl : generateDynamicLogoSvg(sp.name, sp.tier);
        return { ...sp, logoUrl: logo };
      }
      return sp;
    });
    localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error reading local sponsors", e);
    return DEFAULT_SPONSORS;
  }
};

export const saveLocalSponsors = (sponsors) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SPONSORS_KEY, JSON.stringify(sponsors));
    window.dispatchEvent(new Event("dandiya_sponsors_update"));
  } catch (e) {
    console.error("Error saving local sponsors", e);
  }
};

// Real-time listener for sponsors
export const subscribeToSponsors = (callback) => {
  // Emit local sponsors immediately so UI is populated with zero flash/delay
  try {
    callback(getLocalSponsors(), false);
  } catch (e) {}

  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db) {
    try {
      const q = collection(db, COLLECTION_NAME);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            let list = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                logoUrl: isValidLogoUrl(data.logoUrl) ? data.logoUrl : generateDynamicLogoSvg(data.name, data.tier)
              };
            });

            // Clean up old default sponsors from firestore snapshot if any exist
            const oldDocs = snapshot.docs.filter(d => OLD_DEFAULT_NAMES.includes(d.data().name));
            if (oldDocs.length > 0) {
              oldDocs.forEach(async (d) => {
                try {
                  await deleteDoc(doc(db, COLLECTION_NAME, d.id));
                } catch (e) {}
              });
              list = list.filter(item => !OLD_DEFAULT_NAMES.includes(item.name));
            }

            if (list.length === 0) {
              DEFAULT_SPONSORS.forEach(async (sp) => {
                try {
                  await addDoc(collection(db, COLLECTION_NAME), {
                    name: sp.name,
                    tier: sp.tier,
                    tagline: sp.tagline,
                    website: sp.website,
                    logoUrl: sp.logoUrl,
                    createdAt: new Date().toISOString()
                  });
                } catch (e) {}
              });
              callback(DEFAULT_SPONSORS, true);
            } else {
              callback(list, true);
            }
          } else {
            // If collection is empty in Firestore, seed with defaults
            DEFAULT_SPONSORS.forEach(async (sp) => {
              try {
                await addDoc(collection(db, COLLECTION_NAME), {
                  name: sp.name,
                  tier: sp.tier,
                  tagline: sp.tagline,
                  website: sp.website,
                  logoUrl: sp.logoUrl,
                  createdAt: new Date().toISOString()
                });
              } catch (e) {}
            });
            callback(DEFAULT_SPONSORS, true);
          }
        },
        (err) => {
          console.error("Firestore sponsors listener error:", err);
          callback(getLocalSponsors(), false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Error setting up sponsor listener:", err);
    }
  }

  // Local fallback
  const sendLocal = () => {
    callback(getLocalSponsors(), false);
  };
  sendLocal();

  if (typeof window !== "undefined") {
    window.addEventListener("dandiya_sponsors_update", sendLocal);
    return () => {
      window.removeEventListener("dandiya_sponsors_update", sendLocal);
    };
  }
  return () => {};
};

// Add Sponsor
export const addSponsor = async (sponsorData) => {
  const { db, isConnected } = getFirebaseInstance();
  const brandName = sponsorData.name.trim().toUpperCase();
  const brandTier = sponsorData.tier || "Associate Partner";
  const userProvidedLogo = sponsorData.logoUrl?.trim();

  const newSponsor = {
    name: brandName,
    tier: brandTier,
    tagline: sponsorData.tagline?.trim() || "Official Festival Partner",
    website: sponsorData.website?.trim() || "",
    logoUrl: isValidLogoUrl(userProvidedLogo) ? userProvidedLogo : generateDynamicLogoSvg(brandName, brandTier),
    createdAt: new Date().toISOString()
  };

  if (isConnected && db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newSponsor,
        serverCreatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id, ...newSponsor };
    } catch (e) {
      console.warn("Firestore add sponsor failed, fallback to local:", e);
    }
  }

  const list = getLocalSponsors();
  const created = { id: `sp-${Date.now()}`, ...newSponsor };
  saveLocalSponsors([created, ...list]);
  return { success: true, ...created };
};

// Delete Sponsor
export const deleteSponsor = async (id) => {
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db && !id.startsWith("sp-")) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (e) {
      console.warn("Firestore delete sponsor failed:", e);
    }
  }

  const list = getLocalSponsors().filter((sp) => sp.id !== id);
  saveLocalSponsors(list);
  return { success: true };
};

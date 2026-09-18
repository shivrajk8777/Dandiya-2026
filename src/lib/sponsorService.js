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

const LOCAL_SPONSORS_KEY = "dandiya_local_sponsors";
const COLLECTION_NAME = "dandiya_sponsors";

// Initial seed sponsors
const DEFAULT_SPONSORS = [
  {
    id: "sp-1",
    name: "GUJARAT TOURISM",
    tier: "Title Sponsor",
    tagline: "Official Cultural & Heritage Partner",
    website: "https://www.gujarattourism.com",
    logoUrl: ""
  },
  {
    id: "sp-2",
    name: "RED BULL",
    tier: "Energy Partner",
    tagline: "Official Energy Drink & Beats",
    website: "https://www.redbull.com",
    logoUrl: ""
  },
  {
    id: "sp-3",
    name: "TAJ HOTELS",
    tier: "Luxury Hospitality",
    tagline: "VIP Suites & Gourmet Hospitality",
    website: "https://www.tajhotels.com",
    logoUrl: ""
  },
  {
    id: "sp-4",
    name: "TIMES OF INDIA",
    tier: "Headline Media",
    tagline: "Official Print & Digital Media",
    website: "https://timesofindia.indiatimes.com",
    logoUrl: ""
  },
  {
    id: "sp-5",
    name: "VOGUE INDIA",
    tier: "Fashion & Style",
    tagline: "Red Carpet & Gala Style Partner",
    website: "https://www.vogue.in",
    logoUrl: ""
  },
  {
    id: "sp-6",
    name: "FEVER 104 FM",
    tier: "Radio Partner",
    tagline: "Official Radio Broadcaster",
    website: "",
    logoUrl: ""
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
    return JSON.parse(stored);
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
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db) {
    try {
      const q = collection(db, COLLECTION_NAME);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data()
            }));
            callback(list, true);
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

  const newSponsor = {
    name: sponsorData.name.trim().toUpperCase(),
    tier: sponsorData.tier || "Associate Partner",
    tagline: sponsorData.tagline?.trim() || "Official Festival Partner",
    website: sponsorData.website?.trim() || "",
    logoUrl: sponsorData.logoUrl?.trim() || "",
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

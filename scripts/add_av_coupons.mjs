import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: "AIzaSyCJACjXQ6bgiZ-uWajW6xtp8iRKpyRPDyk",
  authDomain: "blogtesting-7753a.firebaseapp.com",
  projectId: "blogtesting-7753a",
  storageBucket: "blogtesting-7753a.firebasestorage.app",
  messagingSenderId: "793017256533",
  appId: "1:793017256533:web:5b37bbf1ef5a46b93ee2dc",
  measurementId: "G-Z7E8VPRN18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "dandiya_coupons";

// Helper to generate unique random 4-char suffix (avoiding 0, O, 1, I)
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function generateSuffix(length = 4) {
  let res = "";
  for (let i = 0; i < length; i++) {
    res += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return res;
}

function generateCodesForPrefix(prefix, count, sponsorName) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(`${prefix}-${generateSuffix(4)}`);
  }
  return Array.from(codes).map((code) => ({
    code,
    sponsor: sponsorName,
    discountPercent: 100,
    isUsed: false,
    usedBy: null,
    usedPhone: null,
    passId: null,
    usedAt: null,
    createdAt: new Date().toISOString()
  }));
}

async function addAvCoupons() {
  console.log("Fetching existing Firestore coupons...");
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  console.log(`Current total documents in '${COLLECTION_NAME}': ${snapshot.size}`);

  const existingCodes = new Set();
  snapshot.forEach((d) => {
    existingCodes.add((d.data().code || d.id).toUpperCase());
  });

  // Generate 20 unique AV codes not in existingCodes
  const avCodes = [];
  while (avCodes.length < 20) {
    const candidate = `AV-${generateSuffix(4)}`;
    if (!existingCodes.has(candidate) && !avCodes.some((c) => c.code === candidate)) {
      avCodes.push({
        code: candidate,
        sponsor: "AV",
        discountPercent: 100,
        isUsed: false,
        usedBy: null,
        usedPhone: null,
        passId: null,
        usedAt: null,
        createdAt: new Date().toISOString()
      });
    }
  }

  console.log(`Generated 20 unique AV coupon codes:`);
  avCodes.forEach((c, idx) => console.log(`${idx + 1}. ${c.code}`));

  console.log("\nUploading 20 AV coupons to Firestore...");
  for (const item of avCodes) {
    const docRef = doc(db, COLLECTION_NAME, item.code);
    await setDoc(docRef, item);
  }
  console.log("Successfully uploaded 20 AV coupons to Firestore!");

  // Verify updated counts
  const afterSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  let mahaveerCount = 0;
  let shreejiCount = 0;
  let skjCount = 0;
  let avCount = 0;
  let othersCount = 0;

  afterSnapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEER-") || code.startsWith("MAHAVEERAGRO-")) mahaveerCount++;
    else if (code.startsWith("SHREEJI-")) shreejiCount++;
    else if (code.startsWith("SKJ-")) skjCount++;
    else if (code.startsWith("AV-")) avCount++;
    else {
      othersCount++;
      console.log("Other document:", code);
    }
  });

  console.log("\n--- Final Firestore Database Verification ---");
  console.log(`🌾 Mahaveer: ${mahaveerCount}`);
  console.log(`🪔 Shreeji: ${shreejiCount}`);
  console.log(`⭐ SKJ: ${skjCount}`);
  console.log(`💎 AV: ${avCount}`);
  if (othersCount > 0) console.log(`Others: ${othersCount}`);
  console.log(`Total live coupons in Firestore: ${afterSnapshot.size}`);

  // Save AV codes to scripts/av_codes.json
  fs.writeFileSync(
    path.join(process.cwd(), "scripts", "av_codes.json"),
    JSON.stringify(avCodes, null, 2)
  );

  // Update scripts/generated_coupons.json if exists
  const genCouponsPath = path.join(process.cwd(), "scripts", "generated_coupons.json");
  if (fs.existsSync(genCouponsPath)) {
    try {
      const existingGen = JSON.parse(fs.readFileSync(genCouponsPath, "utf8"));
      // filter out any existing AV codes just in case
      const filtered = existingGen.filter((c) => !c.code.startsWith("AV-"));
      const combined = [...filtered, ...avCodes];
      fs.writeFileSync(genCouponsPath, JSON.stringify(combined, null, 2));
      console.log(`Updated scripts/generated_coupons.json with ${combined.length} total coupons.`);
    } catch (e) {
      console.warn("Could not update generated_coupons.json:", e);
    }
  }

  process.exit(0);
}

addAvCoupons().catch((err) => {
  console.error("Error adding AV coupons:", err);
  process.exit(1);
});

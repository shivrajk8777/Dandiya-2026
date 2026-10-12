import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch, deleteDoc } from "firebase/firestore";
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
  return Array.from(codes).map(code => ({
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

async function main() {
  console.log("Generating 175 new coupon codes...");
  const mahaveerCodes = generateCodesForPrefix("MAHAVEERAGRO", 50, "Mahaveer Agro");
  const shreejiCodes = generateCodesForPrefix("SHREEJI", 100, "Shreeji");
  const skjCodes = generateCodesForPrefix("SKJ", 25, "SKJ");

  const allNewCoupons = [...mahaveerCodes, ...shreejiCodes, ...skjCodes];
  console.log(`Generated: Mahaveer Agro (${mahaveerCodes.length}), Shreeji (${shreejiCodes.length}), SKJ (${skjCodes.length}) = Total ${allNewCoupons.length}`);

  // Fetch all existing coupons in Firestore
  console.log("Fetching existing Firestore coupons...");
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  console.log(`Found ${snapshot.size} existing documents in Firestore collection '${COLLECTION_NAME}'`);

  const deletePromises = [];
  snapshot.forEach(docSnap => {
    // Delete old VIP26- coupons or old codes
    if (docSnap.id.startsWith("VIP26-") || docSnap.id.startsWith("VIP")) {
      console.log(`Deleting old code: ${docSnap.id}`);
      deletePromises.push(deleteDoc(docSnap.ref));
    }
  });

  if (deletePromises.length > 0) {
    console.log(`Deleting ${deletePromises.length} old VIP codes...`);
    await Promise.all(deletePromises);
    console.log("Old VIP codes deleted successfully.");
  }

  // Upload new coupons in batches of 200 (Firestore limit is 500 per batch)
  console.log("Uploading 175 new coupons to Firestore...");
  const batch = writeBatch(db);
  for (const item of allNewCoupons) {
    const docRef = doc(db, COLLECTION_NAME, item.code);
    batch.set(docRef, item);
  }
  await batch.commit();
  console.log("All 175 new coupons uploaded successfully to Firestore!");

  // Save generated list to JSON file for frontend code update
  fs.writeFileSync(
    path.join(process.cwd(), "scripts", "generated_coupons.json"),
    JSON.stringify(allNewCoupons, null, 2)
  );
  console.log("Saved generated coupons to scripts/generated_coupons.json");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});

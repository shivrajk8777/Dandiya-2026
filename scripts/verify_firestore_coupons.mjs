import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function check() {
  const snapshot = await getDocs(collection(db, "dandiya_coupons"));
  console.log(`Total coupons in Firestore: ${snapshot.size}`);

  const avCodes = [];
  let mahaveer = 0;
  let shreeji = 0;
  let skj = 0;
  let av = 0;
  let others = 0;

  snapshot.forEach((d) => {
    const code = (d.data().code || d.id).toUpperCase();
    if (code.startsWith("MAHAVEER-") || code.startsWith("MAHAVEERAGRO-")) mahaveer++;
    else if (code.startsWith("SHREEJI-")) shreeji++;
    else if (code.startsWith("SKJ-")) skj++;
    else if (code.startsWith("AV-")) {
      av++;
      avCodes.push(code);
    } else {
      others++;
    }
  });

  console.log(`- Mahaveer: ${mahaveer}`);
  console.log(`- Shreeji: ${shreeji}`);
  console.log(`- SKJ: ${skj}`);
  console.log(`- AV: ${av}`);
  if (others > 0) console.log(`- Others: ${others}`);
  console.log("AV Codes present in DB:", avCodes.sort());
  process.exit(0);
}

check().catch(console.error);

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "firebase/firestore";
import { getFirebaseInstance } from "./firebase";
import * as XLSX from "xlsx";

const LOCAL_STORAGE_KEY = "dandiya_local_registrations";
const COLLECTION_NAME = "dandiya_registrations";

// Initial seed data for exciting first-run demo
const SEED_DATA = [
  {
    id: "dnd-demo-1",
    passId: "DND-RAAS-8942",
    fullName: "Aarav Sharma",
    phone: "9876543210",
    email: "aarav.sharma@example.com",
    city: "Ahmedabad",
    passType: "Couple Pass",
    quantity: 1,
    unitPrice: 499,
    totalAmount: 499,
    paymentMethod: "UPI (Google Pay)",
    transactionRef: "UPI94827103841",
    status: "Approved",
    checkedIn: false,
    checkInTime: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "dnd-demo-2",
    passId: "DND-RAAS-5120",
    fullName: "Priya & Rohan Patel",
    phone: "9823456789",
    email: "priya.patel@example.com",
    city: "Mumbai",
    passType: "VIP Lounge Pass",
    quantity: 2,
    unitPrice: 999,
    totalAmount: 1998,
    paymentMethod: "UPI (PhonePe)",
    transactionRef: "UPI58291047192",
    status: "Approved",
    checkedIn: true,
    checkInTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "dnd-demo-3",
    passId: "DND-RAAS-3391",
    fullName: "Sneha Mehta",
    phone: "9812345678",
    email: "sneha.m@example.com",
    city: "Surat",
    passType: "Single Entry",
    quantity: 1,
    unitPrice: 299,
    totalAmount: 299,
    paymentMethod: "UPI (Paytm)",
    transactionRef: "PAYTM84920194",
    status: "Pending",
    checkedIn: false,
    checkInTime: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "dnd-demo-4",
    passId: "DND-RAAS-7704",
    fullName: "Vikas Joshi & Friends",
    phone: "9988776655",
    email: "vikas.j@example.com",
    city: "Vadodara",
    passType: "Group Pass (5 Pax)",
    quantity: 1,
    unitPrice: 1199,
    totalAmount: 1199,
    paymentMethod: "UPI (Cred)",
    transactionRef: "CRED194820194",
    status: "Approved",
    checkedIn: false,
    checkInTime: null,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Helper: Get local data
export const getLocalRegistrations = () => {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Local storage read error", e);
    return SEED_DATA;
  }
};

// Helper: Save local data
export const saveLocalRegistrations = (data) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("dandiya_local_update"));
  } catch (e) {
    console.error("Local storage save error", e);
  }
};

// Generate Unique Pass ID
export const generatePassId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DND-${randomCode}-${num}`;
};

// Create a new registration
export const registerAttendee = async (formData) => {
  const { db, isConnected } = getFirebaseInstance();
  const passId = generatePassId();

  const registrationRecord = {
    passId,
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    email: formData.email?.trim() || "",
    city: formData.city?.trim() || "Local",
    passType: formData.passType || "Single Entry",
    quantity: Number(formData.quantity) || 1,
    unitPrice: Number(formData.unitPrice) || 299,
    totalAmount: Number(formData.totalAmount) || 299,
    paymentMethod: formData.paymentMethod || "UPI",
    transactionRef: formData.transactionRef?.trim() || "MOCK-" + Math.floor(100000 + Math.random() * 900000),
    status: formData.paymentStatus || "Approved", // Instant approval or pending based on setup
    checkedIn: false,
    checkInTime: null,
    createdAt: new Date().toISOString()
  };

  if (isConnected && db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...registrationRecord,
        serverCreatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id, ...registrationRecord };
    } catch (err) {
      console.warn("Firestore save failed, falling back to local:", err);
    }
  }

  // Fallback to local
  const current = getLocalRegistrations();
  const newLocalItem = {
    id: `local-${Date.now()}`,
    ...registrationRecord
  };
  saveLocalRegistrations([newLocalItem, ...current]);
  return { success: true, ...newLocalItem };
};

// Subscribe to registrations (Firebase onSnapshot or local event listener)
export const subscribeToRegistrations = (callback) => {
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db) {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          }));
          callback(list, true);
        },
        (error) => {
          console.error("Firestore onSnapshot error:", error);
          callback(getLocalRegistrations(), false);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Error setting up Firestore listener:", e);
    }
  }

  // Local mode
  const sendLocal = () => {
    callback(getLocalRegistrations(), false);
  };
  sendLocal();

  if (typeof window !== "undefined") {
    window.addEventListener("dandiya_local_update", sendLocal);
    return () => {
      window.removeEventListener("dandiya_local_update", sendLocal);
    };
  }
  return () => {};
};

// Update Registration Status (Approve, Pending, Cancelled)
export const updateStatus = async (id, newStatus) => {
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db && !id.startsWith("local-") && !id.startsWith("dnd-demo-")) {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      await updateDoc(ref, { status: newStatus });
      return { success: true };
    } catch (e) {
      console.warn("Firebase update failed, trying local:", e);
    }
  }

  const list = getLocalRegistrations();
  const updated = list.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  saveLocalRegistrations(updated);
  return { success: true };
};

// Check-In Attendee at Gate by Pass ID or record ID
export const checkInAttendee = async (identifier) => {
  const { db, isConnected } = getFirebaseInstance();
  const cleanId = identifier.trim().toUpperCase();

  // Try Firebase first
  if (isConnected && db) {
    try {
      // Find matching passId
      const q = query(collection(db, COLLECTION_NAME), where("passId", "==", cleanId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const targetDoc = snapshot.docs[0];
        const data = targetDoc.data();
        if (data.checkedIn) {
          return {
            success: false,
            alreadyCheckedIn: true,
            data: { id: targetDoc.id, ...data },
            message: `Already Checked-In at ${new Date(data.checkInTime).toLocaleTimeString()}`
          };
        }

        const now = new Date().toISOString();
        await updateDoc(doc(db, COLLECTION_NAME, targetDoc.id), {
          checkedIn: true,
          checkInTime: now
        });
        return {
          success: true,
          alreadyCheckedIn: false,
          data: { id: targetDoc.id, ...data, checkedIn: true, checkInTime: now },
          message: "Check-in Successful! Welcome to Dandiya Raas!"
        };
      }
    } catch (e) {
      console.warn("Firebase check-in failed, checking local:", e);
    }
  }

  // Local fallback check
  const list = getLocalRegistrations();
  const targetIndex = list.findIndex(
    (item) => item.passId.toUpperCase() === cleanId || item.id === identifier || item.phone === identifier
  );

  if (targetIndex === -1) {
    return { success: false, notFound: true, message: "No registration found with this Pass ID / Phone" };
  }

  const item = list[targetIndex];
  if (item.checkedIn) {
    return {
      success: false,
      alreadyCheckedIn: true,
      data: item,
      message: `Already Checked-In at ${new Date(item.checkInTime).toLocaleTimeString()}`
    };
  }

  const updatedItem = {
    ...item,
    checkedIn: true,
    checkInTime: new Date().toISOString()
  };

  list[targetIndex] = updatedItem;
  saveLocalRegistrations(list);

  return {
    success: true,
    alreadyCheckedIn: false,
    data: updatedItem,
    message: "Check-in Successful! Welcome to Dandiya Raas!"
  };
};

// Lookup pass by phone or Pass ID
export const lookupPass = async (queryStr) => {
  const clean = queryStr.trim();
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db) {
    try {
      // Query by phone
      const qPhone = query(collection(db, COLLECTION_NAME), where("phone", "==", clean));
      const sPhone = await getDocs(qPhone);
      if (!sPhone.empty) {
        return sPhone.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // Query by Pass ID
      const qPass = query(collection(db, COLLECTION_NAME), where("passId", "==", clean.toUpperCase()));
      const sPass = await getDocs(qPass);
      if (!sPass.empty) {
        return sPass.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn("Firestore lookup failed:", e);
    }
  }

  // Local fallback
  const list = getLocalRegistrations();
  return list.filter(
    (item) =>
      item.phone.includes(clean) ||
      item.passId.toUpperCase().includes(clean.toUpperCase()) ||
      item.fullName.toLowerCase().includes(clean.toLowerCase())
  );
};

// Delete registration
export const deleteRegistration = async (id) => {
  const { db, isConnected } = getFirebaseInstance();

  if (isConnected && db && !id.startsWith("local-") && !id.startsWith("dnd-demo-")) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (e) {
      console.warn("Firebase delete failed:", e);
    }
  }

  const list = getLocalRegistrations().filter((item) => item.id !== id);
  saveLocalRegistrations(list);
  return { success: true };
};

// Export to Excel / CSV
export const exportRegistrationsToExcel = (registrations) => {
  if (!registrations || registrations.length === 0) return;

  const dataToExport = registrations.map((r, index) => ({
    "S.No": index + 1,
    "Pass ID": r.passId,
    "Full Name": r.fullName,
    "Phone Number": r.phone,
    "Email": r.email || "N/A",
    "City": r.city || "N/A",
    "Pass Category": r.passType,
    "Quantity": r.quantity,
    "Total Amount (₹)": r.totalAmount,
    "Payment Method": r.paymentMethod,
    "Transaction Ref": r.transactionRef,
    "Status": r.status,
    "Checked In": r.checkedIn ? "Yes" : "No",
    "Check-in Time": r.checkInTime ? new Date(r.checkInTime).toLocaleString() : "-",
    "Registration Date": new Date(r.createdAt).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dandiya_Registrations");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `Dandiya_Raas_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

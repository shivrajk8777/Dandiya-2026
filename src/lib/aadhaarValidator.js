// Verhoeff Algorithm for Official UIDAI Indian Aadhaar Number Validation

// Multiplication table (d)
const dTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// Permutation table (p)
const pTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates whether an input is a valid 12-digit Indian Aadhaar number
 * using UIDAI length, starting-digit rules, and Verhoeff algorithm.
 * 
 * @param {string} aadhaarStr 
 * @returns {{ isValid: boolean, isComplete: boolean, formatted: string, message: string }}
 */
export const validateAadhaar = (aadhaarStr) => {
  if (!aadhaarStr) {
    return {
      isValid: false,
      isComplete: false,
      formatted: "",
      message: "Aadhaar Card number is required"
    };
  }

  const clean = String(aadhaarStr).replace(/\D/g, "");
  const formatted = formatAadhaar(clean);

  if (clean.length < 12) {
    return {
      isValid: false,
      isComplete: false,
      formatted,
      message: `${12 - clean.length} more digit${12 - clean.length === 1 ? "" : "s"} required`
    };
  }

  if (clean.length > 12) {
    return {
      isValid: false,
      isComplete: true,
      formatted,
      message: "Aadhaar cannot exceed 12 digits"
    };
  }

  // 1. Cannot start with 0 or 1
  if (clean.startsWith("0") || clean.startsWith("1")) {
    return {
      isValid: false,
      isComplete: true,
      formatted,
      message: "Aadhaar cannot start with 0 or 1"
    };
  }

  // 2. Cannot be all identical digits (e.g., 222222222222, 999999999999)
  if (/^(\d)\1{11}$/.test(clean)) {
    return {
      isValid: false,
      isComplete: true,
      formatted,
      message: "Invalid Aadhaar: all digits cannot be identical"
    };
  }

  // 3. Verhoeff Checksum Check
  let c = 0;
  const digits = clean.split("").map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = dTable[c][pTable[i % 8][digits[i]]];
  }

  if (c !== 0) {
    return {
      isValid: false,
      isComplete: true,
      formatted,
      message: "Invalid Aadhaar Card Checksum (Please check card number)"
    };
  }

  return {
    isValid: true,
    isComplete: true,
    formatted,
    message: "Valid Aadhaar Card ✓"
  };
};

/**
 * Checks if an Aadhaar number is already used in another pass
 * @param {string} aadhaarStr 
 * @param {Array} existingRegistrations 
 * @param {string|null} excludePassId 
 * @returns {{ isDuplicate: boolean, existingPass: object | null }}
 */
export const checkDuplicateAadhaarInDb = (aadhaarStr, existingRegistrations = [], excludePassId = null) => {
  if (!aadhaarStr || !Array.isArray(existingRegistrations)) {
    return { isDuplicate: false, existingPass: null };
  }

  const cleanDigits = String(aadhaarStr).replace(/\D/g, "");
  if (cleanDigits.length !== 12) {
    return { isDuplicate: false, existingPass: null };
  }

  const duplicate = existingRegistrations.find((r) => {
    if (excludePassId && (r.id === excludePassId || r.passId === excludePassId)) {
      return false;
    }
    // Only check active CONFIRMED / APPROVED passes! Unpaid/Pending leads must not block booking
    if (r.status !== "Approved") {
      return false;
    }

    if (Array.isArray(r.attendees)) {
      const attMatch = r.attendees.some((a) => {
        if (!a || !a.aadhaar) return false;
        const aNum = String(a.aadhaar).replace(/\D/g, "");
        return aNum === cleanDigits;
      });
      if (attMatch) return true;
    }

    if (Array.isArray(r.children)) {
      const childMatch = r.children.some((c) => {
        if (!c || !c.aadhaar) return false;
        const cNum = String(c.aadhaar).replace(/\D/g, "");
        return cNum === cleanDigits;
      });
      if (childMatch) return true;
    }

    if (r.aadhaar) {
      return String(r.aadhaar).replace(/\D/g, "") === cleanDigits;
    }

    return false;
  });

  if (duplicate) {
    return { isDuplicate: true, existingPass: duplicate };
  }
  return { isDuplicate: false, existingPass: null };
};

/**
 * Formats a 12 digit string into 4-4-4 format: "XXXX XXXX XXXX"
 */
export const formatAadhaar = (val) => {
  if (!val) return "";
  const clean = String(val).replace(/\D/g, "").slice(0, 12);
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(" ");
};

/**
 * Masks Aadhaar for privacy display: "•••• •••• 1234"
 */
export const maskAadhaar = (val) => {
  if (!val) return "N/A";
  const clean = String(val).replace(/\D/g, "");
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
};

import fs from "fs";
import path from "path";

const coupons = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "scripts", "generated_coupons.json"), "utf8")
);

const mahaveer = coupons.filter(c => c.sponsor === "Mahaveer Agro");
const shreeji = coupons.filter(c => c.sponsor === "Shreeji");
const skj = coupons.filter(c => c.sponsor === "SKJ");

console.log(`Mahaveer: ${mahaveer.length}, Shreeji: ${shreeji.length}, SKJ: ${skj.length}`);

// Generate markdown file
let mdContent = `# 🎟️ Rang Tarang Garba Mahotsav 2026 - 175 VIP Complimentary Coupon Codes

Aapke request ke anusaar **Old VIP26- codes ko delete karke** naye 175 VIP Codes database me live create kar diye gaye hain:
- 🌾 **Mahaveer Agro:** 50 VIP Codes
- 🪔 **Shreeji:** 100 VIP Codes
- ⭐ **SKJ:** 25 VIP Codes
- **Total:** 175 VIP Complimentary Codes (100% Free Entry - ₹0 Pass)

---

## 🌾 1. Mahaveer Agro (50 VIP Codes)

| S.No | VIP Code | Sponsor / Category | Discount | Status |
|:---:|:---|:---|:---:|:---:|
`;

mahaveer.forEach((c, idx) => {
  mdContent += `| ${idx + 1} | \`${c.code}\` | Mahaveer Agro | 100% FREE PASS | Available |\n`;
});

mdContent += `\n---\n\n## 🪔 2. Shreeji (100 VIP Codes)\n\n| S.No | VIP Code | Sponsor / Category | Discount | Status |\n|:---:|:---|:---|:---:|:---:|\n`;

shreeji.forEach((c, idx) => {
  mdContent += `| ${idx + 1} | \`${c.code}\` | Shreeji | 100% FREE PASS | Available |\n`;
});

mdContent += `\n---\n\n## ⭐ 3. SKJ (25 VIP Codes)\n\n| S.No | VIP Code | Sponsor / Category | Discount | Status |\n|:---:|:---|:---|:---:|:---:|\n`;

skj.forEach((c, idx) => {
  mdContent += `| ${idx + 1} | \`${c.code}\` | SKJ | 100% FREE PASS | Available |\n`;
});

fs.writeFileSync(path.join(process.cwd(), "175_VIP_COUPON_CODES.md"), mdContent);
console.log("Written 175_VIP_COUPON_CODES.md successfully!");

// Output RAW code array for couponService.js
const codeArrayStr = JSON.stringify(coupons.map(c => c.code), null, 2);
fs.writeFileSync(path.join(process.cwd(), "scripts", "code_array.json"), codeArrayStr);
console.log("Written scripts/code_array.json successfully!");

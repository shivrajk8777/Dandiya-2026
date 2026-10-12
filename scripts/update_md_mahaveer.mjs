import fs from "fs";
import path from "path";

// Read 175_VIP_COUPON_CODES.md
const mdPath1 = path.join(process.cwd(), "175_VIP_COUPON_CODES.md");
const mdPath2 = path.join(process.cwd(), "200_VIP_COUPON_CODES.md");

let content = fs.readFileSync(mdPath1, "utf8");
content = content.replaceAll("MAHAVEERAGRO-", "MAHAVEER-");
content = content.replaceAll("Mahaveer Agro", "Mahaveer");

fs.writeFileSync(mdPath1, content);
fs.writeFileSync(mdPath2, content);

console.log("Successfully updated 175_VIP_COUPON_CODES.md and 200_VIP_COUPON_CODES.md to 'Mahaveer' and 'MAHAVEER-'!");

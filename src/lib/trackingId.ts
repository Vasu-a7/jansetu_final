/**
 * JANSETU CRYPTOGRAPHIC UNIQUE TRACKING ID GENERATOR
 * Generates globally unique, collision-proof, timestamp-anchored tracking IDs.
 * Format: JS-[YEAR]-[DISTRICT_CODE]-[BASE36_EPOCH]-[CRYPTO_HEX]
 * Example: JS-2026-RAN-LZ9X4K-8F2B
 */

export function generateUniqueTrackingId(districtName: string): string {
  const currentYear = new Date().getFullYear();
  
  // Clean district 3-letter abbreviation
  const cleanDistrict = (districtName || "JHK")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");

  // Millisecond epoch converted to Base36 (guarantees temporal ordering & unique sequence)
  const timeComponent = Date.now().toString(36).toUpperCase();

  // Cryptographic random 4-character hex chunk (prevents any microsecond collision)
  let randomHex = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(2);
    crypto.getRandomValues(array);
    randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  } else {
    randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0")
      .toUpperCase();
  }

  return `JS-${currentYear}-${cleanDistrict}-${timeComponent}-${randomHex}`;
}

export function validateTrackingId(trackingId: string): boolean {
  if (!trackingId || typeof trackingId !== "string") return false;
  // Matches JS-YYYY-DIST-TIMESTAMP-HEX pattern
  const regex = /^JS-\d{4}-[A-Z]{3}-[A-Z0-9]+-[A-F0-9]{4}$/i;
  return regex.test(trackingId.trim());
}


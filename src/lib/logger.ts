/**
 * JANSETU SANITIZED PRODUCTION LOGGER
 * Strips sensitive PII, passwords, JWT tokens, and secret keys from logs.
 * Silences debug output in production builds.
 */

const IS_PROD = import.meta.env.PROD || process.env.NODE_ENV === "production";

/**
 * Sanitizes object data to strip PII and secret fields
 */
export function sanitizeLogData(data: any): any {
  if (data == null) return data;
  if (typeof data !== "object") return data;

  const copy = Array.isArray(data) ? [...data] : { ...data };
  const SENSITIVE_KEYS = ["password", "token", "jwt", "apikey", "secret", "otp", "phone", "email"];

  Object.keys(copy).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      copy[key] = "[REDACTED_PII_OR_SECRET]";
    } else if (typeof copy[key] === "object") {
      copy[key] = sanitizeLogData(copy[key]);
    }
  });

  return copy;
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    if (!IS_PROD) {
      console.log(`[JanSetu INFO] ${msg}`, ...args.map(sanitizeLogData));
    }
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[JanSetu WARN] ${msg}`, ...args.map(sanitizeLogData));
  },
  error: (msg: string, error?: any) => {
    console.error(`[JanSetu ERROR] ${msg}`, sanitizeLogData(error));
  },
};


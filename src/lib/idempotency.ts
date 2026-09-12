/**
 * JANSETU REQUEST IDEMPOTENCY UTILITY
 * Prevents duplicate database inserts and form submissions when network requests retry.
 */

const SEEN_IDEMPOTENCY_KEYS = new Set<string>();

/**
 * Generates a unique idempotency key for a form action
 */
export function generateIdempotencyKey(actionName: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `idem-${actionName}-${userId || "guest"}-${timestamp}-${random}`;
}

/**
 * Checks and marks an idempotency key as executed within a 5-minute TTL window
 */
export function checkAndMarkIdempotent(key: string): boolean {
  if (SEEN_IDEMPOTENCY_KEYS.has(key)) {
    return false; // Already processed
  }
  SEEN_IDEMPOTENCY_KEYS.add(key);

  // Auto clean key after 5 minutes
  setTimeout(() => {
    SEEN_IDEMPOTENCY_KEYS.delete(key);
  }, 5 * 60 * 1000);

  return true;
}


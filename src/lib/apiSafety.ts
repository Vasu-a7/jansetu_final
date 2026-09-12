/**
 * JANSETU EXPONENTIAL BACKOFF RETRY & API SAFETY WRAPPER
 * Executes async query calls with automatic retries, exponential backoff, jitter,
 * and strict request timeout safeguards.
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
}

/**
 * Wraps an async function execution with exponential backoff & jitter retry
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, initialDelayMs: 500, maxDelayMs: 3000, timeoutMs: 10000 }
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  let delay = options.initialDelayMs || 500;
  const timeoutMs = options.timeoutMs || 10000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Execute with timeout promise race
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request Timeout: Server took too long to respond.")), timeoutMs)
        ),
      ]);
      return result;
    } catch (err: any) {
      if (attempt === maxAttempts) {
        throw new Error(
          err.message || "Service Temporarily Unavailable: High network traffic. Please try again."
        );
      }

      // Calculate exponential backoff + jitter
      const jitter = Math.random() * 200;
      const sleepMs = Math.min(options.maxDelayMs || 3000, delay + jitter);
      await new Promise((resolve) => setTimeout(resolve, sleepMs));
      delay *= 2;
    }
  }

  throw new Error("Service Temporarily Unavailable");
}

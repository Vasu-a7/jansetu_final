/**
 * JANSETU SLIDING-WINDOW RATE LIMITER & ABUSE PREVENTION
 * Enforces rate limits on login, signup, complaint filing, comments, and file uploads.
 */

export interface RateLimitPolicy {
  actionName: string;
  maxLimit: number;
  windowSeconds: number;
}

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  report_submission: { actionName: "Complaint Submission", maxLimit: 3, windowSeconds: 300 }, // 3 per 5 min
  auth_attempt: { actionName: "Login / Signup Attempt", maxLimit: 5, windowSeconds: 300 }, // 5 per 5 min
  file_upload: { actionName: "File Upload", maxLimit: 5, windowSeconds: 300 }, // 5 per 5 min
  general_api: { actionName: "API Request", maxLimit: 60, windowSeconds: 60 }, // 60 per min
};

const TIMESTAMP_LOGS: Record<string, number[]> = {};

export interface RateLimitCheckResult {
  allowed: boolean;
  actionName: string;
  currentCount: number;
  maxLimit: number;
  retryAfterSeconds: number;
  formattedErrorMessage?: string;
}

/**
 * Evaluates whether an action exceeds the sliding window rate limit
 */
export function checkRateLimit(actionKey: string, customPolicy?: RateLimitPolicy): RateLimitCheckResult {
  const policy = customPolicy || RATE_LIMIT_POLICIES[actionKey] || RATE_LIMIT_POLICIES.general_api;
  const now = Date.now();
  const windowMs = policy.windowSeconds * 1000;

  if (!TIMESTAMP_LOGS[actionKey]) {
    TIMESTAMP_LOGS[actionKey] = [];
  }

  // Filter timestamps within current window
  TIMESTAMP_LOGS[actionKey] = TIMESTAMP_LOGS[actionKey].filter((ts) => now - ts < windowMs);
  const currentCount = TIMESTAMP_LOGS[actionKey].length;

  if (currentCount >= policy.maxLimit) {
    const oldestTs = TIMESTAMP_LOGS[actionKey][0];
    const retryAfterMs = windowMs - (now - oldestTs);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      actionName: policy.actionName,
      currentCount,
      maxLimit: policy.maxLimit,
      retryAfterSeconds,
      formattedErrorMessage: `HTTP 429 Too Many Requests: Rate limit exceeded for ${policy.actionName}. Please wait ${retryAfterSeconds} seconds before trying again.`,
    };
  }

  // Record action timestamp
  TIMESTAMP_LOGS[actionKey].push(now);

  return {
    allowed: true,
    actionName: policy.actionName,
    currentCount: currentCount + 1,
    maxLimit: policy.maxLimit,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets rate limit counter for an action (e.g., after successful login)
 */
export function clearRateLimit(actionKey: string): void {
  TIMESTAMP_LOGS[actionKey] = [];
}


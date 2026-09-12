/**
 * JANSETU IN-APP & MULTI-CHANNEL NOTIFICATION ENGINE
 * Manages user notifications for status changes, SLA escalations,
 * duplicate suggestions, and official responses.
 */

export interface JanSetuNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "complaint_submitted"
    | "duplicate_suggestion"
    | "master_link"
    | "department_assigned"
    | "status_change"
    | "sla_reminder"
    | "sla_breach"
    | "escalation_alert"
    | "resolution_request"
    | "reopen_confirmation";
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

const STORAGE_KEY = "jansetu_notifications_v1";

/**
 * Gets all saved notifications for local/in-app display
 */
export function getLocalNotifications(): JanSetuNotification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (_e) {
    return [];
  }
}

/**
 * Dispatches a new notification to the user's inbox
 */
export function dispatchNotification(
  userId: string,
  title: string,
  message: string,
  type: JanSetuNotification["type"],
  linkUrl?: string
): JanSetuNotification {
  const newNotif: JanSetuNotification = {
    id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
    user_id: userId,
    title,
    message,
    type,
    link_url: linkUrl,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getLocalNotifications();
      const updated = [newNotif, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (_e) {
      // Fallback
    }
  }

  return newNotif;
}

/**
 * Marks a notification as read
 */
export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (_e) {
    // Ignore
  }
}

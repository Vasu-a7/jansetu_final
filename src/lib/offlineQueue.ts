/**
 * JANSETU PWA OFFLINE DRAFT & BACKGROUND SYNC QUEUE
 * Preserves report drafts when offline or on weak networks, auto-syncing upon reconnection.
 */

export interface OfflineDraft {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  block_ward?: string;
  urgency: string;
  privacy_level: string;
  location_text?: string;
  latitude?: number | null;
  longitude?: number | null;
  idempotency_key: string;
  created_at: string;
  synced: boolean;
}

const DRAFT_KEY = "jansetu_offline_drafts_v1";

/**
 * Saves a report draft to offline storage
 */
export function saveOfflineDraft(draft: Omit<OfflineDraft, "id" | "created_at" | "synced">): OfflineDraft {
  const newDraft: OfflineDraft = {
    ...draft,
    id: "draft-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
    synced: false,
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getOfflineDrafts();
      const updated = [newDraft, ...existing.filter((d) => !d.synced)];
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    } catch (_e) {
      // Fallback
    }
  }

  return newDraft;
}

/**
 * Retrieves all offline pending drafts
 */
export function getOfflineDrafts(): OfflineDraft[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
  } catch (_e) {
    return [];
  }
}

/**
 * Marks a draft as successfully synced
 */
export function markDraftSynced(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getOfflineDrafts();
    const updated = list.map((d) => (d.id === id ? { ...d, synced: true } : d));
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated.filter((d) => !d.synced)));
  } catch (_e) {
    // Ignore
  }
}

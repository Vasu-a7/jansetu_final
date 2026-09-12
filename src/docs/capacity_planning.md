# JanSetu Production Capacity Planning & Scaling Guide

## 1. Documented System Limits & Capacity Targets

| Resource Metric | Production Threshold Limit | Safeguard / Enforcement Mechanism |
| :--- | :--- | :--- |
| **Concurrent Users** | 1,000 active concurrent connections | Supabase Connection Pooling (PgBouncer) & CDN Caching |
| **API Requests per Minute** | 60 requests / min / user | Sliding-window `rateLimiter.ts` & HTTP 429 Cooldown Modal |
| **Signups / Auth per Minute** | 5 attempts / 5 min / IP | Auth Rate Limiting & Captcha / Turnstile hooks |
| **Complaint Submissions** | 3 filings / 5 min / user | Idempotency keys (`X-Idempotency-Key`) & double-click protection |
| **File Upload Size** | 5MB (Image), 25MB (Audio/Video) | Client-side Canvas Image Compressor (`imageCompressor.ts`) |
| **Database Response Latency** | $<200\text{ms}$ for paginated queries | B-Tree Indexes on `status`, `district`, `created_at` & DB Summary Views |

---

## 2. Scaling & High-Traffic Checklist

1. **Database Indexing**: Verify `20260912_production_security_and_performance.sql` is executed in Supabase SQL Editor.
2. **Edge CDN Caching**: Ensure static assets and JS chunks are cached via Cloudflare Workers / Vercel CDN headers (`Cache-Control: public, max-age=31536000`).
3. **Database Connection Pooling**: Ensure Supabase database connection mode is set to **Transaction Mode** (Port 6543) via PgBouncer.
4. **Offline Draft Queue**: Verify `offlineQueue.ts` syncs local IndexedDB drafts automatically when network reconnects.

---

## 3. Threshold Alert Trigger Rules

- **Alert 1: High Latency (>1500ms)** $\rightarrow$ Auto-fallback to short-lived SWR cache.
- **Alert 2: Database Connection Saturation (>80%)** $\rightarrow$ Scale Supabase Compute Tier (Small to Medium/Large).
- **Alert 3: Rate Limit Exceeded spikes (>100 HTTP 429s/min)** $\rightarrow$ Trigger Cloudflare Web Application Firewall (WAF) challenge.

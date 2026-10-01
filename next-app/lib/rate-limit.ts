/**
 * Rate limiter ساده‌ی درون‌حافظه‌ای (مناسب تک‌نودی).
 * برای استقرار چندنودی، با Redis جایگزین کنید.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  b.count += 1;
  return b.count <= maxPerMinute;
}

// پاک‌سازی دوره‌ای برای جلوگیری از رشد حافظه
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}, 5 * 60_000).unref?.();

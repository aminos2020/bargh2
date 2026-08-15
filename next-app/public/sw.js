/* توان‌بان — service worker
 * استراتژی: app shell و assetهای استاتیک cache-first، APIها network-first.
 * داده‌های حساس هرگز طولانی cache نمی‌شوند.
 */
const VERSION = "tavanban-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const APP_SHELL = ["/login", "/manifest.json", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return; // POSTها (API) هرگز cache نشوند

  // APIها: فقط network
  if (url.pathname.startsWith("/api/")) return;

  // navigations: network-first با fallback به shell
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match("/login"))
    );
    return;
  }

  // استاتیک‌ها: cache-first
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request).then((res) => {
          if (res.ok && (url.origin === self.location.origin)) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        })
    )
  );
});

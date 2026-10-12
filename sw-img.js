/* 圖片加速小幫手（Service Worker）
   網址不變：網頁一樣從 GitHub Pages 開啟，只有「圖片」改從 Cloudflare 的同一份檔案下載（快很多）。
   Cloudflare 讀不到、出錯或 8 秒沒回應時，自動改回從 GitHub 下載原圖。
   網頁、程式、資料都不經過這裡，也不另外存快取。
   緊急停用：把下面 ENABLED 改成 false 再推送，訪客下次開網頁就會恢復原本的方式。 */
const ENABLED = true;
const CDN = 'https://global-bl-cultural-observatory2026.pages.dev/';
const IMG_EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const TIMEOUT_MS = 8000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (!ENABLED) return;
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  // 只處理本網站自己的圖片
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (!IMG_EXT.test(decodeURIComponent(url.pathname))) return;
  const rel = url.pathname.slice(scope.pathname.length) + url.search;
  e.respondWith(fromCdn(CDN + rel).catch(() => fetch(req)));
});

async function fromCdn(cdnUrl) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(cdnUrl, { mode: 'cors', credentials: 'omit', signal: ctrl.signal });
    if (!res.ok) throw new Error('cdn ' + res.status);
    return res;
  } finally {
    clearTimeout(t);
  }
}

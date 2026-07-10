const CACHE = 'biyahe-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});

/* ---- Push notifications ---- */
self.addEventListener('push', e => {
  let msg = 'Biyaheng Pantalan update';
  try { const d = e.data.json(); msg = d.msg || d.body || msg; } catch {}
  e.waitUntil(self.registration.showNotification('⛴️ Biyaheng Pantalan', {
    body: msg,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'biyahe-update',
    renotify: true,
    data: { url: self.registration.scope }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    for (const c of list) if (c.url.includes('biyahe') && 'focus' in c) return c.focus();
    return clients.openWindow(e.notification.data.url || './');
  }));
});

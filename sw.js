/* Offline app shell only. Weather requests and credentials never enter this cache. */
const VERSION = '78d9e7c014b96029';
const PREFIX = 'abord-pwa:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const ASSETS = [
  './', './index.html', './pwa.js', './pwa.css', './manifest.webmanifest',
  './simulador-autonom.html', './icons/icon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'
];
const BASE = new URL(self.registration.scope);
const URLS = new Set(ASSETS.map(path => new URL(path, BASE).href));
const INDEX = new URL('./index.html', BASE).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(path => new Request(new URL(path, BASE), {cache:'reload'})));
    // Updated workers wait: never interrupt a running simulation automatically.
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE.origin) return;
  url.search = ''; url.hash = '';
  if (!URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Directory and index URLs share the exact same cached application version.
    const appNavigation = request.mode === 'navigate' && (url.href === BASE.href || url.href === INDEX);
    const key = appNavigation ? INDEX : url.href;
    const cached = await cache.match(key);
    return cached || fetch(request);
  })());
});

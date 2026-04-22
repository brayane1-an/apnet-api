// Minimal Service Worker for PWA compliance
const CACHE_NAME = 'apnet-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let it pass through to the network
  event.respondWith(fetch(event.request));
});

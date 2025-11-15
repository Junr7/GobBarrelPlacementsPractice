// sw.js - Basic Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler
  event.respondWith(fetch(event.request));
});// sw.js - Basic Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler
  event.respondWith(fetch(event.request));
});
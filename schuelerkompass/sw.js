'use strict';
const cacheName='schuelerkompass-assets-v1';
const base=self.registration.scope;
const files=['./','index.html','app.css','app.js','themen.js','datenschutz.html','manifest.webmanifest','kompass-192.png','kompass-512.png'].map(f=>new URL(f,base).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(files))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('schuelerkompass-assets-')&&k!==cacheName).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const asset=new URL(event.request.url);
  asset.hash='';
  if(event.request.method!=='GET'||!files.includes(asset.href))return;
  event.respondWith(caches.open(cacheName).then(async cache=>(await cache.match(asset.href))??fetch(event.request)));
});

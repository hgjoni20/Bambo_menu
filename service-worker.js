const CACHE_NAME = 'bambo-menu-v1.3.1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './about.html',
  './about.css',
  './script.js',
  './manifest.json',
  './data/en.json',
  './data/sq.json',
  './data/it.json',
'./assets/logo.webp',
  './assets/italy.png',
  './assets/djath.webp',
  './assets/llukanik.webp',
  './assets/panakerpudha.webp',
  './assets/united-kingdom.png',
  './assets/bolonjez.webp',
  './assets/pesto.webp',
  './assets/dskuqur.webp',
  './assets/dite.webp',
  './assets/kalcone.webp',
  './assets/speciale.webp',
  './assets/diavola.webp',
  './assets/vegjetariane.webp',
  './assets/4st.webp',
  './assets/instagram.png',
  './assets/proshut.webp',
  './assets/perimer.webp',
  './assets/whatsapp(1).png',
  './assets/pule.webp',
  './assets/skuqura.webp',
  './assets/kapricoza.webp',
  './assets/salce.webp',
  './assets/suxhuk.webp',
  './assets/margarita.webp',
  './assets/fshati.webp',
  './assets/rukola.webp',
  './assets/zaferano.webp',
  './assets/albania.png',
  './assets/napolitana.webp',
  './assets/tartuff.webp',
  './assets/antipast.webp',
  './assets/tono.webp',
  './assets/4dj.webp',
  './assets/limon.webp',
  './assets/kerpudha.webp',
  './assets/supe.webp',
  './assets/sanduic.webp',
  './assets/gici.webp',
  './assets/rukolap.webp',
  './assets/rtartuf.webp',
  './assets/perime.webp',
  './assets/club.webp',
  './assets/alacrema.webp',
  './assets/salcekosi.webp',
  './assets/map.png',
  './assets/pestoch.webp',
  './assets/tartuf.webp',
  './assets/banneri.webp',
  './assets/furre.webp',
  './assets/cezar.webp',
  './assets/carbonara.webp',
  './assets/amerikana.webp',
  './assets/arrabiata.webp',
  './assets/jeshile.webp',
  './assets/proshutk.webp',
  './assets/fileto.webp',



  // Shto këtu path-et e ikonave dhe fotove kryesore
];

// Instalo Service Worker dhe ruaj resurset në Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Shërbeji resurset nga Cache nëse nuk ka internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

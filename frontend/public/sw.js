 // version development 1.8.10 oyea oyea
 // ALMOST WROKING oh yeaysvgadjkfvgvgh
 //new update
 self.addEventListener('install', function(e) {
     e.waitUntil(
         caches.open('fox-store').then(function(cache) {
             return cache.addAll([
                 './index.html',
                 './index.js',
                 './icon-512.png',
                 './media/albumart.jpg',
                 './media/aman.jpg',
                 './icon-256.png',
                 './icon-128.png',
                 './material-icons.css',
                 './MaterialIcons-Regular.woff'
             ]);
         })
     );
     self.skipWaiting();
 });


 self.addEventListener('fetch', function(e) {
     console.log(e.request.url);
     e.respondWith(
         caches.match(e.request).then(function(response) {
             return response || fetch(e.request);
         })
     );
 });
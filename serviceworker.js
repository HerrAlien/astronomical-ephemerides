/* ephemeris - a software astronomical almanach 

Copyright 2017 Herr_Alien <alexandru.garofide@gmail.com>

This program is free software: you can redistribute it and/or modify it under 
the terms of the GNU Affero General Public License as published by the 
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/agpl.html>. */
(function() {
var CACHE_PREFIX = 'Cache-for-ephemerides';
var CACHE_VERSION = 'v55';
var CACHE_NAME = CACHE_PREFIX + '-' + CACHE_VERSION;
var urlsToCache = [
".",
"index.html",
"manifest.json",
"style/default.css",
"js/notifications.js",
"js/neptune.js",
"js/jupiter.js",
"js/mars.js",
"js/saturn.js",
"js/mercury.js",
"js/moon.js",
"js/sun.js",
"js/uranus.js",
"js/venus.js",
"js/planetdata.js",
"js/planetpage.js",
"js/timeinput.js",
"js/aajs.js",
"js/galileanmoonsdata.js",
"js/matrix.js",
"js/location.js",
"js/realtime.js",
"js/galileanmoonspage.js",
"js/numerical.js",
"js/mooneclipsesdata.js",
"js/solareclipsesdata.js",
"js/mooneclipsespage.js",
"js/moonsdata.js",
"js/moonspage.js",
"js/risetransitset.js",
"js/saturnmoonsdata.js",
"js/saturnmoonspage.js",
"js/pagerank.js",
"js/besselianelements.js",
"js/solareclipsespage.js",
"images/menu.svg",
"images/ae-icon.png",
"images/left.png",
"images/right.png",
"images/settings.svg",
"images/logo.png",
"images/galilean-moons.svg",
"images/jupiter.svg",
"images/lunar-eclipse.svg",
"images/mars.svg",
"images/mercury.svg",
"images/moon.svg",
"images/neptune.svg",
"images/saturn-moons.svg",
"images/saturn.svg",
"images/solar-eclipse.svg",
"images/sun.svg",
"images/home-3.svg",
"images/loading.gif",
"images/uranus.svg",
"images/venus.svg",
"images/logomobilebanner.png",
"images/ae-icon-144.png",
"images/ae-icon-192.png",
"images/ae-icon-256.png",
"images/ae-icon-512.png"
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }
    )
  );
});

function shouldDestroy(name){
    return ((name.startsWith(CACHE_PREFIX)) && (name != CACHE_NAME));
}

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (shouldDestroy(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

})();

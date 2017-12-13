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
var CACHE_NAME = 'Cache-for-astronomical-ephemerides-v10';
var urlsToCache = [
"/ephemerides/",
"/ephemerides/index.html",
"/ephemerides/style/default.css",
"/ephemerides/js/notifications.js",
"/ephemerides/js/neptune.js",
"/ephemerides/js/jupiter.js",
"/ephemerides/js/mars.js",
"/ephemerides/js/saturn.js",
"/ephemerides/js/mercury.js",
"/ephemerides/js/moon.js",
"/ephemerides/js/sun.js",
"/ephemerides/js/uranus.js",
"/ephemerides/js/venus.js",
"/ephemerides/js/planetdata.js",
"/ephemerides/js/planetpage.js",
"/ephemerides/js/timeinput.js",
"/ephemerides/js/aajs.js",
"/ephemerides/js/galileanmoonsdata.js",
"/ephemerides/js/matrix.js",
"/ephemerides/js/location.js",
"/ephemerides/js/realtime.js",
"/ephemerides/js/galileanmoonspage.js",
"/ephemerides/js/numerical.js",
"/ephemerides/js/mooneclipsesdata.js",
"/ephemerides/js/solareclipsesdata.js",
"/ephemerides/js/mooneclipsespage.js",
"/ephemerides/js/moonsdata.js",
"/ephemerides/js/moonspage.js",
"/ephemerides/js/risetransitset.js",
"/ephemerides/js/saturnmoonsdata.js",
"/ephemerides/aajs.js.mem",
"/ephemerides/js/saturnmoonspage.js",
"/ephemerides/js/solareclipsespage.js.orig",
"/ephemerides/js/aajs.js.optimized",
"/ephemerides/js/besselianelements.js",
"/ephemerides/js/solareclipsespage.js",
"/ephemerides/js/aajs.js",
"/ephemerides/images/menu.svg",
"/ephemerides/images/ae-icon.png",
"/ephemerides/images/left.png",
"/ephemerides/images/right.png",
"/ephemerides/images/settings.svg",
"/ephemerides/images/logo.png",
"/ephemerides/images/galilean-moons.svg",
"/ephemerides/images/jupiter.svg",
"/ephemerides/images/lunar-eclipse.svg",
"/ephemerides/images/mars.svg",
"/ephemerides/images/mercury.svg",
"/ephemerides/images/moon.svg",
"/ephemerides/images/neptune.svg",
"/ephemerides/images/saturn-moons.svg",
"/ephemerides/images/saturn.svg",
"/ephemerides/images/solar-eclipse.svg",
"/ephemerides/images/sun.svg",
"/ephemerides/images/home-3.svg",
"/ephemerides/images/loading.gif",
"/ephemerides/images/uranus.svg",
"/ephemerides/images/venus.svg",
"/ephemerides/images/logomobilebanner.png",
"/ephemerides/images/ae-icon-144.png",
"/ephemerides/images/ae-icon-192.png",
"/ephemerides/images/ae-icon-256.png",
"/ephemerides/images/ae-icon-512.png"
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
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

})();

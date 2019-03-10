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
var CACHE_VERSION = '201';
var CACHE_NAME = CACHE_PREFIX + '-' + CACHE_VERSION;

var AAJS_CACHE_PREFIX = 'Cache-for-AAJS'
var AAJS_CACHE_VERSION = '1';
var AAJS_CACHE_NAME = AAJS_CACHE_PREFIX + '-' + AAJS_CACHE_VERSION;


var optionalAajsUrlsToCache = [
"aajs.js.mem",
];

var aajsUrlsToCache = [
"js/aajs.js",
];

var urlsToCache = [
".",
"index.html",
"manifest.json",
"style/default.css",
"../style/common.css",
"style/largescreen.css",
"style/print.css",
"js/besselianelements.js",
"js/galileanmoonsdata.js",
"js/galileanmoonspage.js",
"js/jupiter.js",
"js/location.js",
"js/mars.js",
"js/matrix.js",
"js/mercury.js",
"js/moon.js",
"js/mooneclipsesdata.js",
"js/mooneclipsespage.js",
"js/moonsdata.js",
"js/moonspage.js",
"js/navigation.js",
"js/nextdayseventsdata.js",
"js/nextdayseventsview.js",
"js/neptune.js",
"js/notifications.js",
"js/numerical.js",
"js/pagerank.js",
"js/planetdata.js",
"js/planetpage.js",
"js/physicalpositionaltoggler.js",
"js/promotedmenu.js",
"js/realtime.js",
"js/realtimedata.js",
"js/saturn.js",
"js/saturnmoonsdata.js",
"js/saturnmoonspage.js",
"js/scrollbehavior.js",
"js/searchform.js",
"js/solareclipsesdata.js",
"js/solareclipsespage.js",
"js/sun.js",
"js/timeinput.js",
"js/uranus.js",
"js/venus.js",
"images/bulgarian-courier.ttf",
"images/ae-icon.png",
"images/ae-icon-144.png",
"images/ae-icon-192.png",
"images/ae-icon-256.png",
"images/ae-icon-512.png",
"images/sprite.svg"
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
   Promise.all ([
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      }),

      caches.open(AAJS_CACHE_NAME)
        .then(cache => {
          console.log('Opened AAJS cache');
          cache.addAll(optionalAajsUrlsToCache);
          return cache.addAll(aajsUrlsToCache);
        })
      ]
    )
  );
});

function cacheNameFromUrl (url) {
  if (url.indexOf("aajs.js")) {
    return AAJS_CACHE_NAME;
  }
  return CACHE_NAME;
}


function fetchAndCache (req) {
  return fetch (req.clone()).then (resp => {
    if(!resp || resp.status !== 200 || resp.type !== 'basic') {
      return resp;
    }

    var responseToCache = resp.clone();

    caches.open(cacheNameFromUrl(responseToCache.url))
      .then(function(cache) {
        cache.put(req, responseToCache);
       });

    return resp;
  });
}

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          // analyze it
          return response.clone().blob().then(dataAsBlob => {

            if (!dataAsBlob || dataAsBlob.size == 0) {
              return fetchAndCache(event.request);
            }

            return response;
            
          });
         
        } else {
          return fetchAndCache (event.request);
        }
      }
    )
  );
});

function shouldDestroy(name){
    return ((name.startsWith(CACHE_PREFIX)) && (name != CACHE_NAME)) ||
           ((name.startsWith(AAJS_CACHE_PREFIX)) && (name != AAJS_CACHE_NAME));
}

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (shouldDestroy(cacheName)) {
            console.log("Deleting cache " + cacheName + " ...");
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

})();

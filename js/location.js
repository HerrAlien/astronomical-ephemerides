/*
Extinction-O-Meter - an HTML & JavaScript utility to apply differential 
extinction corrections to brightness estimates
               
Copyright 2015  Herr_Alien <alexandru.garofide@gmail.com>
                
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
                
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
                
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl.html
*/

"use strict";

var Location = {
	// this is the model
	latitude : 44.4268,
	longitude :26.1025,
	altitude : 200,
    
    onLocationUpdated : false,

	// these are the controls
	Controls : {
		lat : document.getElementById ("latitudeInput"),
		long: document.getElementById ("longitudeInput"),
		alt: document.getElementById ("altitudeInput"),
        geolocation : document.getElementById("getFromGeolocationAnchor"),
        map : false,
        marker : false,
		
		updateMapFromControls : function () {
			if (this.map)
				this.map.setView({lat: Number(this.lat.value), lng: Number(this.long.value)});
			if (this.marker)
				this.marker.setLatLng ({lat: Number(this.lat.value), lng: Number(this.long.value)});
		},

		update: function () {
			var attrMap = {"lat" : "latitude", 
                            "long" : "longitude", 
                            "alt" : "altitude"};
			for (var k in attrMap)
				this[k].value = Location[attrMap[k]];
				
			this.updateMapFromControls();
		},
		
		init : function (){
			var ctrls = this;
            this.geolocation.onclick = function () {
                var geoLocationAPI = navigator.geolocation || window.navigator.geolocation;
                if (geoLocationAPI) {
                    geoLocationAPI.getCurrentPosition (function (position) {
                        ctrls.lat.value = position.coords.latitude;
                        ctrls.long.value = position.coords.longitude;
                        if(!position.coords.altitude)
                            ctrls.alt.value = 0;
                        else
                            ctrls.alt.value = position.coords.altitude;
                   
						ctrls.updateMapFromControls();
                   });
                }
            }

            this.lat.oninput = function() { ctrls.updateMapFromControls() };
            this.long.oninput = function() { ctrls.updateMapFromControls() };

		},
        
        commitUserValues : function () {
            Location.latitude = Number(Location.Controls.lat.value);
            Location.longitude = Number(Location.Controls.long.value);
            Location.altitude = Number(Location.Controls.alt.value);

            Location.onLocationUpdated.notify();
        }
	},

    initMap : function () {
          Location.Controls.map = L.map('mapHolder').setView([Location.latitude, Location.longitude], 8);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.outdoors',
				accessToken: 'pk.eyJ1IjoiaGVycmFsaWVuIiwiYSI6ImNqbzl2cWQ4MTAyNzYzcW53YTQxNW9sN2cifQ.5lYnsEwiJsHPv3Ss6l3hHw'
			}).addTo(Location.Controls.map);
			Location.Controls.marker = L.marker([Location.latitude, Location.longitude]).addTo(Location.Controls.map);
			Location.Controls.map.on('dblclick', function(evt){

				Location.Controls.marker.setLatLng(evt.latlng);

				Location.Controls.lat.value = evt.latlng.lat;
				Location.Controls.long.value = evt.latlng.lng;
				Location.Controls.alt.value = isNaN(evt.latlng.alt) ? 0 : evt.latlng.alt;
				
			});
      }, 

	init : function () {
		this.onLocationUpdated = Notifications.New();
		this.Controls.init();
		this.Controls.update();
        this.onLocationUpdated.notify();

		this.initMap();

	}
};


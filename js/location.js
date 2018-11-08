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
				this.map.setCenter({lat: Number(this.lat.value), lng: Number(this.long.value)});
			if (this.marker)
				this.marker.setPosition ({lat: Number(this.lat.value), lng: Number(this.long.value)});
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

    initGoogleMap : function () {
          Location.Controls.map = new google.maps.Map(document.getElementById('mapHolder'), {
            center: {lat: Location.latitude, lng: Location.longitude},
            zoom: 8
          });

          Location.Controls.marker = new google.maps.Marker ({"map" : Location.Controls.map, "position" :  {lat: Location.latitude, lng: Location.longitude}});

          // add your event listeners
          Location.Controls.map.addListener('dblclick', function(evt) {
            Location.Controls.lat.value = evt.latLng.lat();
            Location.Controls.long.value = evt.latLng.lng();
            Location.Controls.marker.setPosition(evt.latLng);
          });
      },

	init : function () {
		this.onLocationUpdated = Notifications.New();
		this.Controls.init();
		this.Controls.update();
        this.onLocationUpdated.notify();

		var scr = document.createElement("script");
		scr.async = "";
		scr.defer = "";
		scr.src = "https://maps.googleapis.com/maps/api/js?callback=Location.initGoogleMap";
		if (document.location.href.indexOf("http://localhost") < 0)
			scr.src += "&key=AIzaSyBEnDEs-D1e0h57lS0AqLVu7hxX2WdjwZ0";

		document.body.appendChild(scr);
	}
};


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
		
		update: function () {
			var attrMap = {"lat" : "latitude", 
                            "long" : "longitude", 
                            "alt" : "altitude"};
			for (var k in attrMap)
				this[k].value = Location[attrMap[k]];
		},
		
		init : function (){

            this.geolocation.onclick = function () {
                var geoLocationAPI = navigator.geolocation || window.navigator.geolocation;
                if (geoLocationAPI) {
                    geoLocationAPI.getCurrentPosition (function (position) {
                        Location.Controls.lat.value = position.coords.latitude;
                        Location.Controls.long.value = position.coords.longitude;
                        if(!position.coords.altitude)
                            Location.Controls.alt.value = 0;
                        else
                            Location.Controls.alt.value = position.coords.altitude;
                   });
                }
            }
		},
        
        commitUserValues : function () {
            Location.latitude = 1.0 * Location.Controls.lat.value;
            Location.longitude = 1.0 * Location.Controls.long.value;
            Location.altitude = 1.0 * Location.Controls.alt.value;
            Location.onLocationUpdated.notify();
        }
	},
	
	init : function () {
		this.onLocationUpdated = Notifications.New();
		this.Controls.init();
		this.Controls.update();
        this.onLocationUpdated.notify();
	}
};

Location.init();

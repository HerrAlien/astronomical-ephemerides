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

"use strict";
var MercuryData = {};
							   
(function () {
	var localInit = function () {
		if (typeof PlanetData != 'undefined' && typeof PlanetPage != 'undefined' && typeof Pages != 'undefined') {
			MercuryData = new PlanetData({ number: 1, name: "Mercury", 
									   semidiameterFunctionName : function (delta) { if (typeof GetAAJS() != "undefined") return GetAAJS().Diameters.MercurySemidiameterB(delta); } } );						   
			var Page = new PlanetPage (MercuryData, "MercuryTable");
			Pages["Mercury Ephemeris"] = Page;
		} else {
			SyncedTimeOut(localInit, Timeout.onInit);
		}
	}
	localInit();
})();

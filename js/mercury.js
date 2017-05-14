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


var MercuryData = new PlanetData({ number: 1, name: "Mercury", 
                               semidiameterFunctionName : AAJS.Diameters.MercurySemidiameterB });						   
							   
(function () {
    var Page = new PlanetPage (MercuryData);
    setTimeout( function() { Page.displayPage(PageTimeInterval.JD, PageTimeInterval.steps); }, 100);


})();

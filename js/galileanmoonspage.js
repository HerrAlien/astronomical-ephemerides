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

// planet object - {number, name, semidiameterFunctionName}

"use strict";

(function(){
    var localInit = function () {
        try {
           var GalileanMoonsPage = new MoonsPage ( "GalileanMoonsContainer",
                   GalileanMoonsData,
                   {'Io' : {'d' : '', 'color' : 'blue', 'lastPos' : {'X' : 0, 'Y' : 0} },
                               'Europa' : {'d' : '', 'color' : 'red', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                               'Ganymede' : {'d' : '', 'color' : 'green', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                               'Callisto' : {'d' : '', 'color' : 'black', 'lastPos' : {'X' : 0, 'Y' : 0}}}
           );

           GalileanMoonsPage.reset = PlanetPage.prototype.reset;
           GalileanMoonsPage.keywords = ["Jupiter", "Moon", "Galilean", "Jovian"];

    
           Pages["Elongations of Galilean Moons"] = GalileanMoonsPage;
        } catch (err) {
                SyncedTimeOut (localInit, Timeout.onInit);
        }
    }
    localInit();
})();

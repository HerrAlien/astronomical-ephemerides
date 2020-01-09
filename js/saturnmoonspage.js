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

WHEN (function() { return true; },
      function() {
            var SaturnMoonsPage = new MoonsPage("SaturnMoonsContainer",
                    SaturnMoonsData,
                    {
                        'Mimas': { 'd': '', 'color': 'blue', 'lastPos': { 'X': 0, 'Y': 0 } },
                        'Enceladus': { 'd': '', 'color': 'red', 'lastPos': { 'X': 0, 'Y': 0 } },
                        'Tethys': { 'd': '', 'color': 'green', 'lastPos': { 'X': 0, 'Y': 0 } },
                        'Dione': { 'd': '', 'color': 'black', 'lastPos': { 'X': 0, 'Y': 0 } },
                        'Rhea': { 'd': '', 'color': 'magenta', 'lastPos': { 'X': 0, 'Y': 0 } },
                        'Titan': { 'd': '', 'color': 'grey', 'lastPos': { 'X': 0, 'Y': 0 } }
                    }
            );

            SaturnMoonsPage.reset = PlanetPage.prototype.reset;
            SaturnMoonsPage.planetFraction = 1 / 23.0;

            Pages.addShareablePage(SaturnMoonsPage, "Elongations of Saturn Moons");
      }
);

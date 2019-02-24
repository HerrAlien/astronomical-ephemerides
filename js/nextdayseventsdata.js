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

/* Requirement for data sources:
    // IncrementHint is just a hint on the sample rate for getting from the inernal data sources.
    // If there is reasonable evidence to suspect an event, a finer icrement should be used.
    GetEvents (startJD, endJD, incrementHint) 
    -> [ { start: <JD>, end: <JD>, title: string, target : [actions]},
         ... ... ...
     ]

   Data sources for next events:
    - the moon and sun eclipses
    - occultations
*/

var NextEvents = {};
(function(){
    NextEvents["MoonEclipsesPage"] = {
        GetEvents : function (startJD, endJD, incrementHint) {
            var events = [];
            for (var jd = startJD; jd < endJD; jd += incrementHint) {
                // test with k. Is it an opposition?
                // if yes, test with eclipses
                // if yes, add it to the array of events
                var eclipseData = MoonEclipsesData.calculateEclipseForJD (JD);
                if (eclipseData.eclipse) {
                    // build th object
                    var id = MoonEclipsesPage.getId(eclipseData);
                    // set the eclipseData['start'], 'title' and 'linkActions'
                    events.push ({
                        start : eclipseData.Timings.Penumbral.firstContact,
                        end :   eclipseData.Timings.Penumbral.lastContact,
                        target : JSON.stringify({
                            page:"Lunar Eclipses",
                            actions:[{name:"scroll", parameters: id}]
                            })
                    });
                }
            }
            return events;
        }
    };
})();

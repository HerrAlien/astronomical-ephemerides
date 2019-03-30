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
    GetEvents (countOfDays) 
    -> [ { start: <JD>, end: <JD>, title: string, navigActionObj : [actions]},
         ... ... ...
     ]

   Data sources for next events:
    - the moon and sun eclipses
    - occultations
*/

var NextEvents = {
    numberOfDays : false,
    startJd : false
};

(function(){
    NextEvents["init"] = function() {
        if (!this.numberOfDays) {
            this.numberOfDays = Number(document.getElementById("futureEventsNumberOfDays").value);
        }
        if (!this.startJd) {
            var rightNow = new Date();
            var y = rightNow.getUTCFullYear();
            var m = 1 + rightNow.getUTCMonth();
            var d = rightNow.getUTCDate();
            this.startJd = AAJS.Date.DateToJD (y, m, d, true) + rightNow.getUTCHours()/24 + rightNow.getUTCMinutes()/(60 * 24);
        }
    };

    NextEvents["reset"] = function() {
        this.numberOfDays = false;
        this.startJd = false;
    };

    NextEvents["GetEvents"] = function(types) {
        var events = [];
        for (var i in types) {
            var key = types[i];
            if (((typeof NextEvents[key]).toUpperCase() == "OBJECT") &&
                ((typeof NextEvents[key]["GetEvents"]).toUpperCase() == "FUNCTION")) {
                var eventsForObj = NextEvents[key]["GetEvents"]();
                events = events.concat(eventsForObj);
            }
        }

        events.sort(function(a, b) { return a.start - b.start; });
        return events;
    };

/////////////////// Moon Eclipses //////////////////////////
    NextEvents["MoonEclipsesPage"] = {
        GetEvents : function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var lastOppositionJd = false;
            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                if (lastOppositionJd && Math.abs(jd + i - lastOppositionJd) < 27) {
                    continue;
                }

                var eclipseData = {eclipse: false};
                try {
                    if (!AAJS.AllDependenciesLoaded()) 
                        throw "AAJS not loaded";
                    eclipseData = MoonEclipsesData.calculateEclipseForJD (jd + i);
                } catch (err) {
                    var errStr = String(err);
                    if (0 > errStr.indexOf("Cannot obtain JD for opposition"))
                        throw err;
                }

                lastOppositionJd = eclipseData.JD;

                if (eclipseData.eclipse) {
                    var id = MoonEclipsesPage.getId(eclipseData);
                    events.push ({
                        start : eclipseData.umbralPartialEclipse? eclipseData.Timings.Umbral.firstContact: eclipseData.Timings.Penumbral.firstContact,
                        end :   eclipseData.umbralPartialEclipse? eclipseData.Timings.Umbral.lastContact: eclipseData.Timings.Penumbral.lastContact,
                        navigActionObj : {
                            page:"Lunar Eclipses",
                            actions:[{name:"scroll", parameters: id}]
                            },
                       title: "Lunar Eclipse: " + MoonEclipsesPage.getTypeOfEclipseString(eclipseData)
                    });
                }
            }

            return events;
        }
    };

/////////////////// Solar Eclipses //////////////////////////
    NextEvents["SolarEclipsesPage"] = {
        GetEvents : function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var lastK = false;

            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                // check if there's an eclipse.
                var k = AAJS.Moon.kForJD (jd + i);
                if (k < 0)
                    k = -1 * Math.ceil(Math.abs(k));
                else
                    k = Math.ceil(Math.abs(k));

                if (lastK && lastK == k) {
                    continue;
                }

                lastK = k;

                var eclipseData = SolarEclipses.EclipseDataForK(k);
                if (eclipseData.bEclipse) {
                    var id = SolarEclipsesPage.getId(eclipseData);
                    events.push ({
                        start :  eclipseData.t0,
                        end :    eclipseData.t0,
                        navigActionObj : {
                            page:"Solar Eclipses",
                            actions:[{name:"scroll", parameters: id}]
                            },
                       title: "Solar Eclipse: " + SolarEclipsesPage.getTypeOfEclipseString(eclipseData)
                    });
                }
            }
            return events;
        }
    };

/////////////////// Occultations //////////////////////////
    NextEvents["Occultations"] = {
        GetEvents : function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var dt = AAJS.DynamicalTime.DeltaT(jd)/(3600 * 24);

            var occultations = OccultationsData.getOccultedStars(jd, NextEvents.numberOfDays);
            for (var conjunctionJde in occultations) {
                var occultation = occultations[conjunctionJde];
                var id = OccultationsPage.getId(occultation);
                var event = {
                    start :  occultation.start.t - dt,
                    end :    occultation.end.t - dt,
                    navigActionObj : {
                        page:"Occultations",
                        actions:[{name:"scroll", parameters: id}]
                        },
                   title: "Occultation: " + OccultationsPage.getStarName(occultation)
                };
                events.push (event);
            }
            
            return events;
        }
    };

})();

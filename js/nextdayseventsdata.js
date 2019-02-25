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
            this.startJd = AAJS.Date.DateToJD (y, m, d, true);
        }
    };

    NextEvents["reset"] = function() {
        this.numberOfDays = false;
        this.startJd = false;
    };

    NextEvents["MoonEclipsesPage"] = {
        GetEvents : function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                var eclipseData = {eclipse: false};
                try {
                    eclipseData = MoonEclipsesData.calculateEclipseForJD (jd + i);
                } catch (err) {
                    var errStr = String(err);
                    if (0 < errStr.indexOf("Cannot obtain JD for opposition"))
                        throw err;
                }
                if (eclipseData.eclipse) {
                    var id = MoonEclipsesPage.getId(eclipseData);
                    events.push ({
                        start : eclipseData.Timings.Penumbral.firstContact,
                        end :   eclipseData.Timings.Penumbral.lastContact,
                        navigActionObj : {
                            page:"Lunar Eclipses",
                            actions:[{name:"scroll", parameters: id}]
                            }
                    });
                }
            }
            return events;
        }
    };


    NextEvents["GetEvents"] = function() {
        var events = [];
        for (var key in NextEvents) {
            if (((typeof NextEvents[key]).toUpperCase() == "OBJECT") &&
                ((typeof NextEvents[key]["GetEvents"]).toUpperCase() == "FUNCTION")) {
                var eventsForObj = NextEvents[key]["GetEvents"]();
                events = events.concat(eventsForObj);
            }
        }

        events.sort(function(a, b) { return a.start - b.start; });
        return events;
    };

})();

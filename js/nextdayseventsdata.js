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
    numberOfDays: false,
    startJd: false
};

(function () {
    NextEvents["init"] = function () {
        if (!this.numberOfDays) {
            this.numberOfDays = Number(document.getElementById("futureEventsNumberOfDays").value);
        }
        if (!this.startJd) {
            var rightNow = new Date();
            var y = rightNow.getUTCFullYear();
            var m = 1 + rightNow.getUTCMonth();
            var d = rightNow.getUTCDate();
            this.startJd = AAJS.Date.DateToJD(y, m, d, true) + rightNow.getUTCHours() / 24 + rightNow.getUTCMinutes() / (60 * 24);
            this.endJd = this.startJd + this.numberOfDays;
        }
    };

    NextEvents["reset"] = function () {
        this.numberOfDays = false;
        this.startJd = false;
        this.endJd = false;
    };

    NextEvents["GetEvents"] = function (types) {
        var events = [];
        for (var i in types) {
            var key = types[i];
            if (((typeof NextEvents[key]).toUpperCase() == "OBJECT") &&
                ((typeof NextEvents[key]["GetEvents"]).toUpperCase() == "FUNCTION")) {
                var eventsForObj = NextEvents[key]["GetEvents"]();
                events = events.concat(eventsForObj);
            }
        }

        events.sort(function (a, b) { return a.start - b.start; });
        return events;
    };

    NextEvents["InTimeBounds"] = function (event) {
        return (event.end >= NextEvents.startJd && 
                event.start <= NextEvents.endJd);
    };

    /////////////////// Moon Eclipses //////////////////////////
    NextEvents["MoonEclipsesPage"] = {
        GetEvents: function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var lastOppositionJd = false;
            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                if (lastOppositionJd && Math.abs(jd + i - lastOppositionJd) < 27) {
                    continue;
                }

                var eclipseData = { eclipse: false };
                try {
                    if (!AAJS.AllDependenciesLoaded())
                        throw "AAJS not loaded";
                    eclipseData = MoonEclipsesData.calculateEclipseForJD(jd + i);
                } catch (err) {
                    var errStr = String(err);
                    if (0 > errStr.indexOf("Cannot obtain JD for opposition"))
                        throw err;
                }

                lastOppositionJd = eclipseData.JD;

                if (eclipseData.eclipse) {
                    var evt = {
                        start: eclipseData.umbralPartialEclipse ? eclipseData.Timings.Umbral.firstContact : eclipseData.Timings.Penumbral.firstContact,
                        end: eclipseData.umbralPartialEclipse ? eclipseData.Timings.Umbral.lastContact : eclipseData.Timings.Penumbral.lastContact,
                        navigActionObj: MoonEclipsesPage.getNavigationObject(eclipseData),
                        title: MoonEclipsesPage.getShareEventTitle(eclipseData)
                    };
                    if (NextEvents.InTimeBounds(evt)) {
                        events.push (evt);
                    }
                }
            }

            return events;
        }
    };

    /////////////////// Solar Eclipses //////////////////////////
    NextEvents["SolarEclipsesPage"] = {
        GetEvents: function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var lastK = false;

            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                // check if there's an eclipse.
                var k = AAJS.Moon.kForJD(jd + i);
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
                    //let's not condition this by visibility. Keep consistent with
                    // how moon eclipses and other events are treated.
                    // if (eclipseData["t1"]) 
                    {
                        var evt = {
                            start: eclipseData.t0,
                            end: eclipseData.t0,
                            navigActionObj: SolarEclipsesPage.getNavigationObject(eclipseData),
                            title: SolarEclipsesPage.getShareEventTitle(eclipseData)
                        };

                        if (NextEvents.InTimeBounds(evt)) {
                            events.push (evt);
                        }
                    }
                }
            }
            return events;
        }
    };

    /////////////////// Occultations //////////////////////////
    NextEvents["Occultations"] = {
        GetEvents: function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var dt = AAJS.DynamicalTime.DeltaT(jd) / (3600 * 24);

            var occultations = OccultationsData.getOccultedStars(jd, NextEvents.numberOfDays);
            for (var conjunctionJde in occultations) {
                var occultation = occultations[conjunctionJde];
                var event = {
                    start: occultation.start.t - dt,
                    end: occultation.end.t - dt,
                    navigActionObj: OccultationsPage.getNavigationObject(occultation),
                    title: OccultationsPage.getShareEventTitle(occultation)
                };

                if (NextEvents.InTimeBounds(event)) {
                        events.push (event);
                }
            }

            return events;
        }
    };

    /////////////////// Transits //////////////////////////
    NextEvents["Transits"] = {
        GetEvents: function () {
            NextEvents.init();
            var nextDaysEvents = [];
            var jd = NextEvents.startJd;
            var dt = AAJS.DynamicalTime.DeltaT(jd) / (3600 * 24);

            var events = Transits.get(jd, NextEvents.numberOfDays);
            for (var jde in events) {
                var event = events[jde];
                var nextDaysEvent = {
                    start: event.C1.t - dt,
                    end: event.C4.t - dt,
                    navigActionObj: TransitsPage.getNavigationObject(event),
                    title: TransitsPage.getShareEventTitle(event)
                };

                if (NextEvents.InTimeBounds(nextDaysEvent)) {
                        nextDaysEvents.push (nextDaysEvent);
                }
            }

            return nextDaysEvents;
        }
    };


    /////////////////// Lunar X //////////////////////////
    NextEvents["LunarXPage"] = {
        GetEvents: function () {
            NextEvents.init();
            var events = [];
            var jd = NextEvents.startJd;
            var lastFirstQuarterJd = false;
            for (var i = 0; i < NextEvents.numberOfDays; i++) {

                if (lastFirstQuarterJd && Math.abs(jd + i - lastFirstQuarterJd) < 27) {
                    continue;
                }

                var xData = false;
                try {
                    if (!AAJS.AllDependenciesLoaded())
                        throw "AAJS not loaded";
                    xData = LunarXData.getEvent(jd + i);
                } catch (err) {
                    var errStr = String(err);
                    if (0 > errStr.indexOf("Cannot obtain JD for opposition"))
                        throw err;
                }

                lastFirstQuarterJd = xData.currentLunarXJd;
                
                    var evt = {
                        start: lastFirstQuarterJd,
                        end: lastFirstQuarterJd,
                        navigActionObj: {
                            page: "Terminator Events",
                            actions: []
                        },
                        title: "Lunar X"
                    };
                    if (NextEvents.InTimeBounds(evt)) {
                        events.push (evt);
                    }
                    var moonMaidenEvt = {
                        start: xData.currentMoonMaiden,
                        end: xData.currentMoonMaiden,
                        navigActionObj: {
                            page: "Terminator Events",
                            actions: []
                        },
                        title: "Moon Maiden"
                    };
                    if (NextEvents.InTimeBounds(moonMaidenEvt)) {
                        events.push (moonMaidenEvt);
                    }
            }

            return events;
        }
    };


})();

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

var OccultationsData = {
    getDataObj: function (JDE, fraction) {
        if (!fraction) {
            fraction = 1;
        }

        var jd3 = Math.floor(JDE / fraction) * fraction;
        return {
            T1: jd3 - 2 * fraction,
            T2: jd3 - fraction,
            T3: jd3,
            T4: jd3 + fraction,
            T5: jd3 + 2 * fraction,
            n: (JDE - jd3) / fraction
        };
    },

    wrappedPlanets: false,

    getWrappedPlanets: function () {
        if (!OccultationsData.wrappedPlanets) {

            function WrappedPlanet(displayName, data, initialTimeInterval, vmag) {
                this.displayName = displayName;
                this.getJdObj = OccultationsData.getDataObj;
                this.interpolatedDataSource = new DataForNow(data);

                if (initialTimeInterval)
                    this.timeInterval = initialTimeInterval;
                else
                    this.timeInterval = 1; // one day

                this.Vmag = -1;
                if (vmag)
                    this.Vmag = vmag;

                this.getInterpolatedData = function (_JD) {
                    var interpolatedData = this.interpolatedDataSource.getInterpolatedData(
                        this.getJdObj(_JD, this.timeInterval));
                    return interpolatedData;
                };

                this.getRa = function (_JD) {
                    var interpolatedData = this.getInterpolatedData(_JD);
                    return interpolatedData.RA;
                };

                this.getDec = function (_JD) {
                    var interpolatedData = this.getInterpolatedData(_JD);
                    return interpolatedData.Dec;
                };

                this.setInterpolationInterval = function (dayFraction) {
                    if (dayFraction) {
                        this.timeInterval = dayFraction;
                    }
                };

                this.getDisplayName = function () {
                    return this.displayName;
                };
            }

            OccultationsData.wrappedPlanets = [
                 new WrappedPlanet("Mercury", MercuryData, 5, -1),
                 new WrappedPlanet("Venus", VenusData, 5, -3),
                 new WrappedPlanet("Mars", MarsData, 5, 5),
                 new WrappedPlanet("Jupiter", JupiterData, 5, -2),
                 new WrappedPlanet("Saturn", SaturnData, 5, 1),
                 new WrappedPlanet("Uranus", UranusData, 5, 5),
                 new WrappedPlanet("Neptune", NeptuneData, 5, 7)
            ];

        }

        return OccultationsData.wrappedPlanets;
    },

    getPlanetsCloseToMoon: function (jde) {
        var planetsCloseToMoon = [];
        var moonData = OccultationsData.getMoonData();
        var getDataObj = OccultationsData.getDataObj;
        var moonPositionData = moonData.getInterpolatedData(getDataObj(jde));

        var allPlanets = OccultationsData.getWrappedPlanets();
        var raEps = 1 / 15;
        var decEps = 1;

        for (var i = 0; i < allPlanets.length; i++) {
            allPlanets[i].timeInterval = 5; // reset for low precision high speed
            var planetData = allPlanets[i].getInterpolatedData(jde);
            if (Math.abs(planetData.Dec - moonPositionData.Dec) < decEps &&
                Math.abs(planetData.RA - moonPositionData.RA) < raEps) {
                planetsCloseToMoon.push(allPlanets[i]);
            }
        }
        return planetsCloseToMoon;
    },

    moonData: false,

    getMoonData: function () {
        if (!OccultationsData.moonData)
            OccultationsData.moonData = new DataForNow(MoonData);
        return OccultationsData.moonData;
    },

    getOccultedStars_noTimings: function (jde, numberOfDays) {

        function sind(x) {
            return Math.sin(x * Math.PI / 180);
        }
        function cosd(x) {
            return Math.cos(x * Math.PI / 180);
        }

        var getDataObj = OccultationsData.getDataObj;

        var occultedObjects = {};
        var dayIncrement = 1;
        var moonData = OccultationsData.getMoonData();
        var stepsCount = 12;
        var jdeIncrement = dayIncrement / stepsCount;

        var treatedJde = {};

        var deg2rad = Math.PI / 180;

        var lst = (GetAAJS().Sidereal.ApparentGreenwichSiderealTime(jde) * 15 +
                    Location.longitude) * deg2rad;
        var utc2lstRatio = 1.00273737909350795;
        var TWO_PI = 2 * Math.PI;
        var lstIncrement = jdeIncrement * TWO_PI * utc2lstRatio;
        for (var d = 0; d < numberOfDays; d += dayIncrement) {

            for (var step = 0; step < stepsCount; step++, jde += jdeIncrement, lst += lstIncrement) {

                if (lst > Math.PI * 2) {
                    lst -= Math.PI * 2;
                }

                var approximatePhase = MoonData.getApproximatePhase(jde);
                var noDimmerThanThis_m = 7;
                if (approximatePhase < 0.047) {
                    noDimmerThanThis_m = 2.1;
                } else if (approximatePhase < 0.017) {
                    continue; // too close to the Sun
                }
                if (approximatePhase > 0.9) {
                    noDimmerThanThis_m = 4;
                }

                var dataForJd = moonData.getInterpolatedData(getDataObj(jde, 6 / 24));
                var ra = dataForJd.RaTopo;
                var dec = dataForJd.DecTopo;
                var starsThatMayBeOcculted = OccultableStars.getStarsNear(ra, dec, jde);

                OccultationsData.processPossibleOccultedObjects(jde, lst, treatedJde,
                    starsThatMayBeOcculted,
                    function (s) { return s.HR; },
                    noDimmerThanThis_m,
                    occultedObjects);

                // get/create wrappers for the planets. inner planets interpolate on a daily basis,
                // outer planets on a 10 days basis.

                var planets = OccultationsData.getPlanetsCloseToMoon(jde);
                OccultationsData.processPossibleOccultedObjects(jde, lst, treatedJde,
                    planets,
                    function (s) { return s.getDisplayName(); },
                    noDimmerThanThis_m,
                    occultedObjects);

            }

        }
        return occultedObjects;
    },

    processPossibleOccultedObjects: function (jde, lst,
                                                treatedJde,
                                               inputObjects,
                                               getIdOfObject,
                                               noDimmerThanThis_m,
                                               occultedObjects) {
        var moonData = OccultationsData.getMoonData();
        var deg2rad = Math.PI / 180;
        var TWO_PI = 2 * Math.PI;
        var getDataObj = OccultationsData.getDataObj;
        var dataForJd = false;
        var utc2lstRatio = 1.00273737909350795;
        var lat = Location.latitude * deg2rad;
        var long = Location.longitude * deg2rad;

        function sind(x) {
            return Math.sin(x * Math.PI / 180);
        }
        function cosd(x) {
            return Math.cos(x * Math.PI / 180);
        }

        for (var i = 0; i < inputObjects.length; i++) {
            var currentObject = inputObjects[i];
            if (Math.round(currentObject.Vmag * 10) / 10 > noDimmerThanThis_m) {
                continue;
            }

            // get the time of conjunction
            var conjunctionJde = jde;
            var lastConjunctionJde = conjunctionJde - 1;
            var starRaH = false;
            for (var cjIndex = 0; cjIndex < 10 && Math.abs(conjunctionJde - lastConjunctionJde) > 1e-6; cjIndex++) {
                lastConjunctionJde = conjunctionJde;
                dataForJd = moonData.getInterpolatedData(getDataObj(conjunctionJde, 4 / 24));
                starRaH = currentObject.getRa(conjunctionJde);
                var beforeData = moonData.getInterpolatedData(getDataObj(conjunctionJde - 1 / 24, 4 / 24));
                var t = (starRaH - beforeData.RaTopo) / (dataForJd.RaTopo - beforeData.RaTopo);
                conjunctionJde = conjunctionJde - 1 / 24 + t / 24;
            }

            var conjunctionId = conjunctionJde + " " + currentObject.getRa(conjunctionJde) + " " + starDecR;

            if (treatedJde[conjunctionId]) {
                continue;
            }
            treatedJde[conjunctionId] = true;
            // interpolate new values for moon

            var conjunctionLst = lst + TWO_PI * utc2lstRatio * (conjunctionJde - jde);
            while (conjunctionLst > TWO_PI) {
                conjunctionLst -= TWO_PI;
            }

            while (conjunctionLst < 0) {
                conjunctionLst += TWO_PI;
            }

            var starDecR = currentObject.getDec(conjunctionJde) * deg2rad;
            var starAltR = Math.asin(Math.sin(starDecR) * Math.sin(lat) + Math.cos(starDecR) * Math.cos(lat) * Math.cos(conjunctionLst - currentObject.getRa(conjunctionJde) * 15 * deg2rad));

            if (starAltR <= 0) {
                continue;
            }

            var dataAtConjunction = dataForJd;
            var conjunctionDec = dataAtConjunction.DecTopo;
            var conjunctionDiameter = dataAtConjunction.DiameterTopo;
            // compute the distance

            var dist = Math.acos(sind(conjunctionDec) * Math.sin(starDecR) +
                                 cosd(conjunctionDec) * Math.cos(starDecR));
            dist *= 180 / Math.PI;
            if (dist < conjunctionDiameter * 0.75) {
                var key = Math.round(conjunctionJde * 1e6) / 1e6;

                if (!occultedObjects[key]) {
                    occultedObjects[key] = {};
                }
                occultedObjects[key][getIdOfObject(currentObject)] = currentObject;
            }
        }
    },

    distance: function (dataForJd, star, t) {
        var degra = Math.PI / 180;
        var moonDecRad = dataForJd.DecTopo * degra;
        var moonRaRad = dataForJd.RaTopo * 15 * degra;

        var starDecRad = star.getDec(t) * degra;
        var starRaRad = star.getRa(t) * 15 * degra;

        var dist = Math.acos(Math.sin(moonDecRad) * Math.sin(starDecRad) +
                   Math.cos(moonDecRad) * Math.cos(starDecRad) * Math.cos(moonRaRad - starRaRad));
        dist *= 180 / Math.PI;
        return dist;
    },

    getStartOrEndContact: function (star, jde, isForStart) {
        var t = jde;
        var d = 1;
        var lastD = 1;
        var epsD = 1e-6;
        var fraction = 2 / 24;
        if (isForStart) {
            t -= fraction;
        } else {
            t += fraction;
        }
        var timeStep = (jde - t) / 2;

        var moonData = new DataForNow(MoonData);

        // call a setInterpolationInterval() method,
        // so that the star objects for planets interpolate at a smaller step
        if (star.setInterpolationInterval) {
            star.setInterpolationInterval(fraction);
        }

        var dataForT = false;
        for (var i = 0; i < 100 && Math.abs(d) > epsD && Math.abs(t - jde) < 0.25; i++) {
            dataForT = moonData.getInterpolatedData(this.getDataObj(t, fraction));
            var distanceFromCenter = this.distance(dataForT, star, t);
            var moonRadius = dataForT.DiameterTopo / 2;
            d = distanceFromCenter - moonRadius;
            if (lastD * d < 0) {
                timeStep *= -0.5;
            }
            t += timeStep;
            lastD = d;
        }

        if (Math.abs(t - jde) >= 0.25)
            return false;

        var degra = Math.PI / 180;
        var dRaDeg = 15 * (star.getRa(t) - dataForT.RaTopo);
        if (dRaDeg > 180) {
            dRaDeg -= 360;
        } else if (dRaDeg < -180) {
            dRaDeg += 360;
        }

        var dx = Math.cos(dataForT.DecTopo * degra) * Math.tan(star.getDec(t) * degra) - Math.sin(dataForT.DecTopo * degra) * Math.cos(dRaDeg * degra)
        var dy = Math.sin(dRaDeg * degra);
        var PA = Math.atan2(dy, dx) / degra;
        if (PA < 0)
            PA += 360;

        return { t: t, PA: PA };
    },

    getOccultedStars: function (startJDE, numberOfDays) {
        var s = OccultationsData.getOccultedStars_noTimings(startJDE, numberOfDays);
        var data = {};

        for (var jdeString in s) {
            var jde = Number(jdeString);
            var stars = s[jdeString];
            for (var hrId in stars) {
                var star = stars[hrId];
                var start = OccultationsData.getStartOrEndContact(star, jde, true);
                var end = OccultationsData.getStartOrEndContact(star, jde, false);
                if (start && end && start.t < end.t && (jde - start.t) < 1 && (end.t - jde) < 1) {
                    data[jdeString] = {
                        star: star,
                        start: start,
                        end: end
                    };
                }
            }
        }
        return data;
    }
};

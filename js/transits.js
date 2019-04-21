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

var Transits = {
    ____Sun : false,

    Sun : function() {
        if (!Transits.____Sun) {
            Transits.____Sun = InterpolatedData.Sun();
            Transits.____Sun.daysBetweenDataPoints = 5;
        }
        return Transits.____Sun;
    },

    JdOfClosestInferiorConjunction : function (startJd, inferiorPlanet) {

        var planetDataForJd = false;

        var computeConjunction = function(jd) {
            var Sun = Transits.Sun();
            var conjunctionJd = jd;
            var lastConjunctionJd = conjunctionJd - 1;

            var sunDataForJd       = false;
            var sunDataForBeforeJd = Sun.getDataAsObjectForJD(lastConjunctionJd);
            var planetDataForBeforeJd = inferiorPlanet.getDataAsObjectForJD(lastConjunctionJd);
            
            for (var i = 0; i < 100 && Math.abs(lastConjunctionJd - conjunctionJd) > 1/(24 * 3600); i++) {

                sunDataForJd    = Sun.getDataAsObjectForJD(conjunctionJd);
                planetDataForJd = inferiorPlanet.getDataAsObjectForJD(conjunctionJd);

                var dRaSun = sunDataForJd.RA - sunDataForBeforeJd.RA;
                var dRaPlanet = planetDataForJd.RA - planetDataForBeforeJd.RA;
                var dRaSunPlanet = sunDataForJd.RA - planetDataForJd.RA;
                if (dRaSunPlanet > 12)
                    dRaSunPlanet -= 24;
                else if (dRaSunPlanet < -12)
                    dRaSunPlanet += 24;

                var tUntilConjunction = dRaSunPlanet / (dRaSun - dRaPlanet) * (lastConjunctionJd - conjunctionJd);
                if (tUntilConjunction > 5) {
                        tUntilConjunction = 5;
                } else if (tUntilConjunction < -5) {
                        tUntilConjunction = -5;
                }
                lastConjunctionJd = conjunctionJd;
                conjunctionJd += tUntilConjunction;
                planetDataForBeforeJd = planetDataForJd;
                sunDataForBeforeJd = sunDataForJd;
            }

            return conjunctionJd;
        }
        var inferiorConjunctionJd = computeConjunction (startJd);

        if (planetDataForJd.DistanceToEarth > 1) {
            inferiorConjunctionJd = computeConjunction (inferiorConjunctionJd + 0.5 * inferiorPlanet.synodicPeriod);
        }
        
        return inferiorConjunctionJd;
    },

    get : function (jd, numDays) {
        var s = {};

        var interpolated = {
            "Mercury" : false,
            "Venus" : false
        };

        for (var key in interpolated) {
            interpolated[key] = InterpolatedData[key]();
            interpolated[key].daysBetweenDataPoints = 5;
        }

        interpolated["Mercury"]['synodicPeriod'] = 0.317 * 365.25;
        interpolated["Venus"  ]['synodicPeriod'] = 1.599 * 365.25;

        var conjunctionJd = 0;
        
        for (var planetName in interpolated) {
            var planetDataSource = interpolated[planetName];

            conjunctionJd = jd;
            while (conjunctionJd - jd < numDays) {
                conjunctionJd = Transits.JdOfClosestInferiorConjunction(conjunctionJd, planetDataSource);

                if (conjunctionJd < jd) {
                    conjunctionJd += planetDataSource.synodicPeriod;
                    continue;
                }
                
                var Sun = Transits.Sun();
                var sunDataAtConjunction = Sun.getDataAsObjectForJD(conjunctionJd);
                var planetDataForJd = planetDataSource.getDataAsObjectForJD(conjunctionJd);

                var distanceBetweenPlanetAndSun = DistanceDFromEqCoordinates(sunDataAtConjunction.RA, sunDataAtConjunction.Dec,
                    planetDataForJd.RA, planetDataForJd.Dec);

                if (distanceBetweenPlanetAndSun < sunDataAtConjunction.Diameter * 0.75) {
                    var oldSunDT = Sun.daysBetweenDataPoints;
                    var oldPlanetDT = planetDataSource.daysBetweenDataPoints;

                    planetDataSource.daysBetweenDataPoints = 1/24;
                    Sun.daysBetweenDataPoints = 1/24;

                    var accuracy = 1 / (24 * 3600); // quarter of a minute

                    var C1 = ContactDetails (Sun, planetDataSource,
                                                       (sunDataAtConjunction.Diameter + planetDataForJd.Diameter)/2,
                                                       conjunctionJd -4/24, accuracy);
                    if (C1) {
                        var C2 = ContactDetails (Sun, planetDataSource,
                                                           (sunDataAtConjunction.Diameter - planetDataForJd.Diameter)/2,
                                                           C1.t + 20/(60 * 24), accuracy);
                        var C3 = ContactDetails (Sun, planetDataSource,
                                                           (sunDataAtConjunction.Diameter - planetDataForJd.Diameter)/2,
                                                           conjunctionJd + 4/24, accuracy);
                        var C4 = ContactDetails (Sun, planetDataSource,
                                                           (sunDataAtConjunction.Diameter + planetDataForJd.Diameter)/2,
                                                           C3.t - 20/(60*24), accuracy);

                        var tMax = 0.25 * (C1.t + C2.t + C3.t + C4.t);

                        var sunDataAtMax = Sun.getDataAsObjectForJD(tMax, false, false, true);
                        var planetDataAtMax = planetDataSource.getDataAsObjectForJD(tMax, false, false, true);

                        planetDataSource.daysBetweenDataPoints = oldSunDT;
                        Sun.daysBetweenDataPoints = oldPlanetDT;

                        var distAtTMaxD = DistanceDFromEqCoordinates (sunDataAtMax.RaTopo, sunDataAtMax.DecTopo, 
                                                                      planetDataAtMax.RaTopo, planetDataAtMax.DecTopo);

                        s[conjunctionJd] = {
                            name: planetName,
                            C1 : C1,
                            C2 : C2,
                            C3 : C3,
                            C4: C4,
                            tMax : tMax,
                            distAtTMaxD : distAtTMaxD
                        };    
                    }
                }
                conjunctionJd += planetDataSource.synodicPeriod;
            }
        }

        var datesArr = [];
        for (var k in s) {
                datesArr.push(Number(k));
        }
        var res = {};
        datesArr.sort();
        for (var i = 0; i < datesArr.length; i++) {
                res[datesArr[i]] = s[datesArr[i]];
        }

        return res;
    }
};

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
    getDataObj : function(JDE, fraction) {
        if  (!fraction) {
            fraction = 1;
        }
        
        var jd3 =  Math.floor(JDE/fraction)*fraction;
        return { T1: jd3 - 2 * fraction, 
                 T2: jd3 - fraction, 
                 T3: jd3, 
                 T4: jd3 + fraction, 
                 T5: jd3 + 2 * fraction, 
                 n: (JDE - jd3) / fraction};
    },

    getOccultedStars_noTimings : function (jde, numberOfDays) {

        function sind (x) {
            return Math.sin(x * Math.PI/180);
        }
        function cosd (x) {
            return Math.cos(x * Math.PI/180);
        }

        var getDataObj = OccultationsData.getDataObj;

        var occultedStars = {};
        var dayIncrement = 1;
        var moonData = new DataForNow(MoonData);
        var stepsCount = 12;
        var jdeIncrement = dayIncrement / stepsCount;

        var treatedJde = {};

        var deg2rad = Math.PI / 180;
        var lat = Location.latitude * deg2rad;
        var long = Location.longitude * deg2rad;

        var lst =  (GetAAJS().Sidereal.ApparentGreenwichSiderealTime(jde) * 15 + 
                    Location.longitude) * deg2rad;
        var utc2lstRatio = 1.00273737909350795;
        var lstIncrement = jdeIncrement * 2 * Math.PI * utc2lstRatio;
        for (var d = 0; d < numberOfDays; d += dayIncrement) {

            for (var step = 0; step < stepsCount; step++,  jde += jdeIncrement, lst += lstIncrement) {
                
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

                var dataForJd = moonData.getInterpolatedData(getDataObj(jde, 6/24));
                var ra = dataForJd.RaTopo;
                var dec = dataForJd.DecTopo;
                var starsThatMayBeOcculted = OccultableStars.getStarsNear(ra, dec, jde);


                for (var i = 0; i < starsThatMayBeOcculted.length; i++) {
                    var star = starsThatMayBeOcculted[i];
                    if (Math.round(star.Vmag * 10) / 10 > noDimmerThanThis_m){
                        continue;
                    }

                    var starDecR = star.DEd * deg2rad;

                    // get the time of conjunction
                    var conjunctionJde = jde;
                    var lastConjunctionJde = conjunctionJde - 1;
                    for (var cjIndex = 0; cjIndex < 10 && Math.abs(conjunctionJde - lastConjunctionJde) > 1e-6; cjIndex++) {
                        lastConjunctionJde = conjunctionJde;
                        dataForJd =  moonData.getInterpolatedData(getDataObj(conjunctionJde, 4/24));
                        var beforeData = moonData.getInterpolatedData(getDataObj(conjunctionJde - 1/24, 4/24));
                        var t = (star.RAh - beforeData.RaTopo) / (dataForJd.RaTopo - beforeData.RaTopo);
                        conjunctionJde = conjunctionJde - 1/24 + t/24;
                    }
                    
                    var conjunctionId = conjunctionJde + " " + star.RAh + " " + star.DEd;

                    if (treatedJde[conjunctionId]) {
                        continue;
                    }
                    treatedJde[conjunctionId] = true;
                    // interpolate new values for moon
                   
                    var conjunctionLst = (GetAAJS().Sidereal.ApparentGreenwichSiderealTime(conjunctionJde) * 15 + 
                    Location.longitude) * deg2rad;

                    var starAltR =  Math.asin (Math.sin (starDecR) * Math.sin (lat) + Math.cos (starDecR) * Math.cos (lat) * Math.cos (conjunctionLst - star.RAh * 15 * deg2rad));

                    if (starAltR <= 0) {
                        continue;
                    }

                    var dataAtConjunction = dataForJd;
                    var conjunctionDec = dataAtConjunction.DecTopo;
                    var conjunctionDiameter = dataAtConjunction.diameter;
                    // compute the distance

                    var dist = Math.acos(sind(conjunctionDec)*sind(star.DEd) + 
                                         cosd(conjunctionDec)*cosd(star.DEd));
                    dist *= 180/Math.PI;
                    if (dist < conjunctionDiameter * 0.75) 
                    {
                        var key = Math.round(conjunctionJde * 1e6) / 1e6;

                        if (!occultedStars[key]) {
                            occultedStars[key] = {};
                        }
                        occultedStars[key][star.HR] = star;
                    }                   
                }
            }

        }
        return occultedStars;
    },

    distance : function  (dataForJd, star) {
        var degra = Math.PI/180;
        var moonDecRad = dataForJd.DecTopo * degra;
        var moonRaRad = dataForJd.RaTopo*15* degra;

        var starDecRad = star.DEd * degra;
        var starRaRad = star.RAh*15 * degra;

        var dist = Math.acos(Math.sin(moonDecRad)*Math.sin(starDecRad) + 
                   Math.cos(moonDecRad)*Math.cos(starDecRad)*Math.cos(moonRaRad - starRaRad));
        dist *= 180/Math.PI;
        return dist;
    },

    getStartOrEndContact : function (star, jde, isForStart) {
        var t = jde;
        var d = 1;
        var lastD = 1;
        var epsD = 1e-6;
        var fraction = 2/24;
        if (isForStart) {
            t -= fraction;
        } else {
            t += fraction;
        }
        var timeStep = (jde - t) / 2;

        var moonData = new DataForNow(MoonData);
        var dataForT = false;
        
        for (var i = 0; i < 100 && Math.abs(d) > epsD && Math.abs(t - jde) < 0.25; i++) {
            dataForT = moonData.getInterpolatedData(this.getDataObj(t, fraction));
            var distanceFromCenter = this.distance(dataForT, star);
            var moonRadius = dataForT.diameter/2;
            d = distanceFromCenter - moonRadius;
            if (lastD * d < 0) {
                timeStep *= -0.5;
            }
            t += timeStep;
            lastD = d;
        }

        if (Math.abs(t - jde) >= 0.25)
            return false;

        var degra = Math.PI/180;
        var dRaDeg = 15*(star.RAh - dataForT.RaTopo);
        if (dRaDeg > 180) {
            dRaDeg -= 360;
        } else if (dRaDeg < -180) {
            dRaDeg += 360;
        }

        var dx = Math.cos(dataForT.DecTopo * degra)*Math.tan(star.DEd * degra)-Math.sin(dataForT.DecTopo * degra)*Math.cos(dRaDeg * degra)
        var dy = Math.sin(dRaDeg * degra);
        var PA = Math.atan2(dy, dx) / degra;
        if (PA < 0)
            PA += 360;

        return {t:t, PA: PA};
    },

    getOccultedStars : function (startJDE, numberOfDays) {
        var s = OccultationsData.getOccultedStars_noTimings (startJDE, numberOfDays);
        var data = {};

        for (var jdeString in s) {
            var jde = Number(jdeString);
            var stars = s[jdeString];
            for (var hrId in stars) {
                var star = stars[hrId];
                var start = OccultationsData.getStartOrEndContact(star, jde, true);
                var end = OccultationsData.getStartOrEndContact(star, jde, false);
                if (start && end) {
                    data [jdeString] = {
                        star : star,
                        start : start,
                        end : end
                    };
                }
            }
        }
        return data;        
    }
};

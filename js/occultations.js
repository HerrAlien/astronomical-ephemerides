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

var Occultations = {
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

    getOccultedStars_noTimings : function (startJD_utc, numberOfDays) {

        function sind (x) {
            return Math.sin(x * Math.PI/180);
        }
        function cosd (x) {
            return Math.cos(x * Math.PI/180);
        }

        var getDataObj = Occultations.getDataObj;

        var occultedStars = {};
        var dayIncrement = 1;
        var moonData = new DataForNow(MoonData);
        var dt = GetAAJS().DynamicalTime.DeltaT(startJD_utc)/(3600 * 24);
        var jde = startJD_utc + dt;
        var stepsCount = 48;
        var jdeIncrement = dayIncrement / stepsCount;

        for (var d = 0; d < numberOfDays; d += dayIncrement) {

            for (var step = 0; step < stepsCount; step++,  jde += jdeIncrement ) {
                var dataForJd = moonData.getInterpolatedData(getDataObj(jde, 2*jdeIncrement));
                var ra = dataForJd.RaTopo;
                var dec = dataForJd.DecTopo;
                var starsThatMayBeOcculted = OccultableStars.getStarsNear(ra, dec, jde);

                for (var i = 0; i < starsThatMayBeOcculted.length; i++) {
                    var star = starsThatMayBeOcculted[i];            

                    // get the time of conjunction
                    var t = 1;
                    var conjunctionJde = jde;
                    for (var tIndex = 0; tIndex < 100 && Math.abs(t) > 1e-6; tIndex++) {
                        dataForJd =  moonData.getInterpolatedData(getDataObj(conjunctionJde, 2*jdeIncrement));
                        var beforeData = moonData.getInterpolatedData(getDataObj(conjunctionJde - 1/24, 2*jdeIncrement));
                        t = (star.RAh - beforeData.RaTopo) / (dataForJd.RaTopo - beforeData.RaTopo);
                        conjunctionJde += t / 24;
                    }
                    // interpolate new values for moon
                    
                    var dataAtConjunction = dataForJd;
                    var conjunctionDec = dataAtConjunction.DecTopo;
                    var conjunctionDiameter = dataAtConjunction.diameter;
                    // compute the distance

                    var dist = Math.acos(sind(conjunctionDec)*sind(star.DEd) + 
                                         cosd(conjunctionDec)*cosd(star.DEd));
                    dist *= 180/Math.PI;
                    if (dist <= conjunctionDiameter/2) 
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
        
        for (var i = 0; i < 100 && Math.abs(d) > epsD; i++) {
            var dataForT = moonData.getInterpolatedData(this.getDataObj(t, fraction));
            var distanceFromCenter = this.distance(dataForT, star);
            var moonRadius = dataForT.diameter/2;
            d = distanceFromCenter - moonRadius;
            if (lastD * d < 0) {
                timeStep *= -0.5;
            }
            t += timeStep;
            lastD = d;
        }

        var degra = Math.PI/180;
        var dRa = 15*(star.RAh - dataForT.RaTopo);
        if (dRa > 180) {
            dRa -= 360;
        } else if (dRa < -180) {
            dRa += 360;
        }
        var dx = dRa * Math.cos(dataForT.DecTopo * degra);
        var PA = Math.atan2(star.DEd - dataForT.DecTopo, dx) / degra;
        if (PA < 0)
            PA += 360;

        return {t:t, PA: PA};
    },

    getOccultedStars : function (startJDE, numberOfDays) {
        var s = Occultations.getOccultedStars_noTimings (startJDE, numberOfDays);
        var data = {};

        for (var jdeString in s) {
            var jde = Number(jdeString);
            var stars = s[jdeString];
            for (var hrId in stars) {
                var star = stars[hrId];
                data [jdeString] = {
                    star : star,
                    start : Occultations.getStartOrEndContact(star, jde, true),
                    end : Occultations.getStartOrEndContact(star, jde, false)
                };
            }
        }
        return data;        
    }
};
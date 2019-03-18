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
    getOccultedStars : function (startJde, numberOfDays) {

    function sind (x) {
        return Math.sin(x * Math.PI/180);
    }
    function cosd (x) {
        return Math.cos(x * Math.PI/180);
    }

    function getDataObj (JDE) {
        var jd3 =  Math.floor(JDE) + 0.5;
        return { T1: jd3 - 2, T2: jd3 - 1, T3: jd3, T4: jd3 + 1, T5: jd3 + 2, n: JDE - jd3};
    }


        var occultedStars = {};
        var dayIncrement = 1;
        var moonData = new DataForNow(MoonData);
        var dt = GetAAJS().DynamicalTime.DeltaT(startJde)/(3600 * 24);
        var jde = startJde + dt;
        var stepsCount = 48;
        var jdeIncrement = dayIncrement / stepsCount;

        for (var d = 0; d < numberOfDays; d += dayIncrement) {

            for (var step = 0; step < stepsCount; step++,  jde += jdeIncrement ) {
                var dataForJd = moonData.getInterpolatedData(getDataObj(jde));
                var ra = dataForJd.RaTopo;
                var dec = dataForJd.DecTopo;
                var starsThatMayBeOcculted = OccultableStars.getStarsNear(ra, dec, jde);

                for (var i = 0; i < starsThatMayBeOcculted.length; i++) {
                    var star = starsThatMayBeOcculted[i];            

                    // get the time of conjunction
                    var t = 1;
                    var conjunctionJde = jde;
                    for (var tIndex = 0; tIndex < 100 && Math.abs(t) > 1e-6; tIndex++) {
                        dataForJd =  moonData.getInterpolatedData(getDataObj(conjunctionJde));
                        var beforeData = moonData.getInterpolatedData(getDataObj(conjunctionJde - 1/24));
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
    }
};
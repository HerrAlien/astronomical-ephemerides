/* ephemeris - a software astronomical almanach 

Copyright 2019 Herr_Alien <alexandru.garofide@gmail.com>

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

var LunarXData = {
    
    moonData : false,

    getEvent : function(jd) {        

        // get the closest first quarter moon.
        var k = AAJS.Moon.kForJD(jd);
        var firstQuarterK = Math.floor(k) + 0.25;

        if ((k - firstQuarterK) > 0.1) {
            firstQuarterK = Math.ceil(k) + 0.25;
        }

        var currentLunarXJd = AAJS['Moon']['JDforK'](firstQuarterK);

        if (!LunarXData.moonData) {
            LunarXData.moonData = MoonData;// new InterpolatedPlanetData(MoonData, 1);
        }

        var xFunc = function (jd) {
            var dateData = LunarXData.moonData.getDataAsObjectForJD(jd, false, true);
            return dateData.Colongitude - 28 * Math.sin(dateData.b0 * Math.PI / 180) - 358;
        }

        var moonMaidenFunc = function (jd) {
            var dateData = LunarXData.moonData.getDataAsObjectForJD(jd, false, true);
            return dateData.Colongitude + 40.3 * Math.sin(dateData.b0 * Math.PI / 180) - 33.2;
        }

        var dayFraction = 6/24;

        var err = xFunc(currentLunarXJd);
        var nextErr = xFunc(currentLunarXJd + dayFraction);
        var slope = (nextErr - err) / dayFraction;
        
        var jdCorrection = err / slope;

        currentLunarXJd -= jdCorrection;

        var currentMoonMaidenJd = currentLunarXJd + 4;
        err = moonMaidenFunc(currentLunarXJd);
        nextErr = moonMaidenFunc(currentLunarXJd + dayFraction);
        slope = (nextErr - err) / dayFraction;
        
        var jdCorrection = err / slope;
        currentMoonMaidenJd -= jdCorrection;

        return { "currentLunarXJd" : currentLunarXJd, 
                 "nextFirstQuarter" : currentLunarXJd + 29,
                 "currentMoonMaiden" : currentMoonMaidenJd };
    }
};

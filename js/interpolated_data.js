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

// ---------------------------- model side ----------------------------------------

var InterpolatedData = { };

(function (module) {

    function DataForNow(dataSource) {
        this.dataSource = dataSource;
    }

    DataForNow.prototype['getInterpolatedData'] = function (datesObj, 
                                                            computeRiseSet, 
                                                            computePhysicalData, 
                                                            computeTopocentricCoordinates) {
                                                                
        var obj1 = this.dataSource.getDataAsObjectForJD(datesObj.T1, computeRiseSet, computePhysicalData);
        var obj2 = this.dataSource.getDataAsObjectForJD(datesObj.T2, computeRiseSet, computePhysicalData);
        var obj3 = this.dataSource.getDataAsObjectForJD(datesObj.T3, computeRiseSet, computePhysicalData);
        var obj4 = this.dataSource.getDataAsObjectForJD(datesObj.T4, computeRiseSet, computePhysicalData);
        var obj5 = this.dataSource.getDataAsObjectForJD(datesObj.T5, computeRiseSet, computePhysicalData);

        if (computeTopocentricCoordinates) {
            var parallax = Math.atan2(6.378137e+6, 149597870700 * obj3.DistanceToEarth) * 180 / Math.PI;
            var objs = [obj1, obj2, obj3, obj4, obj5];
            var times = [datesObj.T1, datesObj.T2, datesObj.T3, datesObj.T4, datesObj.T5];
            for (var i = 0; i < objs.length; i++) {
                var current = objs[i];
                if (!current["RaTopo"]) {
                    var T = times[i];
                    var topoCoords = AAJS['Globe']['EquatorialGeocentricToTopocentric'] (current.RA, current.Dec,
                        parallax, T, Location.latitude, Location.longitude, Location.altitude);
                    current["RaTopo"] = topoCoords["X"];
                    current["DecTopo"] = topoCoords["Y"];
                    current["Parallax"] = parallax;
                }
            }
        }

        var interpolationLimits = {
            "RA": 24,
            "RaTopo" : 24,
            "L0" : 360,
            "CentralMeridianLongitude" : 360,
            "CentralMeridianApparentLongitude_System1" : 360,
            "CentralMeridianApparentLongitude_System2" : 360,
            "Colongitude" : 360,
            "b0" : 360
        };
        
        var interpolatedObject = {};
        for (var key in obj1) {
            interpolatedObject[key] = this.interpolate(datesObj.n, obj1[key], obj2[key], obj3[key], obj4[key], obj5[key], interpolationLimits[key]);
        }

        interpolatedObject.Rise = obj3.Rise;
        interpolatedObject.MeridianTransit = obj3.MeridianTransit;
        interpolatedObject.Set = obj3.Set;

        return interpolatedObject;
    }

    DataForNow.prototype['interpolate'] = function (n, y1, y2, y3, y4, y5, limit) {

        var a = y2 - y1;
        var b = y3 - y2;
        var c = y4 - y3;
        var d = y5 - y4;

        if (!!limit) {
            var halfLimit = 0.5 * limit;
            if (Math.abs(a) > halfLimit || Math.abs(b) > halfLimit || Math.abs(c) > halfLimit || Math.abs(d) > halfLimit) {
                if (y1 < halfLimit)
                    y1 += limit;
                if (y2 < halfLimit)
                    y2 += limit;
                if (y3 < halfLimit)
                    y3 += limit;
                if (y4 < halfLimit)
                    y4 += limit;
                if (y5 < halfLimit)
                    y5 += limit;
            }

            a = y2 - y1;
            b = y3 - y2;
            c = y4 - y3;
            d = y5 - y4;
        }

        var e = b - a;
        var f = c - b;
        var g = d - c;

        var h = f - e;
        var j = g - f;

        var k = j - h;

        var n2 = n * n;
        var n2decr = n2 - 1;

        var res = y3 + 0.5 * n * (b + c) + 0.5 * n2 * f + n * n2decr * (h + j) / 12 + n2 * n2decr * k / 24;

        if (!!limit) {
            if (res > limit)
                res -= limit;
        }

        return res;
    }

    function getDataObjForInterpolation (JDE, daysBetweenDataPoints) {
        if (!daysBetweenDataPoints) {
            daysBetweenDataPoints = 1;
        }

        var jd3 = Math.round(JDE / daysBetweenDataPoints) * daysBetweenDataPoints;
        return {
            T1: jd3 - 2 * daysBetweenDataPoints,
            T2: jd3 - daysBetweenDataPoints,
            T3: jd3,
            T4: jd3 + daysBetweenDataPoints,
            T5: jd3 + 2 * daysBetweenDataPoints,
            n: (JDE - jd3) / daysBetweenDataPoints
        };
    };

    function InterpolatedPlanetData(dataObject, daysBetweenDataPoints) {
        var interpolationObject = new DataForNow (dataObject);
        this.daysBetweenDataPoints = daysBetweenDataPoints;
        if (!this.daysBetweenDataPoints) {
            this.daysBetweenDataPoints = 1; // high accuracy
        }
        this.getDataAsObjectForJD = function (JDE, computeRiseSet, computePhysicalData, computeTopocentricCoordinates) {
            var datesObj = getDataObjForInterpolation (JDE, this.daysBetweenDataPoints);
            var interpolatedData = interpolationObject.getInterpolatedData (datesObj, computeRiseSet, computePhysicalData, computeTopocentricCoordinates);
            return interpolatedData;
        }
        this.getInterpolatedData = function (datesObj, computeRiseSet, computePhysicalData, computeTopocentricCoordinates) { 
            return interpolationObject.getInterpolatedData(datesObj, computeRiseSet, computePhysicalData, computeTopocentricCoordinates); 
        };
    }

    // ================ definition of InterpolatedData =========================
    module['Sun'] =     function() { return new InterpolatedPlanetData(SunData,     5); };
    module['Moon'] =    function() { return new InterpolatedPlanetData(MoonData,    5); };
    module['Mercury'] = function() { return new InterpolatedPlanetData(MercuryData, 5); };
    module['Venus'] =   function() { return new InterpolatedPlanetData(VenusData,   5); };
    module['Mars'] =    function() { return new InterpolatedPlanetData(MarsData,    5); };
    module['Jupiter'] = function() { return new InterpolatedPlanetData(JupiterData, 5); };
    module['Saturn'] =  function() { return new InterpolatedPlanetData(SaturnData,  5); };
    module['Uranus'] =  function() { return new InterpolatedPlanetData(UranusData,  5); };
    module['Neptune'] = function() { return new InterpolatedPlanetData(NeptuneData, 5); };

})(InterpolatedData);

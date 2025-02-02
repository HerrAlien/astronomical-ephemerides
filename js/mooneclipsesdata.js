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

function MoonEclipse(JD) {

    var sunData = SunData.getDataAsObjectForJD(JD);
    var moonData = MoonData.getDataAsObjectForJD(JD);

    var hourFration = 3;
    var dJd = hourFration / 24.0;
    var dT = 2 * hourFration;

    var sunDataPlus = SunData.getDataAsObjectForJD(JD + dJd);
    var moonDataPlus = MoonData.getDataAsObjectForJD(JD + dJd);
    var sunDataMinus = SunData.getDataAsObjectForJD(JD - dJd);
    var moonDataMinus = MoonData.getDataAsObjectForJD(JD - dJd);


    this.dRaSun = 15 * (sunDataPlus.RA - sunDataMinus.RA) / dT;
    this.dDecSun = (sunDataPlus.Dec - sunDataMinus.Dec) / dT;
    this.dRaMoon = 15 * (moonDataPlus.RA - moonDataMinus.RA) / dT;
    this.dDecMoon = (moonDataPlus.Dec - moonDataMinus.Dec) / dT;

    // this is in UTC.        
    this.JD = JD - GetAAJS().DynamicalTime.DeltaT(JD) / (3600 * 24);
    this.ParallaxSun = sunData.Parallax;
    this.ParallaxMoon = moonData.Parallax;

    this.MoonDiameter = moonData.Diameter;
    this.SunDiameter = sunData.Diameter;

    this.RaSun = sunData.RA * 15;
    this.DecSun = sunData.Dec;
    this.RaMoon = moonData.RA * 15;
    this.DecMoon = moonData.Dec;

    var shadowRa = 180 + this.RaSun;
    if (shadowRa > 360)
        shadowRa -= 360;

    this.x0 = (this.RaMoon - shadowRa) * Math.cos(this.DecMoon * Math.PI / 180);;
    this.y0 = this.DecSun + this.DecMoon;
    this.dx = (this.dRaMoon - this.dRaSun) * Math.cos(this.DecMoon * Math.PI / 180);
    this.dy = this.dDecSun + this.dDecMoon;
    this.slope = this.dy / this.dx;

    /* Chauvenet ... */
    //        this.umbralRadius = 1.02 * ( 0.998340 * this.ParallaxMoon - this.SunDiameter/2 + this.ParallaxSun);
    //        this.penumbralRadius = 1.02 * (0.998340 * this.ParallaxMoon + this.SunDiameter/2 + this.ParallaxSun);

    /* Danjon ... */
    this.umbralRadius = 1.01 * (this.ParallaxMoon - this.SunDiameter / 2 + this.ParallaxSun);
    this.penumbralRadius = 1.01 * (this.ParallaxMoon + this.SunDiameter / 2 + this.ParallaxSun);
}

(function () {

    MoonEclipse.prototype['computeMagnitudes'] = function () {

        var denominatorAtMinimum = 1 + this.slope * this.slope;

        this.xMinDistance = -(this.slope * this.y0) / denominatorAtMinimum;
        this.yMinDistance = this.y0 + this.slope * this.xMinDistance;
        this.minDistance = Math.sqrt(this.xMinDistance * this.xMinDistance +
                                               this.yMinDistance * this.yMinDistance);

        var moonRadius = 0.5 * this.MoonDiameter;
        // if the minimum distance is smaller than one of the radii, we have an eclipse.
        this.umbralTotalEclipse = this.minDistance <= this.umbralRadius - moonRadius;
        this.penumbralTotalEclipse = this.minDistance <= this.penumbralRadius - moonRadius;

        this.umbralPartialEclipse = this.minDistance <= this.umbralRadius + moonRadius;
        this.penumbralPartialEclipse = this.minDistance <= this.penumbralRadius + moonRadius;

        this.magnitude = (this.umbralRadius - this.minDistance + moonRadius) / this.MoonDiameter;
        this.penumbralMagnitude = (this.penumbralRadius - this.minDistance + moonRadius) / this.MoonDiameter;

        this.eclipse = this.umbralTotalEclipse || this.penumbralTotalEclipse || this.umbralPartialEclipse || this.penumbralPartialEclipse;
    }

    MoonEclipse.prototype['timeFromXPos'] = function (X) {
        return this.JD + (((X - this.x0) / this.dx) / 24);
    }

    MoonEclipse.prototype['getYOnLineForX'] = function (X) {
        return this.y0 + this.slope * (X - this.x0);
    }

    MoonEclipse.prototype['corectDeltas'] = function () {
        var ang = Math.sqrt(this.x0 * this.x0 + this.y0 * this.y0);
        var cosAng = Math.cos(ang * Math.PI / 180);
        this.umbralRadius /= cosAng;
        this.penumbralRadius *= cosAng;
        this.dx *= Math.cos(this.x0 * Math.PI / 180);
        this.dy *= Math.cos(this.y0 * Math.PI / 180);
    }

})();


var MoonEclipsesData = {

    sinodicPeriod: 29.530587981,

    getOppositionAroundJD: function (JD) {
        var jd = MoonEclipsesData.getOppositionJD(JD);

        var result = new MoonEclipse(jd);
        result['eclipse'] = false;
        return result;
    },

    getOppositionJD: function (startJD) {
        var jd = startJD;
        var sunData = false;
        var moonData = false;
        var eps = 1e-4;
        var dSunData = false;
        var dMoonData = false;
        var oppositionTimeCorrection = 0;
        var dJd = 0.5 / 24;

        var counter = 0;
        do {

            sunData = SunData.getDataAsObjectForJD(jd);
            moonData = MoonData.getDataAsObjectForJD(jd);

            dSunData = SunData.getDataAsObjectForJD(jd + dJd);
            dMoonData = MoonData.getDataAsObjectForJD(jd + dJd);

            var opposingSunRA = 12 + sunData.RA;
            var moonRA_1 = moonData.RA;
            if (Math.abs(opposingSunRA - moonRA_1) > 12) {
                if (opposingSunRA < moonRA_1)
                    opposingSunRA += 24;
                else
                    moonRA_1 += 24;
            }

            var dMoonDataRA = dMoonData.RA;
            var moonRA_2 = moonRA_1;
            if (Math.abs(dMoonDataRA - moonRA_2) > 12) {
                if (dMoonDataRA < moonRA_2)
                    dMoonDataRA += 24;
                else
                    moonRA_2 += 24;
            }

            var sunRA = sunData.RA;
            var dSunDataRA = dSunData.RA;

            if (Math.abs(dSunDataRA - sunRA) > 12) {
                if (dSunDataRA < sunRA)
                    dSunDataRA += 24;
                else
                    sunRA += 24;
            }

            oppositionTimeCorrection = dJd * (opposingSunRA - moonRA_1) /
                                           ((dMoonDataRA - moonRA_2) - (dSunDataRA - sunRA));
            jd += oppositionTimeCorrection;
            counter++;
            if (counter > 25) {
                throw "Cannot obtain JD for opposition JD=" + startJD;
            }

        } while (Math.abs(oppositionTimeCorrection) > eps);
        return jd;
    },


    // needs an X0
    addTimingsAndGeometry: function (opposition) {

        // then compute the minimum distance between the center of the Moon and the axes of these cones
        // - first, the equation of the line that describes the approximate motion of the moon

        opposition.computeMagnitudes();

        if (opposition['eclipse']) {
            opposition['MoonPositions'] = {};
            opposition['Timings'] = { 'Maximum': opposition.JD + (opposition['xMinDistance'] / opposition.dx) / 24 };
        }

        if (opposition['umbralPartialEclipse']) {
            opposition['MoonPositions']['Umbral'] = MoonEclipsesData.computeMoonPositionsAtContact(opposition, opposition['umbralRadius']);
            opposition['Timings']['Umbral'] = MoonEclipsesData.computeTimings(opposition, opposition['MoonPositions']['Umbral']);
        }

        if (opposition['penumbralPartialEclipse']) {
            opposition['MoonPositions']['Penumbral'] = MoonEclipsesData.computeMoonPositionsAtContact(opposition, opposition['penumbralRadius']);
            opposition['Timings']['Penumbral'] = MoonEclipsesData.computeTimings(opposition, opposition['MoonPositions']['Penumbral']);
        }

        return opposition;
    },

    quadraticEquationSolutions: function (opposition, distance, deltaSigns) {

        var squaredDistance = distance * distance;
        var squaredSlope = opposition.slope * opposition.slope;
        var yResidue = opposition.y0 - opposition.slope * opposition.x0;
        var denominatorAtMinimum = 1 + squaredSlope;

        var discriminantAtExternalTangent = 4 * (squaredSlope * squaredDistance - yResidue * yResidue + squaredDistance);

        var x = [];
        for (var i = 0; i < deltaSigns.length; i++) {
            x[i] = (-2 * opposition.slope * yResidue + deltaSigns[i] * Math.sqrt(discriminantAtExternalTangent)) / (2 * denominatorAtMinimum);
        }
        return x;
    },

    // needs an X0
    computeMoonPositionsAtContact: function (opposition, coneRadius) {
        var results = {};
        var distanceAtExternalTangent = coneRadius + opposition.MoonDiameter / 2;

        var externalXContacts = MoonEclipsesData.quadraticEquationSolutions(opposition, distanceAtExternalTangent, [-1, 1]);

        results["firstContact"] = {
            "X": externalXContacts[0],
            "Y": opposition.getYOnLineForX(externalXContacts[0])
        };

        results["lastContact"] = {
            "X": externalXContacts[1],
            "Y": opposition.getYOnLineForX(externalXContacts[1])
        };


        var distanceAtInternalTangent = coneRadius - opposition.MoonDiameter / 2;
        var internalXContacts = MoonEclipsesData.quadraticEquationSolutions(opposition, distanceAtInternalTangent, [-1, 1]);

        results["beginFullImmersion"] = {
            "X": internalXContacts[0],
            "Y": opposition.getYOnLineForX(internalXContacts[0])
        };

        results["endFullImmersion"] = {
            "X": internalXContacts[1],
            "Y": opposition.getYOnLineForX(internalXContacts[1])
        };

        return results;
    },

    computeTimings: function (opposition, moonPosAtContact) {
        var result = {};

        for (var position in moonPosAtContact) {
            result[position] = opposition.timeFromXPos(moonPosAtContact[position].X);
            if (isNaN(result[position]))
                result[position] = false;
        }

        return result;
    },

    clone: function (obj) {
        var res = {};
        for (var key in obj) {
            if (typeof obj[key] == 'Object')
                res[key] = MoonEclipsesData.clone(obj[key]);
            else
                res[key] = obj[key];
        }
        return res;
    },

    calculateEclipseForJD: function (JD) {
        var oppositionData = MoonEclipsesData.getOppositionAroundJD(JD);
        oppositionData = MoonEclipsesData.addTimingsAndGeometry(oppositionData);
        return oppositionData;
    },

    reset: function () {

    }
};

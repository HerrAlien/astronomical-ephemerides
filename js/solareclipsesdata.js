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

var SolarEclipses = {
    ComputeBesselianElements : function (jd) {

        var besselianEngine = new BesselianElements (MoonData, SunData, 0.27227, jd);
        var elements = besselianEngine.leastSquareFitCoeff;
        
        elements['besselianEngine'] = besselianEngine;
        
        elements['tan_f1'] = elements['tan_f1'][0];
        elements['tan_f2'] = elements['tan_f2'][0];
        
        if (elements['mu'][0] > 360)
            elements['mu'][0] -= 360;
        
        elements['mu'][3] = 0;
        elements['d'][3] = 0;
         
        return elements;
    },
    
    EclipseDataForK : function (k) {
        // check if you have an eclipse
        var eclipseData = GetAAJS().Eclipses.CalculateSolar (k);
        if (eclipseData.bEclipse) {
            // if yes, compute the besselian elements
            eclipseData["t0"] = Math.round (eclipseData.JdOfMaximumEclipse * 24) / 24;
            eclipseData["besselianElements"] = this.ComputeBesselianElements(eclipseData["t0"]);
        

            function _poly (coeffs, time) {
                var val = 0;
                var poweredTime = 1;
                for (var i = 0; i < coeffs.length;i++) {
                    val += coeffs[i] * poweredTime;
                    poweredTime *= time;
                }
                return val;
            }
            
            var besselianElements = eclipseData.besselianElements;
            var localElements = besselianElements.besselianEngine.localCircumstancesLSF;
            var tMinusT0OnMax = besselianElements.besselianEngine.timeMinusT0OfMaxEclipse;

            // now, compute local x, y, z for tmax
            var x = _poly(localElements.x, tMinusT0OnMax);
            var y = _poly(localElements.y, tMinusT0OnMax);
            var z = _poly(localElements.z, tMinusT0OnMax);

            var X = _poly(besselianElements.x, tMinusT0OnMax);
            var Y = _poly(besselianElements.y, tMinusT0OnMax);

            var U = X - x;
            var V = Y - y;

            var _x = localElements.x[1] + 2 * localElements.x[2] * tMinusT0OnMax;
            var _y = localElements.y[1] + 2 * localElements.y[2] * tMinusT0OnMax;

            var _X = besselianElements.x[1] + 2 * besselianElements.x[2] * tMinusT0OnMax;
            var _Y = besselianElements.y[1] + 2 * besselianElements.y[2] * tMinusT0OnMax;

            var _U = _X - _x;
            var _V = _Y - _y;

            var correctionOnT = - (U * _U + V * _V)/(_U*_U + _V*_V);
            var hourOfMax = eclipseData["t0"] + tMinusT0OnMax + correctionOnT;

            var lm = Math.sqrt(U*U + V*V);
            var le = _poly(localElements.l1, tMinusT0OnMax + correctionOnT);
            var li = _poly(localElements.l2, tMinusT0OnMax + correctionOnT);

            var g = (le + lm) / (2 * (le - besselianElements.besselianEngine.occultorRadius));

            var g2 = (le - lm)/(le - li);

            // g2 negative? Not visible.

            var phase = 0;
        }


        return eclipseData;
    },

    reset : function () {

    }

};


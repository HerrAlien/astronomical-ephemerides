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
        var besselianEngine = new BesselianElements (MoonData, SunData, 0.27305, jd);
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

            var U, V, _U, _V, le, li;

            var ComputeUvAndDerivative = function (_time) {
                var squaredTime = _time * _time;
                var x = _poly(localElements.x, _time);
                var y = _poly(localElements.y, _time);
                var z = _poly(localElements.z, _time);

                var X = _poly(besselianElements.x, _time);
                var Y = _poly(besselianElements.y, _time);

                U = X - x;
                V = Y - y;

                var _x = localElements.x[1] + 2 * localElements.x[2] * _time 
                         + 3 * localElements.x[3] * squaredTime;
                var _y = localElements.y[1] + 2 * localElements.y[2] * _time
                         +  3 * localElements.y[3] * squaredTime;

                var _X = besselianElements.x[1] + 2 * besselianElements.x[2] * _time
                         + 3 * besselianElements.x[3] * squaredTime;
                var _Y = besselianElements.y[1] + 2 * besselianElements.y[2] * _time
                         + 3 * besselianElements.y[3] * squaredTime;

                _U = _X - _x;
                _V = _Y - _y;
                le = _poly(localElements.l1, _time );
                li = _poly(localElements.l2, _time );
            }

            var correctionOnT = 1;
            var epsT = 1 / 3600.0;

            for (var iter = 0; iter < 20 && Math.abs(correctionOnT) > epsT; iter++) {                
                ComputeUvAndDerivative (tMinusT0OnMax);
                correctionOnT = - (U * _U + V * _V)/(_U*_U + _V*_V);
                tMinusT0OnMax += correctionOnT;
            }

            var dtCorrection = GetAAJS().DynamicalTime.DeltaT(eclipseData["t0"])/(3600 * 24);

            var hourOfMax = eclipseData["t0"] + (tMinusT0OnMax) / 24.0;
            
            eclipseData["tMax"] =  hourOfMax + dtCorrection;

            var lm = Math.sqrt(U*U + V*V);

            var g2 = (le - lm)/(le - li);
            if (g2 > 0) {// Chauvenet
                var M, m, N, n, L, sin_psi, psi, tau;

                var computePsiForStart = function() {
                    if (L > 0) {
                        if (Math.cos(psi) > 0) {
                            psi = Math.PI - psi;
                        }
                    } else {
                        if (Math.cos(psi) < 0) {
                            psi = Math.PI - psi;
                        }
                    }
                }

                var computePsiForEnd = function() {
                    if (L > 0) {
                        if (Math.cos(psi) < 0) {
                            psi = Math.PI - psi;
                        }
                    } else {
                        if (Math.cos(psi) > 0) {
                            psi = Math.PI - psi;
                        }
                    }
                }

                var computeAuxiliaries = function () {
                    M = Math.atan2 (U, V);
                    m = U / Math.sin(M);

                    N = Math.atan2 (_U, _V);
                    n = _U / Math.sin(N);

                    L = le;
                    sin_psi = m * (M - N) / L;
                    psi = Math.asin(sin_psi);

                }

                computeAuxiliaries();
                computePsiForStart();
                var correctionForStart = L * Math.cos(psi) / n - m*Math.cos(M-N)/n;  
                              
                if (!isNaN(correctionForStart)) {
                    eclipseData["t1"] = hourOfMax + correctionForStart / 24.0 + dtCorrection;              
                    computePsiForEnd();
                    var correctionForEnd = L * Math.cos(psi) / n - m*Math.cos(M-N)/n;
                    if (!isNaN(correctionForEnd)) {
                        eclipseData["t4"] = hourOfMax + correctionForEnd / 24.0 + dtCorrection;
                    }

                    var delta = Math.abs(L*sin_psi);
                    eclipseData["magnitude"] = (L - delta) / (2 * (L - besselianElements.besselianEngine.occultorRadius));
                }
            }
        }
        return eclipseData;
    },

    reset : function () {

    }

};


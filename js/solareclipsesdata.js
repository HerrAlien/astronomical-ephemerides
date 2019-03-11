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
            eclipseData = this.LocalCircumstances(eclipseData);
        }
        return eclipseData;
    },

    LocalCircumstances : function (eclipseData) {
        
        function _poly (coeffs, time) {
            var val = 0;
            var poweredTime = 1;
            for (var i = 0; i < coeffs.length;i++) {
                val += coeffs[i] * poweredTime;
                poweredTime *= time;
            }
            return val;
        }

        var degra = Math.PI / 180;
        
        var besselianElements = eclipseData.besselianElements;
        var localElements = besselianElements.besselianEngine.localCircumstancesLSF;
        var tMinusT0OnMax = besselianElements.besselianEngine.timeMinusT0OfMaxEclipse;

        var U, V, _U, _V, le, li, z;

        var ComputeUvAndDerivative = function (tMinusT0, localElements, results) {
            var squaredTime = tMinusT0 * tMinusT0;
            var x = _poly(localElements.x, tMinusT0);
            var y = _poly(localElements.y, tMinusT0);
            results["z"] = _poly(localElements.z, tMinusT0);

            var X = _poly(besselianElements.x, tMinusT0);
            var Y = _poly(besselianElements.y, tMinusT0);

            results["U"] = X - x;
            results["V"] = Y - y;

            var _x = localElements.x[1] + 2 * localElements.x[2] * tMinusT0 
                     + 3 * localElements.x[3] * squaredTime;
            var _y = localElements.y[1] + 2 * localElements.y[2] * tMinusT0
                     +  3 * localElements.y[3] * squaredTime;

            var _X = besselianElements.x[1] + 2 * besselianElements.x[2] * tMinusT0
                     + 3 * besselianElements.x[3] * squaredTime;
            var _Y = besselianElements.y[1] + 2 * besselianElements.y[2] * tMinusT0
                     + 3 * besselianElements.y[3] * squaredTime;

            results["_U"] = _X - _x;
            results["_V"] = _Y - _y;
            results["le"] = _poly(localElements.l1, tMinusT0 );
            results["li"] = _poly(localElements.l2, tMinusT0 );
        }

        eclipseData["tMax"] =  eclipseData["t0"] + (tMinusT0OnMax) / 24.0;
        var dtCorrection = GetAAJS().DynamicalTime.DeltaT(eclipseData["t0"])/(3600 * 24);
        var correction = 1;
        var newTmax = eclipseData["tMax"];

        ////////////// to be iterated ////////////////

            var estimatedJdMax = eclipseData["t0"] + (tMinusT0OnMax) / 24.0;

            var c1 = {};
            
            ComputeUvAndDerivative (tMinusT0OnMax, localElements, c1);
            // Chauvenet
            var computePsiForStart = function(ctxt) {
                if (ctxt.L > 0) {
                    if (Math.cos(ctxt.psi) > 0) {
                        ctxt.psi = Math.PI - ctxt.psi;
                    }
                } else {
                    if (Math.cos(ctxt.psi) < 0) {
                        ctxt.psi = Math.PI - ctxt.psi;
                    }
                }
            }

            var computePsiForEnd = function(ctxt) {
                if (ctxt.L > 0) {
                    if (Math.cos(ctxt.psi) < 0) {
                        ctxt.psi = Math.PI - ctxt.psi;
                    }
                } else {
                    if (Math.cos(ctxt.psi) > 0) {
                        ctxt.psi = Math.PI - ctxt.psi;
                    }
                }
            }

            var computeAuxiliaries = function (ctxt) {
                ctxt["M"] = Math.atan2 (ctxt.U, ctxt.V);
                ctxt["m"] = ctxt.U / Math.sin(ctxt.M);

                ctxt["N"] = Math.atan2 (ctxt._U, ctxt._V);
                ctxt["n"] = ctxt._U / Math.sin(ctxt.N);

                ctxt["sin_psi"] = ctxt.m * Math.sin (ctxt.M - ctxt.N) / ctxt.L;
                ctxt["psi"] = Math.asin(ctxt.sin_psi);

            }

            c1["L"] = c1.le;
            computeAuxiliaries(c1);
            computePsiForStart(c1);
            var correctionForStart = c1.L * Math.cos(c1.psi) / c1.n - c1.m*Math.cos(c1.M-c1.N)/c1.n;  
                          
            if (!isNaN(correctionForStart)) {
                eclipseData["t1"] = estimatedJdMax + correctionForStart / 24.0;  
                eclipseData["PA1"] = (c1.N + c1.psi)/degra;

                var c1e = {};
                for (var k in c1) {
                    c1e[k] = c1[k];
                }

                computePsiForEnd(c1e);
                var correctionForEnd = c1e.L * Math.cos(c1e.psi) / c1e.n - c1e.m*Math.cos(c1e.M-c1e.N)/c1e.n;
                if (!isNaN(correctionForEnd)) {
                    eclipseData["t4"] = estimatedJdMax + correctionForEnd / 24.0;
                    eclipseData["PA4"] = (c1e.N + c1e.psi)/degra;
                }

                var delta = Math.abs(c1.L*c1.sin_psi);
                eclipseData["magnitude"] = (c1.L - delta) / (2 * (c1.L - besselianElements.besselianEngine.occultorRadius));

                if (eclipseData["magnitude"] > 1) {
                    c1.L = c1.li;
                    computeAuxiliaries(c1);
                    computePsiForStart(c1);
                    correctionForStart = c1.L * Math.cos(c1.psi) / c1.n - c1.m*Math.cos(c1.M-c1.N)/c1.n;  
                    if (!isNaN(correctionForStart)) {
                        eclipseData["t2"] = estimatedJdMax + correctionForStart / 24.0;  

                        computePsiForEnd(c1);
                        correctionForEnd = c1.L * Math.cos(c1.psi) / c1.n - c1.m*Math.cos(c1.M-c1.N)/c1.n;
                        if (!isNaN(correctionForEnd)) {
                            eclipseData["t3"] = estimatedJdMax + correctionForEnd / 24.0;
                        }
                    }
                }
            }

            var dt1hours = (eclipseData["t1"] - eclipseData["t0"]) * 24;
            var ct1 = {};
            ComputeUvAndDerivative (dt1hours, localElements, ct1);
            ct1["L"] = ct1.le;
            computeAuxiliaries(ct1);
            computePsiForStart(ct1);
            correctionForStart = ct1.L * Math.cos(ct1.psi) / ct1.n - ct1.m*Math.cos(ct1.M-ct1.N)/ct1.n;  
                          
            if (!isNaN(correctionForStart)) {
                eclipseData["t1"] = eclipseData["t0"] + (dt1hours + correctionForStart) / 24.0;  
                eclipseData["PA1"] = (ct1.N + ct1.psi)/degra;
            }

            var dt4hours = (eclipseData["t4"] - eclipseData["t0"]) * 24;
            var ct4 = {};
            ComputeUvAndDerivative (dt4hours, localElements, ct4);
            ct4["L"] = ct4.le;
            computeAuxiliaries(ct4);
            computePsiForEnd(ct4);
            correctionForEnd = ct4.L * Math.cos(ct4.psi) / ct4.n - ct4.m*Math.cos(ct4.M-ct4.N)/ct4.n;  
                          
            if (!isNaN(correctionForEnd)) {
                eclipseData["t4"] = eclipseData["t0"] + (dt4hours + correctionForEnd) / 24.0;  
                eclipseData["PA4"] = (ct4.N + ct4.psi)/degra;
            }
            
            if (!isNaN(eclipseData["t1"])) {
                newTmax =  (eclipseData["t4"] + eclipseData["t1"]) / 2.0;
                correction = (newTmax - eclipseData["tMax"]) / 24.0;
                tMinusT0OnMax += correction;
                eclipseData["tMax"] = newTmax;
            }

        for (var key in {"t1":0, "t2":0, "t3":0, "t4":0, "tMax":0}) {
            if (eclipseData[key]) {
                eclipseData[key] -= dtCorrection;
            }
        }

        if (eclipseData["magnitude"] <= 1e-4 || z < 0.01) {
            eclipseData["t1"] = false;
        }

///////////////////////////////////////////////////////

        return eclipseData;
    },

    reset : function () {

    }

};


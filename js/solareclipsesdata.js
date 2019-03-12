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

        function UvAndDerivative (tMinusT0, localElements) {
            var squaredTime = tMinusT0 * tMinusT0;
            var x = _poly(localElements.x, tMinusT0);
            var y = _poly(localElements.y, tMinusT0);
            this["z"] = _poly(localElements.z, tMinusT0);

            var X = _poly(besselianElements.x, tMinusT0);
            var Y = _poly(besselianElements.y, tMinusT0);

            this["U"] = X - x;
            this["V"] = Y - y;

            var _x = localElements.x[1] + 2 * localElements.x[2] * tMinusT0 
                     + 3 * localElements.x[3] * squaredTime;
            var _y = localElements.y[1] + 2 * localElements.y[2] * tMinusT0
                     +  3 * localElements.y[3] * squaredTime;

            var _X = besselianElements.x[1] + 2 * besselianElements.x[2] * tMinusT0
                     + 3 * besselianElements.x[3] * squaredTime;
            var _Y = besselianElements.y[1] + 2 * besselianElements.y[2] * tMinusT0
                     + 3 * besselianElements.y[3] * squaredTime;

            this["_U"] = _X - _x;
            this["_V"] = _Y - _y;
            this["le"] = _poly(localElements.l1, tMinusT0 );
            this["li"] = _poly(localElements.l2, tMinusT0 );

            this["M"] = Math.atan2 (this.U, this.V);
            this["m"] = this.U / Math.sin(this.M);

            this["N"] = Math.atan2 (this._U, this._V);
            this["n"] = this._U / Math.sin(this.N);

            this.ComputePsi = function (L) {
                this["sin_psi"] = this.m * Math.sin (this.M - this.N) / L;
                this["psi"] = Math.asin(this.sin_psi);
            }

            this.PsiForStart = function(L) {
                if (L > 0) {
                    if (Math.cos(this.psi) > 0) {
                        return Math.PI - this.psi;
                    }
                } else {
                    if (Math.cos(this.psi) < 0) {
                        return Math.PI - this.psi;
                    }
                }
                return this.psi;
            }

            this.PsiForEnd = function(L) {
                if (L > 0) {
                    if (Math.cos(this.psi) < 0) {
                        return Math.PI - this.psi;
                    }
                } else {
                    if (Math.cos(this.psi) > 0) {
                        return Math.PI - this.psi;
                    }
                }
                return this.psi;
            }

            this.TimeCorrectionHours = function (L, psi) {
                return L * Math.cos(psi) / this.n - this.m*Math.cos(this.M-this.N)/this.n;  
            }
        }

        eclipseData["tMax"] =  eclipseData["t0"] + (tMinusT0OnMax) / 24.0;
        var dtCorrection = GetAAJS().DynamicalTime.DeltaT(eclipseData["t0"])/(3600 * 24);
        var correction = 1;
        var newTmax = eclipseData["tMax"];

        ////////////// to be iterated ////////////////

        var estimatedJdMax = eclipseData["t0"] + (tMinusT0OnMax) / 24.0;

        var c1 = new UvAndDerivative(tMinusT0OnMax, localElements);
        
        // Chauvenet

        c1.ComputePsi(c1.le);
        var psiStart = c1.PsiForStart(c1.le);
        var correctionForStart = c1.TimeCorrectionHours (c1.le, psiStart);
                      
        if (!isNaN(correctionForStart)) {
            eclipseData["t1"] = estimatedJdMax + correctionForStart / 24.0;  
            eclipseData["PA1"] = (c1.N + psiStart)/degra;

            var psiEnd = c1.PsiForEnd(c1.le);
            var correctionForEnd = c1.TimeCorrectionHours (c1.le, psiEnd);
            if (!isNaN(correctionForEnd)) {
                eclipseData["t4"] = estimatedJdMax + correctionForEnd / 24.0;
                eclipseData["PA4"] = (c1.N + psiEnd)/degra;
            }

            c1.ComputePsi(c1.li);
            var correctionForStartTotality = c1.TimeCorrectionHours (c1.li, c1.PsiForStart(c1.li));
            if (!isNaN(correctionForStartTotality)) {
                eclipseData["t2"] = estimatedJdMax + correctionForStartTotality / 24.0;  

                var correctionForEndTotality = c1.TimeCorrectionHours (c1.li, c1.PsiForEnd(c1.li));
                if (!isNaN(correctionForEndTotality)) {
                    eclipseData["t3"] = estimatedJdMax + correctionForEndTotality / 24.0;
                }
            }
        }

        var dt1hours = (eclipseData["t1"] - eclipseData["t0"]) * 24;
        var ct1 = new UvAndDerivative(dt1hours, localElements);
        ct1.ComputePsi(ct1.le);
        correctionForStart = ct1.TimeCorrectionHours (ct1.le, ct1.PsiForStart(ct1.le));
                      
        if (!isNaN(correctionForStart)) {
            eclipseData["t1"] = eclipseData["t0"] + (dt1hours + correctionForStart) / 24.0;  
        }

        var dt4hours = (eclipseData["t4"] - eclipseData["t0"]) * 24;
        var ct4 = new UvAndDerivative (dt4hours, localElements);
        ct4.ComputePsi(ct4.le);
        correctionForEnd = ct4.TimeCorrectionHours (ct4.le, ct4.PsiForEnd(ct4.le));
        if (!isNaN(correctionForEnd)) {
            eclipseData["t4"] =  eclipseData["t0"] + (dt4hours + correctionForEnd) / 24.0;
        }

        var dt2hours = (eclipseData["t2"] - eclipseData["t0"]) * 24;
        var ct2 = new UvAndDerivative (dt2hours, localElements);
        ct2.ComputePsi(ct2.li);
        correctionForStart = ct2.TimeCorrectionHours (ct2.li, ct2.PsiForStart(ct2.li));
                      
        if (!isNaN(correctionForStart)) {
            eclipseData["t2"] = eclipseData["t0"] + (dt2hours + correctionForStart) / 24.0;  
        }

        correctionForEnd = ct2.TimeCorrectionHours (ct2.li, ct2.PsiForEnd(ct2.li));
                      
        if (!isNaN(correctionForEnd)) {
            eclipseData["t3"] = eclipseData["t0"] + (dt2hours + correctionForEnd) / 24.0;  
        }            

        dt1hours = (eclipseData["t1"] - eclipseData["t0"]) * 24;
        ct1 = new UvAndDerivative(dt1hours, localElements);
        ct1.ComputePsi(ct1.le);
        psiStart = ct1.PsiForStart(ct1.le);
        correctionForStart = ct1.TimeCorrectionHours (ct1.le, psiStart);
        if (!isNaN(correctionForStart)) {
            eclipseData["t1"] = eclipseData["t0"] + (dt1hours + correctionForStart) / 24.0;  
            eclipseData["PA1"] = (ct1.N + psiStart)/degra;
        }
                      
        dt4hours = (eclipseData["t4"] - eclipseData["t0"]) * 24;
        ct4 = new UvAndDerivative (dt4hours, localElements);
        ct4.ComputePsi(ct4.le);
        psiEnd = ct4.PsiForEnd(ct4.le);
        correctionForEnd = ct4.TimeCorrectionHours (ct4.le, psiEnd);
        if (!isNaN(correctionForEnd)) {
            eclipseData["t4"] = eclipseData["t0"] + (dt4hours + correctionForEnd) / 24.0;
            eclipseData["PA4"] = (ct4.N + psiEnd)/degra;
        }


        dt1hours = (eclipseData["t1"] - eclipseData["t0"]) * 24;
        ct1 = new UvAndDerivative(dt1hours, localElements);
        ct1.ComputePsi(ct1.le);
        psiStart = ct1.PsiForStart(ct1.le);
        correctionForStart = ct1.TimeCorrectionHours (ct1.le, psiStart);
        if (!isNaN(correctionForStart)) {
            eclipseData["t1"] = eclipseData["t0"] + (dt1hours + correctionForStart) / 24.0;  
            eclipseData["PA1"] = (ct1.N + psiStart)/degra;
        }
                      
        dt4hours = (eclipseData["t4"] - eclipseData["t0"]) * 24;
        ct4 = new UvAndDerivative (dt4hours, localElements);
        ct4.ComputePsi(ct4.le);
        psiEnd = ct4.PsiForEnd(ct4.le);
        correctionForEnd = ct4.TimeCorrectionHours (ct4.le, psiEnd);
        if (!isNaN(correctionForEnd)) {
            eclipseData["t4"] = eclipseData["t0"] + (dt4hours + correctionForEnd) / 24.0;
            eclipseData["PA4"] = (ct4.N + psiEnd)/degra;
        }

        if (!isNaN(eclipseData["t2"]) && !isNaN(eclipseData["t3"])) {
            eclipseData["tMax"] = (eclipseData["t2"] + eclipseData["t3"]) / 2;
        } else {
            eclipseData["tMax"] = (eclipseData["t4"] + eclipseData["t1"]) / 2.0;
            var dtMax = (eclipseData["tMax"] - eclipseData["t0"]) * 24;
            c1 = new UvAndDerivative(dtMax, localElements);
            c1.ComputePsi(c1.le);
            eclipseData["tMax"] = eclipseData["t0"] - c1.m*Math.cos(c1.M-c1.N)/c1.n / 24.0;

            dtMax = (eclipseData["tMax"] - eclipseData["t0"]) * 24;
            c1 = new UvAndDerivative(dtMax, localElements);
            c1.ComputePsi(c1.le);
            eclipseData["tMax"] = eclipseData["t0"] - c1.m*Math.cos(c1.M-c1.N)/c1.n / 24.0;
        }

        dtMax = (eclipseData["tMax"] - eclipseData["t0"]) * 24;
        c1 = new UvAndDerivative(dtMax, localElements);
        c1.ComputePsi(c1.le);
        var delta = Math.abs(c1.le*c1.sin_psi);
        eclipseData["magnitude"] = (c1.le - delta) / (2 * (c1.le - besselianElements.besselianEngine.occultorRadius));

        for (var key in {"t1":0, "t2":0, "t3":0, "t4":0, "tMax":0}) {
            if (eclipseData[key]) {
                eclipseData[key] -= dtCorrection;
            }
        }

        if (eclipseData["magnitude"] <= 1e-4 || c1.z < 0.01) {
            eclipseData["t1"] = false;
        }

///////////////////////////////////////////////////////

        return eclipseData;
    },

    reset : function () {

    }

};


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

function OccultedStar (RA, Dec) {
    this.RA = RA;
    this.Dec = Dec;
    this.Parallax = 0;
    this.Diameter = 0;
    
    this.getDataAsObjectForJD = function () {
        return this;
    }
}

/*! Both the occultor and the occulted need to provide the following method:

    getDataAsObjectForJD : function (jd) -> { "RA": number-in-h-as-v.ddddd, 
                                              "Dec": number-in-degrees-as-v.ddddd, 
                                              "Parallax": number-in-degrees-as-v.ddddd, 
                                              "Diameter": number-in-degrees-as-v.ddddd }

    occultor - typically the data object for the Moon, but it can be the data object of a
               planet, when predicting transits
    occulted - the object covered by the occultor. The data object for the Sun, for a solar
               eclipse, but can be a star or a planet for occultations
    occultorRadius - radius of the occultor object, in Earth radii.
    jd - julian date around which we're computing the polynomial approximations
*/
function BesselianElements (occultor, occulted, occultorRadius, jd) {
    this.timeBasedValues = {
            "x"      : NaN,
            "y"      : NaN,
            "d"      : NaN,
            "mu"     : NaN,
            "l1"     : NaN,
            "l2"     : NaN,
            "tan_f1" : NaN,
            "tan_f2" : NaN,
    };
    this.leastSquareFitCoeff = {
            "x"      : NaN,
            "y"      : NaN,
            "d"      : NaN,
            "mu"     : NaN,
            "l1"     : NaN,
            "l2"     : NaN,
            "tan_f1" : NaN,
            "tan_f2" : NaN,
    };
    
    this.localCircumstancesTimeBased = {
        "x"         : NaN,
        "y"         : NaN,
        "z"         : NaN,
        "l1"        : NaN,
        "l2"        : NaN,
        "delta"     : NaN
    };
    
    this.localCircumstancesLSF = {
        "x"         : NaN,
        "y"         : NaN,
        "z"         : NaN,
        "l1"        : NaN,
        "l2"        : NaN,
        "delta"     : NaN
    };
    
    this.occultor = occultor;
    this.occulted = occulted;
    this.occultorRadius = occultorRadius;
    
    this.ComputeFunctionValuesForElements(jd);
        
    for (var key in this.timeBasedValues) {
        this.leastSquareFitCoeff[key] = FunctionFitting.PolynomialLSF(this.timeBasedValues[key], [-3, -2, -1, 0, 1, 2, 3], 3);
    }
    for (var key in this.localCircumstancesTimeBased) {
        this.localCircumstancesLSF[key] = FunctionFitting.PolynomialLSF(this.localCircumstancesTimeBased[key], [-3, -2, -1, 0, 1, 2, 3], 3);
    }
    
    this.localCircumstancesLSF.delta = FunctionFitting.PolynomialLSF (this.localCircumstancesTimeBased.delta, [-3, -2, -1, 0, 1, 2, 3], 6);
    // minimum distance ...
    // eq is 3 * delta_coeff[3] , 2 * delta_coeff[2], delta_coeff[1] 
    var firstDerivativeEquals0 = new QuadraticEquation (3 * this.localCircumstancesLSF.delta[3], 2 * this.localCircumstancesLSF.delta[2], this.localCircumstancesLSF.delta[1]);
    
    
    this.timeMinusT0OfMaxEclipse = firstDerivativeEquals0.x1.real;
    // must use the time value within our interval [-3, 3]
    if (Math.abs(this.timeMinusT0OfMaxEclipse) > 3)
        this.timeMinusT0OfMaxEclipse = firstDerivativeEquals0.x2.real;
    
    this.jdLocalMax = jd + this.timeMinusT0OfMaxEclipse/24;
    
    function _poly (coeffs, time) {
        var val = 0;
        var poweredTime = 1;
        for (var i = 0; i < coeffs.length;i++) {
            val += coeffs[i] * poweredTime;
            poweredTime *= time;
        }
        return val;
    }
    
    this.deltaLocalMax = _poly (this.localCircumstancesLSF.delta, this.timeMinusT0OfMaxEclipse);
    
    this.l1LocalMax = _poly (this.localCircumstancesLSF.l1, this.timeMinusT0OfMaxEclipse);
    
    this.l2LocalMax = _poly (this.localCircumstancesLSF.l2, this.timeMinusT0OfMaxEclipse);
 }

(function(){
    BesselianElements.prototype['ComputeFunctionValuesForElements'] = function (jd) {
        this.timeBasedValues = {
                "x"      : [0,0,0,0,0,0,0],
                "y"      : [0,0,0,0,0,0,0],
                "d"      : [0,0,0,0,0,0,0],
                "mu"     : [0,0,0,0,0,0,0],
                "l1"     : [0,0,0,0,0,0,0],
                "l2"     : [0,0,0,0,0,0,0],
                "tan_f1" : [0,0,0,0,0,0,0],
                "tan_f2" : [0,0,0,0,0,0,0]
        };
        
        this.localCircumstancesTimeBased = {
                "x"     : [0,0,0,0,0,0,0],
                "y"     : [0,0,0,0,0,0,0],
                "z"     : [0,0,0,0,0,0,0],
                "l1"    : [0,0,0,0,0,0,0],
                "l2"    : [0,0,0,0,0,0,0],
                "delta" : [0,0,0,0,0,0,0]
        };            
        
        Location.recomputeGeocentricCoordinates();
        
        // compute 7 values, at time jd -3h, jd-2h, jd -1h, jd, jd + 1h, jd + 2h, jd + 3h
        var oneHour = 1/24;
        var startJD = jd - 3*oneHour;
        var endJD = jd + 3*oneHour;
        
        var i = 0;
        for (var currentJD = startJD; currentJD <= endJD; currentJD+= oneHour) {
            var oneSetOfValues = this.ComputeOneFunctionValueForElements(currentJD);
            for (var key in this.timeBasedValues) {
                this.timeBasedValues[key][i] = oneSetOfValues[key];
            }
            
            for (var key in this.localCircumstancesTimeBased ) {
                this.localCircumstancesTimeBased[key][i] = oneSetOfValues.localCircumstances[key];
            }
            
            i++;
        }
        
        // the mu may wrap over 360
        var wrappedValues = false;
        for (var i = 0; i < this.timeBasedValues.mu.length - 1 && !wrappedValues; i++) {
            wrappedValues = Math.abs(this.timeBasedValues.mu[i] - this.timeBasedValues.mu[i+1]) > 180;
        }
            
        if (wrappedValues) {
            for (var i = 0; i < this.timeBasedValues.mu.length; i++) {
                if (this.timeBasedValues.mu[i] < 180) {
                    this.timeBasedValues.mu[i] += 360;
                }
            }
        }
    }
    
    BesselianElements.prototype['ComputeOneFunctionValueForElements'] = function (jd) {
        var values = {
            "x"      : 0,
            "y"      : 0,
            "d"      : 0,
            "mu"     : 0,
            "l1"     : 0,
            "l2"     : 0,
            "tan_f1" : 0,
            "tan_f2" : 0,
            "localCircumstances" : {
                "x"      : 0,
                "y"      : 0,
                "z"      : 0,
                "l1"     : 0,
                "l2"     : 0,
                "delta"  : 2
            }
        };
        
        var occultedData  =  this.occulted.getDataAsObjectForJD(jd);
        var occultorData = this.occultor.getDataAsObjectForJD(jd);
        
        var degra = Math.PI / 180;
        var occultorParallaxRads = occultorData.Parallax * degra;
        var occultedParallaxRads = occultedData.Parallax * degra;
        var occultorDecRads = occultorData.Dec* degra;
        
        // -------------------------------------------------
        var r = 1 / Math.sin (occultorParallaxRads);
        var r_prime =  1 / Math.sin(occultedParallaxRads);
        var b = Math.sin(occultedParallaxRads) * r ;
        values.d = occultedData.Dec - (b / (1-b))*(occultorData.Dec - occultedData.Dec);
        if (values.d < 0)
            values.d += 360;

        var a = occultedData.RA - (b / (1-b))*Math.cos(occultorDecRads)/Math.cos(occultedData.Dec * degra) * (occultorData.RA - occultedData.RA);
        values.mu = 15*(GetAAJS().Sidereal.ApparentGreenwichSiderealTime(jd) - a);
        if (values.mu < 0)
            values.mu += 360;
        
        // -------------------------------------------------
        var d = values.d * degra;
        var occultorRaMinusA_Rads = ((occultorData.RA - a) * 15 ) * degra;

        values.x = r * Math.cos(occultorDecRads) * Math.sin(occultorRaMinusA_Rads);
        values.y = r * (Math.sin(occultorDecRads) * Math.cos(d) - Math.cos(occultorDecRads) * Math.sin(d) * Math.cos(occultorRaMinusA_Rads));
        var z = r * (Math.sin(occultorDecRads) * Math.sin(d) + Math.cos(occultorDecRads) * Math.cos(d) * Math.cos(occultorRaMinusA_Rads));

        // -------------------------------------------------
        var r_prime =  1 / Math.sin(occultedParallaxRads);
        var H = (occultedData.Diameter / 2) * degra;
        var g = 1- b;
        var occultorEarthRadiiRatio = this.occultorRadius; //0.27227;
        // penumbral
        var f1 = Math.asin( (Math.sin(H) + occultorEarthRadiiRatio*Math.sin(occultedParallaxRads)) / ( g ) );
        values.tan_f1 = Math.tan(f1);
        // umbral
        var f2 = Math.asin( (Math.sin(H) - occultorEarthRadiiRatio*Math.sin(occultedParallaxRads)) / ( g ) );
        values.tan_f2 = Math.tan(f2);
        
        // --------------------------------------------------
        values.l1 = z * values.tan_f1 + occultorEarthRadiiRatio/Math.cos(f1);
        values.l2 = z * values.tan_f2 - occultorEarthRadiiRatio/Math.cos(f2);
        
        var localHourAngleRads = (values.mu - (-Location.longitude)) * degra;
        
        values.localCircumstances.x = Location.rhoCosPhi*Math.sin(localHourAngleRads);
        values.localCircumstances.y = Location.rhoSinPhi* Math.cos(d) - Location.rhoCosPhi* Math.sin(d) *Math.cos(localHourAngleRads);
        values.localCircumstances.z = Location.rhoSinPhi* Math.sin(d) + Location.rhoCosPhi* Math.cos(d) *Math.cos(localHourAngleRads);
        values.localCircumstances.l1 = values.l1 - values.localCircumstances.z * values.tan_f1;
        values.localCircumstances.l2 = values.l2 - values.localCircumstances.z * values.tan_f2;
        
        var dx = values.x - values.localCircumstances.x;
        var dy = values.y - values.localCircumstances.y;
        
        values.localCircumstances.delta = Math.sqrt( dx*dx + dy*dy);
        
        return values;
    }    
})();


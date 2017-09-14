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

/*! occultor - typically the data object for the Moon, but it can be the data object of a
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
    
    this.occultor = occultor;
    this.occulted = occulted;
    this.occultorRadius = occultorRadius;
    
    this.ComputeFunctionValuesForElements(jd);
        
    for (var key in this.timeBasedValues) {
        this.leastSquareFitCoeff[key] = FunctionFitting.PolynomialLSF(this.timeBasedValues[key], [-3, -2, -1, 0, 1, 2, 3], 3);
    }
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
        };
        
        var occultedData  =  this.occulted.getDataAsObjectForJD(jd);
        var occultorData = this.occultor.getDataAsObjectForJD(jd);
        
        var degra = Math.PI / 180;
        var occultorParallaxRads = occultorData.Parallax * degra;
        var occultedParallaxRads = occultedData.Parallax * degra;
        var occultorDecRads = occultorData.Dec* degra;
        
        // -------------------------------------------------
        var r = 1 / Math.sin (occultorParallaxRads);
        var b = Math.sin(occultedParallaxRads) * r ;
        values.d = occultedData.Dec - (b / (1-b))*(occultorData.Dec - occultedData.Dec);
        if (values.d < 0)
            values.d += 360;

        var a = occultedData.RA - (b / (1-b))*Math.cos(occultorDecRads)/Math.cos(occultedData.Dec * degra) * (occultorData.RA - occultedData.RA);
        values.mu = 15*(AAJS.Sidereal.ApparentGreenwichSiderealTime(jd) - a);
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
        
        return values;
    }
    
})();

var SolarEclipses = {
    ComputeBesselianElements : function (jd) {

        var besselianEngine = new BesselianElements (MoonData, SunData, 0.27227, jd);
        var elements = besselianEngine.leastSquareFitCoeff;
        
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
        var eclipseData = AAJS.Eclipses.CalculateSolar (k);
        if (eclipseData.bEclipse) {
            // if yes, compute the besselian elements
            eclipseData["t0"] = Math.round (eclipseData.JdOfMaximumEclipse * 24) / 24;
            eclipseData["besselianElements"] = this.ComputeBesselianElements(eclipseData["t0"]);
        }
        return eclipseData;
    },

    reset : function () {

    }

};


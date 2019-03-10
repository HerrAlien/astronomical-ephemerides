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
    
    this.getDataAsObjectForJD : function () {
        return this;
    }
}

/*! function BesselianElements (occultor, occulted, occultorRadius, jd) {
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
}*/

function Occultation (star, initialJD) {
    this.star = star;
    this.occulted = new OccultedStar (this.star.RA, this.star.Dec);
    
    Location.recomputeGeocentricCoordinates();
    
    this.
}

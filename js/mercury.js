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


var MercuryData = {
    getDataForJD : function (JD) {
        var data = [];
        
        var dateOfJD =  AAJS.Date.JD2Date(JD);
        data[0] = dateOfJD.M;
        data[1] = dateOfJD.D;
        
        var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 1, true);
        
        //!! These are fairly low precision, need to investigate why ...
        data[2] = planetaryDetails.ApparentGeocentricRA;
        data[3] = planetaryDetails.ApparentGeocentricDeclination;
        
        var delta = planetaryDetails.ApparentGeocentricDistance;
        
        data[4] = 2 * AAJS.Diameters.MercurySemidiameterB(delta) / 3600;
		
		var sunEarthDistance = SunData.getSunEarthDistance(JD);
        
		/* M = E - e*sin(E); => E = M + e * sin(E)
		r = a * (1 - e * cos (E))
		*/
		var meanAnomaly;
		var eccentricity = AAJS.ElementsPlanetaryOrbit.MercuryEccentricity(JD);
		var eccentricAnomaly = AAJS.Elliptical.EccentricAnomalyFromMeanAnomaly(meanAnomaly, eccentricity);
		
		var r = AAJS.ElementsPlanetaryOrbit.MercurySemimajorAxis(JD) *
		        (1 -  eccentricity * Math.cos(eccentricAnomaly) );
		/*
			sunEarthDistance**2 = r**2 + delta **2 - 2 * delta * r * cos (phase);
			2 delta r cos phase = r **2 + delta **2 - sunEarthDistance**2
			phase = acos (( r **2 + delta **2 - sunEarthDistance**2) / (2 * delta * r))
		*/
        return data;
    }
};

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


var VenusData = {
    getDataForJD : function (JD) {
        var data = [];
        
        var dateOfJD =  AAJS.Date.JD2Date(JD);
        data[0] = dateOfJD.M;
        data[1] = dateOfJD.D;
        
        var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 2, true);
        
        //!! These are fairly low precision, need to investigate why ...
        data[2] = planetaryDetails.ApparentGeocentricRA;
        data[3] = planetaryDetails.ApparentGeocentricDeclination;
        
        var delta = planetaryDetails.ApparentGeocentricDistance;
        
        data[4] = 2 * AAJS.Diameters.VenusSemidiameterB(delta) / 3600;
		
		var sunEarthDistance = SunData.getSunEarthDistance(JD);
        
		/* M = E - e*sin(E); => E = M + e * sin(E)
		r = a * (1 - e * cos (E))
		*/
        var meanLongitude = AAJS.ElementsPlanetaryOrbit.VenusMeanLongitude(JD);
        // these two change slowly ... do we really want to recompute them for each JD?
        var ascendingNodeLongitude = AAJS.ElementsPlanetaryOrbit.VenusLongitudeAscendingNode(JD);
        var perihelionLongitude = AAJS.ElementsPlanetaryOrbit.VenusLongitudePerihelion(JD);
        
		var meanAnomaly = meanLongitude - ascendingNodeLongitude - perihelionLongitude; // l = omega + w + M => M = l - omega - w
        // transform it to radians
        meanAnomaly = meanAnomaly * Math.PI / 180;
        
		var eccentricity = AAJS.ElementsPlanetaryOrbit.VenusEccentricity(JD);
		var eccentricAnomaly = AAJS.Elliptical.EccentricAnomalyFromMeanAnomaly(meanAnomaly, eccentricity);
		var a = AAJS.ElementsPlanetaryOrbit.VenusSemimajorAxis(JD);
		var r =  a *  (1 -  eccentricity * Math.cos(eccentricAnomaly) );
		/*
			sunEarthDistance**2 = r**2 + delta **2 - 2 * delta * r * cos (phase);
			2 delta r cos phase = r **2 + delta **2 - sunEarthDistance**2
			phase = acos (( r **2 + delta **2 - sunEarthDistance**2) / (2 * delta * r))
		*/
        
        var cosPhaseAngle = (r*r + delta * delta - sunEarthDistance * sunEarthDistance)/(2 * delta * r);
        data[5] = 0.5 * (cosPhaseAngle + 1);
		
		var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r)/(2 * delta * sunEarthDistance);
		data[6] = Math.acos(cosElongationAngle);
        return data;
    }
};

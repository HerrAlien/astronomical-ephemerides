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
        
		var i = 0;
        var dateOfJD =  AAJS.Date.JD2Date(JD);
        data[i++] = dateOfJD.M;
        data[i++] = dateOfJD.D;
        
        var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 1, true);
        
        //!! These are fairly low precision, need to investigate why ...
        data[i++] = planetaryDetails.ApparentGeocentricRA;
        data[i++] = planetaryDetails.ApparentGeocentricDeclination;
        
        var delta = planetaryDetails.ApparentGeocentricDistance;
        
        data[i++] = 2 * AAJS.Diameters.MercurySemidiameterB(delta) / 3600;
		
		var jdOfTransit = AAJS.Date.ST2NextJD(planetaryDetails.ApparentGeocentricRA, JD);
//		planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (jdOfTransit - 6.0 /24, 1, true);
//		jdOfTransit = AAJS.Date.ST2NextJD(planetaryDetails.ApparentGeocentricRA, jdOfTransit);
		var transitHour = 24 * (jdOfTransit - JD);
		data[i++] = transitHour;
		data[i++] = delta;
		
		var sunEarthDistance = SunData.getSunEarthDistance(JD);
        
		/* M = E - e*sin(E); => E = M + e * sin(E)
		r = a * (1 - e * cos (E))
		*/
        var meanLongitude = AAJS.ElementsPlanetaryOrbit.MercuryMeanLongitude(JD);
        // these two change slowly ... do we really want to recompute them for each JD?
        var ascendingNodeLongitude = AAJS.ElementsPlanetaryOrbit.MercuryLongitudeAscendingNode(JD);
        var perihelionLongitude = AAJS.ElementsPlanetaryOrbit.MercuryLongitudePerihelion(JD);
        
		var meanAnomaly = meanLongitude - ascendingNodeLongitude - perihelionLongitude; // l = omega + w + M => M = l - omega - w
        // transform it to radians
        meanAnomaly = meanAnomaly * Math.PI / 180;
        
		var eccentricity = AAJS.ElementsPlanetaryOrbit.MercuryEccentricity(JD);
		var eccentricAnomaly = AAJS.Elliptical.EccentricAnomalyFromMeanAnomaly(meanAnomaly, eccentricity);
		var a = AAJS.ElementsPlanetaryOrbit.MercurySemimajorAxis(JD);
		var r =  a *  (1 -  eccentricity * Math.cos(eccentricAnomaly) );
		data[i++] = r;
		
		/*
			sunEarthDistance**2 = r**2 + delta **2 - 2 * delta * r * cos (phase);
			2 delta r cos phase = r **2 + delta **2 - sunEarthDistance**2
			phase = acos (( r **2 + delta **2 - sunEarthDistance**2) / (2 * delta * r))
		*/
        
        // debug ...
        // data[5] = 0.5 * (cosPhaseAngle + 1);
		
		var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r)/(2 * delta * sunEarthDistance);
		data[i++] = Math.acos(cosElongationAngle);
        var cosPhaseAngle = (r*r + delta * delta - sunEarthDistance * sunEarthDistance)/(2 * delta * r);
		data[i++] = 0.5 * (cosPhaseAngle + 1);
        return data;
    }
};

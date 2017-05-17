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

// planet object - {number, name, semidiameterFunctionName}
function PlanetData(planet)
{
	this.planet = planet;
	this.cache = {};
	this.getDataForJD = function (JD) {
        var data = this.cache[JD];
            if (!data) {
				data = [];
				var i = 0;
				var dateOfJD =  AAJS.Date.JD2Date(JD);
				data[i++] = dateOfJD.M;
				data[i++] = dateOfJD.D;
				
				var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 
																				this.planet.number, 
																				true);
				
				data[i++] = planetaryDetails.ApparentGeocentricRA;
				data[i++] = planetaryDetails.ApparentGeocentricDeclination;
				
				var delta = planetaryDetails.ApparentGeocentricDistance;
				
				data[i++] = 2 *this.planet.semidiameterFunctionName(delta) / 3600;
				
				var jdOfTransit = JD;
                
                for (var transitIterationIndex = 0; transitIterationIndex < 3; transitIterationIndex++)
                {
                    jdOfTransit = AAJS.Date.ST2NextJD(planetaryDetails.ApparentGeocentricRA, JD);
                    if (jdOfTransit - JD > 1)
                        jdOfTransit -= 1;
                    planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (jdOfTransit, this.planet.number, true);
                }

				var transitHour = 24 * (jdOfTransit - JD);
				data[i++] = transitHour;
				data[i++] = delta;
				
				var sunEarthDistance = SunData.getSunEarthDistance(JD);
				var r =  AAJS[this.planet.name].RadiusVector(JD, true);
				data[i++] = r;
				
				var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r)/(2 * delta * sunEarthDistance);
				data[i++] = Math.acos(cosElongationAngle);
				var cosPhaseAngle = (r*r + delta * delta - sunEarthDistance * sunEarthDistance)/(2 * delta * r);
				data[i++] = 0.5 * (cosPhaseAngle + 1);
				this.cache[JD] = data;
			}
		return data;
    }
}

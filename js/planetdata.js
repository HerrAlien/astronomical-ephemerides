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
    this.riseSetAngle = -0.5667; // degrees
}

(function(){
    PlanetData.prototype["reset"] = function () {
        this.cache = {};
    }
    PlanetData.prototype["getDataAsObjectForJD"] = function (JD, computeRiseTransitSet) {
        var data = this.cache[JD];
        if (!data) {
			data = {};
			var i = 0;
			var dateOfJD =  AAJS.Date.JD2Date(JD);
			data['Month'] = dateOfJD.M;
			data['Day'] = dateOfJD.D;
			
			var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 
																			this.planet.number, 
																			true);
			
			data['RA'] = planetaryDetails.ApparentGeocentricRA;
			data['Dec'] = planetaryDetails.ApparentGeocentricDeclination;
			
			var planetNumber = this.planet.number;
            
            data['MeridianTransit'] = false;
            data['Rise'] = false;
            data['Set'] = false;
			
			var sunEarthDistance = SunData.getSunEarthDistance(JD);
			var r =  AAJS[this.planet.name].RadiusVector(JD, true);
			data['DistanceToSun'] = r;
							
			var delta = planetaryDetails.ApparentGeocentricDistance;
            data['DistanceToEarth'] = delta;
			data['Diameter'] = 2 *this.planet.semidiameterFunctionName(delta) / 3600;

			var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r)/(2 * delta * sunEarthDistance);
			data['Elongation'] = Math.acos(cosElongationAngle);
			var cosPhaseAngle = (r*r + delta * delta - sunEarthDistance * sunEarthDistance)/(2 * delta * r);
			data['Phase'] = 0.5 * (cosPhaseAngle + 1);
			this.cache[JD] = data;
		}
            
        if (computeRiseTransitSet) {
            data = this.addRiseTransitSetData(JD, data);
            this.cache[JD] = data;
        }
        
		return data;
    };
    
    PlanetData.prototype["addRiseTransitSetData"] = function (JD, currentData) {
        var yData = this.getDataAsObjectForJD (JD - 1, false);
        var tData = this.getDataAsObjectForJD (JD + 1, false);
        var rts = AAJS.RiseTransitSet.Calculate (JD, yData['RA'], yData['Dec'], currentData['RA'], currentData['Dec'], tData['RA'], tData['Dec'], -Location.longitude,
        Location.latitude, this.riseSetAngle);
        currentData['MeridianTransit'] = rts['Transit'];
        currentData['Rise'] = rts['Rise'];
        currentData['Set'] = rts['Set'];

        currentData['bTransitValid'] = rts['bTransitValid'];
        currentData['bRiseValid'] = rts['bRiseValid'];
        currentData['bSetValid'] = rts['bSetValid'];
        
        return currentData;
    }
    
})();

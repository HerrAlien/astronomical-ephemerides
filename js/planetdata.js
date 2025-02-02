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

function PlanetData(planet) {
    this.planet = planet;
    this.cache = {};
    this.riseSetAngle = -0.5667; // degrees
}

(function () {
    PlanetData.prototype["reset"] = function () {
        this.cache = {};
    };
    PlanetData.prototype["getDataAsObjectForJD"] = function (JD, computeRiseTransitSet) {
        var data = this.cache[JD];
        if (!data) {
            data = {};
            var i = 0;
            var dateOfJD = GetAAJS().Date.JD2Date(JD);
            data['Month'] = dateOfJD.M;
            data['Day'] = dateOfJD.D;

            var planetaryDetails = GetAAJS().Elliptical.CalculatePlanetaryDetails(JD,
																			this.planet.number,
																			true);

            data['RA'] = planetaryDetails.ApparentGeocentricRA;
            data['Dec'] = planetaryDetails.ApparentGeocentricDeclination;

            var planetNumber = this.planet.number;

            data['MeridianTransit'] = false;
            data['Rise'] = false;
            data['Set'] = false;

            var sunEarthDistance = SunData.getSunEarthDistance(JD);
            var r = GetAAJS()[this.planet.name].RadiusVector(JD, true);
            data['DistanceToSun'] = r;

            var delta = planetaryDetails.ApparentGeocentricDistance;
            data['DistanceToEarth'] = delta;
            data['Diameter'] = 2 * this.planet.semidiameterFunctionName(delta) / 3600;

            var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r) / (2 * delta * sunEarthDistance);
            data['Elongation'] = Math.acos(cosElongationAngle) * 180 / Math.PI;
            var cosPhaseAngle = (r * r + delta * delta - sunEarthDistance * sunEarthDistance) / (2 * delta * r);
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
        var yData = this.getDataAsObjectForJD(JD - 1, false);
        var tData = this.getDataAsObjectForJD(JD + 1, false);
        var rts = GetAAJS().RiseTransitSet.Calculate(JD, yData['RA'], yData['Dec'], currentData['RA'], currentData['Dec'], tData['RA'], tData['Dec'], -Location.longitude,
        Location.latitude, this.riseSetAngle);
        currentData['MeridianTransit'] = JD + rts['Transit'] / 24.0;
        currentData['Rise'] = JD + rts['Rise'] / 24.0;
        currentData['Set'] = JD + rts['Set'] / 24.0;

        currentData['bTransitValid'] = rts['bTransitValid'];
        currentData['bRiseValid'] = rts['bRiseValid'];
        currentData['bSetValid'] = rts['bSetValid'];

        return currentData;
    };

    PlanetData.prototype["isAboveHorizon"] = function (JD) {
        var data = this.getDataAsObjectForJD(JD, false);

        var deg2rad = Math.PI / 180;

        var ra = data.RA * 15 * deg2rad;
        var dec = data.Dec * deg2rad;
        var lat = Location.latitude * deg2rad;
        var long = Location.longitude * deg2rad;
        var lst = (GetAAJS().Sidereal.ApparentGreenwichSiderealTime(JD) * 15 +
                   Location.longitude) * deg2rad;

        var alt = Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(lst - ra)) * 180 / Math.PI;
        return alt > 0;
    };

})();

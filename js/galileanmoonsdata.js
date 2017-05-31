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
var GalileanMoonsData = {
	cache : {},
    
    reset : function () {
        this.cache = {};
    },
    
    getDataAsObjectForJD : function (JD, bHighPrecision) {
        var data = this.cache[JD];
            if (!data) {
				data = AAJS.GalileanMoons.Calculate(JD, bHighPrecision);

				var dateOfJD =  AAJS.Date.JD2Date(JD);
				data['Month'] = dateOfJD.M;
				data['Day'] = dateOfJD.D;
                data['DayFraction'] = JD - Math.floor(JD);
				
				this.cache[JD] = data;
			}
		return data;
    },
    
    // used for wavy thinggie ...
    getDataForJD : function (JD, bHighPrecision) {
        var data = this.getDataAsObjectForJD(JD, bHighPrecision);
		return [
                data.Month,
                data.Day,
                data.DayFraction,
                data.Io.ApparentRectangularCoordinates.X,
                data.Io.ApparentRectangularCoordinates.Y,
                data.Europa.ApparentRectangularCoordinates.X,
                data.Europa.ApparentRectangularCoordinates.Y,
                data.Ganymede.ApparentRectangularCoordinates.X,
                data.Ganymede.ApparentRectangularCoordinates.Y,
                data.Callisto.ApparentRectangularCoordinates.X,
                data.Callisto.ApparentRectangularCoordinates.Y
                ];
    }    
};


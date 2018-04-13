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

function MoonsData (dataFunction) {
	this.cache = {};
    this.dataFunction = dataFunction;
}

(function(){
    MoonsData.prototype["reset"] = function () {
        this.cache = {};
    };
    
    MoonsData.prototype["getDataAsObjectForJD"] = function (JD, bHighPrecision) {
        var data = this.cache[JD];
            if (!data) {
				data = this.dataFunction(JD, bHighPrecision);
                for (var moon in data) {
                    data[moon].ApparentRectangularCoordinates["ApparentElongation"] = Math.sqrt(data[moon].ApparentRectangularCoordinates.X * data[moon].ApparentRectangularCoordinates.X +
                                                       data[moon].ApparentRectangularCoordinates.Y * data[moon].ApparentRectangularCoordinates.Y);
                }
                
                // when ApparentElongation is close or smaller than 1, we may have some events ..
				var dateOfJD =  GetAAJS().Date.JD2Date(JD);
				data['Month'] = dateOfJD.M;
				data['Day'] = dateOfJD.D;
                data['DayFraction'] = (JD -0.5) - Math.floor(JD - 0.5);
				
				this.cache[JD] = data;
			}
		return data;
    };
    
})();

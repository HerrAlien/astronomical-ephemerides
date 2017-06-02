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
function MoonsData (aajsDataFunction) {
	this.cache = {};
    this.aajsDataFunction = aajsDataFunction;
}

(function(){
    MoonsData.prototype["reset"] = function () {
        this.cache = {};
    };
    
    MoonsData.prototype["getDataAsObjectForJD"] = function (JD, bHighPrecision) {
        var data = this.cache[JD];
            if (!data) {
				data = this.aajsDataFunction(JD, bHighPrecision);

				var dateOfJD =  AAJS.Date.JD2Date(JD);
				data['Month'] = dateOfJD.M;
				data['Day'] = dateOfJD.D;
                data['DayFraction'] = (JD -0.5) - Math.floor(JD - 0.5);
				
				this.cache[JD] = data;
			}
		return data;
    };
    
})();

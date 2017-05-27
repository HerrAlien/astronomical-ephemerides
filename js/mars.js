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

var MarsData = new PlanetData({ number: 3, name: "Mars", 
                               semidiameterFunctionName : AAJS.Diameters.MarsSemidiameterB });

// upgrade the object to handle physical data as well.
(function () {    
    MarsData['oldGetData'] = MarsData.getDataForJD;
    MarsData['physicalDataCache'] = {};     
    MarsData.getDataForJD = function (JD) {
        var data = this.oldGetData(JD);            
        var physicalData =  this.physicalDataCache[JD];
        if (!physicalData) {
            physicalData = AAJS['Mars']['PhysicalDetails'] (JD);
            this.physicalDataCache[JD] = physicalData;
        }
        data[data.length]  = physicalData.CentralMeridianLongitude;
        data[data.length]  = physicalData.EarthDeclination;
        data[data.length]  = physicalData.SunDeclination;
        data[data.length]  = physicalData.P;
        return data;
    }
})();
    
    
(function () {
    var Page = new PlanetPage (MarsData);
    Pages["MarsPage"] = Page;

})();


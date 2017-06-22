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
                               semidiameterFunctionName :  function (delta) { if (typeof AAJS != "undefined") return AAJS.Diameters.MarsSemidiameterB(delta); } } );				

// upgrade the object to handle physical data as well.
(function () {    
    MarsData['old_GetData'] = MarsData.getDataForJD;
    MarsData['physicalDataCache'] = {};     
    MarsData.getDataForJD = function (JD) {
        var data = this.old_GetData(JD);            
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
    };
})();
    
    
(function () {
    var Page = new PlanetPage (MarsData, "MarsTable");
    Pages["Mars"] = Page;
    
    Page.tableHeaderInfo['16'] = { "0" : {"text" : "L0", "classes" : ["minWidth50", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "physicalEphemeris"]}, "longText" : "Longitude of central meridian" };
    Page.tableHeaderInfo['17'] = { "0" : {"text" : "DE", "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Planetocentric declination of Earth" };
    Page.tableHeaderInfo['18'] = { "0" : {"text" : "DS", "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Planetocentric declination of the Sun" };
    Page.tableHeaderInfo['19'] = { "0" : {"text" : "P" , "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Position angle of the North Pole" };
    

    Page["old_addPlanetTableHeader"] = Page.addPlanetTableHeader;
    Page["old_prepareLineForView"] = Page.prepareLineForView;
    
    Page.addPlanetTableHeader = function (table, classes) {
        var headerRows = this.old_addPlanetTableHeader(table, classes);
        var cellL0 = headerRows.row1.cells[16];
        cellL0.textContent = "L";
        this.addNodeChild (cellL0, "sub", "0"); 
        return headerRows;
    }
    
    Page.prepareLineForView = function (line, JD) {
        var preparedLine = this.old_prepareLineForView(line, JD);
        preparedLine[preparedLine.length] = Math.round(line[10] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[11] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[12] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[13] * 10) / 10;
        return preparedLine;
    }

})();


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

var JupiterData = new PlanetData({ number: 4, name: "Jupiter", 
                               semidiameterFunctionName :   function (delta) { if (typeof AAJS != "undefined") return AAJS.Diameters.JupiterEquatorialSemidiameterB (delta); } } );				

// upgrade the object to handle physical data as well.
(function () {    
    JupiterData['old_GetData'] = JupiterData.getDataForJD;
    JupiterData['physicalDataCache'] = {};     
    JupiterData.getDataForJD = function (JD) {
        var data = this.old_GetData(JD);            
        var physicalData =  this.physicalDataCache[JD];
        if (!physicalData) {
            physicalData = AAJS['Jupiter']['PhysicalDetails'] (JD);
            this.physicalDataCache[JD] = physicalData;
        }
        data[data.length]  = physicalData.CentralMeridianApparentLongitude_System1;
        data[data.length]  = physicalData.CentralMeridianApparentLongitude_System2;
        data[data.length]  = physicalData.EarthDeclination;
        data[data.length]  = physicalData.SunDeclination;
        data[data.length]  = physicalData.P;
        return data;
    };
})();
							   
(function () {
    var Page = new PlanetPage (JupiterData, "JupiterTable");
        Pages["Jupiter"] = Page;

    Page.tableHeaderInfo['16'] = { "0" : {"text" : "L0-S1", "classes" : ["minWidth50", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "physicalEphemeris"]}, "longText" : "Longitude of central meridian, System 1" };
    Page.tableHeaderInfo['17'] = { "0" : {"text" :"L0-S2" , "classes" : ["minWidth50", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "physicalEphemeris"]}, "longText" : "Longitude of central meridian, System 2" };
    Page.tableHeaderInfo['18'] = { "0" : {"text" :"DE"    , "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Planetocentric declination of Earth" };
    Page.tableHeaderInfo['19'] = { "0" : {"text" :"DS"    , "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Planetocentric declination of the Sun" };
    Page.tableHeaderInfo['20'] = { "0" : {"text" :"P"     , "classes" : ["minWidth40", "physicalEphemeris"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physicalEphemeris"]}, "longText" : "Position angle of the North Pole" };
    
    Page.columnClasses = Page.columnClasses.concat(["minWidth50", "minWidth50", "minWidth40", "minWidth40", "minWidth40"]);
    Page.columnClasses[12] = "minWidth50";
    Page.columnClasses[13] = "minWidth50";

    Page["old_prepareLineForView"] = Page.prepareLineForView;
    Page.prepareLineForView = function (line, JD) {
        var preparedLine = this.old_prepareLineForView(line, JD);
        preparedLine[preparedLine.length] = Math.round(line[10] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[11] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[12] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[13] * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(line[14] * 10) / 10;
        return preparedLine;
    }

    Page["old_addPlanetTableHeader"] = Page.addPlanetTableHeader;
    Page.addPlanetTableHeader = function (table, classes) {
        var headerRows = this.old_addPlanetTableHeader(table, classes);
        var cellL0S1 = headerRows.row1.cells[16];
        cellL0S1.textContent = "L";
        this.addNodeChild (cellL0S1, "sub", "0,S1"); 
        var cellL0S2 = headerRows.row1.cells[17];
        cellL0S2.textContent = "L";
        this.addNodeChild (cellL0S2, "sub", "0,S2"); 
        return headerRows;
    }

})();

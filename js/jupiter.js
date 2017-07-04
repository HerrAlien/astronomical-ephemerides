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
    JupiterData['old_GetData'] = JupiterData.getDataAsObjectForJD;
    JupiterData.getDataAsObjectForJD = function (JD, computeRiseTransitSet) {
        var data = this.old_GetData(JD, computeRiseTransitSet);            
        if (!data['EarthDeclination']) {
            var physicalData = AAJS['Jupiter']['PhysicalDetails'] (JD);
            for (var key in physicalData)
                data[key] = physicalData[key];
            this.cache[JD] = data;
        }
        return data;
    };
})();
    
							   
(function () {
    var Page = new PlanetPage (JupiterData, "JupiterTable");
        Pages["Jupiter"] = Page;

    Page.tableHeaderInfo['16'] = { "0" : {"text" : "Date", "classes" :  ["minWidth20", "displayNone"]}, "1" : {"text" : "", "classes" :       ["minWidth30", "displayNone"]}, "longText" : "Date: month" };
    Page.tableHeaderInfo['17'] = { "0" : {"text" :"" , "classes" :      ["minWidth20", "displayNone"]}, "1" : {"text" : "", "classes" :       ["minWidth30", "displayNone"]}, "longText" : "Date: day" };
    Page.tableHeaderInfo['18'] = { "0" : {"text" : "L0-S1", "classes" : ["minWidth50", "displayNone"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "displayNone"]}, "longText" : "Longitude of central meridian, System 1" };
    Page.tableHeaderInfo['19'] = { "0" : {"text" :"L0-S2" , "classes" : ["minWidth50", "displayNone"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "displayNone"]}, "longText" : "Longitude of central meridian, System 2" };
    Page.tableHeaderInfo['20'] = { "0" : {"text" :"DE"    , "classes" : ["minWidth40", "displayNone"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "displayNone"]}, "longText" : "Planetocentric declination of Earth" };
    Page.tableHeaderInfo['21'] = { "0" : {"text" :"DS"    , "classes" : ["minWidth40", "displayNone"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "displayNone"]}, "longText" : "Planetocentric declination of the Sun" };
    Page.tableHeaderInfo['22'] = { "0" : {"text" :"P"     , "classes" : ["minWidth40", "displayNone"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "displayNone"]}, "longText" : "Position angle of the North Pole" };
    
    Page.firstDataRowColumnClasses = Page.firstDataRowColumnClasses.concat([["minWidth20"], ["minWidth20"], ["minWidth50"], ["minWidth50"], ["minWidth40"], ["minWidth40"], ["minWidth40"]]);

    Page["old_prepareOneDayDataObjectForView"] = Page.prepareOneDayDataObjectForView;
    Page.prepareOneDayDataObjectForView = function (obj, JD) {
        var preparedLine = this.old_prepareOneDayDataObjectForView(obj, JD);
        preparedLine[preparedLine.length] = preparedLine[0]
        preparedLine[preparedLine.length] = preparedLine[1]
        preparedLine[preparedLine.length] = Math.round(obj.CentralMeridianApparentLongitude_System1 * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(obj.CentralMeridianApparentLongitude_System2 * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(obj.EarthDeclination * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(obj.SunDeclination * 10) / 10;
        preparedLine[preparedLine.length] = Math.round(obj.P * 10) / 10;
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

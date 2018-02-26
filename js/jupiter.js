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

var JupiterData = {};

// upgrade the object to handle physical data as well.
(function () {

    var localInit = function () {
        try {
            JupiterData = new PlanetData({ number: 4, name: "Jupiter", 
                                       semidiameterFunctionName :   function (delta) { if (typeof AAJS != "undefined") return AAJS.Diameters.JupiterEquatorialSemidiameterB (delta); } } );
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

            var Page = new PlanetPage (JupiterData, "JupiterTable");

            Page.tableHeaderInfo['16'] = { "0" : {"text" : "Date", "classes" :  ["minWidth20", "physSeenAtSmallWidth", "physPosHidden"]}, "1" : {"text" : "", "classes" :       ["minWidth30", "physSeenAtSmallWidth", "physPosHidden"]}, "longText" : "Date: month" };
            Page.tableHeaderInfo['17'] = { "0" : {"text" :"" , "classes" :      ["minWidth20", "physSeenAtSmallWidth", "physPosHidden"]}, "1" : {"text" : "", "classes" :       ["minWidth30", "physSeenAtSmallWidth", "physPosHidden"]}, "longText" : "Date: day" };
            Page.tableHeaderInfo['18'] = {  "dataKey" : 'CentralMeridianApparentLongitude_System1', "0" : {"text" : "L0-S1", "classes" : ["minWidth50", "physPosHidden"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "physPosHidden"]}, "longText" : "Longitude of central meridian, System 1 (physical ephemeris)" };
            Page.tableHeaderInfo['19'] = {  "dataKey" : 'CentralMeridianApparentLongitude_System2', "0" : {"text" :"L0-S2" , "classes" : ["minWidth50", "physPosHidden"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth50", "physPosHidden"]}, "longText" : "Longitude of central meridian, System 2 (physical ephemeris)" };
            Page.tableHeaderInfo['20'] = {  "dataKey" : 'EarthDeclination', "0" : {"text" :"DE"    , "classes" : ["minWidth40", "physPosHidden"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth40", "physPosHidden"]}, "longText" : "Planetocentric declination of Earth (physical ephemeris)" };
            Page.tableHeaderInfo['21'] = {  "dataKey" : 'SunDeclination', "0" : {"text" :"DS"    , "classes" : ["minWidth45", "physPosHidden"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth45", "physPosHidden"]}, "longText" : "Planetocentric declination of the Sun (physical ephemeris)" };
            Page.tableHeaderInfo['22'] = {  "dataKey" : 'P', "0" : {"text" :"P"     , "classes" : ["minWidth45", "physPosHidden"]}, "1" : {"text" : "\u00B0", "classes" : ["minWidth45", "physPosHidden"]}, "longText" : "Position angle of the North Pole (physical ephemeris)" };

            Page.firstDataRowColumnClasses = Page.firstDataRowColumnClasses.concat([["minWidth20", "physSeenAtSmallWidth"], ["minWidth20", "physSeenAtSmallWidth"], ["minWidth50"], ["minWidth50"], ["minWidth40"], ["minWidth40"], ["minWidth40"]]);

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

            Pages["Jupiter Ephemeris"] = Page;
        } catch (err) {
            setTimeout (localInit, 100);
        }
    }
    
    localInit();
})();

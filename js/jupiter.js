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
        if (typeof PlanetData != 'undefined' && typeof PlanetPage != 'undefined' && typeof Pages != 'undefined') {
            JupiterData = new PlanetData({
                number: 4, name: "Jupiter",
                semidiameterFunctionName: function (delta) { if (typeof GetAAJS() != "undefined") return GetAAJS().Diameters.JupiterEquatorialSemidiameterB(delta); }
            });
            JupiterData['old_GetData'] = JupiterData.getDataAsObjectForJD;
            JupiterData.getDataAsObjectForJD = function (JD, computeRiseTransitSet, computePhysical) {
                var data = this.old_GetData(JD, computeRiseTransitSet);
                if (!data['EarthDeclination'] && computePhysical) {
                    var physicalData = GetAAJS()['Jupiter']['PhysicalDetails'](JD);
                    for (var key in physicalData)
                        data[key] = physicalData[key];
                    this.cache[JD] = data;
                }
                return data;
            };

            var Page = new PlanetPage(JupiterData, "JupiterTable");

            Page.tableHeaderInfo['16'] = { "dataKey": 'CentralMeridianApparentLongitude_System1', "0": { "text": "  L0-S1" }, "1": { "text": "             \u00B0" }, "longText": "Longitude of central meridian, System 1 (physical ephemeris)" };
            Page.tableHeaderInfo['17'] = { "dataKey": 'CentralMeridianApparentLongitude_System2', "0": { "text": " L0-S2" }, "1": { "text": "     \u00B0 " }, "longText": "Longitude of central meridian, System 2 (physical ephemeris)" };
            Page.tableHeaderInfo['18'] = { "dataKey": 'EarthDeclination', "0": { "text": "  DE" }, "1": { "text": "    \u00B0" }, "longText": "Planetocentric declination of Earth (physical ephemeris)" };
            Page.tableHeaderInfo['19'] = { "dataKey": 'SunDeclination', "0": { "text": "   DS" }, "1": { "text": "    \u00B0" }, "longText": "Planetocentric declination of the Sun (physical ephemeris)" };
            Page.tableHeaderInfo['20'] = { "dataKey": 'P', "0": { "text": "    P  " }, "1": { "text": "    \u00B0" }, "longText": "Position angle of the North Pole (physical ephemeris)" };

            Page.tableHeaderInfo['21'] = {
                "0": { "text": " Date  " },
                "1": { "text": "          " },
                "longText": "Date: month",
                "dataKey": 'Month'
            };
            Page.tableHeaderInfo['22'] = {
                "0": { "text": " " },
                "1": { "text": "          " },
                "longText": "Date: day",
                "dataKey": 'Day'
            };

            Page.formattingFunctions = Page.formattingFunctions.concat([
            function (L01) { return prePadTo(L01, " ", 5); },
            function (L02) { return prePadTo(L02, " ", 5); },
            function (DE) { return prePadTo(DE, " ", 5); },
            function (DS) { return prePadTo(DS, " ", 4); },
            function (P) { return prePadTo(P, " ", 5); },
            function (month) { return prePadTo(month, " ", 3); },
            function (day) { return prePadTo(day, " ", 2); },
            ]);

            Page["old_prepareOneDayDataObjectForView"] = Page.prepareOneDayDataObjectForView;
            Page.prepareOneDayDataObjectForView = function (obj, JD) {
                var preparedLine = this.old_prepareOneDayDataObjectForView(obj, JD);
                preparedLine[preparedLine.length] = Math.round(obj.CentralMeridianApparentLongitude_System1 * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.CentralMeridianApparentLongitude_System2 * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.EarthDeclination * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.SunDeclination * 10) / 10;
                preparedLine[preparedLine.length] = Math.round(obj.P * 10) / 10;
                preparedLine[preparedLine.length] = preparedLine[0]
                preparedLine[preparedLine.length] = preparedLine[1]
                return preparedLine;
            }

            Page["old_addPlanetTableHeader"] = Page.addTableHeader;
            Page.addTableHeader = function (table, classes) {
                var header = this.old_addPlanetTableHeader(table, classes);
                var divPhysical = PlanetPage.prototype["addNodeChild"](header, "div");
                divPhysical.classList.add("hidePhaseOnPhysical");
                return header;
            }

            Pages["Jupiter Ephemeris"] = Page;
        } else {
            SyncedTimeOut(localInit, Timeout.onInit);
        }
    }

    localInit();
})();

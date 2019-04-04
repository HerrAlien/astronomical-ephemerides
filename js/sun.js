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

var SunData = {
    cache: {},

    getDataAsObjectForJD: function (JDE, computeRiseTransitSet) {
        var data = this.cache[JDE];
        if (!data) {
            data = {};
            var _date = GetAAJS().Date.JD2Date(JDE);
            // convert from JD to gregorian
            data['Month'] = _date.M;
            data['Day'] = _date.D;
            var radec = GetAAJS().Sun.EquatorialCoordinates(JDE, true);
            data['RA'] = radec.X; // RA [h.hhhh]
            data['Dec'] = radec.Y; // DEC [deg.dddd]
            var sunDistance = GetAAJS().Sun.Distance(JDE, true);
            data['DistanceToEarth'] = sunDistance;// [au]
            data['Diameter'] = GetAAJS().Sun.Diameter(JDE, true) / 3600; // [deg.dddd]

            data['MeridianTransit'] = false;
            var physical = GetAAJS().Sun.CalculatePhysicalDetails(JDE, true);
            data['P'] = physical.P; // [deg.dddd]
            data['B0'] = physical.B0; // [deg.dddd]
            data['L0'] = physical.L0; // [deg.dddd]
            data['Parallax'] = Math.atan2(6.378137e+6, 149597870700 * sunDistance) * 180 / Math.PI; // [deg.dddd]
            this.cache[JDE] = data;
        }

        if (computeRiseTransitSet) {
            data = this.addRiseTransitSetData(JDE, data);
            this.cache[JDE] = data;
        }

        return data;
    },

    getSunEarthDistance: function (JD) {
        var data = this.getDataAsObjectForJD(JD);
        return data.DistanceToEarth;
    },
    getRA: function (JD) {
        var data = this.getDataAsObjectForJD(JD);
        return data.RA;
    },
    reset: function () {
        this.cache = {};
    },
    riseSetAngle: -0.83333,
    addRiseTransitSetData: false
};


(function () {
    var Sun = {
        hostElement: document.getElementById("SunTable"),
        pageRendered: false,
        dataSource: SunData,
        tableHeaderInfo: {
            "0": {
                "0": { "text": "Date  " },
                "1": { "text": "     " },
                "longText": "Date: month",
                "dataKey": 'Month'
            },

            "1": {
                "0": { "text": " " },
                "1": { "text": " " },
                "longText": "Date: day",
                "dataKey": 'Day'
            },
            "2": {
                "0": { "text": "  \u03B1 " },
                "1": { "text": "  h  " },
                "longText": "Apparent geocentric equatorial coordinates: Right Ascension",
                "dataKey": 'RA'
            },
            "3": {
                "0": { "text": "(RA)   " },
                "1": { "text": "m  " },
                "longText": "Apparent geocentric equatorial coordinates: Right Ascension"
            },
            "4": {
                "0": { "text": " " },
                "1": { "text": " s   " },
                "longText": "Apparent geocentric equatorial coordinates: Right Ascension"
            },
            "5": {
                "0": { "text": " \u03B4 " },
                "1": { "text": " \u00B0 " },
                "longText": "Apparent geocentric equatorial coordinates: Declination",
                "dataKey": 'Dec'
            },
            "6": {
                "0": { "text": "(Dec) " },
                "1": { "text": " ' " },
                "longText": "Apparent geocentric equatorial coordinates: Declination"
            },
            "7": {
                "0": { "text": " " },
                "1": { "text": " \" " },
                "longText": "Apparent geocentric equatorial coordinates: Declination"
            },

            "8": {
                "0": { "text": "  \u0394" },
                "1": { "text": "  au", },
                "longText": "Distance to Earth, in astronomical units",
                "dataKey": 'DistanceToEarth'
            },

            "9": {
                "0": { "text": "     \u03D5" },
                "1": { "text": "   '" },
                "longText": "Apparent diameter of the Sun",
                "dataKey": 'Diameter'
            },
            "10": {
                "0": { "text": "  " },
                "1": { "text": "  \" " },
                "longText": "Apparent diameter of the Sun"
            },


            "11": {
                "0": { "text": "Rise " },
                "1": { "text": "hh:mm " },
                "longText": "The time of rise above horizon",
                "dataKey": 'Rise'
            },
            "12": {
                "0": { "text": "Transit" },
                "1": { "text": "hh:mm " },
                "longText": "The time of the transit across the meridian",
                "dataKey": 'MeridianTransit'
            },
            "13": {
                "0": { "text": " Set " },
                "1": { "text": "hh:mm " },
                "longText": "The time of setting",
                "dataKey": 'Set'
            },


            "14": {
                "0": { "text": "     P" },
                "1": { "text": "    \u00B0" },
                "longText": "Position angle of the N end of the axis of rotation (physical ephemeris). It is positive when east of the north point of the disk, negative if west.",
                "dataKey": 'P'
            },

            "15": {
                "0": { "text": "     B" },
                "1": { "text": "     \u00B0" },
                "longText": "Heliographic latitude of the centre of the disk (physical ephemeris).",
                "dataKey": 'B0'
            },

            "16": {
                "0": { "text": "        L" },
                "1": { "text": "        \u00B0" },
                "longText": "Heliographic longitude of the centre of the disk (physical ephemeris).",
                "dataKey": 'L0'
            },
            // \u03C0
            "17": {
                "0": { "text": "    \u03C0" },
                "1": { "text": "    \"" },
                "longText": "Equatorial horizontal parallax",
                "dataKey": 'Parallax'
            }
        },

        formattingFunctions: [
        function (month) { return prePadTo(month, " ", 3); },
        function (day) { return prePadTo(day, " ", 2); },
        function (RA_h) { return prePadTo(RA_h, " ", 2); },
        function (RA_m) { return prePadTo(RA_m, " ", 2); },
        function (RA_s) { return prePadTo(RA_s, " ", 4); },
        function (dec_deg) { return prePadTo(dec_deg, " ", 3); },
        function (dec_m) { return prePadTo(dec_m, " ", 2); },
        function (dec_s) { return prePadTo(dec_s, " ", 2); },
        function (delta) { return postPadTo(delta, " ", 5); },
        function (phi_min) { return prePadTo(phi_min, " ", 2); },
        function (phi_sec) { return prePadTo(phi_sec, " ", 2); },
		function (v) { return v; },
		function (v) { return v; },
		function (v) { return v; },
		function (v) { return prePadTo(v, " ", 7); },
		function (v) { return prePadTo(v, " ", 6); },
		function (v) { return prePadTo(v, " ", 7); },
		function (v) { return prePadTo(v, " ", 5); },
        ],

        lastDisplayedMonth: -1,
        months: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        // this will probably become an utility available for every page
        lastAppendedLine: false,

        prepareOneDayDataObjectForView: function (obj, JD) {
            var displayableLine = [];

            displayableLine[0] = "";
            var month = obj.Month;
            if (month != this.lastDisplayedMonth) { // first day of the month
                displayableLine[0] = this.months[month]; // set displayableLine[0] to the name of the month
                this.lastDisplayedMonth = month;
            }

            // copy the day verbatim
            displayableLine[1] = obj.Day;

            var di = 2;
            var sexagesimalRA = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.RA * 36000) / 36000);
            displayableLine[di++] = sexagesimalRA.Ord3;
            displayableLine[di++] = sexagesimalRA.Ord2
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.Dec * 3600) / 3600);
            displayableLine[di++] = sexagesimalDec.Ord3;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;

            displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.DistanceToEarth);

            var sexagesimalDiam = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.Diameter * 3600) / 3600);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;

            displayableLine[di++] = obj.bRiseValid ? this.timeToHhColumnMm(obj.Rise) : "N/A";
            displayableLine[di++] = obj.bTransitValid ? this.timeToHhColumnMm(obj.MeridianTransit) : "N/A";
            displayableLine[di++] = obj.bSetValid ? this.timeToHhColumnMm(obj.Set) : "N/A";

            displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.P);
            displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.B0);
            displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.L0);

            displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.Parallax * 3600); // just arcsecs

            return displayableLine;
        },

        addTableHeader: function (table, classes) {

            var result = this.oldAddHeader(table, classes);
            // add some subscripts
            return result;
        },

    };

    var localInit = function () {
        if (typeof PlanetData != 'undefined' && typeof PlanetPage != 'undefined' && typeof Pages != 'undefined') {
            SunData.addRiseTransitSetData = PlanetData.prototype.addRiseTransitSetData;
            SunData.isAboveHorizon = PlanetData.prototype.isAboveHorizon;
            Sun.reset = PlanetPage.prototype.reset;
            Sun.displayPage = PlanetPage.prototype.displayPage;
            Sun.timeToHhColumnMm = PlanetPage.prototype.timeToHhColumnMm;
            Sun.appendLine = PlanetPage.prototype.appendLine;
            Sun.addNodeChild = PlanetPage.prototype.addNodeChild;
            Sun.oldAddHeader = PlanetPage.prototype.addTableHeader;
            Pages["Sun Ephemeris"] = Sun;
        } else {
            SyncedTimeOut(localInit, Timeout.onInit);
        }
    }

    localInit();

})();

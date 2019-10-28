
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

var SolarEclipsesPage = {

    hostElement: document.getElementById("SolarEclipsesContainer"),
    pageRendered: false,

    // clears up the rendered thing
    displayPage: function () {

        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD || typeof BesselianElements == 'undefined')
            return SyncedTimeOut(function () { SolarEclipsesPage.displayPage(); }, Timeout.onInit);

        if (SolarEclipsesPage.pageRendered)
            return;

        SolarEclipsesPage.reset();
        var startJD = PageTimeInterval.JD;
        var numberOfConjunctions = Math.round(PageTimeInterval.days / MoonEclipsesPage.dataSource.sinodicPeriod);

        var startK = GetAAJS().Moon.kForJD(startJD);
        if (startK < 0)
            startK = -1 * Math.ceil(Math.abs(startK));
        else
            startK = Math.ceil(Math.abs(startK));

        var endK = startK + numberOfConjunctions;

        function processK(k, endingK) {
            if (k >= endingK) {
                SolarEclipsesPage.pageRendered = true;
                return;
            }

            var eclipseData = SolarEclipsesPage.dataSource.EclipseDataForK(k);
            if (eclipseData.bEclipse)
                SolarEclipsesPage.drawNewEclipse(eclipseData);

            requestAnimationFrame(function () { processK(k + 1, endingK); });
        }

        processK(startK, endK);
    },

    getTypeOfEclipseString: function (eclipseData) {
        var oldOpt = TimeStepsData.useLocalTime;
        TimeStepsData.useLocalTime = false;
        TimeStepsData.useLocalTime = oldOpt;
        var description = "";

        if (eclipseData.isPartial)
            description += "Partial ";
        if (eclipseData.isTotal)
            description += "Total ";
        if (eclipseData.isAnnular)
            description += "Annular ";
        if (eclipseData.isAnnularTotal)
            description += "Hybrid ";
        description += "Eclipse.";

        if (!eclipseData["t1"]) {
            description += " Not visible from your location.";
        }

        return description;
    },

    getId: function (eclipseData) {
        return "SolarEclipse" + eclipseData.t0;
    },

    getNavigationObject : function (eclipseData) {
        return { page: "Solar Eclipses",
        actions: [{ name: "scroll", parameters: SolarEclipsesPage.getId(eclipseData)}]};
    },

    getShareEventTitle : function (eclipseData) {
        return "Solar Eclipse: " + SolarEclipsesPage.getTypeOfEclipseString(eclipseData);
    },

    drawNewEclipse: function (eclipseData) {
        var yyyymmdd_hhmmOfJD = PlanetPage.prototype.yyyymmdd_hhmmOfJD;

        var addNodeChild = PlanetPage.prototype.addNodeChild;
        var mainDiv = addNodeChild(SolarEclipsesPage.hostElement, "div");
        mainDiv["id"] = this.getId(eclipseData);
        mainDiv.classList.add("solarEclipse");
        mainDiv.classList.add("individualEventSection");

        var oldOpt = TimeStepsData.useLocalTime;
        TimeStepsData.useLocalTime = false;
        var dateTime = yyyymmdd_hhmmOfJD(eclipseData.t0);
        TimeStepsData.useLocalTime = oldOpt;

        var description = this.getTypeOfEclipseString(eclipseData);

        var decimalsFactor = 1e5;

        var shareAnchor = addNodeChild(mainDiv, "a");
        shareAnchor.classList.add("shareIcon");
        //shareAnchor.href = "#" + JSON.stringify(this.getNavigationObject(oppositionData));
        shareAnchor.onclick = function() { PlanetPage.prototype["share"](
            SolarEclipsesPage.getShareEventTitle(eclipseData),
            "%23" + JSON.stringify(SolarEclipsesPage.getNavigationObject(eclipseData))
        )};


        addNodeChild(mainDiv, "h2", dateTime.date.Y + "-" + dateTime.date.M + "-" + dateTime.date.D + " " + description);

        if (eclipseData.t1) {

            function timeString(t) {
                var _t = yyyymmdd_hhmmOfJD(t);
                return _t.time.Ord3 + ":" + _t.time.Ord2;
            }

            addNodeChild(mainDiv, "h3", "Local circumstances:");
            var timings = addNodeChild(mainDiv, "span");
            timings.textContent = "Magnitude: " + GetAAJS().Numerical.RoundTo2Decimals(eclipseData["magnitude"]);;

            var localsTable = addNodeChild(mainDiv, "table");
            var timings = {
                t1: "Eclipse starts (T1)",
                t2: "Totality starts (T2)",
                tMax: "Time of maximum",
                t3: "Totality ends (T3)",
                t4: "Eclipse ends (T4)"
            };
            for (var key in timings) {
                if (!eclipseData[key]) {
                    continue;
                }
                var localRow = addNodeChild(localsTable, "tr");
                addNodeChild(localRow, "td", timings[key]);
                addNodeChild(localRow, "td", timeString(eclipseData[key]));
            }

            var positionAngles = {
                PA1: "Position angle: first contact",
                PA4: "Position angle: last contact"
            };
            for (var key in positionAngles) {
                if (!eclipseData[key]) {
                    continue;
                }
                var localRow = addNodeChild(localsTable, "tr");
                addNodeChild(localRow, "td", positionAngles[key]);
                addNodeChild(localRow, "td", Math.round(eclipseData[key]));
            }

        }

        addNodeChild(mainDiv, "h3", "Besselian elements:");
        addNodeChild(mainDiv, "span", "T0 = " + dateTime.time.Ord3 + ":" + dateTime.time.Ord2 + " DT");

        var table = addNodeChild(mainDiv, "table");
        var header = addNodeChild(table, "tr");

        addNodeChild(header, "th", "");
        addNodeChild(header, "th", "0");
        addNodeChild(header, "th", "1");
        addNodeChild(header, "th", "2");
        addNodeChild(header, "th", "3");

        var elements = {
            "x": "x",
            "y": "y",
            "mu": "\u03BC",
            "d": "d",
            "l1": "l1",
            "l2": "l2"
        };

        function addRowDataForParameter(paramName) {
            var row = addNodeChild(table, "tr");
            addNodeChild(row, "td", elements[paramName]);

            for (var degree = 0; degree < eclipseData.besselianElements[paramName].length; degree++) {
                addNodeChild(row, "td", Math.round(decimalsFactor * eclipseData.besselianElements[paramName][degree]) / decimalsFactor + "");
            }
        }

        for (var key in elements) {
            addRowDataForParameter(key);
        }

        var row = addNodeChild(table, "tr");
        addNodeChild(row, "td", "tan (f1)");
        addNodeChild(row, "td", Math.round(eclipseData.besselianElements.tan_f1 * 1e7) / 1e7);
        for (var i = 0; i < 3; i++)
            addNodeChild(row, "td", "0");

        row = addNodeChild(table, "tr");
        addNodeChild(row, "td", "tan (f2)");
        addNodeChild(row, "td", Math.round(eclipseData.besselianElements.tan_f2 * 1e7) / 1e7);
        for (var i = 0; i < 3; i++)
            addNodeChild(row, "td", "0");


    },
    keywordsArray: ["Besselian", "Elements", "Shadow", "Umbra", "Penumbra", "Antumbra", "Partial", "Total", "Annular", "Eclipse",
                      "Contact", "First", "Last"]

};

(function () {
    var initLocal = function () {
        try {
            SolarEclipsesPage.dataSource = SolarEclipses;
            SolarEclipsesPage.reset = PlanetPage.prototype.reset;
            Pages["Solar Eclipses"] = SolarEclipsesPage;
        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    };
    initLocal();
})();


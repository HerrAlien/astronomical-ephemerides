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

function prePadTo(v, pad, cnt) {
    var res = String(v);
    while (res.length < cnt)
        res = pad + res;
    return res;
}

function postPadTo(v, pad, cnt) {
    var res = String(v);
    while (res.length < cnt)
        res += pad;
    return res;
}


function PlanetPage(planetDataSource, tableName) {
    if (planetDataSource) {
        this.dataSource = planetDataSource;
        this.hostElement = document.getElementById(this.dataSource.planet.name);
    }

    if (tableName)
        this.hostElement = document.getElementById(tableName);

    this.pageRendered = false;
    this.lastAppendedLine = false;

    this.tableHeaderInfo = {
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
            "0": { "text": "\u03D5 " },
            "1": { "text": " \" " },
            "longText": "Apparent diameter",
            "dataKey": 'Diameter'
        },
        "9": {
            "0": { "text": "Rise " },
            "1": { "text": "hh:mm " },
            "longText": "The time of rise above horizon",
            "dataKey": 'Rise'
        },
        "10": {
            "0": { "text": "Transit" },
            "1": { "text": "hh:mm " },
            "longText": "The time of the transit across the meridian",
            "dataKey": 'MeridianTransit'
        },
        "11": {
            "0": { "text": " Set " },
            "1": { "text": "hh:mm " },
            "longText": "The time of setting",
            "dataKey": 'Set'
        },

        "12": {
            "0": { "text": "    \u0394   " },
            "1": { "text": "  au   " },
            "longText": "Distance to Earth, in astronomical units",
            "dataKey": 'DistanceToEarth'
        },

        "13": {
            "0": { "text": "   R   " },
            "1": { "text": "  au   " },
            "longText": "Distance to Sun, in astronomical units",
            "dataKey": 'DistanceToSun'
        },

        "14": {
            "0": { "text": " Elong" },
            "1": { "text": "   \u00B0" },
            "longText": "Elongation angle from the Sun",
            "dataKey": 'Elongation'
        },

        "15": {
            "0": { "text": "  Phase" },
            "1": { "text": "" },
            "longText": "The phase of the planet (illuminated fraction of disk, as seen from Earth)",
            "dataKey": 'Phase'
        }
    };

    this.lastDisplayedMonth = -1;
    this.months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    this.formattingFunctions = [
    function (month) { return prePadTo(month, " ", 3); },
    function (day) { return prePadTo(day, " ", 2); },
    function (RA_h) { return prePadTo(RA_h, " ", 2); },
    function (RA_m) { return prePadTo(RA_m, " ", 2); },
    function (RA_s) { return prePadTo(RA_s, " ", 4); },
    function (dec_deg) { return prePadTo(dec_deg, " ", 3); },
    function (dec_m) { return prePadTo(dec_m, " ", 2); },
    function (dec_s) { return prePadTo(dec_s, " ", 2); },
    function (phi) { return prePadTo(phi, " ", 2); },
    function (rise) { return rise; },
    function (transit) { return transit; },
    function (set) { return set; },
    function (delta) { return postPadTo(delta, " ", 6); },
    function (R) { return postPadTo(R, " ", 6); },
    function (E) { return prePadTo(E, " ", 7); },
    function (P) { return postPadTo(P, " ", 5); },

    ];

    this.header = null;
}

(function () {

    PlanetPage.prototype["displayPage"] = function () {
        var pageObj = this;
        WHEN (function() {return ! (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD); },
              function() {
                var JD = PageTimeInterval.JD;
                var daysAfter = PageTimeInterval.days;
                var stepSize = PageTimeInterval.stepSize;

                pageObj.lastAppendedLine = false;
                if (!pageObj.pageRendered) {
                    pageObj.reset();

                    // so far we have no styling, so suppress the first header for now.
                    // this.addTableHeader (this.hostElement, [["fixed", "firstHeaderRow"], ["fixed", "secondHeaderRow"]]);

                    var hostElement = pageObj.hostElement;
                    var columnClasses = pageObj.firstDataRowColumnClasses;
                    var dataSource = pageObj.dataSource;

                    var delayedAppendData = function (JD, endJD, steps, hostElement, columnClasses, dataSource) {
                        if (JD >= endJD)
                            return;

                        var i = 0;
                        var docFragment = hostElement.ownerDocument.createDocumentFragment();
                        var span = pageObj.addNodeChild(docFragment, "span");

                        for (i = 0; i < steps; i++, JD += stepSize) {
                            if (JD >= endJD) {
                                break;
                            }

                            var JDE = JD + GetAAJS().DynamicalTime.DeltaT(JD) / (3600 * 24);

                            var preparedData = pageObj.prepareOneDayDataObjectForView(pageObj.dataSource.getDataAsObjectForJD(JDE, true, true), JDE);
                            var changedMonth = !pageObj.lastAppendedLine ||
                                                (preparedData[0] && pageObj.lastAppendedLine[0] != preparedData[0]);

                            if (changedMonth) {
                                var header = pageObj.addTableHeader(docFragment);
                                if (!pageObj.header) {
                                    pageObj.header = header;
                                } else {
                                    header.classList.add("printOnly");
                                }
                                span = pageObj.addNodeChild(docFragment, "span");
                            }


                            pageObj.appendLine(preparedData, columnClasses, span);
                        }

                        hostElement.appendChild(docFragment);
                        requestAnimationFrame(function () { delayedAppendData(JD, endJD, steps, hostElement, columnClasses, dataSource); });
                    }
                    delayedAppendData(JD, JD + daysAfter, 20, hostElement, columnClasses, dataSource);
                    pageObj.pageRendered = true;
                }
            }
        );
    };

    PlanetPage.prototype["appendLine"] = function (dataArray, classes, docFragment) {

        var line = "";
        var i = 0;
        for (i = 0; i < dataArray.length; i++) {
            line += this.formattingFunctions[i](dataArray[i]) + " ";

        }

        docFragment.textContent = docFragment.textContent + line + "\n";
        this.lastAppendedLine = dataArray;
    };

    PlanetPage.prototype["addTableHeader"] = function (table, rowClasses, columnClasses) {
        var headerText = "";
        for (var rowIndex = 0; rowIndex < 2; rowIndex++) {
            for (var headerKey in this.tableHeaderInfo) {
                headerText += this.tableHeaderInfo[headerKey][rowIndex]['text'];
            }
            headerText += "\n";
        }

        var header = this.addNodeChild(table, "span", headerText);
        header.classList.add("planetTableHeader");
        return header;
    };

    PlanetPage.prototype["reset"] = function (keepData) {
        while (this.hostElement.hasChildNodes()) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }
        this.pageRendered = false;
        this.header = false;
        // reset the data - transits depend on the longitude
        if (keepData && this.dataSource.reset) {
            this.dataSource.reset();
        }
    };

    PlanetPage.prototype["prepareOneDayDataObjectForView"] = function (obj, JD) {

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

        displayableLine[di++] = Math.round(obj.Diameter * 3600);

        displayableLine[di++] = this.timeToHhColumnMm(obj.Rise);
        displayableLine[di++] = this.timeToHhColumnMm(obj.MeridianTransit);
        displayableLine[di++] = this.timeToHhColumnMm(obj.Set);

        displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.DistanceToEarth);
        displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.DistanceToSun);

        // is it east or is it west?
        var cardinalCoordinateRelativeToSun = "W";

        var sunRA = SunData.getRA(JD);
        var planetRA = obj.RA;
        var delta = planetRA - sunRA;
        // this is probably because we have one angle in q1, the other in q4.
        if (Math.abs(delta) >= 12) // hours ...
        {
            if (delta > 0)
                delta -= 24;
            else
                delta += 24;
        }

        if (delta > 0)
            cardinalCoordinateRelativeToSun = "E";

        displayableLine[di++] = GetAAJS().Numerical.RoundTo1Decimal(obj.Elongation) + " " + cardinalCoordinateRelativeToSun;
        displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals(obj.Phase);

        return displayableLine;
    };

    PlanetPage.prototype["addNodeChild"] = function (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent = content;
        return child;
    };

    PlanetPage.prototype["timeToHhColumnMm"] = function (JD) {
        var res = PlanetPage.prototype.yyyymmdd_hhmmOfJD(JD);
        return res.time.Ord3 + ":" + res.time.Ord2;
    };

    PlanetPage.prototype["yyyymmdd_hhmmOfJD"] = function (JD, timeAccuracy) {
        var fullDayJD = 0.5 + Math.floor(JD - 0.5);
        var dayFraction = JD - fullDayJD;
        if (dayFraction < 0) dayFraction += 1;

        if (!timeAccuracy) {
            timeAccuracy = 1 / (24 * 60);
        }

        var roundedDayFraction = Math.round(dayFraction / timeAccuracy) * timeAccuracy;

        var dateOfJD = GetAAJS().Date.JD2Date(fullDayJD);
        var roundedTime = roundedDayFraction * 24;
        var sexagesimalTime = GetAAJS().Numerical.ToSexagesimal(roundedTime);

        if (TimeStepsData.useLocalTime) {
            var lt = new Date(Date.UTC(dateOfJD.Y, dateOfJD.M - 1, 
            dateOfJD.D, sexagesimalTime.Ord3, sexagesimalTime.Ord2, sexagesimalTime.Ord1));

            dateOfJD.Y = lt.getFullYear();
            dateOfJD.M = Number(lt.getMonth()) + 1;
            dateOfJD.D = lt.getDate();

            sexagesimalTime.Ord3 = lt.getHours();
            sexagesimalTime.Ord2 = lt.getMinutes();
            sexagesimalTime.Ord1 = lt.getSeconds();

        }

        if (dateOfJD.M < 10) dateOfJD.M = "0" + dateOfJD.M;
        if (dateOfJD.D < 10) dateOfJD.D = "0" + dateOfJD.D;

        if (sexagesimalTime.Ord3 < 10) sexagesimalTime.Ord3 = "0" + sexagesimalTime.Ord3;
        if (sexagesimalTime.Ord2 < 10) sexagesimalTime.Ord2 = "0" + sexagesimalTime.Ord2;
        if (sexagesimalTime.Ord1 < 10) sexagesimalTime.Ord1 = "0" + sexagesimalTime.Ord1;

        return { 'date': dateOfJD, 'time': sexagesimalTime };
    };

    function setupShareAnchor(a, title, navigationObject) {
        a.classList.add("shareIcon");
        a.classList.add("cta");

        var shareURL = document.location.origin + document.location.pathname + 
                      "?navigationObject=" + encodeURI(JSON.stringify(navigationObject));

        if (navigator.share) {
            a.onclick = function() {navigator.share(
                { text: title,
                  title: title,
                  // to be refined ...
                  url: shareURL
                });
            };
        } else {
            a.href = shareURL;
        }

        return a;
    }

    PlanetPage.prototype["addShareIcon"] = function (hostElement, title, navigationObject) {
        var a = PlanetPage.prototype.addNodeChild(hostElement, "a");
        return setupShareAnchor (a, title, navigationObject);
    }


    PlanetPage.prototype["addFirstChildShareIcon"] = function (hostElement, title, navigationObject) {
        var a = document.createElement("a");
        hostElement.insertBefore(a, hostElement.firstChild);
        return setupShareAnchor (a, title, navigationObject);
    }

})();

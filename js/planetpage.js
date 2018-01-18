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

function PlanetPage (planetDataSource, tableName) {
    if (planetDataSource) {
        this.dataSource = planetDataSource;
        this.hostElement = document.getElementById(this.dataSource.planet.name);
    }
    
    if (tableName)
        this.hostElement = document.getElementById(tableName);
    
    this.pageRendered = false;
    this.lastAppendedLine = false;

    this.tableHeaderInfo = {
        "0" : {
                "0" : { "text" : "Date", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: month"
            } ,

        "1" : {
                "0" : { "text" : "", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: day"
            },
        "2" : {
                "0" : { "text" : "\u03B1", "classes" : ["minWidth20"] },
                "1" : { "text" : "h", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "3" : {
                "0" : { "text" : "(RA)", "classes" : ["minWidth20", "screenOnly"] },
                "1" : { "text" : "m", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "4" : {
                "0" : { "text" : "", "classes" : ["minWidth10"] },
                "1" : { "text" : "s", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "5" :  {
                "0" : { "text" : "\u03B4", "classes" : ["minWidth20"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth25"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "6" :  {
                "0" : { "text" : "(Dec)", "classes" : ["minWidth20", "screenOnly" ] },
                "1" : { "text" : "'", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "7" :  {
                "0" : { "text" : "", "classes" : ["minWidth10"  ] },
                "1" : { "text" : "''", "classes" : ["minWidth25"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "8" :  {
                "0" : { "text" : "\u03D5", "classes" : ["minWidth20"] },
                "1" : { "text" : "''", "classes" : ["minWidth20"    ] },
                "longText" : "Apparent diameter"
            },
        "9" : {
                   "0" : { "text" : "Rise", "classes" :  ["minWidth50"] },
                   "1" : { "text" : "hh:mm", "classes" : ["minWidth50"] },
                   "longText" : "The UTC time of rise above horizon"
            },
        "10" : {
                   "0" : { "text" : "Transit", "classes" : ["minWidth40"  ] },
                   "1" : { "text" : "hh:mm", "classes" : ["minWidth50"] },
                   "longText" : "The UTC time of the transit across the meridian"
            },
        "11" : {
                   "0" : { "text" : "Set", "classes" : ["minWidth40"  ] },
                   "1" : { "text" : "hh:mm", "classes" : ["minWidth55"] },
                   "longText" : "The UTC time of setting"
            },

            "12" :  {
                "0" : { "text" : "\u0394", "classes" : ["minWidth55"] },
                "1" : { "text" : "A.U.", "classes" : ["minWidth55"  ] },
                "longText" : "Distance to Earth, in astronomical units"
            },

            "13" :  {
                "0" : { "text" : "R", "classes" : ["minWidth55"   ] },
                "1" : { "text" : "A.U.", "classes" : ["minWidth55"] },
                "longText" : "Distance to Sun, in astronomical units"
            },

            "14" :  {
                "0" : { "text" : "Elong", "classes" : ["minWidth70" ] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth62"] },
                "longText" : "Elongation angle from the Sun"
            },

        "15" :  {
                "0" : { "text" : "Phase", "classes" : ["minWidth50"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth50"] },
                "longText" : "The phase of the planet (illuminated fraction of disk, as seen from Earth)"
            }
        };
    
    this.lastDisplayedMonth = -1;
    this.months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    this.firstDataRowColumnClasses = [ ["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth20"],
                           ["minWidth25"], ["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth50"], 
                           ["minWidth50"], ["minWidth50"], ["minWidth55"], ["minWidth55"], ["minWidth62"],
                           ["minWidth45"] ];
}

(function(){
    
    
    PlanetPage.prototype["displayPage"] = function () {
            var pageObj = this;
            if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD)
                return setTimeout (function() { pageObj.displayPage(); }, 300);
            
            var JD = PageTimeInterval.JD;
            var daysAfter =  PageTimeInterval.days;
            var stepSize = PageTimeInterval.stepSize;
            
            this.lastAppendedLine = false;
            if (!this.pageRendered) {
                this.reset();
                
                this.addTableHeader (this.hostElement, [["fixed", "firstHeaderRow"], ["fixed", "secondHeaderRow"]]);

                var hostElement = pageObj.hostElement;
                var columnClasses = pageObj.firstDataRowColumnClasses;
                var dataSource = pageObj.dataSource;
                
                var delayedAppendData = function (JD, endJD, steps, hostElement, columnClasses, dataSource) {
                    if (JD >= endJD)
                        return;
                    
                    var i = 0;
                    var docFragment = hostElement.ownerDocument.createDocumentFragment();
                    
                    for (i = 0; i < steps; i++, JD+=stepSize) {
                        if (JD >= endJD)
                            break;
                        
                        var preparedData = pageObj.prepareOneDayDataObjectForView(pageObj.dataSource.getDataAsObjectForJD(JD, true), JD);
                        pageObj.appendLine (preparedData, columnClasses, docFragment);
                    }
                    
                    pageObj.addTableHeader (docFragment, [["fixed", "printOnly"], ["fixed", "printOnly"]]);
                    
                    hostElement.appendChild(docFragment);
                    
                    requestAnimationFrame (function() {delayedAppendData (JD, endJD, steps, hostElement, columnClasses, dataSource); });
                }
                delayedAppendData (JD, JD + daysAfter, 20, hostElement, columnClasses, dataSource);
                this.pageRendered = true;
            }
        };
    
    PlanetPage.prototype["appendLine"] = function (dataArray, classes, docFragment) {
            var line = this.hostElement.ownerDocument.createElement("tr");
            if (!docFragment)
                docFragment = this.hostElement;
            
            var changedMonth = this.lastAppendedLine && dataArray[0] && this.lastAppendedLine[0] != dataArray[0];
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
                if (changedMonth)
                    td.classList.add("topBorder");

                if (i > 1)
                {
                    if (i < 15)
                        td.classList.add ("positionEphemeris");
                    else
                        td.classList.add ("physicalEphemeris");
                }
                
                if (!!classes && !!classes[i]) {
                    var colClasses = classes[i];
                    for (var classIndex = 0; classIndex < colClasses.length; classIndex++)
                        td.classList.add (colClasses[classIndex]);
                }
            }
            docFragment.appendChild(line);
            this.lastAppendedLine = dataArray;
        };
        
    PlanetPage.prototype["addTableHeader"] = function (table, rowClasses, columnClasses) {
        var rows = [];
        for (var rowIndex = 0; rowIndex < 2; rowIndex++) {
            var row = this.addNodeChild (table, "tr");
            var currentRowClasses = rowClasses[rowIndex];
            for (var classIndex = 0; classIndex < rowClasses.length; classIndex++)
                row.classList.add (currentRowClasses[classIndex]);

            for (var headerKey in this.tableHeaderInfo) {
                var th = this.addNodeChild (row, "th", this.tableHeaderInfo[headerKey][rowIndex]['text']);
                th['title'] = this.tableHeaderInfo[headerKey].longText;
                th.onclick = function () { alert (this.title); }
                
                var columnsClasses = this.tableHeaderInfo[headerKey][rowIndex]['classes']
                if (!!columnsClasses)
                {
                    for (var columnsClassesIndex in columnsClasses)
                        th.classList.add (columnsClasses[columnsClassesIndex]);
                }
            }
            rows[rowIndex] = row;
        }
        return {"row1" : rows[0], "row2" : rows[1] };
    };

    PlanetPage.prototype["reset"] = function () {
        while (this.hostElement.hasChildNodes()) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }
        this.pageRendered = false;
        // reset the data - transits depend on the longitude
        this.dataSource.reset();
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
        var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(obj.RA * 3600)/3600);
        displayableLine[di++] = sexagesimalRA.Ord3 ;
        displayableLine[di++] = sexagesimalRA.Ord2 
        displayableLine[di++] = sexagesimalRA.Ord1;

        var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(obj.Dec * 3600)/3600);
        displayableLine[di++] = sexagesimalDec.Ord3 ;
        displayableLine[di++] = sexagesimalDec.Ord2;
        displayableLine[di++] = sexagesimalDec.Ord1;
		
        var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(obj.Diameter * 3600)/3600);
        displayableLine[di++] = sexagesimalDiam.Ord1;
        
        displayableLine[di++] = this.timeToHhColumnMm(obj.Rise);
        displayableLine[di++] = this.timeToHhColumnMm(obj.MeridianTransit);
        displayableLine[di++] = this.timeToHhColumnMm(obj.Set);
        
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.DistanceToEarth);
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.DistanceToSun);
        
        // is it east or is it west?
        var cardinalCoordinateRelativeToSun = "W";
        
        var sunRA = SunData.getRA(JD);
        var planetRA = obj.RA;
        // this is probably because we have one angle in q1, the other in q4.
        if (Math.abs(sunRA - planetRA) >= 12) // hours ...
        {
            sunRA += 12;
            planetRA += 12;
            
            if (sunRA > 24)
                sunRA -= 24;
            if (planetRA > 24)
                planetRA -= 24;
        }
        
        if (sunRA < planetRA )
            cardinalCoordinateRelativeToSun = "E";
        
        displayableLine[di++] = AAJS.Numerical.RoundTo1Decimal (obj.Elongation * 180 / Math.PI) + " " + cardinalCoordinateRelativeToSun;
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.Phase);
        
        return displayableLine;
    };

	PlanetPage.prototype["addNodeChild"] = function (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent =  content;
        return child;
    };
    
    PlanetPage.prototype["timeToHhColumnMm"] = function (timeHdotHhh) {
        var roundedTime = Math.round(timeHdotHhh * 60) / 60;
        var roundedTimeObj = AAJS.Numerical.ToSexagesimal (roundedTime);
        return (roundedTimeObj.Ord3 >= 10 ? roundedTimeObj.Ord3 : "0" + roundedTimeObj.Ord3) + ":" +
               (roundedTimeObj.Ord2 >= 10 ? roundedTimeObj.Ord2 : "0" + roundedTimeObj.Ord2)
    };
    
    PlanetPage.prototype["yyyymmdd_hhmmOfJD"] = function (JD) {
        var fullDayJD = 0.5 + Math.floor(JD - 0.5);
        var dayFraction = JD - fullDayJD;
        if (dayFraction < 0) dayFraction += 1;
        
        var dateOfJD =  AAJS.Date.JD2Date(fullDayJD);

        if (dateOfJD.M < 10) dateOfJD.M = "0" + dateOfJD.M;
        if (dateOfJD.D < 10) dateOfJD.D = "0" + dateOfJD.D;
        
        var roundedTime = Math.round(dayFraction * 24 * 60) / 60;
        var sexagesimalTime = AAJS.Numerical.ToSexagesimal (roundedTime);

        if (sexagesimalTime.Ord3 < 10) sexagesimalTime.Ord3 = "0" + sexagesimalTime.Ord3;
        if (sexagesimalTime.Ord2 < 10) sexagesimalTime.Ord2 = "0" + sexagesimalTime.Ord2;
        if (sexagesimalTime.Ord1 < 10) sexagesimalTime.Ord1 = "0" + sexagesimalTime.Ord1;
        
        return { 'date': dateOfJD, 'time' : sexagesimalTime };
    };
    
})();						   
	
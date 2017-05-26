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


    var SunData = {
        cache : {},
        getDataForJD : function (JD) {
            var line = this.cache[JD];
            if (!line) {
                line = [];
                var i = 0;
                var _date = AAJS.Date.JD2Date(JD);
                // convert from JD to gregorian
                line[i++] = _date.M;
                line[i++] = _date.D;
                var radec = AAJS.Sun.EquatorialCoordinates(JD, true);
                line[i++] = radec.X; // RA [h.hhhh]
                line[i++] = radec.Y; // DEC [deg.dddd]
                var sunDistance = AAJS.Sun.Distance(JD, true);
				line[i++] = sunDistance;// [au]
                line[i++] = AAJS.Sun.Diameter(JD, true)/3600; // [deg.dddd]
                
                // transit should be computed from the RA (LST to UTC conversion)
                var jdOfTransit = AAJS.Date.LST2NextJD(radec.X, JD, Location.longitude);
                if (jdOfTransit - JD > 1)
                    jdOfTransit -= 1;
                
                for (var transitIndex = 0; transitIndex < 2; transitIndex++) {
                    radec = AAJS.Sun.EquatorialCoordinates(jdOfTransit, true);
                    jdOfTransit = AAJS.Date.LST2NextJD(radec.X, JD, Location.longitude);
                    if (jdOfTransit - JD > 1)
                        jdOfTransit -= 1;
                }
                
                line[i++] = 24 * (jdOfTransit - JD);
                var physical = AAJS.Sun.CalculatePhysicalDetails(JD, true);
                line[i++] = physical.P; // [deg.dddd]
                line[i++] = physical.B0; // [deg.dddd]
                line[i++] = physical.L0; // [deg.dddd]
                line[i++] = Math.atan2(6.378137e+6,149597870700 * sunDistance) * 180/Math.PI; // [deg.dddd]
            }
            this.cache[JD] = line;
            return line;
        },
        initFromLocalStorage : function () {
            // TODO: this is where we fetch data already computed during earlier sessions
        },
		getSunEarthDistance : function(JD) {
			var line = this.getDataForJD(JD);
			return line[4];
		},
        getRA : function(JD) {
			var line = this.getDataForJD(JD);
			return line[2];
		}
    };
    SunData.initFromLocalStorage();

(function(){    
    var SunPage = {
        table : document.getElementById("Sun"),
        tablePopulated : false,
        reset : function () {
            while (this.table.hasChildNodes()) {
                this.table.removeChild(this.table.firstChild);
            }
            this.tablePopulated = false;
        },
        
        tableHeaderInfo : {
            "0" : {
                    "1" : "Date",
                    "2" : "",
                    "longText" : "Date: month"
                } ,

            "1" : {
                    "1" : "",
                    "2" : "",
                    "longText" : "Date: day"
                },
            "2" : {
                    "1" : "RA",
                    "2" : "h",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "3" : {
                    "1" : "",
                    "2" : "m",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "4" : {
                    "1" : "",
                    "2" : "s",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "5" :  {
                    "1" : "Dec.",
                    "2" : "\u00B0",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "6" :  {
                    "1" : "",
                    "2" : "'",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "7" :  {
                    "1" : "",
                    "2" : "''",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "8" :  {
                    "1" : "Delta",
                    "2" : "A.U.",
                    "longText" : "Distance to Earth, in astronomical units"
                },
            
            "9" :  {
                    "1" : "Diam.",
                    "2" : "'",
                    "longText" : "Apparent diameter of the Sun"
                },
            "10" :  {
                    "1" : "",
                    "2" : "''",
                    "longText" : "Apparent diameter of the Sun"
                },
                
            "11" : {
                    "1" : "Transit",
                    "2" : "h",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "12" : {
                    "1" : "",
                    "2" : "m",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "13" : {
                    "1" : "",
                    "2" : "s",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "14" :  {
                    "1" : "P",
                    "2" : "\u00B0",
                    "longText" : "Position angle of the N end of the axis of rotation. It is positive when east of the north point of the disk, negative if west."
                },

            "15" :  {
                    "1" : "B",
                    "2" : "\u00B0",
                    "longText" : "Heliographic latitude of the centre of the disk."
                },

            "16" :  {
                    "1" : "L",
                    "2" : "\u00B0",
                    "longText" : "Heliographic longitude of the centre of the disk."
                },
                // \u03C0
            "17" :  {
                    "1" : "\u03C0",
                    "2" : "''",
                    "longText" : "Equatorial horizontal parallax"
                }

            },
        
        prepareLineForView : function (line) {
            var displayableLine = [];
            // copy the day verbatim
            displayableLine[1] = line[1];
            if (line[1] == 1  || PageTimeInterval.stepSize > 1) { // first day of the month
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                displayableLine[0] = months[line[0]]; // set displayableLine[0] to the name of the month
            }
            else
                displayableLine[0] = "";
            
            var di = 2;
            var si = 2;
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal2(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal2(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal2(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal2(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++] * 3600); // just arcsecs

            return displayableLine;
        },
        
        // this will probably become an utility available for every page
        appendLine : function (dataArray) {
            var line = this.table.ownerDocument.createElement("tr");
            var tbody = this.table.getElementsByTagName("tbody")[0];
            if (!tbody)
                tbody = this.table;
            tbody.appendChild(line);
            
            var i = 0;
            var titleIndex = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
                td["title"] = this.tableHeaderInfo[titleIndex++ % 17].longText;
            }
        },
        addNodeChild : function (parent, type, content) {
            var child = parent.ownerDocument.createElement(type);
            parent.appendChild(child);
            if (content)
                child.textContent =  content;
            return child;
        },
    
        addTableHeader : function (table, classes) {

            var row1 = this.addNodeChild (table, "tr");
            for (var i = 0; i < classes.length; i++)
                row1.classList.add (classes[i]);    
            
            for (var i in this.tableHeaderInfo)
            {
                var th = this.addNodeChild (row1, "th", this.tableHeaderInfo[i]["1"]);
                th["title"] = this.tableHeaderInfo[i].longText;
                this.tableHeaderInfo[i]["element"] = th;
            }

            var row2 = this.addNodeChild (table, "tr");
            for (var i = 0; i < classes.length; i++)
                row2.classList.add (classes[i]);    
            
            for (var i in this.tableHeaderInfo)
            {
                var th = this.addNodeChild (row2, "th", this.tableHeaderInfo[i]["2"]);
                th["title"] = this.tableHeaderInfo[i].longText;
            }
            
            // add some subscripts
            this.addNodeChild (this.tableHeaderInfo["15"]["element"], "sub", "0");
            this.addNodeChild (this.tableHeaderInfo["16"]["element"], "sub", "0");

    },
        
        displayPage : function(JD, daysAfter, stepSize) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { SunPage.displayPage(JD, daysAfter, stepSize); }, 100);

            if (!SunPage.tablePopulated) {
                this.addTableHeader (this.table, ["fixed"]);
                var delayedAppendData = function (JD, endJD, steps) {
                    if (JD == endJD)
                        return;
                    
                    var i = 0;
                    for (i = 0; i < steps; i++, JD += stepSize) {
                        if (JD >= endJD)
                            return;
                        SunPage.appendLine (SunPage.prepareLineForView(SunData.getDataForJD(JD)));
                    }
                    SunPage.addTableHeader (SunPage.table, ["fixed", "printOnly"]);
                    setTimeout (function() {delayedAppendData (JD, endJD, steps); }, 1);
                }
                delayedAppendData (JD, JD + daysAfter, 15);
                SunPage.tablePopulated = true;
            }
        }
    };

        Pages["SunPage"] = SunPage;
    
})();

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
				line[i++] = AAJS.Sun.Distance(JD, true); // [au]
                line[i++] = AAJS.Sun.Diameter(JD, true)/3600; // [deg.dddd]
                // transit should be computed from the RA (LST to UTC conversion)
                var jdOfTransit = AAJS.Date.ST2NextJD(radec.X, JD);
                radec = AAJS.Sun.EquatorialCoordinates(jdOfTransit - 5 /(24 * 60), true);
                jdOfTransit = AAJS.Date.ST2NextJD(radec.X, jdOfTransit);
                var transitHour = 24 * (jdOfTransit - JD);
                line[i++] = transitHour;
                var physical = AAJS.Sun.CalculatePhysicalDetails(JD, true);
                line[i++] = physical.P; // [deg.dddd]
                line[i++] = physical.B0; // [deg.dddd]
                line[i++] = physical.L0; // [deg.dddd]
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
		}
    };
    SunData.initFromLocalStorage();

(function(){    
    var SunPage = {
        table : document.getElementById("Sun"),

        reset : function () {
            while (this.table.hasChildNodes()) {
                var currentTr = this.table.lastElementChild;
                if (currentTr.className == "fixed") // not the safest way
                    break;
                this.table.removeChild(currentTr);
            }
        },
        
        prepareLineForView : function (line) {
            var displayableLine = [];
            // copy the day verbatim
            displayableLine[1] = line[1];
            if (line[1] == 1) { // first day of the month
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                displayableLine[0] = months[line[0]]; // set displayableLine[0] to the name of the month
            }
            else
                displayableLine[0] = "";
            
            var di = 2;
            var si = 2;
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);

            return displayableLine;
        },
        
        // this will probably become an utility available for every page
        appendLine : function (dataArray) {
            var line = this.table.ownerDocument.createElement("tr");
            var tbody = this.table.getElementsByTagName("tbody")[0];
            tbody.appendChild(line);
            
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
            }
        },
        
        displayPage : function(JD, daysAfter) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { SunPage.displayPage(JD, daysAfter); }, 100);
            var i = 0;
            for (i = 0; i < daysAfter; i++)
                SunPage.appendLine (SunPage.prepareLineForView(SunData.getDataForJD(JD + i)));
        }
    };

        Pages["SunPage"] = SunPage;
    
})();

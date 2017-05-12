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

var VenusData = new PlanetData({ number: 2, name: "Venus", 
                               semidiameterFunctionName : AAJS.Diameters.VenusSemidiameterB });

							   
(function () {
    var VenusPage = {
        table : document.getElementById("Venus"),

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
			
//			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo1Decimal (line[si++] * 180 / Math.PI);
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
        
        displayVenusPage : function(JD, daysAfter) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { VenusPage.displyaySunPage(JD, daysAfter); }, 100);
            var i = 0;
            for (i = 0; i < daysAfter; i++)
                VenusPage.appendLine (VenusPage.prepareLineForView(VenusData.getDataForJD(JD + i)));
        }
    };

    setTimeout( function() { VenusPage.displayVenusPage(AAJS.Date.DateToJD (2017, 1, 1, true), 380); }, 100);


})();
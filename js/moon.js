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

var MoonData = {
    cache : {},
    getDataForJD : function (JD) {
        var key = JSON.stringify([JD,Location.latitude, Location.longitude, Location.altitude]);
        var data = this.cache[key];
        if (!data) {
            data = [];
        
            var i = 0;
            
            var _date = AAJS.Date.JD2Date(JD);
            // convert from JD to gregorian
            data[i++] = _date.M;
            data[i++] = _date.D;
            
            var posData = AAJS.Moon.PositionalEphemeris(JD, Location.latitude, Location.longitude, Location.altitude);
                
            data[i++] = posData.RaGeo;
            data[i++] = posData.DecGeo;
            data[i++] = posData.RaTopo;
            data[i++] = posData.DecTopo;
            data[i++] = posData.diameter;
            
            var jdOfTransit = JD;
                
            for (var transitIterationIndex = 0; transitIterationIndex < 5; transitIterationIndex++)
            {
                jdOfTransit = AAJS.Date.LST2NextJD(posData.RaTopo, JD, Location.longitude);
                if (jdOfTransit - JD > 1)
                    jdOfTransit -= 1;
                posData = AAJS.Moon.PositionalEphemeris(jdOfTransit, Location.latitude, Location.longitude, Location.altitude);
            }

				var transitHour = 24 * (jdOfTransit - JD);
				data[i++] = transitHour;

            
            data[i] = posData.parallax;
            
            this.cache[key] = data;
        }
        return data;
    }
    
};
    

(function(){    
    var MoonPage = {
        table : document.getElementById("Moon"),
        tablePopulated : false,
        reset : function () {
            while (this.table.hasChildNodes()) {
                this.table.removeChild(this.table.firstChild);
            }
            this.tablePopulated = false;
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
            var sexagesimalRaGeo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalRaGeo.Ord3 ;
            displayableLine[di++] = sexagesimalRaGeo.Ord2 
            displayableLine[di++] = sexagesimalRaGeo.Ord1;

            var sexagesimalDecGeo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDecGeo.Ord3 ;
            displayableLine[di++] = sexagesimalDecGeo.Ord2;
            displayableLine[di++] = sexagesimalDecGeo.Ord1;
			            
            var sexagesimalRaTopo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalRaTopo.Ord3 ;
            displayableLine[di++] = sexagesimalRaTopo.Ord2 
            displayableLine[di++] = sexagesimalRaTopo.Ord1;

            var sexagesimalDecTopo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDecTopo.Ord3 ;
            displayableLine[di++] = sexagesimalDecTopo.Ord2;
            displayableLine[di++] = sexagesimalDecTopo.Ord1;

            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            var sexagesimalParallax = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            
            displayableLine[di++] = sexagesimalParallax.Ord3;
            displayableLine[di++] = sexagesimalParallax.Ord2;
            displayableLine[di++] = sexagesimalParallax.Ord1;

            return displayableLine;
        },
        
        lastAppendedLine : false,
        // this will probably become an utility available for every page
        appendLine : function (dataArray) {
            var line = this.table.ownerDocument.createElement("tr");
            var tbody = this.table.getElementsByTagName("tbody")[0];
            if (!tbody)
                tbody = this.table;
            tbody.appendChild(line);
            
            var changedMonth = this.lastAppendedLine && dataArray[0] && this.lastAppendedLine[0] != dataArray[0];
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
                if (changedMonth)
                    td.classList.add("topBorder");
            }
            this.lastAppendedLine = dataArray;
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
            for (var i = 0; i < classes[0].length; i++)
                row1.classList.add (classes[0][i]);    
            this.addNodeChild (row1, "th", "Date");
            this.addNodeChild (row1, "th");    
            this.addNodeChild (row1, "th", "RA");
            this.addNodeChild (row1, "th", "geo");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Dec.");
            this.addNodeChild (row1, "th", "geo");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "RA");
            this.addNodeChild (row1, "th", "topo");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Dec.");
            this.addNodeChild (row1, "th", "topo");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Diam.");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Transit");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "\u03C0");
            var row2 = this.addNodeChild (table, "tr");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th");
            for (var i = 0; i < classes[1].length; i++)
                row2.classList.add (classes[1][i]);    
            this.addNodeChild (row2, "th");
            this.addNodeChild (row2, "th");
            this.addNodeChild (row2, "th", "h");
            this.addNodeChild (row2, "th", "m");
            this.addNodeChild (row2, "th", "s");
            this.addNodeChild (row2, "th", "\u00B0");
            this.addNodeChild (row2, "th", "'");
            this.addNodeChild (row2, "th", "''");

            this.addNodeChild (row2, "th", "h");
            this.addNodeChild (row2, "th", "m");
            this.addNodeChild (row2, "th", "s");
            this.addNodeChild (row2, "th", "\u00B0");
            this.addNodeChild (row2, "th", "'");
            this.addNodeChild (row2, "th", "''");

            this.addNodeChild (row2, "th", "'");
            this.addNodeChild (row2, "th", "''");
            this.addNodeChild (row2, "th", "h");
            this.addNodeChild (row2, "th", "m");
            this.addNodeChild (row2, "th", "s");

            this.addNodeChild (row2, "th", "\u00B0");
            this.addNodeChild (row2, "th", "'");
            this.addNodeChild (row2, "th", "''");
    },
        
        displayPage : function(JD, daysAfter, stepSize) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { MoonPage.displayPage(JD, daysAfter, stepSize); }, 300);

            this.lastAppendedLine = false;
            if (!MoonPage.tablePopulated) {
                this.reset();
                this.addTableHeader (this.table, [["fixed", "firstHeaderRow"], ["fixed", "secondHeaderRow"]]);
                var delayedAppendData = function (JD, endJD, steps) {
                    if (JD == endJD)
                        return;
                    
                    var i = 0;
                    for (i = 0; i < steps; i++, JD += stepSize) {
                        if (JD >= endJD)
                            return;
                        MoonPage.appendLine (MoonPage.prepareLineForView(MoonData.getDataForJD(JD)));
                    }
                    MoonPage.addTableHeader (MoonPage.table, [["fixed", "printOnly"], ["fixed", "printOnly"]]);
                    setTimeout (function() {delayedAppendData (JD, endJD, steps); }, 1);
                }
                delayedAppendData (JD, JD + daysAfter, 15);
                MoonPage.tablePopulated = true;
            }
        }
    };

        Pages["MoonPage"] = MoonPage;
    
})();

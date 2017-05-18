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
    getDataForJD: function (JD) {
        var data = [];
        
        return data;
    }
    
};
    

(function(){    
    var MoonPage = {
        table : document.getElementById("Moon"),
        tablePopulated : false,
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
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
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
            this.addNodeChild (row1, "th", "Date");
            this.addNodeChild (row1, "th");    
            this.addNodeChild (row1, "th", "RA");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Dec.");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Diam.");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "Transit");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th");
            this.addNodeChild (row1, "th", "\u03C0");
            var row2 = this.addNodeChild (table, "tr");
            for (var i = 0; i < classes.length; i++)
                row2.classList.add (classes[i]);    
            this.addNodeChild (row2, "th");
            this.addNodeChild (row2, "th");
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

            this.addNodeChild (row2, "th", "''");
    },
        
        displayPage : function(JD, daysAfter, stepSize) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { MoonPage.displayPage(JD, daysAfter, stepSize); }, 100);

            if (!MoonPage.tablePopulated) {
                this.addTableHeader (this.table, ["fixed"]);
                var delayedAppendData = function (JD, endJD, steps) {
                    if (JD == endJD)
                        return;
                    
                    var i = 0;
                    for (i = 0; i < steps; i++, JD += stepSize) {
                        if (JD >= endJD)
                            return;
                        MoonPage.appendLine (MoonPage.prepareLineForView(MoonData.getDataForJD(JD)));
                    }
                    MoonPage.addTableHeader (MoonPage.table, ["fixed", "printOnly"]);
                    setTimeout (function() {delayedAppendData (JD, endJD, steps); }, 1);
                }
                delayedAppendData (JD, JD + daysAfter, 15);
                MoonPage.tablePopulated = true;
            }
        }
    };

        Pages["MoonPage"] = MoonPage;
    
})();

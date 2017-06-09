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

var MoonEclipsesPage = {

    hostElement : document.getElementById("MoonEclipses"),
    pageRendered : false,
    dataSource : MoonEclipsesData,

    // clears up the rendered thing
    reset : PlanetPage.prototype.reset,
    
    displayPage : function (startJD, numberOfDays) {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded())
            return setTimeout (function() { MoonEclipsesPage.displayPage(startJD, numberOfDays); }, 300);

        if (MoonEclipsesPage.pageRendered)
            return;

        MoonEclipsesPage.reset();
        var endJD = startJD + numberOfDays;
        
        function processJD (JD) {
            if (JD >= endJD) {
                MoonEclipsesPage.pageRendered = true;
                return;
            }
            
            var oppositionData = MoonEclipsesPage.dataSource.calculateEclipseForJD (JD);
            if (oppositionData.eclipse) 
                MoonEclipsesPage.drawNewEclipse (oppositionData);
            
            setTimeout (function() { processJD(oppositionData.oppositionJD + MoonEclipsesPage.dataSource.sinodicPeriod); }, 1);
        }
        
        processJD(startJD);
    },
    
    displayTimings : function (oppositionData, mainDiv) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        
        function yyyymmdd_hhmmOfJD (JD) {
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
            
            return { 'date': dateOfJD, 'time' : sexagesimalTime };
        }
        
        // get the JD of the opposition
        var oppositionDateTime = yyyymmdd_hhmmOfJD(oppositionData.oppositionJD);

        addNodeChild (mainDiv, "h2", oppositionDateTime.date.Y + "-" + oppositionDateTime.date.M + "-" + oppositionDateTime.date.D);
        
        var timingsTable = addNodeChild (mainDiv, "table");
        var headerRow = addNodeChild (timingsTable, "tr");
        var headerPhaseColumn = addNodeChild (headerRow, "th", "Phase");
        var headerTimeColumn = addNodeChild (headerRow, "th", "UTC");
        
        function addTiming (JD, description, timingsTable) {
            var addNodeChild = PlanetPage.prototype.addNodeChild;
            var tr = addNodeChild (timingsTable, "tr");
            var dt = yyyymmdd_hhmmOfJD(JD);
            addNodeChild (tr, "td", description);
            addNodeChild (tr, "td", dt.time.Ord3 + ":" +  dt.time.Ord2);
        }
        
        addTiming (oppositionData.Timings.Penumbral.firstContact, "Start of penumbral eclipse (TP1)", timingsTable);
                   
        if (oppositionData.umbralPartialEclipse) {
            addTiming (oppositionData.Timings.Umbral.firstContact, "Start of umbral eclipse (TU1)", timingsTable);

            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.beginFullImmersion, "Start of totality (TU2)", timingsTable);
        }
        
        // maximum ...
        addTiming (oppositionData.Timings.Maximum, "Eclipse maximum (TM)", timingsTable);
        
        if (oppositionData.umbralPartialEclipse) {
            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.endFullImmersion,  "End of totality (TU3)", timingsTable);
                       
            addTiming (oppositionData.Timings.Umbral.lastContact, "End of umbral eclipse (TU4)", timingsTable);
        }
        
        addTiming (oppositionData.Timings.Penumbral.lastContact, "End of penumbral eclipse (TP4)", timingsTable);
    },
    
    drawNewEclipse : function (oppositionData) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        
        /*        <div class="moonEclipse">
            <h2>Total eclipse of 2017-08-07</h2>
            <table> 
                <tr><th>Phase</th><th>UTC</th></tr>
                <tr><td>Start of penumbral eclipse (T<sub>p1</sub>)</td><td>19:00</td></tr>
                <tr><td>Start of umbral eclipse (T<sub>u1</sub>)</td><td>19:00</td></tr>
                <tr><td>Start of totality eclipse (T<sub>u2</sub>)</td><td>19:00</td></tr>
                <tr><td>Eclipse maximum (T<sub>m</sub>)</td><td>19:00</td></tr>
                <tr><td>End of totality eclipse (T<sub>u3</sub>)</td><td>19:00</td></tr>
                <tr><td>End of umbral eclipse (T<sub>u4</sub>)</td><td>19:00</td></tr>
                <tr><td>End of penumbral eclipse (T<sub>p4</sub>)</td><td>19:00</td></tr>
            </table>
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
            
            </svg>
        </div>
        */
        var mainDiv = addNodeChild(MoonEclipsesPage.hostElement, "div");
        mainDiv.classList.add("moonEclipse");
        
        MoonEclipsesPage.displayTimings (oppositionData, mainDiv);
 
    }
}

Pages["MoonEclipsesPage"] = MoonEclipsesPage;

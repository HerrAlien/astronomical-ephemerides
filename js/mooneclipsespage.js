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

var MoonEclipsesPage = {

    hostElement : document.getElementById("MoonEclipsesContainer"),
    pageRendered : false,
    dataSource : MoonEclipsesData,

    // clears up the rendered thing
    reset : PlanetPage.prototype.reset,
    
    displayPage : function () {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD)
            return setTimeout (function() { MoonEclipsesPage.displayPage(); }, 300);

        var startJD = PageTimeInterval.JD;
        var numberOfDays =  PageTimeInterval.days;

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
            
            requestAnimationFrame (function() { processJD(oppositionData.JD + MoonEclipsesPage.dataSource.sinodicPeriod); });
        }
        
        processJD(startJD);
    },
    
    displayTimings : function (oppositionData, mainDiv) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        
        var yyyymmdd_hhmmOfJD  = PlanetPage.prototype.yyyymmdd_hhmmOfJD;
        
        // get the JD of the opposition
        var oppositionDateTime = yyyymmdd_hhmmOfJD(oppositionData.JD);
        var description = "Eclipse through the penumbra";
        if (oppositionData.umbralPartialEclipse)
            description = "Partial eclipse";
        if (oppositionData.umbralTotalEclipse)
            description = "Total eclipse";
        

        var eclipseTitle = addNodeChild (mainDiv, "h2", oppositionDateTime.date.Y + "-" + oppositionDateTime.date.M + "-" + oppositionDateTime.date.D + " " + description);
        addNodeChild (mainDiv, "span", "magnitude: " + AAJS.Numerical.RoundTo2Decimals(oppositionData.magnitude) + "; penumbral magnitude: " + AAJS.Numerical.RoundTo2Decimals(oppositionData.penumbralMagnitude));
        
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
        
        addTiming (oppositionData.Timings.Penumbral.firstContact, "Penumbral Eclipse Begins (TP1)", timingsTable);
                   
        if (oppositionData.umbralPartialEclipse) {
            addTiming (oppositionData.Timings.Umbral.firstContact, "Partial Eclipse Begins (TU1)", timingsTable);

            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.beginFullImmersion, "Total Eclipse Begins (TU2)", timingsTable);
        }
        
        // maximum ...
        addTiming (oppositionData.Timings.Maximum, "Eclipse maximum (TM)", timingsTable);
        
        if (oppositionData.umbralPartialEclipse) {
            if (oppositionData.umbralTotalEclipse)
                addTiming (oppositionData.Timings.Umbral.endFullImmersion,  "Total Eclipse Ends (TU3)", timingsTable);
                       
            addTiming (oppositionData.Timings.Umbral.lastContact, "Partial Eclipse Ends (TU4)", timingsTable);
        }
        
        addTiming (oppositionData.Timings.Penumbral.lastContact, "Penumbral Eclipse Ends (TP4)", timingsTable);
    },
    
    circle : function (svg, R, CX, CY, fillColor, strokeColor) {
        var c = svg.ownerDocument.createElementNS ("http://www.w3.org/2000/svg", "circle");
        svg.appendChild (c);
        c.setAttribute ("cx", CX);
        c.setAttribute ("cy", CY);
        c.setAttribute ("r", R);
        c.setAttribute ("fill", fillColor);
        c.setAttribute ("stroke", strokeColor);
        c.setAttribute ("stroke-width", 1);
    },
    
    addLabel : function (svg, transformedPos, text) {
        var textDOM = svg.ownerDocument.createElementNS ("http://www.w3.org/2000/svg", "text");
        svg.appendChild(textDOM);
        textDOM.setAttribute("x", transformedPos.X);
        textDOM.setAttribute("y", transformedPos.Y);
        textDOM.textContent = text;
    },
    
    displayGraph : function (oppositionData, mainDiv) {
        var namespace = "http://www.w3.org/2000/svg";
        var viewportSvg = mainDiv.ownerDocument.createElementNS(namespace, "svg");        
        var svg = mainDiv.ownerDocument.createElementNS(namespace, "svg");
        var size = 800;
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("alt", "Lunar Eclipse Graph");
        
        viewportSvg.classList.add("viewport");
        viewportSvg.setAttribute("viewBox", "0 0 " + size + " " + size);
        viewportSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        viewportSvg.appendChild(svg);
        mainDiv.appendChild(viewportSvg);
        
        var margin = 1;
        
        var halfwidth = 0.5 * size;
        
        var pxPerDeg = (halfwidth - margin )/(oppositionData.penumbralRadius + oppositionData.MoonDiameter );
        
        // penumbra and umbra circle
        MoonEclipsesPage.circle (svg, oppositionData.penumbralRadius * pxPerDeg, halfwidth, halfwidth, "#eeeeee", "#000000");
        MoonEclipsesPage.circle (svg, oppositionData.umbralRadius * pxPerDeg, halfwidth, halfwidth, "#CCCCCC", "#000000");
        
        function moonPxCoords (contactData) {
            return {
                'X' : -contactData.X * pxPerDeg + halfwidth,
                'Y' : halfwidth - contactData.Y * pxPerDeg
            };
        }

        var moonRadius =  oppositionData.MoonDiameter /2 * pxPerDeg;

        var cp1 = moonPxCoords (oppositionData.MoonPositions.Penumbral.firstContact);
        MoonEclipsesPage.circle (svg, moonRadius, cp1.X, cp1.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cp1, "P1");
                           
        if (oppositionData.umbralPartialEclipse) {
            var cu1 = moonPxCoords (oppositionData.MoonPositions.Umbral.firstContact);
            MoonEclipsesPage.circle (svg, moonRadius, cu1.X, cu1.Y, "none", "#000000");
            MoonEclipsesPage.addLabel (svg, cu1, "U1");

            if (oppositionData.umbralTotalEclipse) {
                var cu2 = moonPxCoords (oppositionData.MoonPositions.Umbral.beginFullImmersion);
                MoonEclipsesPage.circle (svg, moonRadius, cu2.X, cu2.Y, "none", "#000000");
                MoonEclipsesPage.addLabel (svg, cu2, "U2");
            }
        }
        
        // maximum ...
         var cm = moonPxCoords ({'X' : oppositionData.xMinDistance, 'Y' : oppositionData.yMinDistance});
         MoonEclipsesPage.circle (svg, moonRadius, cm.X, cm.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cm, "M");
        
        if (oppositionData.umbralPartialEclipse) {
            if (oppositionData.umbralTotalEclipse) {
                var cu3 = moonPxCoords (oppositionData.MoonPositions.Umbral.endFullImmersion);
                MoonEclipsesPage.circle (svg, moonRadius, cu3.X, cu3.Y, "none", "#000000");
                MoonEclipsesPage.addLabel (svg, cu3, "U3");
            }
                
            var cu4 = moonPxCoords (oppositionData.MoonPositions.Umbral.lastContact);
            MoonEclipsesPage.circle (svg, moonRadius, cu4.X, cu4.Y, "none", "#000000");
            MoonEclipsesPage.addLabel (svg, cu4, "U4");
         }
        
        var cp4 = moonPxCoords (oppositionData.MoonPositions.Penumbral.lastContact);
        MoonEclipsesPage.circle (svg, moonRadius, cp4.X, cp4.Y, "none", "#000000");
        MoonEclipsesPage.addLabel (svg, cp4, "P4");

    },
    
    drawNewEclipse : function (oppositionData) {
        var addNodeChild = PlanetPage.prototype.addNodeChild;
        var mainDiv = addNodeChild(MoonEclipsesPage.hostElement, "div");
        mainDiv.classList.add("moonEclipse");
        
        MoonEclipsesPage.displayTimings (oppositionData, mainDiv);
        MoonEclipsesPage.displayGraph (oppositionData, mainDiv); 
    },
    keywordsArray : ["Shadow", "Umbra", "Penumbra", "Partial", "Total", "Eclipse",
                      "Contact", "First", "Last"]
}

Pages["Lunar Eclipses"] = MoonEclipsesPage;

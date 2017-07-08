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

// planet object - {number, name, semidiameterFunctionName}
//                  "SaturnMoons"
//
/*
{'Mimas' : {'d' : '', 'color' : 'blue', 'lastPos' : {'X' : 0, 'Y' : 0} },
                    'Enceladus' : {'d' : '', 'color' : 'red', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Tethys' : {'d' : '', 'color' : 'green', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Dione' : {'d' : '', 'color' : 'black', 'lastPos' : {'X' : 0, 'Y' : 0}},
                    'Rhea' : {'d' : '', 'color' : 'magenta', 'lastPos' : {'X' : 0, 'Y' : 0}},
                    'Titan' : {'d' : '', 'color' : 'grey', 'lastPos' : {'X' : 0, 'Y' : 0}}};
                    */
function MoonsPage (hostElemName, dataObject, pathsConfigs){
    
    this.hostElement = document.getElementById(hostElemName);
    this.pageRendered = false;
    this.dataSource = dataObject;
    this.paths = pathsConfigs;
    this.planetFraction = 1/32.0;
}

(function(){
    // clears up the rendered thing
    MoonsPage.prototype["reset"] = PlanetPage.prototype.reset;
    
    MoonsPage.prototype["displayPage"] = function () {
        
        var pageObj = this;
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD)
            return setTimeout (function() { pageObj.displayPage(); }, 300);

        var startJD = PageTimeInterval.JD;
        var numberOfDays =  PageTimeInterval.days;
        
        if (this.pageRendered)
            return;

        this.reset();
        
        var dayFraction = 48;
        
        var stepSize = 1/dayFraction; // one hour.
        var numberOfSteps = numberOfDays / stepSize;
    
        var width = 800;
        var vPadding = 10;
        var height = Math.ceil (numberOfSteps) + 2* vPadding;
        
        var hostSVG = this.hostElement.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
        var viewportSvg = this.hostElement.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");        

        hostSVG.setAttribute("width", width);
        hostSVG.setAttribute("height", height);
        
        viewportSvg.classList.add("viewport");
        viewportSvg.setAttribute("viewBox", "0 0 " + width + " " + height);
        viewportSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        viewportSvg.appendChild(hostSVG);
        this.hostElement.appendChild(viewportSvg);

        var halfWidth = width/2;
        var planetRadius = halfWidth * this.planetFraction;

        var currentJD = startJD;
        var coords = this.dataSource.getDataAsObjectForJD(currentJD, false);        
        
        for (var satelliteName in this.paths) {
                this.paths[satelliteName].lastPos.X = coords[satelliteName].ApparentRectangularCoordinates.X;
                this.paths[satelliteName].lastPos['elongation'] = coords[satelliteName].ApparentRectangularCoordinates.ApparentElongation;
        }
        
       ( function (page) {
            var stepsCounter = 1;
            var satellitesPage = page;
            
            for (var satelliteName in satellitesPage.paths) {
                satellitesPage.paths[satelliteName]['superiorConjunctions'] = [];
                
                satellitesPage.paths[satelliteName]['lastSuperiorConjunctionStart'] = false;
            }
                
            function getDataForPaths () {

                for (var satelliteName in satellitesPage.paths) {
                    var elongation = satellitesPage.paths[satelliteName].lastPos.elongation * planetRadius;
                    if (satellitesPage.paths[satelliteName].lastPos.X < 0)
                        elongation = -elongation;
                    
                     satellitesPage.paths[satelliteName].d = "M " + (elongation + halfWidth) + " " 
                                                            + (stepsCounter -1 + vPadding);
                }
                
                var planetInitialY = stepsCounter ;
                var dayLines = [];
                
                for (var i = 0 ; i < 10 * dayFraction && stepsCounter < numberOfSteps ; i++, currentJD += stepSize, stepsCounter++) {
                    var coords = satellitesPage.dataSource.getDataAsObjectForJD(currentJD, false);

                    for (var satelliteName in satellitesPage.paths){
                        
                        var currentSatellitePath = satellitesPage.paths[satelliteName];
                        var currentSatelliteCoords = coords[satelliteName].ApparentRectangularCoordinates;

                        currentSatellitePath.lastPos['elongation'] = currentSatelliteCoords.ApparentElongation;
                        currentSatellitePath.lastPos.X = currentSatelliteCoords.X;
                        
                        var elongation = currentSatellitePath.lastPos.elongation * planetRadius;
                        if (satellitesPage.paths[satelliteName].lastPos.X < 0)
                            elongation = -elongation;
                        
                        var currentX = elongation + halfWidth;
                        var currentY = stepsCounter + vPadding;
                    
                        currentSatellitePath.d += " L " + currentX + " "  + currentY;
                        
                        if (currentSatellitePath.lastPos.elongation < 1 && currentSatelliteCoords.Z > 0) {
                            if (!currentSatellitePath['lastSuperiorConjunctionStart']) {
                                satellitesPage.paths[satelliteName]['lastSuperiorConjunctionStart'] = {X: currentX, Y: currentY};
                            }
                        } 
                            
                        if (currentSatellitePath.lastPos.elongation >= 1 && currentSatellitePath['lastSuperiorConjunctionStart'] && currentSatelliteCoords.Z > 0) {

                            satellitesPage.paths[satelliteName]['superiorConjunctions'].push({
                                start: {X : currentSatellitePath['lastSuperiorConjunctionStart'].X, Y : currentSatellitePath['lastSuperiorConjunctionStart'].Y}, 
                                end: {X: currentX, Y: currentY} });
                            satellitesPage.paths[satelliteName]['lastSuperiorConjunctionStart'] = false;
                        }
                    }
                    
                    if (coords.DayFraction < stepSize){
                        dayLines[dayLines.length] = {
                            "YCoord" : stepsCounter + vPadding,
                            "Month" : coords.Month,
                            "Day" : coords.Day
                        };
                    }
                }

                var ownerDoc = hostSVG.ownerDocument;

                var pathsHolder =  ownerDoc.createElementNS("http://www.w3.org/2000/svg", "g");
                for (var satelliteName in satellitesPage.paths){
                    var pathElem = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "path");
                    pathElem.setAttribute("d", satellitesPage.paths[satelliteName].d);
                    pathElem.setAttribute("stroke", satellitesPage.paths[satelliteName].color);
                    pathElem.setAttribute("fill", 'none');
                    pathElem.setAttribute("stroke-width", 2);
                    pathsHolder.appendChild(pathElem);
                    pathElem.setAttribute("title", satelliteName);
                }
                hostSVG.appendChild(pathsHolder);

                var conjunctionsHolder =  ownerDoc.createDocumentFragment();
                for (var satelliteName in satellitesPage.paths){
                    var superiorConjunctions = satellitesPage.paths[satelliteName]['superiorConjunctions'];
                    for (var i = 0; i < superiorConjunctions.length; i++) {
                        planet = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "line");
                        conjunctionsHolder.appendChild (planet);
                        planet.setAttribute ("stroke", "orange");
                        planet.setAttribute ("stroke-width", 4);
                        planet.setAttribute ("x1", superiorConjunctions[i].start.X);
                        planet.setAttribute ("y1", superiorConjunctions[i].start.Y);
                        planet.setAttribute ("x2", superiorConjunctions[i].end.X);
                        planet.setAttribute ("y2", superiorConjunctions[i].end.Y);
                    }
                }
                hostSVG.appendChild(conjunctionsHolder);

                
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                var linesDF = ownerDoc.createDocumentFragment();
                
                for (var i = 0; i < dayLines.length; i++) {
                    var line = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "rect");
                    linesDF.appendChild (line);
                    line.setAttribute ("fill", "gray");
                    line.setAttribute ("x", 0);
                    line.setAttribute ("y", dayLines[i].YCoord);
                    line.setAttribute ("width", width);
                    line.setAttribute ("height", 1);
                    
                    var text = ownerDoc.createElementNS("http://www.w3.org/2000/svg", "text");
                    linesDF.appendChild (text);
                    text.setAttribute ("x", 0);
                    text.setAttribute ("y", dayLines[i].YCoord + 1);
                    text.textContent = months[dayLines[i].Month] + " " + dayLines[i].Day;
                    text.style["fontSize"] = "20px";
                    text.style["fontFamily"] = "Arial";
                } 
                hostSVG.appendChild (linesDF);
                   
                if (stepsCounter < numberOfSteps) {
                    setTimeout (getDataForPaths, 1);
                } else {
                    satellitesPage.pageRendered = true;
                }
            }
            
                var planetHolder = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
                var planet = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
                planet.setAttribute ("fill", "orange");
                planet.setAttribute ("x", halfWidth - planetRadius);
                planet.setAttribute ("y", 0  + vPadding - 10);
                planet.setAttribute ("width", 2*planetRadius);
                planet.setAttribute ("height", numberOfSteps + vPadding + 10);
                hostSVG.appendChild (planetHolder);
                planetHolder.appendChild(planet);
            
            getDataForPaths();
        })(this);
         
    };
})();


// Pages["SaturnMoonsPage"] = SaturnMoonsPage;
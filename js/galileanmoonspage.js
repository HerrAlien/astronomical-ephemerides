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
var GalileanMoonsPage = {
    
    hostElement : document.getElementById("GalileanMoons"),
    pageRendered : false,
    
    // clears up the rendered thing
    reset : function () {
        while (this.hostElement.hasChildNodes()) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }
        GalileanMoonsData.reset();
        this.pageRendered = false;
    },
    
    displayPage : function (startJD, numberOfDays) {
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
        hostSVG.setAttribute("width", width);
        hostSVG.setAttribute("height", height);
        hostSVG.setAttribute ("xmlns", "http://www.w3.org/2000/svg");
        this.hostElement.appendChild(hostSVG);

        var halfWidth = width/2;
        var jupiterRadius = halfWidth / 35;

        var paths = {'Io' : {'d' : '', 'color' : 'blue', 'lastPos' : {'X' : 0, 'Y' : 0} },
                    'Europa' : {'d' : '', 'color' : 'red', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Ganymede' : {'d' : '', 'color' : 'lime', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Callisto' : {'d' : '', 'color' : 'black', 'lastPos' : {'X' : 0, 'Y' : 0}}};
        var currentJD = startJD;
        var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);        
        
        for (var satelliteName in paths){
                paths[satelliteName].lastPos.X = (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterRadius + halfWidth)*1.0;
                paths[satelliteName].lastPos.Y = (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterRadius + vPadding)*1.0; // we move down ....
        }
        
        ( function (page) {
            var stepsCounter = 1;
            var satellitesPage = page;
            function getDataForPaths () {

                for (var satelliteName in paths)
                    paths[satelliteName].d = "M " + paths[satelliteName].lastPos.X + " " + paths[satelliteName].lastPos.Y;
                
                var planetInitialY = stepsCounter;
                var dayLines = [];
                
                for (var i = 0 ; i < dayFraction && stepsCounter < numberOfSteps ; i++, currentJD += stepSize, stepsCounter++) {
                    var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);

                    for (var satelliteName in paths){
                        paths[satelliteName].lastPos.X = (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterRadius + halfWidth)*1.0;
                        paths[satelliteName].lastPos.Y = (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterRadius + stepsCounter + vPadding)*1.0; // we move down ....
                        paths[satelliteName].d += " L " + paths[satelliteName].lastPos.X + " " + paths[satelliteName].lastPos.Y;
                    }
                    
                    if (coords.DayFraction < stepSize)
                        dayLines[dayLines.length] = {
                            "YCoord" : stepsCounter + vPadding,
                            "Month" : coords.Month,
                            "Day" : coords.Day
                        };
                }

                for (var satelliteName in paths){
                    var pathElem = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
                    pathElem.setAttribute("d", paths[satelliteName].d);
                    pathElem.setAttribute("stroke", paths[satelliteName].color);
                    pathElem.setAttribute("fill", 'none');
                    pathElem.setAttribute("stroke-width", 2);
                    hostSVG.appendChild(pathElem);
                    pathElem.setAttribute("title", satelliteName);
                }
                    
                var planet = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
                hostSVG.appendChild (planet);
                planet.setAttribute ("fill", "orange");
                planet.setAttribute ("x", halfWidth - jupiterRadius);
                planet.setAttribute ("y", planetInitialY  + vPadding - 30);
                planet.setAttribute ("width", 2*jupiterRadius);
                planet.setAttribute ("height", stepsCounter - planetInitialY + vPadding + 30);
                
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                for (var i = 0; i < dayLines.length; i++) {
                    var line = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
                    hostSVG.appendChild (line);
                    line.setAttribute ("fill", "gray");
                    line.setAttribute ("x", 0);
                    line.setAttribute ("y", dayLines[i].YCoord);
                    line.setAttribute ("width", width);
                    line.setAttribute ("height", 1);
                    
                    var text = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
                    hostSVG.appendChild (text);
                    text.setAttribute ("x", 10);
                    text.setAttribute ("y", dayLines[i].YCoord);
                    text.textContent = months[dayLines[i].Month] + " " + dayLines[i].Day;
                    text.style["fontSize"] = "14px";
                    text.style["fontFamily"] = "Arial";

                    
                } 
                   
                if (stepsCounter < numberOfSteps) {
                    setTimeout (getDataForPaths, 10);
                } else {
                    satellitesPage.pageRendered = true;
                }
            }
            getDataForPaths();
        })(this);
         
    }
};

Pages["GalileanMoonsPage"] = GalileanMoonsPage;
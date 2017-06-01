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
        
        var stepSize = 1/24; // one hour.
        var numberOfSteps = numberOfDays / stepSize;
    
        var width = 1000;
        var height = Math.ceil (numberOfSteps);
        
        var halfWidth = width/2;
        var jupiterSize = halfWidth / 30;

        var paths = {'Io' : '', 'Europa' : '', 'Ganymede' : '', 'Callisto' : ''};
        var currentJD = startJD;
        var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);
        for (var satelliteName in paths){
                paths[satelliteName] += "M " + (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize + halfWidth)*1.0
                                      + " " + (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize)*1.0; // we move down ....
        }
        currentJD += stepSize;
        
        ( function (page) {
            var stepsCounter = 1;
            var satellitesPage = page;
            function getDataForPaths () {
                for (var i = 0 ; i < 30 && stepsCounter < numberOfSteps ; i++, currentJD += stepSize, stepsCounter++) {
                    var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);
                    for (var satelliteName in paths){
                        paths[satelliteName] += " L " + (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize + halfWidth)*1.0
                                              + " " + (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize + stepsCounter)*1.0; // we move down ....
                    }
                }
                
                if (stepsCounter < numberOfSteps) {
                    setTimeout (getDataForPaths, 10);
                } else {
                    satellitesPage.reset();
                    var hostSVG = satellitesPage.hostElement.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
                    hostSVG.setAttribute("width", width);
                    hostSVG.setAttribute("height", height);
                    hostSVG.setAttribute ("xmlns", "http://www.w3.org/2000/svg");
                    satellitesPage.hostElement.appendChild(hostSVG);
                          
                    var addNodeChild = PlanetPage.prototype["addNodeChild"];
                    for (var satelliteName in paths){
                        var pathElem = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
                        pathElem.setAttribute("d", paths[satelliteName]);
                        pathElem.setAttribute("stroke", 'black');
                        pathElem.setAttribute("fill", 'none');
                        pathElem.setAttribute("stroke-width", 2);
                        hostSVG.appendChild(pathElem);
                        pathElem.setAttribute("title", satelliteName);
                    }
        
                    satellitesPage.pageRendered = true;

                }
            }
            getDataForPaths();
        })(this);
         
    }
};

Pages["GalileanMoonsPage"] = GalileanMoonsPage;
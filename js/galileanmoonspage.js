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
        
        var stepSize = 1/24; // one hour.
        var numberOfSteps = numberOfDays / stepSize;
    
        var width = 1000;
        var height = Math.ceil (numberOfSteps);
        
        var hostSVG = this.hostElement.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
        hostSVG.setAttribute("width", width);
        hostSVG.setAttribute("height", height);
        hostSVG.setAttribute ("xmlns", "http://www.w3.org/2000/svg");
        this.hostElement.appendChild(hostSVG);

        var halfWidth = width/2;
        var jupiterSize = halfWidth / 30;

        var paths = {'Io' : {'d' : '', 'color' : 'blue', 'lastPos' : {'X' : 0, 'Y' : 0} },
                    'Europa' : {'d' : '', 'color' : 'red', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Ganymede' : {'d' : '', 'color' : 'lime', 'lastPos' : {'X' : 0, 'Y' : 0}}, 
                    'Callisto' : {'d' : '', 'color' : 'black', 'lastPos' : {'X' : 0, 'Y' : 0}}};
        var currentJD = startJD;
        var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);        
        
        for (var satelliteName in paths){
                paths[satelliteName].lastPos.X = (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize + halfWidth)*1.0;
                paths[satelliteName].lastPos.Y = (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize)*1.0; // we move down ....
        }
        currentJD += stepSize;
        
        ( function (page) {
            var stepsCounter = 1;
            var satellitesPage = page;
            function getDataForPaths () {

                for (var satelliteName in paths)
                    paths[satelliteName].d = "M " + paths[satelliteName].lastPos.X + " " + paths[satelliteName].lastPos.Y;
                
                for (var i = 0 ; i < 30 && stepsCounter < numberOfSteps ; i++, currentJD += stepSize, stepsCounter++) {
                    var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);

                    for (var satelliteName in paths){
                        paths[satelliteName].lastPos.X = (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize + halfWidth)*1.0;
                        paths[satelliteName].lastPos.Y = (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize + stepsCounter)*1.0; // we move down ....
                        paths[satelliteName].d += " L " + paths[satelliteName].lastPos.X + " " + paths[satelliteName].lastPos.Y;
                    }
                }

                    for (var satelliteName in paths){
                        var pathElem = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
                        pathElem.setAttribute("d", paths[satelliteName].d);
                        pathElem.setAttribute("stroke", paths.color);
                        pathElem.setAttribute("fill", 'none');
                        pathElem.setAttribute("stroke-width", 2);
                        hostSVG.appendChild(pathElem);
                        pathElem.setAttribute("title", satelliteName);
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
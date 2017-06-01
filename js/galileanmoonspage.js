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
        var numberOfSteps = 30 / stepSize;
    
        
        this.reset();
        
        var hostSVG = this.hostElement;
        var width = 1000;
        var height = Math.ceil (numberOfSteps);
        hostSVG.setAttribute("width", width);
        hostSVG.setAttribute("height", height);
       
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
        
        for (var i = 1; i < numberOfSteps; i++, currentJD += stepSize) {
            var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);
            for (var satelliteName in paths){
                paths[satelliteName] += " L " + (coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize + halfWidth)*1.0
                                      + " " + (coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize + i)*1.0; // we move down ....
            }
        }
        
        var addNodeChild = PlanetPage.prototype["addNodeChild"];
        for (var satelliteName in paths){
            var pathElem = hostSVG.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
            pathElem.setAttribute("d", paths[satelliteName]);
            pathElem.setAttribute("stroke", 'black');
            pathElem.setAttribute("fill", 'none');
            pathElem.setAttribute("stroke-width", 2);
            hostSVG.appendChild(pathElem);
        }
        
        this.pageRendered = true;
    }
};

Pages["GalileanMoonsPage"] = GalileanMoonsPage;
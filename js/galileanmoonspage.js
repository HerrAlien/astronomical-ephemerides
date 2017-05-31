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
    
        var addNodeChild = PlanetPage.prototype["addNodeChild"];
        var hostSVG = addNodeChild(this.hostElement, "svg");
        hostSVG["xmlns"] = "http://www.w3.org/2000/svg";
        hostSVG['width'] = 1000;
        hostSVG['height'] = Math.ceil (numberOfSteps);
        
        var jupiterSize = 900 / 27;
        
        var paths = {'Io' : '', 'Europa' : '', 'Ganymede' : '', 'Callisto' : ''};
        var currentJD = startJD;
        for (var i = 0; i < numberOfSteps; i++, currentJD += stepSize) {
            var coords = GalileanMoonsData.getDataAsObjectForJD(currentJD, false);
            for (var satelliteName in paths){
                paths[satelliteName] += " M " + coords[satelliteName].ApparentRectangularCoordinates.X * jupiterSize
                                      + " " + coords[satelliteName].ApparentRectangularCoordinates.Y * jupiterSize + i; // we move down ....
            }
        }
        
        
        
        this.pageRendered = true;
    }
};

Pages["GalileanMoonsPage"] = GalileanMoonsPage;
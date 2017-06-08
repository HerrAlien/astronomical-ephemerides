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

    hostElement : document.getElementById("MoonEclipsesPage"),
    pageRendered : false,
    dataObject : MoonEclipsesData,

    // clears up the rendered thing
    reset : PlanetPage.prototype.reset,
    
    displayPage : function (startJD, numberOfDays) {
        
        var pageObj = this;
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded())
            return setTimeout (function() { pageObj.displayPage(startJD, numberOfDays); }, 300);

        if (this.pageRendered)
            return;

        this.reset();
        var endJD = startJD + numberOfDays;
        
        function processJD (JD) {
            if (JD >= endJD) {
                MoonEclipsesPage.pageRendered = true;
                return;
            }
            
            var oppositionData = MoonEclipsesPage.dataObject.calculateEclipseForJD (JD);
            if (oppositionData.eclipse) 
                MoonEclipsesPage.drawNewEclipse (oppositionData);
            
            setTimeout (function() { MoonEclipsesPage.processJD(JD + MoonEclipsesPage.dataObject.sinodicPeriod); }, 1);
        }
    },
    
    drawNewEclipse : function (oppositionData) {
        
    }
}

Pages["MoonEclipsesPage"] = MoonEclipsesPage;

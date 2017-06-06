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
var MoonEclipsesData = {
    
	onNewEclipse : Notifications.NewOneParameter(),
    
    sinodicPeriod : 29.530587981,
    
    getOppositionAroundJD : function (JD) {
        var jd = JD;
        var sunData = false;
        var moonData = false;
        var eps = 1e-4;
        var dSunData = false;
        var dMoonData = false;
        var oppositionTimeCorrection = 0;
        
        do {
            
            var dJd = 1/24;
            sunData = SunData.getDataForJD (jd);
            moonData = MoonData.getDataForJD (jd);
            
            dSunData = SunData.getDataForJD (jd + dJd);
            dMoonData = MoonData.getDataForJD (jd + dJd);
            
            var opposingSunRA = 12 + sunData[2];
            if (opposingSunRA > 24)
                opposingSunRA -= 24;
            
            oppositionTimeCorrection = (opposingSunRA - moonData[2]) /
                                           ((dMoonData[2] - moonData[2]) - (dSunData[2] - sunData[2]));
            jd += oppositionTimeCorrection/24;
            
        } while (Math.abs(oppositionTimeCorrection) > eps);
        
        return {
                    "RaSun" : sunData[2] * 15,
                    "DecSun" : sunData[3],
                    "RaMoon" : moonData[2] * 15,
                    "DecMoon" : moonData[3],
                    
                    "dRaSun" : (dSunData[2] - sunData[2]) * 15,
                    "dDecSun": (dSunData[3] - sunData[3]),
                    "dRaMoon" : (dMoonData[2] - moonData[2]) * 15,
                    "dDecMoon": (dMoonData[3] - moonData[3]),
                    
                    "ParallaxSun" : sunData[10],
                    "ParallaxMoon" : moonData[8],
                    
                    "MoonDiameter" : moonData[6],
                    
                    "oppositionJD" : jd,
                    "eclipse" : false
            };
    },
    
    addTimingsAndRadii : function (opposition) {
        // first, compute penumbral and umbral radii
        // then compute the minimum distance between the center of the Moon and the axes of these cones
        // if the minimum distance is smaller than one of the radii, we have an eclipse.
    },
    
    computeEclipses : function (startJD, endJD) {
        var lastOpposition = this.getOppositionAroundJD(endJD);
        
        function calculateEclipseForJD (JD) {
            if (JD > lastOpposition.oppositionJD)
                return;
                
            var oppositionData = MoonEclipsesData.getOppositionAroundJD (JD);
            oppositionData = MoonEclipsesData.addTimingsAndRadii(oppositionData);
            if (oppositionData.eclipse)
                setTimeout (function () { MoonEclipsesData.onNewEclipse.notify (oppositionData); }, 1);
        }
        setTimeout (function () { calculateEclipseForJD (JD + MoonEclipsesData.sinodicPeriod); }, 1);
        
        calculateEclipseForJD (startJD);
    },
    
    reset : function () {

    }
};

(function(){

})();

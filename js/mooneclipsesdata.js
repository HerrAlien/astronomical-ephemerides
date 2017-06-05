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
var MoonEclipsesData : {
    
	onNewEclipse : Ntifications.NewOneParameter(),
    
    getDates : function (startJD, endJD) {
        // get a start K, and an end K
        var startK = Math.floor(AAJS.Moon.kForJD (startJD)) + 0.5;
        var endK = Math.floor(AAJS.Moon.kForJD (endJD)) - 0.5;
        
        function checkK (k) {
            if (k > endK)
                return;
            
            // check if k has an eclipse
            var hasEclipse = false;
            
            if (hasEclipse) {
                // get the JD for the k
                var JD = AAJS.Moon.JDforK (k);
                // check if this is the time of the opposition
                var initialSunData = SunData.getDataForJD (JD);
                var initialMoonData = MoonData.getDataForJD (JD);
                var halfHourLaterJD = JD + 0.5/24;
                var halfHourLaterSunData = SunData.getDataForJD (halfHourLaterJD);
                var halfHourLaterMooonData = MoonData.getDataForJD (halfHourLaterJD);
                var eclipseData = {
                    "RaSun" : initialSunData[2],
                    "DecSun" : initialSunData[3],
                    "RaMoon" : initialMoonData[2],
                    "DecMoon" : initialMoonData[3],
                    
                    "dRaSun" : 2* (halfHourLaterSunData[2] - initialSunData[2]),
                    "dDecSun": 2* (halfHourLaterSunData[3] - initialSunData[3]),
                    "dRaMoon" : 2* (oneHourLaterMoonData[2] - initialMoonData[2]),
                    "dDecMoon": 2* (oneHourLaterMoonData[3] - initialMoonData[3]),
                    
                    "ParallaxSun" : initialSunData[10],
                    "ParallaxMoon" : initialMoonData[8],
                    
                    "MoonDiameter" : initialMoonData[6],
                    
                    "oppositionJD" : JD
                }
                
                var oppositionTimeCorrection = (12 + initialSunData[2] - initialMoonData[2]) /
                                               (eclipseData.dRaMoon - eclipseData.dRaSun);
                if (Math.abs (oppositionTimeCorrection) > 1/60) {
                    eclipseData.oppositionJD = JD + oppositionTimeCorrection / 24;
                    
                    var sunData = SunData.getDataForJD (JD);
                    var moonData = MoonData.getDataForJD (JD);
                    eclipseData["RaSun"] = sunData[2];
                    eclipseData["DecSun"] = sunData[3];
                    eclipseData["RaMoon"] = moonData[2];
                    eclipseData["DecMoon"] = moonData[3];
                }
                
                eclipseData = MoonEclipsesData.AddTimingsAndRadii(eclipseData);
                setTimeout (function () { MoonEclipsesData.onNewEclipse.notify (eclipseData); }, 1);
            }
            
            
            
            setTimeout (function () { checkK (k + 1); }, 1);
        }
        
    },
    reset : function () {
        this.eclipsesDates = []
    }
};

(function(){

})();

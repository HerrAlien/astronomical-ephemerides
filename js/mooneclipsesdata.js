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
        var hourFraction  = 1;
        var dJd = hourFraction/24;
        
        do {
            
            sunData = SunData.getDataForJD (jd);
            moonData = MoonData.getDataForJD (jd);
            
            dSunData = SunData.getDataForJD (jd + dJd);
            dMoonData = MoonData.getDataForJD (jd + dJd);
            
            var opposingSunRA = 12 + sunData[2];
            if (opposingSunRA > 24)
                opposingSunRA -= 24;
            
            oppositionTimeCorrection = dJd * (opposingSunRA - moonData[2]) /
                                           ((dMoonData[2] - moonData[2]) - (dSunData[2] - sunData[2]));
            jd += oppositionTimeCorrection;
            
        } while (Math.abs(oppositionTimeCorrection) > eps);
        
        return {
                    "RaSun" : sunData[2] * 15,
                    "DecSun" : sunData[3],
                    "RaMoon" : moonData[2] * 15,
                    "DecMoon" : moonData[3],
                    
                    "dRaSun" : (dSunData[2] - sunData[2]) * 15 / hourFraction,
                    "dDecSun": (dSunData[3] - sunData[3]) / hourFraction,
                    "dRaMoon" : (dMoonData[2] - moonData[2]) * 15 / hourFraction,
                    "dDecMoon": (dMoonData[3] - moonData[3]) / hourFraction,
                    
                    "ParallaxSun" : sunData[10],
                    "ParallaxMoon" : moonData[8],
                    
                    "MoonDiameter" : moonData[6],
                    "SunDiameter" : sunData[5],
                    
                    "oppositionJD" : jd,
                    "eclipse" : false
            };
    },
    
    addTimingsAndGeometry : function (opposition) {
        // first, compute penumbral and umbral radii. In degrees.
        opposition['umbralRadius'] = 1.02 * (0.99833 * opposition.ParallaxMoon - opposition.SunDiameter/2 + opposition.ParallaxSun);
        opposition['penumbralRadius'] = 1.02 * (0.99833 * opposition.ParallaxMoon + opposition.SunDiameter/2 + opposition.ParallaxSun);
        
        // then compute the minimum distance between the center of the Moon and the axes of these cones
        // - first, the equation of the line that describes the approximate motion of the moon
        opposition['y0'] = opposition.DecMoon + opposition.DecSun;
        opposition['dy'] = opposition.dDecMoon + opposition.dDecSun;
        opposition['dx'] = (opposition.dRaMoon - opposition.dRaSun)*Math.cos(opposition.DecMoon * Math.PI / 180);
        
        opposition['slope'] = opposition['dy'] / opposition['dx'];

        var denominatorAtMinimum = 1 + opposition['slope'] * opposition['slope'];
        var xMinDistance = - (opposition['slope'] * opposition['y0']) / denominatorAtMinimum;
        var yMinDistance = opposition['y0'] + opposition['slope'] * xMinDistance;
        var minDistance = Math.sqrt (xMinDistance * xMinDistance + yMinDistance * yMinDistance);
        // if the minimum distance is smaller than one of the radii, we have an eclipse.
        opposition['umbralTotalEclipse'] = minDistance <= opposition['umbralRadius'];
        opposition['penumbralTotalEclipse'] = minDistance <= opposition['penumbralRadius'];

        opposition['umbralPartialEclipse'] = minDistance <= opposition['umbralRadius'] + 0.5 * opposition.MoonDiameter;
        opposition['penumbralPartialEclipse'] = minDistance <= opposition['penumbralRadius'] + 0.5 * opposition.MoonDiameter;

        opposition['eclipse'] = opposition['umbralTotalEclipse'] || opposition['penumbralTotalEclipse'] || opposition['umbralPartialEclipse'] || opposition['penumbralPartialEclipse'];
        
        if (opposition['eclipse']) {
            opposition['MoonPositions'] = {};
            opposition['Timings'] = {};
        }
        
        if (opposition['umbralPartialEclipse']) {
            opposition['MoonPositions']['Umbral'] = MoonEclipsesData.computeMoonPositionsAtContact (opposition, opposition['umbralRadius']);
            opposition['Timings']['Umbral'] = MoonEclipsesData.computeTimings (opposition, opposition['MoonPositions']['Umbral']);
        }
        
        if (opposition['penumbralPartialEclipse']) {
            opposition['MoonPositions']['Penumbral'] = MoonEclipsesData.computeMoonPositionsAtContact (opposition, opposition['penumbralRadius']);
            opposition['Timings']['Penumbral'] = MoonEclipsesData.computeTimings (opposition, opposition['MoonPositions']['Penumbral']);
        }
        
        return opposition;
    },
    
    computeMoonPositionsAtContact : function (opposition, coneRadius) {
        var denominatorAtMinimum = 1 + opposition.slope * opposition.slope;
        var discriminantAtExternalTangent = 4 * opposition.slope * opposition.slope * opposition.y0 * opposition.y0 -
                           (4 * denominatorAtMinimum * (opposition.y0 * opposition.y0 - (coneRadius + opposition.MoonDiameter/2)*(coneRadius + opposition.MoonDiameter/2) ));
        var results = {
            "firstContact" : { "X" : (-2 * opposition.slope * opposition.y0 - Math.sqrt (discriminantAtExternalTangent)) / (2 * denominatorAtMinimum) },
            "lastContact" : {"X" : (-2 * opposition.slope * opposition.y0 + Math.sqrt (discriminantAtExternalTangent)) / (2 * denominatorAtMinimum)}
        };

        var discriminantAtInternalTangent = 4 * opposition.slope * opposition.slope * opposition.y0 * opposition.y0 -
                           (4 * denominatorAtMinimum * (opposition.y0 * opposition.y0 - (coneRadius - opposition.MoonDiameter/2)*(coneRadius - opposition.MoonDiameter/2) ));
        results ['beginFullImmersion'] = { "X" : (-2 * opposition.slope * opposition.y0 - Math.sqrt (discriminantAtInternalTangent)) / (2 * denominatorAtMinimum) };
        results ['endFullImmersion'] = { "X" : (-2 * opposition.slope * opposition.y0 + Math.sqrt (discriminantAtInternalTangent)) / (2 * denominatorAtMinimum) };

        results ['firstContact']["Y"] = opposition.y0 + opposition.slope *  results ['firstContact']["X"];
        results ['lastContact']["Y"] = opposition.y0 + opposition.slope *  results ['lastContact']["X"];
        results ['beginFullImmersion']["Y"] = opposition.y0 + opposition.slope *  results ['beginFullImmersion']["X"];
        results ['endFullImmersion']["Y"] = opposition.y0 + opposition.slope *  results ['endFullImmersion']["X"];
        return results;
    },
    
    computeTimings : function (opposition, moonPosAtContact) {
        var result = {};
        
        for (var position in moonPosAtContact) {
            result[position] = opposition.oppositionJD + (moonPosAtContact[position].X / opposition.dx)/24;
            if (isNaN(result[position]))
                result[position] = false;
        }
        
        return result;
    },
    
    computeEclipses : function (startJD, endJD) {
        var lastOpposition = this.getOppositionAroundJD(endJD);
        
        function calculateEclipseForJD (JD) {
            if (JD > lastOpposition.oppositionJD)
                return;
                
            var oppositionData = MoonEclipsesData.getOppositionAroundJD (JD);
            oppositionData = MoonEclipsesData.addTimingsAndGeometry(oppositionData);
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

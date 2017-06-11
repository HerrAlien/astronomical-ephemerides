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
        var plus = MoonEclipsesData.getOppositionAroundJDUsingFraction(JD, 0.5);
        var minus = MoonEclipsesData.getOppositionAroundJDUsingFraction(JD, -0.5);
        var result = {};
        for (var key in plus)
            result[key] = 0.5 * (plus[key] + minus[key]);
        
        return result;
    },
    
    computeDeltas : function (JD1, JD2) {
        var result = {};
        
        var sunData1 = SunData.getDataForJD (JD1);
        var moonData1 = MoonData.getDataForJD (JD1);
        
        var  sunData2 = SunData.getDataForJD (JD2);
        var moonData2 = MoonData.getDataForJD (JD2);
        
        var dT = (JD1 - JD2) * 24;
        
        result["dRaSun"  ] = 15 * (sunData1[2] - sunData2[2]) / dT;
        result["dDecSun" ] = (sunData1[3] - sunData2[3]) / dT;
        result["dRaMoon" ] = 15 * (moonData1[2] - moonData2[2]) / dT;
        result["dDecMoon"] = (moonData1[3] - moonData2[3]) / dT;
        
        var meanMoonDec = 0.5 * (moonData1[3] + moonData2[3]);
        
        result["dx"] = (result["dRaMoon"] - result["dRaSun"])*Math.cos(meanMoonDec * Math.PI / 180);
        result["dy" ] = result["dDecSun" ] + result["dDecMoon"];
        
        return result;
    },
    
    getOppositionAroundJDUsingFraction : function (JD, hourFraction) {
        var jd = JD;
        var sunData = false;
        var moonData = false;
        var eps = 1e-4;
        var dSunData = false;
        var dMoonData = false;
        var oppositionTimeCorrection = 0;
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
    
    addDeltas : function (opposition) {
        
        opposition['dy'] = opposition.dDecMoon + opposition.dDecSun;
        opposition['dx'] = (opposition.dRaMoon - opposition.dRaSun)*Math.cos(opposition.DecMoon * Math.PI / 180);
        return opposition;
    },
    
    addTimingsAndGeometry : function (opposition) {
        // first, compute penumbral and umbral radii. In degrees.
        opposition['umbralRadius'] = .993 * 1.02 * (0.99834 * opposition.ParallaxMoon - opposition.SunDiameter/2 + opposition.ParallaxSun);
        opposition['penumbralRadius'] = .988 * 1.02 * (0.99834 * opposition.ParallaxMoon + opposition.SunDiameter/2 + opposition.ParallaxSun);
        
        // then compute the minimum distance between the center of the Moon and the axes of these cones
        // - first, the equation of the line that describes the approximate motion of the moon
        opposition['y0'] = opposition.DecMoon + opposition.DecSun;
        
        opposition['slope'] = opposition['dy'] / opposition['dx'];

        var denominatorAtMinimum = 1 + opposition['slope'] * opposition['slope'];
        opposition['xMinDistance'] = - (opposition['slope'] * opposition['y0']) / denominatorAtMinimum;
        opposition['yMinDistance'] = opposition['y0'] + opposition['slope'] * opposition['xMinDistance'];
        opposition['minDistance'] = Math.sqrt (opposition['xMinDistance'] * opposition['xMinDistance'] +
                                               opposition['yMinDistance'] * opposition['yMinDistance']);
        // if the minimum distance is smaller than one of the radii, we have an eclipse.
        opposition['umbralTotalEclipse'] = opposition['minDistance'] <= opposition['umbralRadius'];
        opposition['penumbralTotalEclipse'] = opposition['minDistance'] <= opposition['penumbralRadius'];

        opposition['umbralPartialEclipse'] = opposition['minDistance'] <= opposition['umbralRadius'] + 0.5 * opposition.MoonDiameter;
        opposition['penumbralPartialEclipse'] = opposition['minDistance'] <= opposition['penumbralRadius'] + 0.5 * opposition.MoonDiameter;
        
        opposition['magnitude'] = (opposition['umbralRadius'] - opposition['minDistance'] + opposition.MoonDiameter/2) / opposition.MoonDiameter;
        opposition['penumbralMagnitude'] = (opposition['penumbralRadius'] - opposition['minDistance'] + opposition.MoonDiameter/2) / opposition.MoonDiameter;

        opposition['eclipse'] = opposition['umbralTotalEclipse'] || opposition['penumbralTotalEclipse'] || opposition['umbralPartialEclipse'] || opposition['penumbralPartialEclipse'];
        
        if (opposition['eclipse']) {
            opposition['MoonPositions'] = {};
            opposition['Timings'] = { 'Maximum' : opposition.oppositionJD + (opposition['xMinDistance'] / opposition.dx)/24 };
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
    
    average : function (a1, a2) {
        return 2 * a1 * a2 / (a1 + a2);
    },
    
    calculateEclipseForJD : function (JD) {
        var oppositionData = MoonEclipsesData.getOppositionAroundJD (JD);
        oppositionData = MoonEclipsesData.addTimingsAndGeometry(oppositionData);
        return oppositionData;
    },
    
    reset : function () {

    }
};

(function(){

})();

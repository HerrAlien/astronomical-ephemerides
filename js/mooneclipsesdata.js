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

function MoonEclipse (JD) {
    
        var sunData = SunData.getDataForJD (JD);
        var moonData = MoonData.getDataForJD (JD);
        
        var hourFration = 0.5;
        var dJd = hourFration /24.0;
        var dT = 2 * hourFration;
        
        var  sunDataPlus = SunData.getDataForJD (JD + dJd);
        var moonDataPlus = MoonData.getDataForJD (JD + dJd);
        var  sunDataMinus = SunData.getDataForJD (JD - dJd);
        var moonDataMinus = MoonData.getDataForJD (JD - dJd);
        
        
        this.dRaSun   = 15 * (sunDataPlus[2] - sunDataMinus[2]) / dT;
        this.dDecSun  = (sunDataPlus[3] - sunDataMinus[3]) / dT;
        this.dRaMoon  = 15 * (moonDataPlus[2] - moonDataMinus[2]) / dT;
        this.dDecMoon = (moonDataPlus[3] - moonDataMinus[3]) / dT;
                
        this.JD = JD;
        this.ParallaxSun = sunData[10];
        this.ParallaxMoon = moonData[8];

        this.MoonDiameter = moonData[6];
        this.SunDiameter = sunData[5];

        this.RaSun   = sunData[2] * 15;
        this.DecSun  = sunData[3];
        this.RaMoon  = moonData[2] * 15;
        this.DecMoon = moonData[3];

        var shadowRa = 180 + this.RaSun;
        if (shadowRa > 360)
            shadowRa -= 360;
        
        this.x0 = (shadowRa - this.RaMoon) * Math.cos(this.DecMoon * Math.PI / 180);;
        this.y0 = this.DecSun + this.DecMoon;
        this.dx = (this.dRaMoon - this.dRaSun)*Math.cos(this.DecMoon * Math.PI / 180);
        this.dy  = this.dDecSun + this.dDecMoon;        
        this.slope = this.dy / this.dx;
        
}

(function(){
    MoonEclipse.prototype['computeMagnitudes'] = function () {
        
        this.umbralRadius = 1.02 * (0.99834 * this.ParallaxMoon - this.SunDiameter/2 + this.ParallaxSun);
        this.penumbralRadius = 1.02 * (0.99834 * this.ParallaxMoon + this.SunDiameter/2 + this.ParallaxSun);

        var denominatorAtMinimum = 1 + this.slope  * this.slope ;
        
        this.xMinDistance  = - (this.slope  * this.y0 ) / denominatorAtMinimum;
        this.yMinDistance  = this.y0  + this.slope  * this.xMinDistance ;
        this.minDistance  = Math.sqrt (this.xMinDistance  * this.xMinDistance  +
                                               this.yMinDistance  * this.yMinDistance );
                                               
        // if the minimum distance is smaller than one of the radii, we have an eclipse.
        this.umbralTotalEclipse  = this.minDistance  <= this.umbralRadius ;
        this.penumbralTotalEclipse  = this.minDistance  <= this.penumbralRadius ;

        this.umbralPartialEclipse  = this.minDistance  <= this.umbralRadius  + 0.5 * this.MoonDiameter;
        this.penumbralPartialEclipse  = this.minDistance  <= this.penumbralRadius  + 0.5 * this.MoonDiameter;
        
        this.magnitude  = (this.umbralRadius  - this.minDistance  + this.MoonDiameter/2) / this.MoonDiameter;
        this.penumbralMagnitude  = (this.penumbralRadius  - this.minDistance  + this.MoonDiameter/2) / this.MoonDiameter;

        this.eclipse  = this.umbralTotalEclipse  || this.penumbralTotalEclipse  || this.umbralPartialEclipse  || this.penumbralPartialEclipse ;
    }
    
    
})();


var MoonEclipsesData = {
    
	onNewEclipse : Notifications.NewOneParameter(),
    
    sinodicPeriod : 29.530587981,
    
    getOppositionAroundJD : function (JD) {
        var jd = MoonEclipsesData.getOppositionJD(JD);

        var result = new MoonEclipse (jd);
        result['eclipse'] = false;
        return result;
    },
    
    getOppositionJD : function (startJD) {
        var jd = startJD;
        var sunData = false;
        var moonData = false;
        var eps = 1e-4;
        var dSunData = false;
        var dMoonData = false;
        var oppositionTimeCorrection = 0;
        var dJd = 0.5/24;
        
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
        return jd;
    },
    
        
    // needs an X0
    addTimingsAndGeometry : function (opposition) {
        
        // then compute the minimum distance between the center of the Moon and the axes of these cones
        // - first, the equation of the line that describes the approximate motion of the moon
        
        opposition.computeMagnitudes();
        
        if (opposition['eclipse']) {
            opposition['MoonPositions'] = {};
            opposition['Timings'] = { 'Maximum' : opposition.JD + (opposition['xMinDistance'] / opposition.dx)/24 };
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
    
    // needs an X0
    computeMoonPositionsAtContact : function (opposition, coneRadius) {
        var distanceAtExternalTangent = coneRadius + opposition.MoonDiameter/2;
        
        var squaredDistance = distanceAtExternalTangent * distanceAtExternalTangent;
        var squaredSlope = opposition.slope * opposition.slope;
        var yResidue = opposition.y0 - opposition.slope * opposition.x0;
        var denominatorAtMinimum = 1 + squaredSlope;
        
        var discriminantAtExternalTangent = 4 * (squaredSlope*squaredDistance - yResidue*yResidue + squaredDistance);
        
        var results = {
            "firstContact" : { "X" : (-2 * opposition.slope * opposition.y0 - Math.sqrt (discriminantAtExternalTangent)) / (2 * denominatorAtMinimum) },
            "lastContact" : {"X" : (-2 * opposition.slope * opposition.y0 + Math.sqrt (discriminantAtExternalTangent)) / (2 * denominatorAtMinimum)}
        };
        
        var distanceAtInternalTangent = coneRadius - opposition.MoonDiameter/2;
        squaredDistance = distanceAtInternalTangent * distanceAtInternalTangent;

        var discriminantAtInternalTangent = 4 * (squaredSlope*squaredDistance - yResidue*yResidue + squaredDistance);
        
        
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
            result[position] = opposition.JD + (moonPosAtContact[position].X / opposition.dx)/24;
            if (isNaN(result[position]))
                result[position] = false;
        }
        
        return result;
    },
        
    clone : function (obj) {
        var res = {};
        for (var key in obj) {
            if (typeof obj[key] == 'Object')
                res[key] = MoonEclipsesData.clone (obj[key]);
            else
                res[key] = obj[key];
        }
        return res;
    },
    
    calculateEclipseForJD : function (JD) {
        var oppositionData = MoonEclipsesData.getOppositionAroundJD (JD);
        oppositionData = MoonEclipsesData.addTimingsAndGeometry(oppositionData);
        
        if (oppositionData.eclipse) {
        /* picewise linear:
         - compute deltas around a given position
         - compute X, Y based on the x0 and y0 corresponding to that position
         - update that one timestamp.
        */
        
        var p1 = MoonEclipsesData.eclipseInputsAroundJD (oppositionData['Timings']['Penumbral']['lastContact'] );
        p1 =  MoonEclipsesData.addTimingsAndGeometry(p1);
        oppositionData['Timings']['Penumbral']['lastContact']  = p1 ['Timings']['Penumbral']['lastContact'] ;
        
        
        }
       
        return oppositionData;
    },
    
    reset : function () {

    }
};

(function(){

})();

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

"use strict";

var MoonData = {
    cache : {},
    
    toDUT : 0,
   
   getDataAsObjectForJD : function (_JD, computeRiseTransitSet) {
        if (!this.toDUT)
            this.toDUT = AAJS.DynamicalTime.DeltaT(_JD)/(3600 * 24);
        
        var JD = _JD + this.toDUT;
        
        var data = this.cache[JD];
        
        if (!data) {
            data = {};
        
            var i = 0;
            
            var _date = AAJS.Date.JD2Date(JD);
            // convert from JD to gregorian
            data['Month'] = _date.M;
            data['Day'] = _date.D;
            
            var posData = AAJS.Moon.PositionalEphemeris(JD, Location.latitude, Location.longitude, Location.altitude);
            
            for (var key in posData)
                data[key] = posData[key];
            
            // how about we rename the geo ones?
            data ['RA'] = data['RaGeo'];
            data ['Dec'] = data['DecGeo'];
            
			data['MeridianTransit'] = false;

            var selenographicCoordsOfSun = AAJS.Moon.CalculateSelenographicPositionOfSun (JD, true);
            var colongitude = 90 - selenographicCoordsOfSun.l0;
            if (colongitude < 0)
                colongitude += 360;
            
            data['Colongitude'] = colongitude;
            data['b0'] = selenographicCoordsOfSun.b0;
            
            this.cache[JD] = data;
        }
        
        if (computeRiseTransitSet) {
            this.riseSetAngle = 0.7275 * data.parallax - 0.56666666666666666666666666666667;
            data = this.addRiseTransitSetData(JD, data);
            this.cache[JD] = data;
        }

        return data;
    },

    reset : function () {
        this.cache = {};
        this.toDUT = 0;
    },

    riseSetAngle : -0.83333,
    addRiseTransitSetData : PlanetData.prototype["addRiseTransitSetData"]    
};
    

(function(){    
    var MoonPage = {
        hostElement : document.getElementById("MoonTable"),
        pageRendered : false,
        dataSource : MoonData,
        tableHeaderInfo : {
        "0" : {
                "0" : { "text" : "Date", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: month"
            } ,

        "1" : {
                "0" : { "text" : "", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: day"
            },
        "2" : {
                "0" : { "text" : "\u03B1", "classes" : ["minWidth20"] },
                "1" : { "text" : "h", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "3" : {
                "0" : { "text" : "(RA)", "classes" : ["minWidth20", "screenOnly"] },
                "1" : { "text" : "m", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "4" : {
                "0" : { "text" : "", "classes" : ["minWidth10"] },
                "1" : { "text" : "s", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "5" :  {
                "0" : { "text" : "\u03B4", "classes" : ["minWidth20"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth25"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "6" :  {
                "0" : { "text" : "(Dec)", "classes" : ["minWidth20" , "screenOnly"] },
                "1" : { "text" : "'", "classes" : ["minWidth20"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "7" :  {
                "0" : { "text" : "", "classes" : ["minWidth10"  ] },
                "1" : { "text" : "''", "classes" : ["minWidth25"] },
                "longText" : "Equatorial coordinates: Declination"
            },

            "8" : {
                    "0" : { "text" :"\u03B1", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"h"     , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial coordinates: Right Ascension"
                },
            "9" : {
                    "0" : { "text" :"topo", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"m"   , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial coordinates: Right Ascension"
                },
            "10" : {
                    "0" : { "text" :"" , "classes" : ["minWidth5", "positionEphemeris"] },
                    "1" : { "text" :"s", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial oordinates: Right Ascension"
                },
            "11" :  {
                    "0" : { "text" :"\u03B4", "classes" : ["minWidth25", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth25", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial coordinates: Declination"
                },
            "12" :  {
                    "0" : { "text" :"topo", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'"   , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial coordinates: Declination"
                },
            "13" :  {
                    "0" : { "text" :""  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth30", "positionEphemeris"] },
                    "longText" : "Topocentric equatorial coordinates: Declination"
                },

           
            "14" :  {
                    "0" : { "text" :"\u03D5", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'"     , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Apparent diameter"
                },
            "15" :  {
                    "0" : { "text" :""  , "classes" : ["minWidth15", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth30", "positionEphemeris"] },
                    "longText" : "Apparent diameter"
                },
                
            "16" : {
                    "0" : { "text" :"Rise", "classes" : ["minWidth50", "positionEphemeris"] },
                    "1" : { "text" :"hh:mm"      , "classes" : ["minWidth50", "positionEphemeris"] },
                    "longText" : "The UTC time of rise above horizon"
                },
            "17" : {
                    "0" : { "text" :"Transit" , "classes" : ["minWidth50", "positionEphemeris"] },
                    "1" : { "text" :"hh:mm", "classes" : ["minWidth50", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "18" : {
                    "0" : { "text" :"Set" , "classes" : ["minWidth55", "positionEphemeris"] },
                    "1" : { "text" :"hh:mm", "classes" : ["minWidth50", "positionEphemeris"] },
                    "longText" : "The UTC time of setting"
                },
 
            "19" :  {
                    "0" : { "text" :"\u03C0", "classes" : ["minWidth15", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth15", "positionEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },
                
            "20" :  {
                    "0" : { "text" :"" , "classes" : ["minWidth20", "physicalEphemeris"] },
                    "1" : { "text" :"'", "classes" : ["minWidth20", "physicalEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },

            "21" :  {
                    "0" : { "text" :""  , "classes" : ["minWidth20", "physicalEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth20", "physicalEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },
            "22" :  {
                    "0" : { "text" :"90-l0" , "classes" : ["minWidth52", "physicalEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth52", "physicalEphemeris"] },
                    "longText" : "colongitude of the Sun"
                },
            "23" :  {
                    "0" : { "text" :"b0"    , "classes" : ["minWidth65", "physicalEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth65", "physicalEphemeris"] },
                    "longText" : "latitude of the Sun"
                },
        },
        
        firstDataRowColumnClasses : [["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth20"], 
                         ["minWidth25"], ["minWidth20"], ["minWidth20"], ["minWidth20"], ["minWidth20"], 
                         ["minWidth20"], ["minWidth25"], ["minWidth20"], ["minWidth30"], ["minWidth20"],
                         ["minWidth20"], ["minWidth50"], ["minWidth50"], ["minWidth50"], ["minWidth15"],
                         ["minWidth20"], ["minWidth20"], ["minWidth52"], ["minWidth52"]],
 
        lastDisplayedMonth : -1,
        months : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        lastAppendedLine : false
    };
    
    Pages["Moon"] = MoonPage;
    
    MoonPage.reset = PlanetPage.prototype.reset;
    MoonPage.appendLine = PlanetPage.prototype.appendLine;
    MoonPage.addNodeChild = PlanetPage.prototype.addNodeChild;
    MoonPage.displayPage = PlanetPage.prototype.displayPage;
   
    MoonPage.prepareOneDayDataObjectForView = function (obj) {
        var displayableLine = [];

        displayableLine[0] = "";
        var month = obj.Month;
        if (month != this.lastDisplayedMonth) { // first day of the month
            displayableLine[0] = this.months[month]; // set displayableLine[0] to the name of the month
            this.lastDisplayedMonth = month;
        }

        // copy the day verbatim
        displayableLine[1] = obj.Day;
        
        var di = 2;
        var sexagesimalRaGeo = AAJS.Numerical.ToSexagesimal(Math.round(obj.RaGeo * 3600)/3600);
        displayableLine[di++] = sexagesimalRaGeo.Ord3 ;
        displayableLine[di++] = sexagesimalRaGeo.Ord2 
        displayableLine[di++] = sexagesimalRaGeo.Ord1;

        var sexagesimalDecGeo = AAJS.Numerical.ToSexagesimal(Math.round(obj.DecGeo * 3600)/3600);
        displayableLine[di++] = sexagesimalDecGeo.Ord3 ;
        displayableLine[di++] = sexagesimalDecGeo.Ord2;
        displayableLine[di++] = sexagesimalDecGeo.Ord1;
		            
        var sexagesimalRaTopo = AAJS.Numerical.ToSexagesimal(Math.round(obj.RaTopo * 3600)/3600);
        displayableLine[di++] = sexagesimalRaTopo.Ord3 ;
        displayableLine[di++] = sexagesimalRaTopo.Ord2 
        displayableLine[di++] = sexagesimalRaTopo.Ord1;

        var sexagesimalDecTopo = AAJS.Numerical.ToSexagesimal(Math.round(obj.DecTopo * 3600)/3600);
        displayableLine[di++] = sexagesimalDecTopo.Ord3 ;
        displayableLine[di++] = sexagesimalDecTopo.Ord2;
        displayableLine[di++] = sexagesimalDecTopo.Ord1;

        var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(obj.diameter * 3600)/3600);
        displayableLine[di++] = sexagesimalDiam.Ord2;
        displayableLine[di++] = sexagesimalDiam.Ord1;
        
        displayableLine[di++] = this.timeToHhColumnMm(obj.Rise);
        displayableLine[di++] = this.timeToHhColumnMm(obj.MeridianTransit);
        displayableLine[di++] = this.timeToHhColumnMm(obj.Set);
            
        var sexagesimalParallax = AAJS.Numerical.ToSexagesimal(Math.round(obj.parallax * 3600)/3600);
        
        displayableLine[di++] = sexagesimalParallax.Ord3;
        displayableLine[di++] = sexagesimalParallax.Ord2;
        displayableLine[di++] = sexagesimalParallax.Ord1;
        
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.Colongitude);
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.b0);

        return displayableLine;
    };

    MoonPage.oldHeaderFunc = PlanetPage.prototype.addTableHeader;
    
    MoonPage.addTableHeader = function (table, classes, tBody) {            
        var result = this.oldHeaderFunc(table, classes, tBody);
        result.row1.cells[22].textContent = "90-l";
        this.addNodeChild(result.row1.cells[22], "sub", "0");
        result.row1.cells[23].textContent = "b";
        this.addNodeChild(result.row1.cells[23], "sub", "0");
        
        return result;
    };
    
    MoonPage.timeToHhColumnMm = PlanetPage.prototype.timeToHhColumnMm;
})();

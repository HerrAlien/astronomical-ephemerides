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

var MoonData = {
    cache : {},
    getDataForJD : function (JD) {
        var key = JSON.stringify([JD,Location.latitude, Location.longitude, Location.altitude]);
        var data = this.cache[key];
        if (!data) {
            data = [];
        
            var i = 0;
            
            var _date = AAJS.Date.JD2Date(JD);
            // convert from JD to gregorian
            data[i++] = _date.M;
            data[i++] = _date.D;
            
            var posData = AAJS.Moon.PositionalEphemeris(JD, Location.latitude, Location.longitude, Location.altitude);
                
            data[i++] = posData.RaGeo;
            data[i++] = posData.DecGeo;
            data[i++] = posData.RaTopo;
            data[i++] = posData.DecTopo;
            data[i++] = posData.diameter;
            
            var jdOfTransit = Transit (JD, function(jd) { 
                
                var data = AAJS.Moon.PositionalEphemeris(jd, Location.latitude, Location.longitude, Location.altitude);
                return {"X" : posData.RaGeo, "Y" : posData.DecGeo };
                
            }, 1/(24 * 3600)); 
            
				var transitHour = 24 * (jdOfTransit - JD);
				data[i++] = transitHour;

            
            data[i++] = posData.parallax;
            var selenographicCoordsOfSun = AAJS.Moon.CalculateSelenographicPositionOfSun (JD, true);
            var colongitude = 90 - selenographicCoordsOfSun.l0;
            if (colongitude < 0)
                colongitude += 360;
            
            data[i++] = colongitude;
            data[i++] = selenographicCoordsOfSun.b0;
            
            this.cache[key] = data;
        }
        return data;
    },
    
    reset : function () {
        this.cache = {};
    }    
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
                "0" : { "text" : "", "classes" : ["minWidth5"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: day"
            },
            "2" : {
                    "0" : { "text" :"\u03B1", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"h"     , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial coordinates: Right Ascension"
                },
            "3" : {
                    "0" : { "text" :"geo", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"m"  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial coordinates: Right Ascension"
                },
            "4" : {
                    "0" : { "text" :"" , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"s", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial oordinates: Right Ascension"
                },
            "5" :  {
                    "0" : { "text" :"\u03B4", "classes" : ["minWidth25", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth25", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial coordinates: Declination"
                },
            "6" :  {
                    "0" : { "text" :"geo", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'"  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial coordinates: Declination"
                },
            "7" :  {
                    "0" : { "text" :""  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Geocentric equatorial coordinates: Declination"
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
                    "0" : { "text" :""  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Apparent diameter"
                },
                
            "16" : {
                    "0" : { "text" :"Transit", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"h"      , "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "17" : {
                    "0" : { "text" :"" , "classes" : ["minWidth5", "positionEphemeris"] },
                    "1" : { "text" :"m", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "18" : {
                    "0" : { "text" :"" , "classes" : ["minWidth5", "positionEphemeris"] },
                    "1" : { "text" :"s", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
 
            "19" :  {
                    "0" : { "text" :"\u03C0", "classes" : ["minWidth25", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth25", "positionEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },
                
            "20" :  {
                    "0" : { "text" :"" , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },

            "21" :  {
                    "0" : { "text" :""  , "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                },
            "22" :  {
                    "0" : { "text" :"90-l0" , "classes" : ["minWidth52", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth52", "positionEphemeris"] },
                    "longText" : "colongitude of the Sun"
                },
            "23" :  {
                    "0" : { "text" :"b0"    , "classes" : ["minWidth52", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth52", "positionEphemeris"] },
                    "longText" : "latitude of the Sun"
                },
        },
 
        lastDisplayedMonth : -1,
        months : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        lastAppendedLine : false
    };
    
    Pages["Moon"] = MoonPage;
    
    MoonPage.reset = PlanetPage.prototype.reset;
    MoonPage.appendLine = PlanetPage.prototype.appendLine;
    MoonPage.addNodeChild = PlanetPage.prototype.addNodeChild;
    MoonPage.displayPage = PlanetPage.prototype.displayPage;

    MoonPage.prepareLineForView = function (line) {
        var displayableLine = [];

        displayableLine[0] = "";
        if (line[0] != this.lastDisplayedMonth) { // first day of the month
            displayableLine[0] = this.months[line[0]]; // set displayableLine[0] to the name of the month
            this.lastDisplayedMonth = line[0];
        }

        // copy the day verbatim
        displayableLine[1] = line[1];
        
        var di = 2;
        var si = 2;
        var sexagesimalRaGeo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalRaGeo.Ord3 ;
        displayableLine[di++] = sexagesimalRaGeo.Ord2 
        displayableLine[di++] = sexagesimalRaGeo.Ord1;

        var sexagesimalDecGeo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalDecGeo.Ord3 ;
        displayableLine[di++] = sexagesimalDecGeo.Ord2;
        displayableLine[di++] = sexagesimalDecGeo.Ord1;
		            
        var sexagesimalRaTopo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalRaTopo.Ord3 ;
        displayableLine[di++] = sexagesimalRaTopo.Ord2 
        displayableLine[di++] = sexagesimalRaTopo.Ord1;

        var sexagesimalDecTopo = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalDecTopo.Ord3 ;
        displayableLine[di++] = sexagesimalDecTopo.Ord2;
        displayableLine[di++] = sexagesimalDecTopo.Ord1;

        var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalDiam.Ord2;
        displayableLine[di++] = sexagesimalDiam.Ord1;
        
        var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        displayableLine[di++] = sexagesimalTransit.Ord3;
        displayableLine[di++] = sexagesimalTransit.Ord2;
        displayableLine[di++] = sexagesimalTransit.Ord1;
            
        var sexagesimalParallax = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
        
        displayableLine[di++] = sexagesimalParallax.Ord3;
        displayableLine[di++] = sexagesimalParallax.Ord2;
        displayableLine[di++] = sexagesimalParallax.Ord1;
        
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
        displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);

        return displayableLine;
    };
    
    MoonPage.oldHeaderFunc = PlanetPage.prototype.addTableHeader;
    
    MoonPage.addTableHeader = function (table, classes) {            
        var result = this.oldHeaderFunc(table, classes);
        result.row1.cells[22].textContent = "90-l";
        this.addNodeChild(result.row1.cells[22], "sub", "0");
        result.row1.cells[23].textContent = "b";
        this.addNodeChild(result.row1.cells[23], "sub", "0");
        
        return result;
    };
})();

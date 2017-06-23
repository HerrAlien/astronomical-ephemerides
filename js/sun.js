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

var SunData = {
    cache : {},
    getDataForJD : function (JD) {
        var line = this.cache[JD];
        if (!line) {
            line = [];
            var i = 0;
            var _date = AAJS.Date.JD2Date(JD);
            // convert from JD to gregorian
            line[i++] = _date.M;
            line[i++] = _date.D;
            var radec = AAJS.Sun.EquatorialCoordinates(JD, true);
            line[i++] = radec.X; // RA [h.hhhh]
            line[i++] = radec.Y; // DEC [deg.dddd]
            var sunDistance = AAJS.Sun.Distance(JD, true);
			line[i++] = sunDistance;// [au]
            line[i++] = AAJS.Sun.Diameter(JD, true)/3600; // [deg.dddd]
            
            // transit should be computed from the RA (LST to UTC conversion)
            var jdOfTransit = Transit (JD, function(jd) { return AAJS.Sun.EquatorialCoordinates(jd, true); }, 1/(24 * 3600)); 
            
            
            line[i++] = 24 * (jdOfTransit - JD);
            var physical = AAJS.Sun.CalculatePhysicalDetails(JD, true);
            line[i++] = physical.P; // [deg.dddd]
            line[i++] = physical.B0; // [deg.dddd]
            line[i++] = physical.L0; // [deg.dddd]
            line[i++] = Math.atan2(6.378137e+6,149597870700 * sunDistance) * 180/Math.PI; // [deg.dddd]
        }
        this.cache[JD] = line;
        return line;
    },
	getSunEarthDistance : function(JD) {
		var line = this.getDataForJD(JD);
		return line[4];
	},
    getRA : function(JD) {
		var line = this.getDataForJD(JD);
		return line[2];
	},
    reset : function () {
        this.cache = {};
    }
};

    
(function(){    
    var Sun = {
        hostElement : document.getElementById("SunTable"),
        pageRendered : false,
        dataSource : SunData,
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
                    "0" : { "text" :"\u03B1",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"h"     ,  "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "3" : {
                    "0" : { "text" :"",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"m", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "4" : {
                    "0" : { "text" :"",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"s", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "5" :  {
                    "0" : { "text" :"\u03B4", "classes" : ["minWidth25", "positionEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth25", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Declination"
                },
            "6" :  {
                    "0" : { "text" :"",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'", "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Declination"
                },
            "7" :  {
                    "0" : { "text" :"",   "classes" : ["minWidth15", "positionEphemeris"] },
                    "1" : { "text" :"''", "classes" : ["minWidth25", "positionEphemeris"] },
                    "longText" : "Equatorial coordinates: Declination"
                },
            "8" :  {
                    "0" : { "text" :"\u0394", "classes" : ["minWidth50", "positionEphemeris"] },
                    "1" : { "text" :"A.U.",   "classes" : ["minWidth50", "positionEphemeris"] },
                    "longText" : "Distance to Earth, in astronomical units"
                },
            
            "9" :  {
                    "0" : { "text" :"\u03D5", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"'",      "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Apparent diameter of the Sun"
                },
            "10" :  {
                    "0" : { "text" :"",    "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"''",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "Apparent diameter of the Sun"
                },
                
            "11" : {
                    "0" : { "text" :"Transit", "classes" : ["minWidth20", "positionEphemeris"] },
                    "1" : { "text" :"h",       "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "12" : {
                    "0" : { "text" :"",   "classes" : ["minWidth1", "positionEphemeris"] },
                    "1" : { "text" :"m",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "13" : {
                    "0" : { "text" :"",   "classes" : ["minWidth1", "positionEphemeris"] },
                    "1" : { "text" :"s",  "classes" : ["minWidth20", "positionEphemeris"] },
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "14" :  {
                    "0" : { "text" :"P",      "classes" : ["minWidth62", "physicalEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth62", "physicalEphemeris"] },
                    "longText" : "Position angle of the N end of the axis of rotation. It is positive when east of the north point of the disk, negative if west."
                },

            "15" :  {
                    "0" : { "text" :"B",      "classes" : ["minWidth62", "physicalEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth62", "physicalEphemeris"] },
                    "longText" : "Heliographic latitude of the centre of the disk."
                },

            "16" :  {
                    "0" : { "text" :"L",      "classes" : ["minWidth62", "physicalEphemeris"] },
                    "1" : { "text" :"\u00B0", "classes" : ["minWidth62", "physicalEphemeris"] },
                    "longText" : "Heliographic longitude of the centre of the disk."
                },
                // \u03C0
            "17" :  {
                    "0" : { "text" :"\u03C0", "classes" : ["minWidth30", "physicalEphemeris"] },
                    "1" : { "text" :"''",     "classes" : ["minWidth30", "physicalEphemeris"] },
                    "longText" : "Equatorial horizontal parallax"
                }
        },
        lastDisplayedMonth : -1,
        months : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        // this will probably become an utility available for every page
        lastAppendedLine : false,
       
        reset : PlanetPage.prototype.reset,

        prepareLineForView : function (line) {
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
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++] * 3600); // just arcsecs

            return displayableLine;
        },
        
        appendLine : PlanetPage.prototype.appendLine,
        addNodeChild : PlanetPage.prototype.addNodeChild,
        oldAddHeader : PlanetPage.prototype.addTableHeader,
        addTableHeader : function (table, classes) {

            var result = this.oldAddHeader(table, classes);
            // add some subscripts
            this.addNodeChild (result.row1.cells[15], "sub", "0");
            this.addNodeChild (result.row1.cells[16], "sub", "0");
            return result;
        },
        
        displayPage : PlanetPage.prototype.displayPage
    };

        Pages["Sun"] = Sun;
    
})();

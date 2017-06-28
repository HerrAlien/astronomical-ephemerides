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

    getDataAsObjectForJD : function (JD, computeRiseTransitSet) {
        var data = this.cache[JD];
        if (!data) {
            data = {};
            var _date = AAJS.Date.JD2Date(JD);
            // convert from JD to gregorian
            data['Month'] = _date.M;
            data['Day'] = _date.D;
            var radec = AAJS.Sun.EquatorialCoordinates(JD, true);
            data['RA'] = radec.X; // RA [h.hhhh]
            data['Dec'] = radec.Y; // DEC [deg.dddd]
            var sunDistance = AAJS.Sun.Distance(JD, true);
			data['DistanceToEarth'] = sunDistance;// [au]
            data['Diameter'] = AAJS.Sun.Diameter(JD, true)/3600; // [deg.dddd]
            
            // transit should be computed from the RA (LST to UTC conversion)
            var jdOfTransit = Transit (JD, function(jd) { return AAJS.Sun.EquatorialCoordinates(jd, true); }, 1/(24 * 3600)); 
            
            
            data['MeridianTransit'] = 24 * (jdOfTransit - JD);
            var physical = AAJS.Sun.CalculatePhysicalDetails(JD, true);
            data['P'] = physical.P; // [deg.dddd]
            data['B0'] = physical.B0; // [deg.dddd]
            data['L0'] = physical.L0; // [deg.dddd]
            data['Parallax'] = Math.atan2(6.378137e+6,149597870700 * sunDistance) * 180/Math.PI; // [deg.dddd]
            this.cache[JD] = data;
        }
        return data;
    },

	getSunEarthDistance : function(JD) {
		var data = this.getDataAsObjectForJD(JD);
		return data.DistanceToEarth;
	},
    getRA : function(JD) {
		var data = this.getDataAsObjectForJD(JD);
		return data.RA;
	},
    reset : function () {
        this.cache = {};
    }
};

    
(function(){    
    var SunPage = {
        hostElement : document.getElementById("Sun"),
        pageRendered : false,
        dataSource : SunData,
        tableHeaderInfo : {
            "0" : {
                    "0" : "Date",
                    "1" : "",
                    "longText" : "Date: month"
                } ,

            "1" : {
                    "0" : "",
                    "1" : "",
                    "longText" : "Date: day"
                },
            "2" : {
                    "0" : "\u03B1",
                    "1" : "h",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "3" : {
                    "0" : "",
                    "1" : "m",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "4" : {
                    "0" : "",
                    "1" : "s",
                    "longText" : "Equatorial coordinates: Right Ascension"
                },
            "5" :  {
                    "0" : "\u03B4",
                    "1" : "\u00B0",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "6" :  {
                    "0" : "",
                    "1" : "'",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "7" :  {
                    "0" : "",
                    "1" : "''",
                    "longText" : "Equatorial coordinates: Declination"
                },
            "8" :  {
                    "0" : "\u0394",
                    "1" : "A.U.",
                    "longText" : "Distance to Earth, in astronomical units"
                },
            
            "9" :  {
                    "0" : "\u03D5",
                    "1" : "'",
                    "longText" : "Apparent diameter of the Sun"
                },
            "10" :  {
                    "0" : "",
                    "1" : "''",
                    "longText" : "Apparent diameter of the Sun"
                },
                
            "11" : {
                    "0" : "Transit",
                    "1" : "h",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "12" : {
                    "0" : "",
                    "1" : "m",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "13" : {
                    "0" : "",
                    "1" : "s",
                    "longText" : "The UTC time of the transit across the meridian"
                },
            "14" :  {
                    "0" : "P",
                    "1" : "\u00B0",
                    "longText" : "Position angle of the N end of the axis of rotation. It is positive when east of the north point of the disk, negative if west."
                },

            "15" :  {
                    "0" : "B",
                    "1" : "\u00B0",
                    "longText" : "Heliographic latitude of the centre of the disk."
                },

            "16" :  {
                    "0" : "L",
                    "1" : "\u00B0",
                    "longText" : "Heliographic longitude of the centre of the disk."
                },
                // \u03C0
            "17" :  {
                    "0" : "\u03C0",
                    "1" : "''",
                    "longText" : "Equatorial horizontal parallax"
                }
        },
        lastDisplayedMonth : -1,
        months : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        // this will probably become an utility available for every page
        lastAppendedLine : false,
       
        reset : PlanetPage.prototype.reset,
       
        prepareOneDayDataObjectForView : function (obj, JD) {
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
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(obj.RA * 3600)/3600);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(obj.Dec * 3600)/3600);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.DistanceToEarth);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(obj.Diameter * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(obj.MeridianTransit * 3600)/3600);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.P);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.B0);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.L0);
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(obj.Parallax * 3600); // just arcsecs

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

        Pages["SunPage"] = SunPage;
    
})();

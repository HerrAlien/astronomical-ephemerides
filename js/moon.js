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
       
   getDataAsObjectForJD : function (JDE, computeRiseTransitSet, computeSelenographicData) {
        
        var data = this.cache[JDE];
        
        if (!data) {
            data = {};
        
            var i = 0;
            
            var _date = GetAAJS().Date.JD2Date(JDE);
            // convert from JD to gregorian
            data['Month'] = _date.M;
            data['Day'] = _date.D;

            var posData = GetAAJS().Moon.PositionalEphemeris(JDE, Location.latitude, Location.longitude, Location.altitude);
            
            for (var key in posData) {
                if (key == 'RaGeo') {
                    data['RA'] = posData[key];
                } else if (key == 'DecGeo') {
                    data['Dec'] = posData[key];
                } else if (key == 'diameter') {
                    data['DiameterTopo'] = posData[key];
                } else if (key == 'parallax') {
                    data['Parallax'] = posData[key];
                } else {
                    data[key] = posData[key];
                }
            }

            var r = data['R'] * GetAAJS().Globe.Radius;
            data['Diameter'] =  GetAAJS().Diameters.GeocentricMoonSemidiameter(r)/1800;
            
            // how about we rename the geo ones?
			data['MeridianTransit'] = false;
            
            this.cache[JDE] = data;
        }
        
        if (computeRiseTransitSet) {
            this.riseSetAngle = 0.7275 * data.parallax - 0.56666666666666666666666666666667;
            data = this.addRiseTransitSetData(JDE, data);
            this.cache[JDE] = data;
        }

        if (computeSelenographicData) {
            var selenographicCoordsOfSun = GetAAJS().Moon.CalculateSelenographicPositionOfSun (JDE, true);
            var colongitude = 90 - selenographicCoordsOfSun.l0;
            if (colongitude < 0)
                colongitude += 360;

            data['Colongitude'] = colongitude;
            data['b0'] = selenographicCoordsOfSun.b0;
            this.cache[JDE] = data;
        }

        return data;
    },

    reset : function () {
        this.cache = {};
    },

    getApproximatePhaseAngle : function(JDE) {
        var T = (JDE - 2451545)/36525;
        var T2 = T*T;
        var T3 = T2*T;
        var T4 = T3*T;
        var D = 297.8502042 + 445267.1115168 * T
                            - 0.00163 * T2
                            + T3/545868 
                            - T4/113065000;
        var M = 357.5291092 + 35999.0502909 * T
                            - 0.0001536 * T2
                            + T3 / 24490000;   

        var _M = 134.9634114 + 477198.8676313*T
                             + 0.008997 * T2
                             + T3/69699 
                             - T4 / 14712000;                                         

        var degra =  Math.PI/180;

        var i = 180 - D - 6.289 * Math.sin (_M * degra)
                        + 2.1 * Math.sin (M * degra)
                        - 1.274 * Math.sin ((2*D - _M) * degra)
                        - 0.658 * Math.sin (2 * D * degra)
                        - 0.214 * Math.sin (2 * _M * degra)
                        - 0.11 * Math.sin (D * degra);
        return i;
    },

    getApproximatePhase : function (JDE) {
        return (1 + Math.cos(MoonData.getApproximatePhaseAngle(JDE) * Math.PI/180)) / 2;
    },
  

    riseSetAngle : -0.83333
};

(function(){    
    var MoonPage = {
        hostElement : document.getElementById("MoonTable"),
        pageRendered : false,
        dataSource : MoonData,
        tableHeaderInfo : {
        "0" : {
                "0" : { "text" : "Date  " },
                "1" : { "text" : "     " },
                "longText" : "Date: month",
                "dataKey" : 'Month'
            } ,

        "1" : {
                "0" : { "text" : " "},
                "1" : { "text" : " "},
                "longText" : "Date: day",
                "dataKey" : 'Day'
            },


        "2" : {
                "0" : { "text" : "  \u03B1 "},
                "1" : { "text" : "  h  "},
                "longText" : "Apparent geocentric equatorial coordinates: Right Ascension",
                "dataKey" : 'RA'
            },
        "3" : {
                "0" : { "text" : "(RA)   "},
                "1" : { "text" : "m  "},
                "longText" : "Apparent geocentric equatorial coordinates: Right Ascension"
            },
        "4" : {
                "0" : { "text" : " "},
                "1" : { "text" : " s   "},
                "longText" : "Apparent geocentric equatorial coordinates: Right Ascension"
            },
        "5" :  {
                "0" : { "text" : " \u03B4 "},
                "1" : { "text" : " \u00B0 "},
                "longText" : "Apparent geocentric equatorial coordinates: Declination",
                "dataKey" : 'Dec'
            },
        "6" :  {
                "0" : { "text" : "(Dec) "},
                "1" : { "text" : " ' "},
                "longText" : "Apparent geocentric equatorial coordinates: Declination"
            },
        "7" :  {
                "0" : { "text" : " "},
                "1" : { "text" : " \" " },
                "longText" : "Apparent geocentric equatorial coordinates: Declination"
            },


            "8" : {
                    "0" : { "text" :"  \u03B1"},
                    "1" : { "text" :" h"     },
                    "longText" : "Apparent topocentric equatorial coordinates: Right Ascension",
                    "dataKey" : "RaTopo"
                },
            "9" : {
                    "0" : { "text" :" topo "},
                    "1" : { "text" :"  m"   },
                    "longText" : "Apparent topocentric equatorial coordinates: Right Ascension"
                },
            "10" : {
                    "0" : { "text" :"" },
                    "1" : { "text" :"   s"},
                    "longText" : "Apparent topocentric equatorial oordinates: Right Ascension"
                },
            "11" :  {
                    "0" : { "text" :"    \u03B4"},
                    "1" : { "text" :"    \u00B0"},
                    "longText" : "Apparent topocentric equatorial coordinates: Declination",
                    "dataKey" : "DecTopo"
                },
            "12" :  {
                    "0" : { "text" :" topo "},
                    "1" : { "text" :"  '"   },
                    "longText" : "Apparent topocentric equatorial coordinates: Declination"
                },
            "13" :  {
                    "0" : { "text" :""  },
                    "1" : { "text" :"  \""},
                    "longText" : "Apparent topocentric equatorial coordinates: Declination"
                },

           
            "14" :  {
                    "0" : { "text" :"   \u03D5"},
                    "1" : { "text" :"  '"     },
                    "longText" : "Apparent diameter",
                "dataKey" : 'Diameter'
                },
            "15" :  {
                    "0" : { "text" :""  },
                    "1" : { "text" :"  \""},
                    "longText" : "Apparent diameter"
                },
                
            "16" : {
                    "0" : { "text" :"   Rise"},
                    "1" : { "text" :" hh:mm"      },
                    "longText" : "The time of rise above horizon",
                "dataKey" : 'Rise'
                },
            "17" : {
                    "0" : { "text" :" Transit " },
                    "1" : { "text" :" hh:mm "},
                    "longText" : "The time of the transit across the meridian",
                "dataKey" : 'MeridianTransit'
                },
            "18" : {
                    "0" : { "text" :"Set" },
                    "1" : { "text" :"hh:mm"},
                    "longText" : "The time of setting",
                "dataKey" : 'Set'
                },
 
            "19" :  {
                    "0" : { "text" :"     \u03C0"},
                    "1" : { "text" :" \u00B0"},
                    "longText" : "Equatorial horizontal parallax",
                "dataKey" : 'Parallax'
                },
                
            "20" :  {
                    "0" : { "text" :"" },
                    "1" : { "text" :"  '"},
                    "longText" : "Equatorial horizontal parallax"
                },

            "21" :  {
                    "0" : { "text" :""  },
                    "1" : { "text" :"  \""},
                    "longText" : "Equatorial horizontal parallax"
                },
            "22" :  {
                    "0" : { "text" :"    90-l0" },
                    "1" : { "text" :"   \u00B0"},
                    "longText" : "colongitude of the Sun (physical ephemeris)",
                "dataKey" : 'Colongitude'
                },
            "23" :  {
                    "0" : { "text" :"     b0"    },
                    "1" : { "text" :"       \u00B0"},
                    "longText" : "latitude of the Sun (physical ephemeris)",
                "dataKey" : 'b0'
                },
        },
        
        formattingFunctions : [
        function(month) { return prePadTo(month, " ", 3); }, 
        function (day) { return prePadTo(day, " ", 2); }, 
        function (RA_h) { return prePadTo(RA_h, " ", 2); },
        function (RA_m) { return prePadTo(RA_m, " ", 2); }, 
        function (RA_s) { return prePadTo(RA_s, " ", 4);  },
        function (dec_deg) { return prePadTo(dec_deg, " ", 3); },
        function (dec_m) { return prePadTo(dec_m, " ", 2); },
        function (dec_s) { return prePadTo(dec_s, " ", 2); },
        function (RA_h) { return prePadTo(RA_h, " ", 2); },
        function (RA_m) { return prePadTo(RA_m, " ", 2); }, 
        function (RA_s) { return prePadTo(RA_s, " ", 4);  },
        function (dec_deg) { return prePadTo(dec_deg, " ", 3); },
        function (dec_m) { return prePadTo(dec_m, " ", 2); },
        function (dec_s) { return prePadTo(dec_s, " ", 2); },
        function (phi_min) { return prePadTo(phi_min, " ", 2); },
        function (phi_sec) { return prePadTo(phi_sec, " ", 2); },
        function(v) { return prePadTo(v, " ", 1); }, 
        function(v) { return prePadTo(v, " ", 1); }, 
        function(v) { return prePadTo(v, " ", 1); }, 
        function(v) { return prePadTo(v, " ", 1); }, 
        function (pi_min) { return prePadTo(pi_min, " ", 2); },
        function (pi_sec) { return prePadTo(pi_sec, " ", 2); },
        function(v) { return prePadTo(v, " ", 7); }, 
        function(v) { return prePadTo(v, " ", 6); }
        ],
 
        lastDisplayedMonth : -1,
        months : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        lastAppendedLine : false
    };
    
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
        var sexagesimalRaGeo = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.RA * 36000)/36000);
        displayableLine[di++] = sexagesimalRaGeo.Ord3 ;
        displayableLine[di++] = sexagesimalRaGeo.Ord2 
        displayableLine[di++] = sexagesimalRaGeo.Ord1;

        var sexagesimalDecGeo = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.Dec * 3600)/3600);
        displayableLine[di++] = sexagesimalDecGeo.Ord3 ;
        displayableLine[di++] = sexagesimalDecGeo.Ord2;
        displayableLine[di++] = sexagesimalDecGeo.Ord1;
		            
        var sexagesimalRaTopo = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.RaTopo * 36000)/36000);
        displayableLine[di++] = sexagesimalRaTopo.Ord3 ;
        displayableLine[di++] = sexagesimalRaTopo.Ord2 
        displayableLine[di++] = sexagesimalRaTopo.Ord1;

        var sexagesimalDecTopo = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.DecTopo * 3600)/3600);
        displayableLine[di++] = sexagesimalDecTopo.Ord3 ;
        displayableLine[di++] = sexagesimalDecTopo.Ord2;
        displayableLine[di++] = sexagesimalDecTopo.Ord1;

        var sexagesimalDiam = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.Diameter * 3600)/3600);
        displayableLine[di++] = sexagesimalDiam.Ord2;
        displayableLine[di++] = sexagesimalDiam.Ord1;
        
        displayableLine[di++] = this.timeToHhColumnMm(obj.Rise);
        displayableLine[di++] = this.timeToHhColumnMm(obj.MeridianTransit);
        displayableLine[di++] = this.timeToHhColumnMm(obj.Set);
            
        var sexagesimalParallax = GetAAJS().Numerical.ToSexagesimal(Math.round(obj.Parallax * 3600)/3600);
        
        displayableLine[di++] = sexagesimalParallax.Ord3;
        displayableLine[di++] = sexagesimalParallax.Ord2;
        displayableLine[di++] = sexagesimalParallax.Ord1;
        
        displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals (obj.Colongitude);
        displayableLine[di++] = GetAAJS().Numerical.RoundTo3Decimals (obj.b0);

        return displayableLine;
    };
    
    MoonPage.addTableHeader = function (table, classes, tBody) {            
        var result = this.oldHeaderFunc(table, classes, tBody);
        return result;
    };
    
    var localInit = function() {
        if (typeof PlanetData != 'undefined' && typeof PlanetPage != 'undefined' && typeof Pages != 'undefined') {
            MoonData.addRiseTransitSetData = PlanetData.prototype.addRiseTransitSetData;
            MoonData.isAboveHorizon = PlanetData.prototype.isAboveHorizon;

            MoonPage.reset = PlanetPage.prototype.reset;
            MoonPage.appendLine = PlanetPage.prototype.appendLine;
            MoonPage.addNodeChild = PlanetPage.prototype.addNodeChild;
            MoonPage.displayPage = PlanetPage.prototype.displayPage;

            MoonPage.oldHeaderFunc = PlanetPage.prototype.addTableHeader;
            MoonPage.timeToHhColumnMm = PlanetPage.prototype.timeToHhColumnMm;
            Pages["Moon Ephemeris"] = MoonPage;
        } else {
            SyncedTimeOut(localInit, Timeout.onInit);
        }
    }

    localInit();

})();

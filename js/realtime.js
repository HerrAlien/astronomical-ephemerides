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

// ---------------------------- model side ----------------------------------------

var JDForRealTimeView = {
    timerId : false,
    updateTimeInterval : 1000, // [ms]
    start : function () {
        if (this.timerId)
            clearInterval(this.timerId);
        this.timerId = setInterval (JDForRealTimeView.recomputeTimes, this.updateTimeInterval);
    },
    onRecomputedTimes : Notifications.New(),
    recomputeTimes : function () {
        if (typeof AAJS != 'undefined' && AAJS.AllDependenciesLoaded && AAJS.AllDependenciesLoaded()) {
            var rightNow = new Date();
            var y = rightNow.getUTCFullYear();
            var m = 1 + rightNow.getUTCMonth();
            var d = rightNow.getUTCDate();

            var jdT3 = AAJS.Date.DateToJD (y, m, d, true);
            var spanBetweenComputedTimes = 1; // [days] - one full day
            // get the T1
            var jdT2 = jdT3 - spanBetweenComputedTimes;
            var jdT1 = jdT2 - spanBetweenComputedTimes;
            // get the T3
            var jdT4 = jdT3 + spanBetweenComputedTimes;
            var jdT5 = jdT4 + spanBetweenComputedTimes;
            
            var n = (rightNow.getUTCHours() + (rightNow.getUTCMinutes() + (rightNow.getUTCSeconds() + rightNow.getUTCMilliseconds()/1000)/60)/60)/24;
            JDForRealTimeView.onRecomputedTimes.notify ({"T1" : jdT1, "T2" : jdT2, "T3" : jdT3,"T4" : jdT4, "T5" : jdT5, "n" : n});
        }
    }
};


    function DataForNow(dataSource) {
        this.dataSource = dataSource;
        this.onDataUpdated = new Notifications.New();
        this.start();
    }
    
    (function(){
        DataForNow.prototype['start'] = function() {
            JDForRealTimeView.start();
            var obj = this;
            JDForRealTimeView.onRecomputedTimes.add (function(datesObj) { obj.updateData(datesObj); });
        }
        
        DataForNow.prototype['updateData'] = function (datesObj) {
            if (typeof AAJS != 'undefined') {

                var obj1 = this.dataSource.getDataAsObjectForJD (datesObj.T1, true);
                var obj2 = this.dataSource.getDataAsObjectForJD (datesObj.T2, true);
                var obj3 = this.dataSource.getDataAsObjectForJD (datesObj.T3, true);
                var obj4 = this.dataSource.getDataAsObjectForJD (datesObj.T4, true);
                var obj5 = this.dataSource.getDataAsObjectForJD (datesObj.T5, true);
                
                var interpolationLimits = {
                    "RA" : 24
                };

                var interpolatedObject = {};
                for (var key in obj1) {
                    interpolatedObject[key] = this.interpolate (datesObj.n, obj1[key], obj2[key], obj3[key], obj4[key], obj5[key], interpolationLimits[key]);
                }
                
                this.onDataUpdated.notify(interpolatedObject);
            }
        }
        
        DataForNow.prototype['interpolate'] = function (n, y1, y2, y3, y4, y5, limit) {
            
            var a = y2 - y1;
            var b = y3 - y2;
            var c = y4 - y3;
            var d = y5 - y4;
            
            if (!!limit) {
                var halfLimit = 0.5 * limit;
                if (Math.abs(a) > halfLimit || Math.abs(b) > halfLimit || Math.abs(c) > halfLimit || Math.abs(d) > halfLimit) {
                    if (y1 < halfLimit)
                        y1 += limit;
                    if (y2 < halfLimit)
                        y2 += limit;
                    if (y3 < halfLimit)
                        y3 += limit;
                    if (y4 < halfLimit)
                        y4 += limit;
                    if (y5 < halfLimit)
                        y5 += limit;
                }
                
                a = y2 - y1;
                b = y3 - y2;
                c = y4 - y3;
                d = y5 - y4;
            }
            
            var e = b - a;
            var f = c - b;
            var g = d - c;
            
            var h = f - e;
            var j = g - f;
            
            var k = j - h;
            
            var n2 = n * n;
            var n2decr = n2 - 1;
            
            var res = y3 + 0.5 * n * (b + c) + 0.5 * n2 * f + n * n2decr * (h + j)/ 12 + n2 * n2decr * k / 24;
            
            if (!!limit) {
                if (res > limit)
                    res -= limit;
            }
            
            return res;
        }
    })();

// -------------------------------------------------------------------------------


// ---------------------------- view side ----------------------------------------    
 
     function RealTimeDataViewer (page, viewElement) {
        this.page = page;
        this.view = viewElement;
        
        this.viewRA = this.view.getElementsByClassName("RA")[0];
        this.viewDec = this.view.getElementsByClassName("Dec")[0];
        
        this.rtData = new DataForNow(this.page.dataSource);
        var obj = this;
        this.rtData.onDataUpdated.add (function(data) {
        
            /*var oldLastMonth = obj.page.lastDisplayedMonth;
            var displayableLine = obj.page.prepareOneDayDataObjectForView(data, 0);
            obj.page.lastDisplayedMonth = oldLastMonth;
            */
            
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(data.RA * 3600000)/3600000);
            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(data.Dec * 3600000)/3600000);
            
            obj.viewRA.textContent = padToTens(sexagesimalRA.Ord3) + "h " +  padToTens(sexagesimalRA.Ord2) + "m " +  padToThousandth (sexagesimalRA.Ord1) + "s";
            obj.viewDec.textContent = padToTens(sexagesimalDec.Ord3) + "\u00B0 " +  padToTens(sexagesimalDec.Ord2) + "' " +  padToThousandth (sexagesimalDec.Ord1) + "''";
            
            
        });
    }
    
    function padToTens (a) {
        var isNegative = a < 0;
        
        return ((Math.abs(a) < 10) ?  (isNegative ? "-0" : "0") + Math.abs(a) : a);
    }
    
    function padToThousandth (a) {
        var intPart = Math.floor(a);
        var fractionPart = Math.floor(1000 * (a - intPart));
        fractionPart =  Math.abs(fractionPart);
        if (fractionPart < 10)
            fractionPart = "00" + fractionPart;
        else if (fractionPart < 100)
            fractionPart = "0" + fractionPart;
            
        return padToTens(intPart) + "." + fractionPart;
    }

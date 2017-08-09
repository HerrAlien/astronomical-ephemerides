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

// ---------------------------- model side ----------------------------------------
    function DataForNow(dataSource) {
        this.dataSource = dataSource;
        this.onDataUpdated = new Notifications.NewOneParameter();
        this.timerId = false;
        this.updateTimeInterval = 1000; // ms
        this.fullHoursBetweenInterpolation = 1;
        this.start();
    }
    
    (function(){
        DataForNow.prototype['start'] = function() {
            if (this.timerId)
                clearInterval(this.timerId);
            var obj = this;
            
            this.timerId = setInterval (function() {  obj.updateData(); }, this.updateTimeInterval);
        }
        
        DataForNow.prototype['updateData'] = function () {
            if (typeof AAJS != 'undefined') {
                
                if (!PageTimeInterval) {
                    onApplySettings();
                }
                
                var rightNow = new Date();
                var y = rightNow.getUTCFullYear();
                var m = 1 + rightNow.getUTCMonth();
                var d = rightNow.getUTCDate();
                var h = rightNow.getUTCHours();
                var jdBase = AAJS.Date.DateToJD (y, m, d, true);
                // get the T1
                var jdT2 = jdBase + h/24;
                var oneHourAsDay = 1/24;
                var jdT1 = jdT2 - oneHourAsDay;
                // get the T3
                var jdT3 = jdT2 + oneHourAsDay;
                var n = (rightNow.getUTCMinutes() + (rightNow.getUTCSeconds() + rightNow.getUTCMilliseconds()/1000)/60)/60;
                
                // get the data for each JD
                var obj1 = this.dataSource.getDataAsObjectForJD (jdT1, true);
                var obj2 = this.dataSource.getDataAsObjectForJD (jdT2, true);
                var obj3 = this.dataSource.getDataAsObjectForJD (jdT3, true);
                
                var interpolatedObject = {};
                for (var key in obj1) {
                    interpolatedObject[key] = this.interpolate (n, obj1[key], obj2[key], obj3[key]);
                }
                
                this.onDataUpdated.notify(interpolatedObject);
            }
        }
        
        DataForNow.prototype['interpolate'] = function (n, y1, y2, y3) {
            var a = y2 - y1;
            var b = y3 - y2;
            var c = y1 + y3 - 2 * y2;
            return y2 + 0.5 * n * (a + b + n * c);
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

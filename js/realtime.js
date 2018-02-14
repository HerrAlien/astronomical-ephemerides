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
 
     function RealTimeDataViewer (pageName) {
        this.page = Pages[pageName];
        var doms = CreateLinkDom (pageName);
        this.view = doms["a"];

        // views, per daya key
        // TODO: get the keys!
        this.allKeys = [];

        this.allViews = {};
        for (var i = 0; i < this.allKeys.length; i++) {
            var name = this.allKeys[i].name;
            this.allViews[name] = this.view.getElementsByClassName(name)[0];
        }
        // TODO: on a settings notification, update the visibility for all entries in this.allViews
        
        this.rtData = new DataForNow(this.page.dataSource);
        var obj = this;
        this.rtData.onDataUpdated.add (function(data) {
        
            
            for (var i = 0; i < obj.allKeys.length; i++) {
                var key = obj.allKeys[i];
                var decimals = Math.pow(10, key.decimalsNum);
                var name = key.name;
                var keyData = Math.round(key.factor * data[name] * decimals)/decimals;
                if (obj.allViews[name]) {
                    obj.allViews[name].textContent = Math.floor(keyData) + 
                                                      key.unit + " ." +
                                                      padToOrder(Math.floor(decimals * (keyData - Math.floor(keyData))), key.decimalsNum);
                }
            }   

        });

        var onKeyAdded = function (key, dom) {
            obj.allKeys.push (key);
            obj.allViews [key.name] = dom;
        }

        CreateRtDomForPage (doms['div'], pageName, onKeyAdded);
    }

    function CreateLinkDom (pageName) {
        var host = document.getElementById("rightNowFrontPage");
        
        var createdDoms = {};

        createdDoms['a'] = CreateDom (host, "a");
        createdDoms['a'].setAttribute("href", "#" + pageName);
        var div = CreateDom(createdDoms['a'], "div");
        createdDoms['div'] = div;

        div.classList.add ("rightNowFrontPageWidget");

        // TODO: the background class.
        // TODO: this should be from the page object.
        var objectName = pageName.substr(0, pageName.indexOf(" "));
        var realTimeBackgroundClassName = objectName + "Background"; // horrible, get it from the page object,
        // like Pages[pageName]["realTimeBackgroundClassName"]

        div.classList.add(realTimeBackgroundClassName);

        var span = CreateDom(div, "span", objectName);
        span.classList.add("realtimeTitle");
        return createdDoms;
    };

    function CreateRtDomForPage (domHost, pageName, onViewAdded) {
        // same host
        try {
            // TODO: this is for all keys ...
            // This wil throw initially. Notifications will not update the view.
            for (var key in Pages[pageName].dataSource.getDataAsObjectForJD(0, false)) {
                var createdDom = CreateDom(domHost, "div", "loading ...");
                createdDom.classList.add(key);

                var unit = "\u00B0";
                var scaleFactor = 1;
                for (var tableKey in Pages[pageName].tableHeaderInfo) {
                    if (key == Pages[pageName].tableHeaderInfo[tableKey].dataKey) {
                        unit = Pages[pageName].tableHeaderInfo[tableKey]["1"]["text"];
                        createdDom.setAttribute("alt", Pages[pageName].tableHeaderInfo[tableKey]["longText"]);
                        createdDom.setAttribute("title", Pages[pageName].tableHeaderInfo[tableKey]["longText"]);
                    }
                }
                
                if (unit == "'") {
                    scaleFactor = 60;
                } else if (unit == "''") {
                    scaleFactor = 3600;
                }else if (unit == "hh:mm") {
                    unit = "h";
                }

                onViewAdded ({"name" : key, "unit": unit, "decimalsNum" : 3, "factor" : scaleFactor}, createdDom);
            }

        } catch (err) {
            setTimeout (function() { CreateRtDomForPage(domHost, pageName, onViewAdded); }, 100);
        }
    }
    
    function CreateDom (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent =  content;
        return child;
    }

    function padToOrder (number, order) {
        if (order < 2) {
            return "" + number;
        }

        var absNum = Math.abs(number);
        var threshold = Math.pow(10, Math.floor(order - 1));
        var res = "";

        for (var i = 1; (i < order) && (absNum < threshold); i++, threshold *= 0.1) {
            res += "0";
        }
        if (number < 0) {
            res = "-" + res;
        }
        return res + "" + absNum;
    }
    
    function padToTens (a) {
        return padToOrder(a, 2);
    }  

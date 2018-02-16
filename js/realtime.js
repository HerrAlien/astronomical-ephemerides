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


// ---------------------------- view side ----------------------------------------    
var RealTimeDataViewer = {

    New: function (pageName) {

        var returnedViewer = {

            page: Pages[pageName],

            reset: function () {

                var doms = RealTimeDataViewer.CreateLinkDom(pageName);
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
                this.rtData.onDataUpdated.add(function (data) {


                    for (var i = 0; i < obj.allKeys.length; i++) {
                        var key = obj.allKeys[i];
                        var decimals = Math.pow(10, key.decimalsNum);
                        var name = key.name;
                        var keyData = Math.round(key.factor * data[name] * decimals) / decimals;
                        if (obj.allViews[name]) {
                            obj.allViews[name].textContent = Math.floor(keyData) +
                                                              key.unit + "." +
                                                              padToOrder(Math.floor(decimals * (keyData - Math.floor(keyData))), key.decimalsNum);
                        }
                    }

                });

                var onKeyAdded = function (key, dom) {
                    obj.allKeys.push(key);
                    obj.allViews[key.name] = dom;
                }
                var scrollableDiv = CreateDom(doms['div'], "div");
                scrollableDiv.classList.add("scrollableRT");
                RealTimeDataViewer.CreateRtDomForPage(scrollableDiv, pageName, onKeyAdded);
            }
        }

        returnedViewer.reset();
        return returnedViewer;
    },

    alertDivTitle : function() { 
        alert(this.title); 
    },

    CreateLinkDom : function(pageName) {
        var host = document.getElementById("rightNowFrontPage");

        var createdDoms = {};

        var div = CreateDom(host, "div");
        if (!IsVisible(pageName)) {
            div.classList.add("hidden");
        }

        createdDoms['div'] = div;

        div.classList.add("rightNowFrontPageWidget");

        // TODO: the background class.
        // TODO: this should be from the page object.
        var objectName = pageName.substr(0, pageName.indexOf(" "));
        var realTimeBackgroundClassName = objectName + "Background"; // horrible, get it from the page object,
        // like Pages[pageName]["realTimeBackgroundClassName"]

        div.classList.add(realTimeBackgroundClassName);

        createdDoms['a'] = CreateDom(div, "a");
        createdDoms['a'].setAttribute("href", "#" + pageName);


        var span = CreateDom(createdDoms['a'], "span", objectName);
        span.classList.add("realtimeTitle");
        return createdDoms;
    },

    CreateRtDomForPage : function (domHost, pageName, onViewAdded) {
        // same host
        try {
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
                        createdDom.onclick = RealTimeDataViewer.alertDivTitle;
                    }
                }

                if (unit == "'") {
                    scaleFactor = 60;
                } else if (unit == "''") {
                    scaleFactor = 3600;
                } else if (unit == "hh:mm") {
                    unit = "h";
                }

                var decimalsNum = GetNumberOfDecimals(pageName, key);
                if (IsVisible(pageName, key)) {
                    createdDom.classList.remove("hidden");
                } else {
                    createdDom.classList.add("hidden");
                }

                onViewAdded({ "name": key, "unit": unit, "decimalsNum": decimalsNum, "factor": scaleFactor }, createdDom);
            }

        } catch (err) {
            setTimeout(function () { RealTimeDataViewer.CreateRtDomForPage(domHost, pageName, onViewAdded); }, 100);
        }
    }


};

function GetNumberOfDecimals(pageName, key) {
    var numOfDecimals = localStorage.getItem(GetRTStorageKey("numOfDecimals", pageName, key));
    if (numOfDecimals === null) {
        numOfDecimals = 3;
        localStorage.setItem(GetRTStorageKey("numOfDecimals", pageName, key), numOfDecimals);
    }

    return numOfDecimals * 1.0;
}

function IsVisible(pageName, key) {

    var visible = localStorage.getItem(GetRTStorageKey("visible", pageName, key));
    if (visible === null) {

        visible = true;
        if (pageName == "Jupiter Ephemeris") {
            if (key == "CentralMeridianGeometricLongitude_System1" ||
                key == "CentralMeridianGeometricLongitude_System2") {
                visible = false;
            }
        }

        if (pageName == "Moon Ephemeris") {
            if (key == "RA" || key == "Dec") {
                visible = false;
            }
        }

        localStorage.setItem(GetRTStorageKey("visible", pageName, key), visible);
    }

    return ('true' == visible);
}

function GetRTStorageKey(purpose, pageName, key) {
    return pageName + "/" + key + "/" + purpose;
}


function CreateDom(parent, type, content) {
    var child = parent.ownerDocument.createElement(type);
    parent.appendChild(child);
    if (content)
        child.textContent = content;
    return child;
}

function padToOrder(number, order) {
    if (order < 2) {
        return "" + number;
    }

    var absNum = Math.abs(number);
    var threshold = Math.pow(10, Math.floor(order - 1));
    var res = "";

    for (var i = 1; (i < order) && (absNum < threshold) ; i++, threshold *= 0.1) {
        res += "0";
    }
    if (number < 0) {
        res = "-" + res;
    }
    return res + "" + absNum;
}

function padToTens(a) {
    return padToOrder(a, 2);
}

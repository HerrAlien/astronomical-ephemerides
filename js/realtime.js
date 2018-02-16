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
                this.view = doms["div"];

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
                                                              RealTimeDataViewer.Utils.padToOrder(Math.floor(decimals * (keyData - Math.floor(keyData))), key.decimalsNum);
                        }
                    }

                });

                var onKeyAdded = function (key, dom) {
                    obj.allKeys.push(key);
                    obj.allViews[key.name] = dom;
                }
                var scrollableDiv = RealTimeDataViewer.Utils.CreateDom(doms['div'], "div");
                scrollableDiv.classList.add("scrollableRT");
                RealTimeDataViewer.CreateRtDomForPage(scrollableDiv, pageName, onKeyAdded);
            },

            resetItemVisibility: function () {
                if (RealTimeDataViewer.Persistent.IsVisible(pageName)) {
                    this.view.classList.remove("hidden");
                } else {
                    this.view.classList.add("hidden");
                }
                    
                for (var key in this.allViews) {
                    if (RealTimeDataViewer.Persistent.IsVisible(pageName, key)) {
                        this.allViews[key].classList.remove("hidden");
                    } else {
                        this.allViews[key].classList.add("hidden");
                    }
                }
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
        var createDom = RealTimeDataViewer.Utils.CreateDom;
        var createdDoms = {};

        var div = createDom(host, "div");
        if (RealTimeDataViewer.Persistent.IsVisible(pageName)) {
            div.classList.remove("hidden");
        } else {
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

        createdDoms['a'] = createDom(div, "a");
        createdDoms['a'].setAttribute("href", "#" + pageName);


        var span = createDom(createdDoms['a'], "span", objectName);
        span.classList.add("realtimeTitle");
        return createdDoms;
    },

    CreateRtDomForPage : function (domHost, pageName, onViewAdded) {
        // same host
        try {
            // This wil throw initially. Notifications will not update the view.
            for (var key in Pages[pageName].dataSource.getDataAsObjectForJD(0, false)) {
                var createdDom = RealTimeDataViewer.Utils.CreateDom(domHost, "div", "loading ...");
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

                var decimalsNum = RealTimeDataViewer.Persistent.GetNumberOfDecimals(pageName, key);
                if (RealTimeDataViewer.Persistent.IsVisible(pageName, key)) {
                    createdDom.classList.remove("hidden");
                } else {
                    createdDom.classList.add("hidden");
                }

                onViewAdded({ "name": key, "unit": unit, "decimalsNum": decimalsNum, "factor": scaleFactor }, createdDom);
            }

        } catch (err) {
            setTimeout(function () { RealTimeDataViewer.CreateRtDomForPage(domHost, pageName, onViewAdded); }, 100);
        }
    },

    Persistent : {
        GetNumberOfDecimals : function (pageName, key) {
            var numOfDecimals = localStorage.getItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.numberOfDecimals, pageName, key));
            if (numOfDecimals === null) {
                numOfDecimals = 3;
                localStorage.setItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.numberOfDecimals, pageName, key), numOfDecimals);
            }

            return numOfDecimals * 1.0;
        },

        IsVisible : function (pageName, key) {
            var visible = localStorage.getItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.visibility, pageName, key));
            if (visible == null) {
                visible = 'true';
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
                localStorage.setItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.visibility, pageName, key), visible);
            }
            return ('true' == visible);
        },

        GetRTStorageKey : function (purpose, pageName, key){
            if (typeof purpose == 'undefined') {
                throw "Invalid purpose!";
            }
            return pageName + "/" + key + "/" + purpose;
        },

        purposes : { 
            visibility : "visible",
            numberOfDecimals : "numOfDecimals"
        },

    },

    Utils : {
        CreateDom : function(parent, type, content) {
            var child = parent.ownerDocument.createElement(type);
            parent.appendChild(child);
            if (content)
                child.textContent = content;
            return child;
        },

        padToOrder: function (number, order) {
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
        },

        padToTens : function (a){
            return RealTimeDataViewer.Utils.padToOrder(a, 2);
        }

    },

};

(function(){
    for (var pageName in Pages) {
        if (Pages[pageName]["tableHeaderInfo"]) {
            CreateRTSettings (pageName);
        }
    } 

    function CreateRTSettings (pageName) {
        var hostForRTSettings = document.getElementById("realTimeSettingsContainer");
        var createDom = RealTimeDataViewer.Utils.CreateDom;
        var persistent = RealTimeDataViewer.Persistent;
        var topDiv = createDom(hostForRTSettings, "div");

        // <div class="rtsettings">
        var bodySectionDiv = createDom (topDiv, "div");
        bodySectionDiv.classList.add ("rtsettings");
        // <h3>Sun</h3>
        // TODO: this should be from the page object.
        var objectName = pageName.substr(0, pageName.indexOf(" "));
        createDom (bodySectionDiv, "h3", objectName);

        // <input type="checkbox"></input>
        var sectionCheckbox = createDom (bodySectionDiv, "input");
        sectionCheckbox.type = "checkbox";

        sectionCheckbox.onclick = function () { 
            localStorage.setItem(persistent.GetRTStorageKey(persistent.purposes.visibility, pageName), this.checked);
            Pages[pageName]["rtViewer"].resetItemVisibility();
        }


        // <div class="clear">&nbsp;</div>
        createDom (bodySectionDiv, "div", " ").classList.add("clear");
    }

})();
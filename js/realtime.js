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

    views: {},

    format: {
        default: function (value, unit, numberOfDecimals, factor) {
            var decimals = Math.pow(10, numberOfDecimals);
            var data = Math.round(factor * value * decimals) / decimals;
            var dataStr = Math.floor(data) + unit + "." +
                          RealTimeDataViewer.Utils.padToOrder(
                              Math.floor(decimals * (data - Math.floor(data))),
                              numberOfDecimals);
            return dataStr;
        },
        JD: function (value) {
            try {
                var dt = PlanetPage.prototype.yyyymmdd_hhmmOfJD(value);
                return dt.time.Ord3 + ":" + dt.time.Ord2;
            } catch (err) {
                return RealTimeDataViewer.format.default(value, "d", 3, 1);
            }
        },
        Rise: function (value) { return RealTimeDataViewer.format.JD(value); },
        Set: function (value) { return RealTimeDataViewer.format.JD(value); },
        MeridianTransit: function (value) { return RealTimeDataViewer.format.JD(value); },
    },

    buildRtDataObject : function (planetName) {
        var rtDataObj = InterpolatedData[planetName]();
        
        rtDataObj['start'] = function () {
            if (JDForRealTimeView.onRecomputedTimes) {
                JDForRealTimeView.onRecomputedTimes.add(function (datesObj) { rtDataObj.updateData(datesObj); });
                JDForRealTimeView.start();
            } else {
                SyncedTimeOut(function () { rtDataObj.start(); }, Timeout.onInit);
            }
        };

        rtDataObj['updateData'] = function (datesObj) {
            if (typeof GetAAJS() != 'undefined') {
                try {
                    var interpolatedObject = rtDataObj.getInterpolatedData(datesObj, 
                        true, // rise - transit - set
                        true, // physical ephemeris, where applicable
                        true); // topocentric coordinates
                    rtDataObj.onDataUpdated.notify(interpolatedObject);
                } catch (err) {

                }
            }
        };

        rtDataObj['onDataUpdated'] = new Notifications.New();
        return rtDataObj;
    },

    getRtSettingsSectionId: function (pageName) {
        return pageName + " settings section";
    },

    rtDomHost: document.getElementById("rightNowFrontPage"),

    New: function (pageName) {

        var returnedViewer = {

            page: Pages[pageName],

            reset: function () {

                var host = document.createDocumentFragment();

                var doms = RealTimeDataViewer.CreateLinkDom(host, pageName);
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

                this.rtData = RealTimeDataViewer.buildRtDataObject(this.page.dataSource.planet.name);
                this.rtData.start();

                var obj = this;
                this.rtData.onDataUpdated.add(function (data) {
                    for (var i = 0; i < obj.allKeys.length; i++) {
                        var key = obj.allKeys[i];
                        var viewFunction = RealTimeDataViewer.format[key.name];
                        if (!viewFunction) {
                            viewFunction = RealTimeDataViewer.format.default;
                        }

                        if (obj.allViews[key.name]) {
                            obj.allViews[key.name].textContent = viewFunction(
                                data[key.name],
                                key.unit,
                                key.decimalsNum,
                                key.factor
                            );

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

                RealTimeDataViewer.rtDomHost.appendChild(host);
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

    alertDivTitle: function () {
        alert(this.title);
    },

    CreateLinkDom: function (host, pageName) {

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

        var configureAnchor = createDom(div, "a");
        configureAnchor.classList.add("configureRtView");
        
        var objectName = Pages[pageName].dataSource.name;
        if (!objectName)
            objectName = pageName;

        configureAnchor['title'] = "Configure visible info in the 'Right Now' section for " + objectName;
        configureAnchor['href'] = '#{"page":"settings",\
        "actions":[\
            {"name":"scroll","parameters":"' + RealTimeDataViewer.getRtSettingsSectionId(pageName) + '"},\
            {"name":"classListRemove",\
             "parameters":{\
                "target" : "' + RealTimeDataViewer.getRtSettingsSectionId(pageName) + '",\
                "classes" : ["collapsed"]\
             }}\
            ]}';

        return createdDoms;
    },

    CreateRtDomForPage: function (domHost, pageName, onViewAdded) {
        var hiddenKeys = ["bRiseValid", "bSetValid", "bTransitValid",
                          "parallax", "diameter", "RaGeo", "DecGeo",
                          "Day", "Month",
                          "CentralMeridianGeometricLongitude_System1",
                          "CentralMeridianGeometricLongitude_System2",
                          "DiameterTopo"];
        // same host
        try {
            if (!AAJS.AllDependenciesLoaded())
                throw "wait!";
            // This wil throw initially. Notifications will not update the view.
            var seed = Pages[pageName].dataSource.getDataAsObjectForJD(0, true, true);
            for (var key in seed) {
                if (hiddenKeys.indexOf(key) >= 0) {
                    continue;
                }
                    
                var createdDom = RealTimeDataViewer.Utils.CreateDom(domHost, "div", "loading ...");
                createdDom.classList.add(key);
                createdDom.classList.add("scrollableRTdiv");

                var unit = "\u00B0";
                var scaleFactor = 1;
                for (var tableKey in Pages[pageName].tableHeaderInfo) {
                    if (key == Pages[pageName].tableHeaderInfo[tableKey].dataKey) {
                        unit = Pages[pageName].tableHeaderInfo[tableKey]["1"]["text"].trim();
                        createdDom.setAttribute("alt", Pages[pageName].tableHeaderInfo[tableKey]["longText"]);
                        createdDom.setAttribute("title", Pages[pageName].tableHeaderInfo[tableKey]["longText"]);
                        createdDom.onclick = RealTimeDataViewer.alertDivTitle;
                    }
                }

                if (unit == "'") {
                    scaleFactor = 60;
                } else if (unit == "''" || unit == '"') {
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
            SyncedTimeOut(function () { RealTimeDataViewer.CreateRtDomForPage(domHost, pageName, onViewAdded); }, Timeout.onInit);
        }
    },

    Persistent: {
        GetNumberOfDecimals: function (pageName, key) {
            var numOfDecimals = localStorage.getItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.numberOfDecimals, pageName, key));
            if (numOfDecimals === null) {
                numOfDecimals = 3;
                localStorage.setItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.numberOfDecimals, pageName, key), numOfDecimals);
            }

            return Number(numOfDecimals);
        },

        IsVisible: function (pageName, key) {
            var visible = localStorage.getItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.visibility, pageName, key));
            if (visible == null) {
                visible = 'false';
                if (pageName == 'Venus Ephemeris' || pageName == 'Jupiter Ephemeris') {

                    if (key) {
                        if (pageName == 'Venus Ephemeris' && key == 'Phase') {
                            visible = 'true';
                        }
                        if (pageName == 'Jupiter Ephemeris' && (key == 'RA' || key == 'Dec')) {
                            visible = 'true';
                        }
                    } else {
                        visible = 'true';
                    }
                }

                localStorage.setItem(RealTimeDataViewer.Persistent.GetRTStorageKey(RealTimeDataViewer.Persistent.purposes.visibility, pageName, key), visible);
            }
            return ('true' == visible);
        },

        GetRTStorageKey: function (purpose, pageName, key) {
            if (typeof purpose == 'undefined') {
                throw "Invalid purpose!";
            }
            return pageName + " " + key + " " + purpose;
        },

        purposes: {
            visibility: "RT View Settings.checked",
            numberOfDecimals: "numOfDecimals"
        },

    },

    Utils: {
        CreateDom: function (parent, type, content) {
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

        padToTens: function (a) {
            return RealTimeDataViewer.Utils.padToOrder(a, 2);
        }

    },

};


(function () {

    function createCheckboxSwitch(host, usingID) {
        return PersistedControls.addSettingsToggle(host, usingID, false, " ");
    }

    function CreateRTSettings(hostForRTSettings, pageName) {
        var createDom = RealTimeDataViewer.Utils.CreateDom;
        var persistent = RealTimeDataViewer.Persistent;
        var topDiv = createDom(hostForRTSettings, "div");
        createDom(topDiv, "div", " ").classList.add("clear");

        // <div class="rtsettings">
        var bodySectionDiv = createDom(topDiv, "div");
        bodySectionDiv.classList.add("rtsettings");
        bodySectionDiv.classList.add("collapsed");

        bodySectionDiv['id'] = RealTimeDataViewer.getRtSettingsSectionId(pageName);

        // <h3>Sun</h3>
        // TODO: this should be from the page object.
        createDom(bodySectionDiv, "div", " ").classList.add("clear");
        var objectName = pageName.substr(0, pageName.indexOf(" "));

        var sectionCheckboxId = pageName + " RT View Settings";

        // <input type="checkbox"></input>
        var sectionCheckbox = createCheckboxSwitch(bodySectionDiv, sectionCheckboxId);

//        sectionCheckbox.checked = 'true' == localStorage.getItem(persistent.GetRTStorageKey(persistent.purposes.visibility, pageName));

        var sectionLabel = createDom(bodySectionDiv, "label");
        sectionLabel.setAttribute('for', sectionCheckboxId);

        var collapseExpand = createDom(bodySectionDiv, "div");
        collapseExpand.classList.add("expandCollapseButton");
        collapseExpand.onclick = function () {
            if (this.parentElement.classList.contains("collapsed")) {
                this.parentElement.classList.remove("collapsed");
            } else {
                this.parentElement.classList.add("collapsed");
            }
        }


        var sectionLabel2 = createDom(bodySectionDiv, "label");
        sectionLabel2.setAttribute('for', sectionCheckboxId);
        createDom(sectionLabel2, "h3", objectName);


        var rtViewer = RealTimeDataViewer.views[pageName];
        sectionCheckbox.onValueChanged.add(function () {
            rtViewer.resetItemVisibility();
        });

        function AddSettingsForKeys() {
            if (rtViewer.allKeys.length != 0) {
                for (var key in rtViewer.allViews) {
                    var checkboxId = pageName + " " + key + " RT View Settings";

                    // div + checkbox for each key
                    createDom(bodySectionDiv, "div", " ").classList.add("clear");
                    var row = createDom(bodySectionDiv, "div");
                    row.classList.add("row");
                    sectionCheckbox = createCheckboxSwitch(row, checkboxId);
                    sectionCheckbox.onValueChanged.add(function () {
                            rtViewer.resetItemVisibility();
                    });

                    var lbl = createDom(row, "label");
                    lbl.setAttribute('for', checkboxId);
                    var labelDiv = createDom(lbl, "div", " ");
                    labelDiv.classList.add(key);
                    labelDiv.classList.add("settingsLabelDiv");

                }
            } else {
                SyncedTimeOut(AddSettingsForKeys, Timeout.onInit);
            }
        }

        AddSettingsForKeys();

        // <div class="clear">&nbsp;</div>
        createDom(bodySectionDiv, "div", " ").classList.add("clear");
        createDom(bodySectionDiv, "div", " ").classList.add("clear");
        rtViewer.resetItemVisibility();
    }


    var pagesDoms = document.getElementsByClassName("page");
    var hostForRTSettings = document.getElementById("realTimeSettingsContainer");
    

    var localInit = function () {
        if (typeof Pages != 'undefined' && typeof InterpolatedData != 'undefined' && typeof Notifications != 'undefined') {
            var pagesAccountedFor = 0;
            for (var i = 0; i < pagesDoms.length; i++) {
                var pageName = pagesDoms[i].id;
                if (typeof Pages != 'undefined' &&
                    Pages[pageName] &&
                    Pages[pageName]["tableHeaderInfo"] && !(RealTimeDataViewer.views[pageName])) {
                    RealTimeDataViewer.views[pageName] = RealTimeDataViewer.New(pageName);
                    var host = document.createDocumentFragment();
                    CreateRTSettings(host, pageName);
                    hostForRTSettings.appendChild(host);
                }

                if (typeof Pages != 'undefined' && Pages[pageName]) {
                    pagesAccountedFor++;
                }
            }
            if (pagesAccountedFor == pagesDoms.length) {
                return;
            }
        }

        SyncedTimeOut(localInit, Timeout.onInit);
    }

    localInit();
})();


/* ephemeris - a software astronomical almanach 

Copyright 2019 Herr_Alien <alexandru.garofide@gmail.com>

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

var LunarXPage = {
    hostElement: document.getElementById("LunarXContainer"),
    pageRendered: false,
    getSignature: function () {
        return JSON.stringify(PageTimeInterval) + JSON.stringify(
          [Location.latitude, Location.longitude, Location.altitude]
        );
    },

    displayPage : function() {
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !AAJS.AllDependenciesLoaded || 
            !PageTimeInterval.JD || typeof MoonData == "undefined") {
            return SyncedTimeOut(function () { LunarXPage.displayPage(); }, Timeout.onInit);
        }

        LunarXPage.signature = LunarXPage.getSignature();

        var startJD = PageTimeInterval.JD;
        var numberOfDays = PageTimeInterval.days;

        if (LunarXPage.pageRendered)
            return;

        LunarXPage.reset();
        MoonData.reset();
        var endJD = startJD + numberOfDays;

        function ProcessJD(JD, host) {
            var signatureChanged = LunarXPage.signature != LunarXPage.getSignature();
            if (JD >= endJD || signatureChanged) {
                LunarXPage.pageRendered = !signatureChanged;
                return;
            }

            var lunarXData = LunarXPage.dataSource.getEvent(JD);
            LunarXPage.addEntry(lunarXData.currentLunarXJd, host);

            requestAnimationFrame(function () { ProcessJD(lunarXData.nextFirstQuarter, host); });
        }

        var div = PlanetPage.prototype["addNodeChild"](LunarXPage.hostElement, "div");
        div.classList.add ("lunarXEvents");
        var table = PlanetPage.prototype["addNodeChild"](div, "table");
        var row = PlanetPage.prototype["addNodeChild"](table, "tr");
        PlanetPage.prototype["addNodeChild"](row, "th",  "Date");
        PlanetPage.prototype["addNodeChild"](row, "th",  TimeStepsData.useLocalTime ? "Time (local)" : "Time (UTC)");
        ProcessJD(startJD, table);
    },

    addEntry : function (jd, domHost) {
        var row = PlanetPage.prototype["addNodeChild"](domHost, "tr");
        var t = PlanetPage.prototype["yyyymmdd_hhmmOfJD"](jd);

        PlanetPage.prototype["addNodeChild"](row, "td",  t.date.Y + "-" + t.date.M + "-" + t.date.D);
        PlanetPage.prototype["addNodeChild"](row, "td", t.time.Ord3 + ":" + t.time.Ord2);
    },

     keywordsArray: ["Moon", "Luna", "X", "Cross", "Lunar X", "Werner X", "Werner Cross"]
};

(function () {
    var initLocal = function () {
        try {
            
            var pageDivId = "Lunar X";

            LunarXPage.dataSource = LunarXData;
            LunarXPage.reset = PlanetPage.prototype.reset;
            Pages[pageDivId] = LunarXPage;

            var div = document.getElementById(pageDivId);
            PlanetPage.prototype.addFirstChildShareIcon(div, pageDivId, { page: pageDivId});

        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    }
    initLocal();
})();

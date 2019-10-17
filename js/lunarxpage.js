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


        LunarXPage.pageRendered = true;
    }
};

(function () {
    var initLocal = function () {
        try {
            LunarXPage.dataSource = LunarXData;
            LunarXPage.reset = PlanetPage.prototype.reset;
            Pages["Lunar X"] = LunarXPage;
        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    }
    initLocal();
})();

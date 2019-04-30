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
    updateTimeInterval: 100, // [ms]
    start: function () {
        JDForRealTimeView.recomputeTimes();
    },
    recomputeTimes: function () {
        if (typeof AAJS != 'undefined' && AAJS.AllDependenciesLoaded && AAJS.AllDependenciesLoaded()) {
            JDForRealTimeView.updateTimeInterval = 1000;
        }
        var rightNow = new Date();
        var y = rightNow.getUTCFullYear();
        var m = 1 + rightNow.getUTCMonth();
        var d = rightNow.getUTCDate();

        var jdT3 = GetAAJS().Date.DateToJD(y, m, d, true);
        var spanBetweenComputedTimes = 1/24; // [days] - one full day
        // get the T1
        var jdT2 = jdT3 - spanBetweenComputedTimes;
        var jdT1 = jdT2 - spanBetweenComputedTimes;
        // get the T3
        var jdT4 = jdT3 + spanBetweenComputedTimes;
        var jdT5 = jdT4 + spanBetweenComputedTimes;

        var n = (rightNow.getUTCHours() + (rightNow.getUTCMinutes() + (rightNow.getUTCSeconds() + rightNow.getUTCMilliseconds() / 1000) / 60) / 60) / 24;
        JDForRealTimeView.onRecomputedTimes.notify({ "T1": jdT1, "T2": jdT2, "T3": jdT3, "T4": jdT4, "T5": jdT5, "n": n });

        SyncedTimeOut(JDForRealTimeView.recomputeTimes, JDForRealTimeView.updateTimeInterval);
    }
};


(function () {

    var localInit = function () {

        if (typeof Notifications != 'undefined') {
            JDForRealTimeView.onRecomputedTimes = Notifications.New();
        } else {
            SyncedTimeOut(localInit, Timeout.onInit);
        }
    }

    localInit();
})();

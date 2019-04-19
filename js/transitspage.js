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

var TransitsPage = {

    hostElement: document.getElementById("TransitsContainer"),
    pageRendered: false,
    transitsRendered: {},
    signature: false,
    getSignature: function () {
        return JSON.stringify(PageTimeInterval) + JSON.stringify(
          [Location.latitude, Location.longitude, Location.altitude]
        );
    },


    displayPage: function () {

        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !AAJS.AllDependenciesLoaded || !PageTimeInterval.JD
            || typeof Transits == "undefined" || typeof SunData == "undefined" ||
            typeof DistanceDFromEqCoordinates == "undefined" || typeof InterpolatedData == "undefined") {
            return SyncedTimeOut(function () { TransitsPage.displayPage(); }, Timeout.onInit);
        }

        TransitsPage.signature = TransitsPage.getSignature();

        var startJD = PageTimeInterval.JD;
        var numberOfDays = PageTimeInterval.days;

        if (TransitsPage.pageRendered)
            return;

        TransitsPage.reset();
        TransitsPage.occultationRendered = {};
        MoonData.reset(); //????
        var endJD = startJD + numberOfDays;

        var daysPerDrawCall = 100;

        function TransitsPageProcessJD(JD) {
            var signatureChanged = TransitsPage.signature != TransitsPage.getSignature();
            if (JD >= endJD || signatureChanged) {
                TransitsPage.pageRendered = !signatureChanged;
                return;
            }

            var events = Transits.get(JD, daysPerDrawCall);
            for (var key in events) {
                var id = TransitsPage.getId(events[key]);
                if (TransitsPage.transitsRendered[id]) {
                    continue;
                }
                TransitsPage.draw(events[key], TransitsPage.hostElement);
                TransitsPage.transitsRendered[id] = true;
            }

            requestAnimationFrame(function () { TransitsPageProcessJD(JD + daysPerDrawCall); });
        }

        TransitsPageProcessJD(startJD);
    },

    getPlanetName: function (event) {
        return event.name;
    },

    getTitle: function (event) {
        var yyyymmdd_hhmmOfJD = PlanetPage.prototype["yyyymmdd_hhmmOfJD"];

        var dt = yyyymmdd_hhmmOfJD(event.C1.t);
        var dateString = "" + dt.date.Y + "-" + dt.date.M + "-" + dt.date.D;
        var name = TransitsPage.getPlanetName(event);
        return dateString + " " + name;
    },

    getId: function (event) {
        return "transit " + Math.round(event.C1.t) +
                + " " + TransitsPage.getStarName(event);
    },

    draw: function (event, host) {
        var addNodeChild = PlanetPage.prototype["addNodeChild"];
        var yyyymmdd_hhmmOfJD = PlanetPage.prototype["yyyymmdd_hhmmOfJD"];

        var dt = AAJS.DynamicalTime.DeltaT(event.C1.t) / (3600 * 24);

        var fragment = document.createDocumentFragment();
        var div = addNodeChild(fragment, "div");
        div.classList.add("individualEventSection");
        div.classList.add("occultation");
        div["id"] = TransitsPage.getId(event);
        var occultationTitle = TransitsPage.getOccultationTitle(event);

        var h2 = addNodeChild(div, "h2", occultationTitle);
        addNodeChild(div, "span", "Magnitude of occulted object: " + event.star.Vmag);

        var table = addNodeChild(div, "table");
        var header = addNodeChild(table, "tr");
        addNodeChild(header, "th", "Phase");
        addNodeChild(header, "th", "Time");
        addNodeChild(header, "th", "Position Angle");

        var immersionRow = addNodeChild(table, "tr");
        addNodeChild(immersionRow, "td", "Disappearance (D)");
        var t = yyyymmdd_hhmmOfJD(event.start.t - dt);
        addNodeChild(immersionRow, "td", t.time.Ord3 + ":" + t.time.Ord2);
        addNodeChild(immersionRow, "td", Math.round(event.start.PA));

        var emmersionRow = addNodeChild(table, "tr");
        addNodeChild(emmersionRow, "td", "Reappearance (R)");
        t = yyyymmdd_hhmmOfJD(event.end.t - dt);
        addNodeChild(emmersionRow, "td", t.time.Ord3 + ":" + t.time.Ord2);
        addNodeChild(emmersionRow, "td", Math.round(event.end.PA));

        var w = 800;
        var h = 800;
        var sunRadius = w / 3;

        var svgns = "http://www.w3.org/2000/svg";
        var viewport = document.createElementNS(svgns, "svg");
        div.appendChild(viewport);
        viewport.setAttribute("class", "viewport");
        viewport.setAttribute("viewBox", "0 0 " + w + " " + h);
        viewport.setAttribute("preserveAspectRatio", "xMidYMid meet");

        var img = document.createElementNS(svgns, "svg");
        viewport.appendChild(img);
        img.setAttribute("height", h);
        img.setAttribute("width", w);
        img.setAttribute("alt", occultationTitle);


        var degra = Math.PI / 180;

/*
        var text = document.createElementNS(svgns, "text");
        img.appendChild(text);
        text.setAttribute("x", xd + w / 2 - 25);
        var yText = h / 2 - yd;
        var yOffset = 40;
        if (yText < h / 2)
            yText -= yOffset;
        else
            yText += yOffset;
        text.setAttribute("y", yText);
        text.textContent = "D";

        text = document.createElementNS(svgns, "text");
        img.appendChild(text);
        text.setAttribute("x", xr + w / 2);
        yText = h / 2 - yr;
        if (yText < h / 2)
            yText -= yOffset;
        else
            yText += yOffset;
        text.setAttribute("y", yText);
        text.textContent = "R";
*/



        host.appendChild(fragment);
    },


    keywordsArray: ["Transit", "Ingress", "Egress"]
    // clears up the rendered thing
};

(function () {
    var initLocal = function () {
        try {
            TransitsPage.dataSource = Transits;
            TransitsPage.reset = PlanetPage.prototype.reset;
            Pages["Transits"] = TransitsPage;
        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    }
    initLocal();
})();

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

var OccultationsPage = {

    hostElement : document.getElementById("OccultationsContainer"),
    pageRendered : false,
    occultationRendered : {},
    signature : false,
    getSignature : function() {
      return  JSON.stringify(PageTimeInterval) + JSON.stringify(
        [Location.latitude, Location.longitude, Location.altitude]
      );
    },
    

    displayPage : function () {
        
        if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !AAJS.AllDependenciesLoaded || !PageTimeInterval.JD )
            return SyncedTimeOut (function() { OccultationsPage.displayPage(); }, Timeout.onInit);

        OccultationsPage.signature = OccultationsPage.getSignature();

        var startJD = PageTimeInterval.JD;
        var numberOfDays =  PageTimeInterval.days;

        if (OccultationsPage.pageRendered)
            return;

        OccultationsPage.reset();
        OccultationsPage.occultationRendered = {};
        MoonData.reset();
        OccultableStars.reset();
        var endJD = startJD + numberOfDays;
        
        function OccultationsPageProcessJD (JD) {
            var signatureChanged = OccultationsPage.signature != OccultationsPage.getSignature();
            if (JD >= endJD || signatureChanged) {
                OccultationsPage.pageRendered = !signatureChanged;
                return;
            }

            var occultations = OccultationsData.getOccultedStars(JD, 1);
            for (var occKey in occultations) {
                var id = OccultationsPage.getId(occultations[occKey]);
                if ( OccultationsPage.occultationRendered[id]) {
                    continue;
                }
                OccultationsPage.drawOccultation(occultations[occKey], OccultationsPage.hostElement);
                OccultationsPage.occultationRendered[id] = true;
            }
            
            requestAnimationFrame (function() { OccultationsPageProcessJD(JD + 1); });
        }
        
        OccultationsPageProcessJD(startJD);
    },

    getStarName: function (occultation) {
        var star = occultation.star;
        var name = star.Name ? star.Name : star.bfID ? star.bfID  : "HR " + star.HR +
                   (star.zc ? " (ZC " + occultation.star.zc + ")" : "");
        return name;
    },

    getOccultationTitle: function (occultation) {
    var yyyymmdd_hhmmOfJD =  PlanetPage.prototype["yyyymmdd_hhmmOfJD"];

    var dt = yyyymmdd_hhmmOfJD(occultation.start.t);
    var dateString  = "" + dt.date.Y + "-" + dt.date.M + "-" + dt.date.D;
    var name = OccultationsPage.getStarName(occultation);
    return dateString + " " + name;
},

getId: function (occultation) {
  return "occultation " + Math.round(occultation.start.t) + 
          + " " + OccultationsPage.getStarName(occultation);
},

drawOccultation: function  (occultation, host) {
    var addNodeChild = PlanetPage.prototype["addNodeChild"];
    var yyyymmdd_hhmmOfJD =  PlanetPage.prototype["yyyymmdd_hhmmOfJD"];

    var dt = AAJS.DynamicalTime.DeltaT(occultation.start.t)/(3600 * 24);

  var fragment = document.createDocumentFragment();
  var div = addNodeChild (fragment, "div");
  div.classList.add("individualEventSection");
  div.classList.add("occultation");
  div["id"] = OccultationsPage.getId (occultation);
  var occultationTitle = OccultationsPage.getOccultationTitle(occultation);

  var h2 = addNodeChild (div, "h2", occultationTitle);
  addNodeChild (div, "span", "Star magnitude: " + occultation.star.Vmag);
  
  var table = addNodeChild (div, "table");
  var header = addNodeChild(table, "tr");
  addNodeChild(header, "th", "Phase");
  addNodeChild(header, "th", "Time");
  addNodeChild(header, "th", "Position Angle");

  var timeAccuracy = 1/(24 * 60);

  var immersionRow = addNodeChild(table, "tr");
  addNodeChild(immersionRow, "td", "Disappearance (D)");
  var t = yyyymmdd_hhmmOfJD(occultation.start.t - dt, timeAccuracy);
  addNodeChild(immersionRow, "td", t.time.Ord3 + ":" + t.time.Ord2);
  addNodeChild(immersionRow,"td", Math.round(occultation.start.PA));

  var emmersionRow = addNodeChild(table, "tr");
  addNodeChild(emmersionRow, "td", "Reappearance (R)");
  t = yyyymmdd_hhmmOfJD(occultation.end.t - dt, timeAccuracy);
  addNodeChild(emmersionRow, "td", t.time.Ord3 + ":" + t.time.Ord2);
  addNodeChild(emmersionRow,"td", Math.round(occultation.end.PA));

  var w = 800;
  var h = 800;
  var moonRadius = w/3;

  var svgns = "http://www.w3.org/2000/svg";
  var viewport = document.createElementNS(svgns, "svg");
  div.appendChild (viewport);
  viewport.setAttribute("class", "viewport");
  viewport.setAttribute("viewBox", "0 0 " + w + " " + h);
  viewport.setAttribute("preserveAspectRatio", "xMidYMid meet");

  var img =  document.createElementNS(svgns, "svg");
  viewport.appendChild (img);
  img.setAttribute("height", h);
  img.setAttribute("width", w);
  img.setAttribute("alt", occultationTitle);


  var degra = Math.PI/180;
  var hra = Math.PI/12;
  var paD = degra * (90 + occultation.start.PA);
  var xd = moonRadius * Math.cos(paD);
  var yd = moonRadius * Math.sin(paD);

  var paR = degra * (90 + occultation.end.PA);
  var xr = moonRadius * Math.cos(paR);
  var yr = moonRadius * Math.sin(paR);

  var text = document.createElementNS (svgns, "text");
  img.appendChild (text);
  text.setAttribute("x", xd + w/2 - 25);
  var yText = h/2 - yd;
  var yOffset = 40;
  if (yText < h/2)
    yText -= yOffset;
  else
    yText += yOffset;
  text.setAttribute("y", yText);
  text.textContent = "D";

  text = document.createElementNS (svgns, "text");
  img.appendChild (text);
  text.setAttribute("x", xr + w/2);
  yText = h/2 - yr;
  if (yText < h/2)
    yText -= yOffset;
  else
    yText += yOffset;
  text.setAttribute("y", yText);
  text.textContent = "R";


  var slope = (yr - yd) / (xr - xd);
  var yStart = (slope * (-w/2 - xd) + yd);
  var yEnd = (slope * (w/2 - xd) + yd);

  yStart = h/2 - yStart;
  yEnd = h/2 - yEnd;

  var l = document.createElementNS(svgns, "line");
  img.appendChild (l);
  l.setAttribute("x1", 0);
  l.setAttribute ("y1", yStart);
  l.setAttribute("x2", w);
  l.setAttribute ("y2", yEnd);
  l.setAttribute("stroke", "#000000");


  var moon = document.createElementNS(svgns, "circle");
  img.appendChild (moon);
  moon.setAttribute("cx", h/2);
  moon.setAttribute("cy", w/2);
  moon.setAttribute("r", moonRadius);
  moon.setAttribute("fill", "#aaaaaa");
  moon.setAttribute("stroke", "#000000");

  var moonData = MoonData.getDataAsObjectForJD(occultation.start.t);
  var sunData = SunData.getDataAsObjectForJD(occultation.start.t);

  var cos = Math.cos;
  var sin = Math.sin;
  var tan = Math.tan;

  var paSun = Math.atan2 (cos(sunData.Dec * degra) * sin(hra * (sunData.RA - moonData.RA)),
                          (sin(sunData.Dec * degra) * cos(moonData.Dec*degra) -
                          cos(sunData.Dec * degra) * sin(moonData.Dec*degra) * cos(hra * (sunData.RA - moonData.RA))
                          )
                          );
  paSun += Math.PI/2;
  var limbX = moonRadius * cos(paSun);
  var limbY = moonRadius * sin(paSun);

  var darkX = moonRadius * cos(paSun + Math.PI);
  var darkY = moonRadius * sin(paSun + Math.PI);

  var cusp1PA = paSun + Math.PI/2; 
  var cusp1X = moonRadius * cos(cusp1PA);
  var cusp1Y = moonRadius * sin(cusp1PA);

  var cusp2PA = cusp1PA + Math.PI; 
  var cusp2X = -cusp1X;
  var cusp2Y = -cusp1Y;

  var k = MoonData.getApproximatePhase(occultation.start.t);

  // tip of the terminator
  var tx = (1 - k) * limbX + k * darkX;
  var ty = (1 - k) * limbY + k * darkY;
  // circle that passes through both cusps and tip of terminator
  var p1x = (cusp1X + tx) / 2;
  var p1y = (cusp1Y + ty) / 2;
  var slope1 = (-1) / ((cusp1Y - ty) / (cusp1X - tx));

  var p2x = (cusp2X + tx) / 2;
  var p2y = (cusp2Y + ty) / 2;
  var slope2 = (-1) / ((cusp2Y - ty) / (cusp2X - tx));

  var cx = (slope1 * p1x - slope2 * p2x + p2y - p1y) / (slope1 - slope2);
  var cy = slope1 * (cx - p1x) + p1y;

  var tr = Math.sqrt((cx - tx) * (cx - tx) + (cy - ty) * (cy - ty));

  var flip = k < 0.5 ? 1 : 0;

  cusp1X += w/2;
  cusp2X += w/2;
  darkX  += w/2;
  limbX  += w/2;
  tx += w/2;

 cusp1Y = h/2 - cusp1Y;
 cusp2Y = h/2 - cusp2Y;
 darkY  = h/2 - darkY ;
 limbY  = h/2 - limbY ;
 ty = h/2 - ty;

  var d = "M " + cusp1X + " " + cusp1Y +
            " A " + tr + " " + tr + " 0 0 " + flip + " " + tx + " " + ty  +
            " A " + tr + " " + tr + " 0 0 " + flip + " " + cusp2X + " " + cusp2Y  +
            " A " + moonRadius + " " + moonRadius + " 0 0 0 " + limbX + " " + limbY  +
            " A " + moonRadius + " " + moonRadius + " 0 0 0 " + cusp1X + " " + cusp1Y;

  var path = document.createElementNS(svgns, "path");
  img.appendChild (path);
  path.setAttribute("d", d);
  path.setAttribute ("fill", "#ffffdd");
  path.setAttribute ("sroke", "#000000");
  path.setAttribute ("stroke-width", 2);

  host.appendChild(fragment);
},


    keywordsArray : ["Occultation", "Disappearance", "Reappearance", "Immersion", "Emmersion"]
    // clears up the rendered thing
};

(function(){
    var initLocal = function() {
        try {
            OccultationsPage.dataSource = OccultationsData;
            OccultationsPage.reset = PlanetPage.prototype.reset;
            Pages["Occultations"] = OccultationsPage;
        } catch (err) {
            SyncedTimeOut(initLocal, Timeout.onInit);
        }
    }
    initLocal();
})();

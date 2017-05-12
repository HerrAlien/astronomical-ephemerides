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


var MercuryData = {
	cache : {},
    getDataForJD : function (JD) {
        var data = this.cache[JD];
            if (!data) {
				data = [];
				var i = 0;
				var dateOfJD =  AAJS.Date.JD2Date(JD);
				data[i++] = dateOfJD.M;
				data[i++] = dateOfJD.D;
				
				var planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (JD, 1, true);
				
				//!! These are fairly low precision, need to investigate why ...
				data[i++] = planetaryDetails.ApparentGeocentricRA;
				data[i++] = planetaryDetails.ApparentGeocentricDeclination;
				
				var delta = planetaryDetails.ApparentGeocentricDistance;
				
				data[i++] = 2 * AAJS.Diameters.MercurySemidiameterB(delta) / 3600;
				
				var jdOfTransit = AAJS.Date.ST2NextJD(planetaryDetails.ApparentGeocentricRA, JD);
		//		planetaryDetails = AAJS.Elliptical.CalculatePlanetaryDetails (jdOfTransit - 6.0 /24, 1, true);
		//		jdOfTransit = AAJS.Date.ST2NextJD(planetaryDetails.ApparentGeocentricRA, jdOfTransit);
				var transitHour = 24 * (jdOfTransit - JD);
				data[i++] = transitHour;
				data[i++] = delta;
				
				var sunEarthDistance = SunData.getSunEarthDistance(JD);
				var r =  AAJS.Mercury.RadiusVector(JD, true);
				data[i++] = r;
				
				var cosElongationAngle = (delta * delta + sunEarthDistance * sunEarthDistance - r * r)/(2 * delta * sunEarthDistance);
				data[i++] = Math.acos(cosElongationAngle);
				var cosPhaseAngle = (r*r + delta * delta - sunEarthDistance * sunEarthDistance)/(2 * delta * r);
				data[i++] = 0.5 * (cosPhaseAngle + 1);
				this.cache[JD] = data;
			}
		return data;
    },
    initFromLocalStorage : function () {
            // TODO: this is where we fetch data already computed during earlier sessions
    }
};

(function () {
    var MercuryPage = {
        table : document.getElementById("Mercury"),

        reset : function () {
            while (this.table.hasChildNodes()) {
                var currentTr = this.table.lastElementChild;
                if (currentTr.className == "fixed") // not the safest way
                    break;
                this.table.removeChild(currentTr);
            }
        },
        
        prepareLineForView : function (line) {
            var displayableLine = [];
            // copy the day verbatim
            displayableLine[1] = line[1];
            if (line[1] == 1) { // first day of the month
                var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                displayableLine[0] = months[line[0]]; // set displayableLine[0] to the name of the month
            }
            else
                displayableLine[0] = "";
            
            var di = 2;
            var si = 2;
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
//			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalDiam.Ord2;
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(line[si++]);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo1Decimal (line[si++] * 180 / Math.PI);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);

            return displayableLine;
        },
        
        // this will probably become an utility available for every page
        appendLine : function (dataArray) {
            var line = this.table.ownerDocument.createElement("tr");
            var tbody = this.table.getElementsByTagName("tbody")[0];
            tbody.appendChild(line);
            
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
            }
        },
        
        displayMercuryPage : function(JD, daysAfter) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { MercuryPage.displyaySunPage(JD, daysAfter); }, 100);
            var i = 0;
            for (i = 0; i < daysAfter; i++)
                MercuryPage.appendLine (MercuryPage.prepareLineForView(MercuryData.getDataForJD(JD + i)));
        }
    };

    setTimeout( function() { MercuryPage.displayMercuryPage(AAJS.Date.DateToJD (2017, 1, 1, true), 365); }, 100);


})();
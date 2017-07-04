function PlanetPage (planetDataSource) {
    if (planetDataSource) {
        this.dataSource = planetDataSource;
        this.hostElement = document.getElementById(this.dataSource.planet.name);
    }
    this.pageRendered = false;
    this.lastAppendedLine = false;

    this.tableHeaderInfo = {
        "0" : {
                "0" : "Date",
                "1" : "",
                "longText" : "Date: month"
            } ,

        "1" : {
                "0" : "",
                "1" : "",
                "longText" : "Date: day"
            },
        "2" : {
                "0" : "\u03B1",
                "1" : "h",
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "3" : {
                "0" : "",
                "1" : "m",
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "4" : {
                "0" : "",
                "1" : "s",
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "5" :  {
                "0" : "\u03B4",
                "1" : "\u00B0",
                "longText" : "Equatorial coordinates: Declination"
            },
        "6" :  {
                "0" : "",
                "1" : "'",
                "longText" : "Equatorial coordinates: Declination"
            },
        "7" :  {
                "0" : "",
                "1" : "''",
                "longText" : "Equatorial coordinates: Declination"
            },
        "8" :  {
                "0" : "\u03D5",
                "1" : "''",
                "longText" : "Apparent diameter"
            },

            
        "9" : {
                "0" : "Rise",
                "1" : "hh:mm",
                "longText" : "The UTC time of rise above horizon"
            },
        "10" : {
                "0" : "Transit",
                "1" : "hh:mm",
                "longText" : "The UTC time of the transit across the meridian"
            },
        "11" : {
                "0" : "Set",
                "1" : "hh:mm",
                "longText" : "The UTC time of setting"
            },

            "12" :  {
                "0" : "\u0394",
                "1" : "A.U.",
                "longText" : "Distance to Earth, in astronomical units"
            },

            "13" :  {
                "0" : "R",
                "1" : "A.U.",
                "longText" : "Distance to Sun, in astronomical units"
            },

            "14" :  {
                "0" : "Elong.",
                "1" : "\u00B0",
                "longText" : "Elongation angle from the Sun"
            },

        "15" :  {
                "0" : "Phase",
                "1" : "",
                "longText" : "The phase of the planet (illuminated fraction of disk, as seen from Earth)"
            }
    };

    this.lastDisplayedMonth = -1;
    this.months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
}

(function(){
    
    
    PlanetPage.prototype["displayPage"] = function () {
            var pageObj = this;
            if (typeof AAJS == "undefined" || !AAJS.AllDependenciesLoaded() || !PageTimeInterval.JD)
                return setTimeout (function() { pageObj.displayPage(); }, 300);
            
            var JD = PageTimeInterval.JD;
            var daysAfter =  PageTimeInterval.days;
            var stepSize = PageTimeInterval.stepSize;
            
            this.lastAppendedLine = false;
            if (!this.pageRendered) {
                this.reset();
                this.addTableHeader (this.hostElement, [["fixed", "firstHeaderRow"], ["fixed", "secondHeaderRow"]]);

                var hostElement = pageObj.hostElement;
                var dataSource = pageObj.dataSource;
                
                var delayedAppendData = function (JD, endJD, steps, hostElement, dataSource) {
                    if (JD >= endJD)
                        return;
                    
                    var i = 0;
                    var docFragment = hostElement.ownerDocument.createDocumentFragment();
                    
                    for (i = 0; i < steps; i++, JD+=stepSize) {
                        if (JD >= endJD)
                            break;
                        
                        var preparedData = pageObj.prepareOneDayDataObjectForView(pageObj.dataSource.getDataAsObjectForJD(JD, true), JD);
                        // preparedData = pageObj.prepareLineForView(pageObj.dataSource.getDataForJD(JD), JD);
                        pageObj.appendLine (preparedData, docFragment);
                    }
                    
                    pageObj.addTableHeader (docFragment, [["fixed", "printOnly"], ["fixed", "printOnly"]]);
                    
                    hostElement.appendChild(docFragment);
                    
                    setTimeout (function() {delayedAppendData (JD, endJD, steps, hostElement, dataSource); },1 );
                }
                delayedAppendData (JD, JD + daysAfter, 20, hostElement, dataSource);
                this.pageRendered = true;
            }
        };
    
    PlanetPage.prototype["appendLine"] = function (dataArray, docFragment) {
            var line = this.hostElement.ownerDocument.createElement("tr");
            if (!docFragment)
                docFragment = this.hostElement;
            
            var changedMonth = this.lastAppendedLine && dataArray[0] && this.lastAppendedLine[0] != dataArray[0];
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
                if (changedMonth)
                    td.classList.add("topBorder");
            }
            docFragment.appendChild(line);
            this.lastAppendedLine = dataArray;
        };
        
    PlanetPage.prototype["addTableHeader"] = function (table, classes) {
        var rows = [];
        for (var rowIndex = 0; rowIndex < 2; rowIndex++) {
            var row = this.addNodeChild (table, "tr");
            var rowClasses = classes[rowIndex];
            for (var classIndex = 0; classIndex < rowClasses.length; classIndex++)
                row.classList.add (rowClasses[classIndex]);

            for (var headerKey in this.tableHeaderInfo) {
                var th = this.addNodeChild (row, "th", this.tableHeaderInfo[headerKey][rowIndex]);
                th['title'] = this.tableHeaderInfo[headerKey].longText;
                th.onclick = function () { alert (this.title); }
            }
            rows[rowIndex] = row;
        }
        return {"row1" : rows[0], "row2" : rows[1] };
    };

    PlanetPage.prototype["reset"] = function () {
        while (this.hostElement.hasChildNodes()) {
            this.hostElement.removeChild(this.hostElement.firstChild);
        }
        this.pageRendered = false;
        // reset the data - transits depend on the longitude
        this.dataSource.reset();
    };
		   
	PlanetPage.prototype["prepareOneDayDataObjectForView"] = function (obj, JD) {

           var displayableLine = [];

            displayableLine[0] = "";
            var month = obj.Month;
            if (month != this.lastDisplayedMonth) { // first day of the month
                displayableLine[0] = this.months[month]; // set displayableLine[0] to the name of the month
                this.lastDisplayedMonth = month;
            }

            // copy the day verbatim
            displayableLine[1] = obj.Day;
           
            var di = 2;
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(obj.RA * 3600)/3600);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(obj.Dec * 3600)/3600);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(obj.Diameter * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(obj.MeridianTransit * 3600)/3600);
            displayableLine[di++] = obj.bRiseValid ? this.timeToHhColumnMm(obj.Rise) : "N/A";
            displayableLine[di++] = obj.bTransitValid ? this.timeToHhColumnMm(obj.MeridianTransit) : "N/A";
            displayableLine[di++] = obj.bSetValid ? this.timeToHhColumnMm(obj.Set) : "N/A";
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.DistanceToEarth);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.DistanceToSun);
            
            // is it east or is it west?
            var cardinalCoordinateRelativeToSun = "W";
            
            var sunRA = SunData.getRA(JD);
            var planetRA = obj.RA;
            // this is probably because we have one angle in q1, the other in q4.
            if (Math.abs(sunRA - planetRA) >= 12) // hours ...
            {
                sunRA += 12;
                planetRA += 12;
                
                if (sunRA > 24)
                    sunRA -= 24;
                if (planetRA > 24)
                    planetRA -= 24;
            }
            
            if (sunRA < planetRA )
                cardinalCoordinateRelativeToSun = "E";
            
            displayableLine[di++] = AAJS.Numerical.RoundTo1Decimal (obj.Elongation * 180 / Math.PI) + " " + cardinalCoordinateRelativeToSun;
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (obj.Phase);

            return displayableLine;
    };

	PlanetPage.prototype["addNodeChild"] = function (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent =  content;
        return child;
    };
    
    PlanetPage.prototype["timeToHhColumnMm"] = function (timeHdotHhh) {
        var roundedTime = Math.round(timeHdotHhh * 60) / 60;
        var roundedTimeObj = AAJS.Numerical.ToSexagesimal (roundedTime);
        return (roundedTimeObj.Ord3 >= 10 ? roundedTimeObj.Ord3 : "0" + roundedTimeObj.Ord3) + ":" +
               (roundedTimeObj.Ord2 >= 10 ? roundedTimeObj.Ord2 : "0" + roundedTimeObj.Ord2)
    }
    
})();						   
	
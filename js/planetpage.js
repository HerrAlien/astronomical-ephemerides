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
                "0" : "Transit",
                "1" : "h",
                "longText" : "The UTC time of the transit across the meridian"
            },
        "10" : {
                "0" : "",
                "1" : "m",
                "longText" : "The UTC time of the transit across the meridian"
            },
        "11" : {
                "0" : "",
                "1" : "s",
                "longText" : "The UTC time of the transit across the meridian"
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
                            return;
                        pageObj.appendLine (pageObj.prepareLineForView(pageObj.dataSource.getDataForJD(JD), JD), docFragment);
                    }
                    
                    pageObj.addTableHeader (docFragment, [["fixed", "printOnly"], ["fixed", "printOnly"]]);
                    
                    hostElement.appendChild(docFragment);
                    
                    setTimeout (function() {delayedAppendData (JD, endJD, steps, hostElement, dataSource); },1 );
                }
                delayedAppendData (JD, JD + daysAfter, 20, hostElement, dataSource);
                this.pageRendered = true;
            }
        };
    
    PlanetPage.prototype["appendLine"] = function (dataArray, classes, docFragment) {
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
                td['title'] = this.tableHeaderInfo[i].longText;
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
		
	PlanetPage.prototype["prepareLineForView"] = function (line, JD) {

           var displayableLine = [];

            displayableLine[0] = "";
            if (line[0] != this.lastDisplayedMonth) { // first day of the month
                displayableLine[0] = this.months[line[0]]; // set displayableLine[0] to the name of the month
                this.lastDisplayedMonth = line[0];
            }

            // copy the day verbatim
            displayableLine[1] = line[1];
           
            var di = 2;
            var si = 2;
            var sexagesimalRA = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalRA.Ord3 ;
            displayableLine[di++] = sexagesimalRA.Ord2 
            displayableLine[di++] = sexagesimalRA.Ord1;

            var sexagesimalDec = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDec.Ord3 ;
            displayableLine[di++] = sexagesimalDec.Ord2;
            displayableLine[di++] = sexagesimalDec.Ord1;
			
//			displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals(line[si++]);
            
            var sexagesimalDiam = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalDiam.Ord1;
            
            var sexagesimalTransit = AAJS.Numerical.ToSexagesimal(Math.round(line[si++] * 3600)/3600);
            displayableLine[di++] = sexagesimalTransit.Ord3;
            displayableLine[di++] = sexagesimalTransit.Ord2;
            displayableLine[di++] = sexagesimalTransit.Ord1;
            
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);
            
            // is it east or is it west?
            var cardinalCoordinateRelativeToSun = "W";
            
            var sunRA = SunData.getRA(JD);
            var planetRA = line[2];
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
            
            displayableLine[di++] = AAJS.Numerical.RoundTo1Decimal (line[si++] * 180 / Math.PI) + " " + cardinalCoordinateRelativeToSun;
            displayableLine[di++] = AAJS.Numerical.RoundTo3Decimals (line[si++]);

            return displayableLine;
    };
    
	PlanetPage.prototype["addNodeChild"] = function (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent =  content;
        return child;
    };
})();						   
	
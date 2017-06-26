function PlanetPage (planetDataSource, tableName) {
    if (planetDataSource) {
        this.dataSource = planetDataSource;
        this.hostElement = document.getElementById(this.dataSource.planet.name);
    }
    
    if (tableName)
        this.hostElement = document.getElementById(tableName);
    
    this.pageRendered = false;
    this.lastAppendedLine = false;

    this.tableHeaderInfo = {
        "0" : {
                "0" : { "text" : "Date", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: month"
            } ,

        "1" : {
                "0" : { "text" : "", "classes" : ["minWidth20"] },
                "1" : { "text" : "", "classes" : ["minWidth20"] },
                "longText" : "Date: day"
            },
        "2" : {
                "0" : { "text" : "\u03B1", "classes" : ["minWidth20", "positionEphemeris"] },
                "1" : { "text" : "h", "classes" : ["minWidth20", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "3" : {
                "0" : { "text" : "", "classes" : ["minWidth20", "positionEphemeris"] },
                "1" : { "text" : "m", "classes" : ["minWidth20", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "4" : {
                "0" : { "text" : "", "classes" : ["minWidth20", "positionEphemeris"] },
                "1" : { "text" : "s", "classes" : ["minWidth20", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Right Ascension"
            },
        "5" :  {
                "0" : { "text" : "\u03B4", "classes" : ["minWidth25", "positionEphemeris"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth25", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "6" :  {
                "0" : { "text" : "", "classes" : ["minWidth20" , "positionEphemeris"] },
                "1" : { "text" : "'", "classes" : ["minWidth20", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "7" :  {
                "0" : { "text" : "", "classes" : ["minWidth15"  , "positionEphemeris"] },
                "1" : { "text" : "''", "classes" : ["minWidth25", "positionEphemeris"] },
                "longText" : "Equatorial coordinates: Declination"
            },
        "8" :  {
                "0" : { "text" : "\u03D5", "classes" : ["minWidth20", "positionEphemeris"] },
                "1" : { "text" : "''", "classes" : ["minWidth20"    , "positionEphemeris"] },
                "longText" : "Apparent diameter"
            },
        "9" : {
                "0" : { "text" : "Transit", "classes" : ["minWidth20", "positionEphemeris"] },
                "1" : { "text" : "h", "classes" : ["minWidth20"      , "positionEphemeris"] },
                "longText" : "The UTC time of the transit across the meridian"
            },
        "10" : {
                "0" : { "text" : "", "classes" : ["minWidth1"  , "positionEphemeris"] },
                "1" : { "text" : "m", "classes" : ["minWidth20", "positionEphemeris"] },
                "longText" : "The UTC time of the transit across the meridian"
            },
        "11" : {
                "0" : { "text" : "", "classes" : ["minWidth1"  , "positionEphemeris"] },
                "1" : { "text" : "s", "classes" : ["minWidth25", "positionEphemeris"] },
                "longText" : "The UTC time of the transit across the meridian"
            },

            "12" :  {
                "0" : { "text" : "\u0394", "classes" : ["minWidth55", "positionEphemeris"] },
                "1" : { "text" : "A.U.", "classes" : ["minWidth55"  , "positionEphemeris"] },
                "longText" : "Distance to Earth, in astronomical units"
            },

            "13" :  {
                "0" : { "text" : "R", "classes" : ["minWidth55"   , "positionEphemeris"] },
                "1" : { "text" : "A.U.", "classes" : ["minWidth55", "positionEphemeris"] },
                "longText" : "Distance to Sun, in astronomical units"
            },

            "14" :  {
                "0" : { "text" : "Elong", "classes" : ["minWidth70" , "positionEphemeris"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth62", "positionEphemeris"] },
                "longText" : "Elongation angle from the Sun"
            },

        "15" :  {
                "0" : { "text" : "Phase", "classes" : ["minWidth45", "physicalEphemeris"] },
                "1" : { "text" : "\u00B0", "classes" : ["minWidth45"     , "physicalEphemeris"] },
                "longText" : "The phase of the planet (illuminated fraction of disk, as seen from Earth)"
            }
    };
    
    this.lastDisplayedMonth = -1;
    this.months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    this.columnClasses = [ "minWidth20", "minWidth20", "minWidth20", "minWidth20", "minWidth20",
                           "minWidth25", "minWidth20", "minWidth20", "minWidth20", "minWidth20", 
                           "minWidth20", "minWidth25", "minWidth55", "minWidth55", "minWidth62",
                           "minWidth45" ];
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

                var firstLine = true;
                
                var hostElement = pageObj.hostElement;
                var columnClasses = pageObj.columnClasses;
                var dataSource = pageObj.dataSource;
                
                var delayedAppendData = function (JD, endJD, steps, hostElement, columnClasses, dataSource) {
                    if (JD >= endJD)
                        return;
                    
                    var i = 0;
                    var docFragment = hostElement.ownerDocument.createDocumentFragment();
                    
                    for (i = 0; i < steps; i++, JD+=stepSize) {
                        if (JD >= endJD)
                            break;
                        
                        var dataRowClasses = false;
                        if (firstLine && i == 0) {
                            firstLine = false;
                            dataRowClasses = columnClasses;
                        }
                        
                        pageObj.appendLine (pageObj.prepareLineForView(dataSource.getDataForJD(JD), JD), dataRowClasses, docFragment);
                    }
                    
                    pageObj.addTableHeader (docFragment, [["fixed", "printOnly"], ["fixed", "printOnly"]]);
                    
                    hostElement.appendChild(docFragment);
                    
                    setTimeout (function() {delayedAppendData (JD, endJD, steps, hostElement, columnClasses, dataSource); },1 );
                }
                delayedAppendData (JD, JD + daysAfter, 20, hostElement, columnClasses, dataSource);
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

                if (i > 1)
                {
                    if (i < 15)
                        td.classList.add ("positionEphemeris");
                    else
                        td.classList.add ("physicalEphemeris");
                }
                
                if (!!classes && !!classes[i])
                    td.classList.add (classes[i])
            }
            docFragment.appendChild(line);
            this.lastAppendedLine = dataArray;
        };
        
    PlanetPage.prototype["addTableHeader"] = function (table, rowClasses, columnClasses) {
        var rows = [];
        for (var rowIndex = 0; rowIndex < 2; rowIndex++) {
            var row = this.addNodeChild (table, "tr");
            var currentRowClasses = rowClasses[rowIndex];
            for (var classIndex = 0; classIndex < rowClasses.length; classIndex++)
                row.classList.add (currentRowClasses[classIndex]);

            for (var headerKey in this.tableHeaderInfo) {
                var th = this.addNodeChild (row, "th", this.tableHeaderInfo[headerKey][rowIndex]['text']);
                th['title'] = this.tableHeaderInfo[headerKey].longText;
                th.onclick = function () { alert (this.title); }
                
                var columnsClasses = this.tableHeaderInfo[headerKey][rowIndex]['classes']
                if (!!columnsClasses)
                {
                    for (var columnsClassesIndex in columnsClasses)
                        th.classList.add (columnsClasses[columnsClassesIndex]);
                }
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
	
function PlanetPage (planetDataSource) {
    if (planetDataSource) {
        this.dataSource = planetDataSource;
        this.table = document.getElementById(this.dataSource.planet.name);
    }
    this.tablePopulated = false;
	
	this.reset = function () {
        while (this.table.hasChildNodes()) {
            var currentTr = this.table.lastElementChild;
            if (currentTr.className == "fixed") // not the safest way
                break;
            this.table.removeChild(currentTr);
        }
    };
		
	this.prepareLineForView = function (line) {
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
    };
    
	this.addNodeChild = function (parent, type, content) {
        var child = parent.ownerDocument.createElement(type);
        parent.appendChild(child);
        if (content)
            child.textContent =  content;
        return child;
    };
    
    this.addPlanetTableHeader = function (table) {
        var row1 = this.addNodeChild (table, "tr");
        row1.classList.add ("fixed");    
        this.addNodeChild (row1, "th", "Date");
        this.addNodeChild (row1, "th");    
        this.addNodeChild (row1, "th", "RA");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th", "Dec");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th", "Diam.");
        this.addNodeChild (row1, "th", "Transit");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th");
        this.addNodeChild (row1, "th", "Delta");
        this.addNodeChild (row1, "th", "r");
        this.addNodeChild (row1, "th", "Elongation");
        this.addNodeChild (row1, "th", "Phase");
        var row2 = this.addNodeChild (table, "tr");
        row2.classList.add ("fixed");    
        this.addNodeChild (row2, "th");
        this.addNodeChild (row2, "th");
        this.addNodeChild (row2, "th", "h");
        this.addNodeChild (row2, "th", "m");
        this.addNodeChild (row2, "th", "s");
        this.addNodeChild (row2, "th", "\u00B0");
        this.addNodeChild (row2, "th", "'");
        this.addNodeChild (row2, "th", "''");
        this.addNodeChild (row2, "th", "''");
        this.addNodeChild (row2, "th", "h");
        this.addNodeChild (row2, "th", "m");
        this.addNodeChild (row2, "th", "s");
        this.addNodeChild (row2, "th", "A.U.");
        this.addNodeChild (row2, "th", "A.U.");
        this.addNodeChild (row2, "th", "\u00B0");
        this.addNodeChild (row2, "th");
    };
    this.addPlanetTableHeader (this.table);

	this.appendLine = function (dataArray) {
            var line = this.table.ownerDocument.createElement("tr");
            var tbody = this.table.getElementsByTagName("tbody")[0];
            if (!tbody)
                tbody = this.table;
            tbody.appendChild(line);
            
            var i = 0;
            for (i = 0; i < dataArray.length; i++) {
                var td = line.ownerDocument.createElement("td");
                line.appendChild(td);
                td.textContent = dataArray[i];
            }
        };
		
		this.displayPage = function (JD, daysAfter) {
            if (!AAJS.AllDependenciesLoaded())
                return setTimeout (function() { this.displayPage(JD, daysAfter); }, 100);
            
            if (!this.tablePopulated)
            {
                var pageObj = this;
                var delayedAppendData = function (JD, endJD) {
                if (JD == endJD)
                {
                    pageObj.tablePopulated = true;
                    return;
                }
                pageObj.appendLine (pageObj.prepareLineForView(pageObj.dataSource.getDataForJD(JD)));
                setTimeout (function() {delayedAppendData (JD+1, endJD); },1 );
            }
            delayedAppendData (JD, JD + daysAfter);
        
            }
        };
}							   
	
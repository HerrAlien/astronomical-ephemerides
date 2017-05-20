/*
               
Copyright 2017  Herr_Alien <alexandru.garofide@gmail.com>
                
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
                
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
                
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl.html
*/

var TimeStepsData = {
	// this is the model
    yearToStart: 2017,
    monthToStart : 1,
    dayToStart : 1,
    numberOfDays : 410,
    timestep : 1,
    
    onTimestepUpdated : false,

	// these are the controls
	Controls : {
		dateInput : document.getElementById ("startingDate"),
		daysCountInput: document.getElementById ("numberOfDays"),
        stepSizeInput: document.getElementById ("incrementDate"),
		
		update: function () {
			var attrMap = {"daysCountInput" : "numberOfDays", 
                            "stepSizeInput" : "timestep"};
			for (var k in attrMap)
				this[k].value = TimeStepsData[attrMap[k]];
            
            this.dateInput.valueAsDate = new Date (TimeStepsData.yearToStart, TimeStepsData.monthToStart, TimeStepsData.dayToStart, 0,0,0,0);

            TimeStepsData.onTimestepUpdated.notify();
		},
		
		init : function (){
			this.dateInput.oninput = function () {
                var selDate = this.dateInput.valueAsDate;
                TimeStepsData.yearToStart = selDate.getFullYear();
                TimeStepsData.monthToStart = 1 + selDate.getMonth();
                TimeStepsData.dayToStart = selDate.getDate();
                
                TimeStepsData.onTimestepUpdated.notify();
            }
			 
            this.daysCountInput.oninput = function () {
                TimeStepsData.numberOfDays = this.daysCountInput.value;
                TimeStepsData.onTimestepUpdated.notify();
            }             
            this.stepSizeInput.oninput = function () {
                TimeStepsData.timestep = this.stepSizeInput.value;
                TimeStepsData.onTimestepUpdated.notify();
            }             
		}
	},
	
	init : function () {
		this.onTimestepUpdated = Notifications.NewNoParameter();
		this.Controls.init();
		this.Controls.update();
	}
};

TimeStepsData.init();

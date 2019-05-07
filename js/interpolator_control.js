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

var InterpolatorControl = {
    New : function(page, name) {
        var appendDomNode = PlanetPage.prototype["addNodeChild"]
        var domHost = appendDomNode (page, "div");
        domHost.classList.add("interpolator");

        var rightNow_specifyDate_toggle = InterpolatorControl.Toggle.New (domHost, name + "_rightNowOrSpecifyDate");
        appendDomNode (domHost, "br");



        var localTime_universalTime_toggle = InterpolatorControl.Toggle.New (domHost, name + "_localOrUniversalTime");
        appendDomNode (domHost, "br");
    },

    Toggle : {
        New : function (domHost, meaning) {
            var appendDomNode = PlanetPage.prototype["addNodeChild"]

            var offLabel = appendDomNode (domHost, "label", meaning + "_off");
            offLabel.setAttribute('for', meaning);
            offLabel.classList.add("settingsLabel");

            var switchLabel = appendDomNode(domHost, "label");
            switchLabel.classList.add("switch");
            var input =  appendDomNode(switchLabel, "input");
            input['type'] = "checkbox";
            input['id'] = meaning;
            input.classList.add("switchinput");

            var span =  appendDomNode(switchLabel, "span");
            span.classList.add("slider");
            span.classList.add("round");

            var onLabel = appendDomNode (domHost, "label", meaning + "_on");
            onLabel.setAttribute('for', meaning);
            onLabel.classList.add("settingsLabel");

            var returnedObj =  {
                offLabel : offLabel,
                onLabel : onLabel,
                on : function () { return input.checked; }
            };

            returnedObj['onchange'] = Notifications.New();
            input.onchange = returnedObj.onchange.notify;

            return returnedObj;
        }
    },
    Date : {
        New : function (host) {

        }
    }, 

    TIme : {
        New : function (host) {
            
        }
    }
};
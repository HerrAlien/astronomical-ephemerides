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
    New : function(domHost) {
        var rightNow_specifyDate_toggle = InterpolatorControl.Toggle.New (domHost, "rightNowOrSpecifyDate");

        var localTime_universalTime_toggle = InterpolatorControl.Toggle.New (domHost, "localOrUniversalTime");
    },

    appendDomNode : function (host, nodeType, content) {
        var n = document.createElement (nodeType);
        if (content) {
            n.textContent = content;
        }
        host.appendChild (n);
        return n;
    },

    Toggle : {
        New : function (domHost, meaning) {
            var appendDomNode = InterpolatorControl.appendDomNode;
            var offLabel = appendDomNode (domHost, "label", meaning + "_off");
            offLabel['for'] = meaning;
            var switchLabel = appendDomNode(domHost, "label");

            var input =  appendDomNode(domHost, "input");
            input['type'] = "checkbox";
            input['id'] = meaning;
            input.classlist.add("switchinput");

            var span =  appendDomNode(domHost, "span");
            span.classlist.add("slider");
            span.classlist.add("round");

            var onLabel = appendDomNode (domHost, "label", meaning + "_on");
            onLabel['for'] = meaning;
            var br = appendDomNode (domHost, "br");

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
};
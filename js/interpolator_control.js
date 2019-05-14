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
        var appendDomNode = PlanetPage.prototype["addNodeChild"];
        var domHost = appendDomNode (page, "div");
        domHost.classList.add("interpolator");

        var rightNow_specifyDate_toggle = InterpolatorControl.Toggle.New (domHost, name + "_rightNowOrSpecifyDate");
        rightNow_specifyDate_toggle.offLabel.textContent = "For right now ";
        rightNow_specifyDate_toggle.onLabel.textContent = " For a given date";
        rightNow_specifyDate_toggle.set(false);
        appendDomNode (domHost, "br");

        var dateObjects = InterpolatorControl.Date.New(domHost);

        var timeObjects = InterpolatorControl.Time.New(domHost);

        var localTime_universalTime_toggle = InterpolatorControl.Toggle.New (domHost, name + "_localOrUniversalTime");
        localTime_universalTime_toggle.offLabel.textContent = "Local Time ";
        localTime_universalTime_toggle.onLabel.textContent = " UTC";
        localTime_universalTime_toggle.set(false);
        appendDomNode (domHost, "br");

        var onDateChanged = Notifications.New();

        var update = function (date) {
            if (!date) {
                return;
            }

            dateObjects.input.valueAsDate = date;
            if (localTime_universalTime_toggle.on()) { // this means UTC
                timeObjects.hours.value =   date.getUTCHours();
                timeObjects.minutes.value = date.getUTCMinutes();
                timeObjects.seconds.value = date.getUTCSeconds();
            } else { // local time
                timeObjects.hours.value =   date.getHours();
                timeObjects.minutes.value = date.getMinutes();
                timeObjects.seconds.value = date.getSeconds();
            }
            onDateChanged.notify();
        }
        update (new Date()); // initial value
        var inputChanged = function () { onDateChanged.notify(); };
        timeObjects.hours.onchange = inputChanged;
        timeObjects.minutes.onchange = inputChanged;
        timeObjects.seconds.onchange = inputChanged;
        dateObjects.input.onchange = inputChanged;

        var getCurrentDate = function () {
            var date = dateObjects.input.valueAsDate;
            if (localTime_universalTime_toggle.on()) { // this means UTC
                date.setUTCHours  ( timeObjects.hours.value  );
                date.setUTCMinutes( timeObjects.minutes.value);
                date.setUTCSeconds( timeObjects.seconds.value);
            } else { // local time
                date.setHours  ( timeObjects.hours.value  );
                date.setMinutes( timeObjects.minutes.value);
                date.setSeconds( timeObjects.seconds.value);
            }
            return date;
        }

        var lastJD = false;
        var lastDt = false;

        var getCurrentJDE = function () {
            var date = getCurrentDate();
            var jd = AAJS.Date.DateToJD(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), true);
            jd += ((date.getUTCSeconds() / 60 + date.getUTCMinutes()) / 60 + date.getUTCHours()) / 24;
            if (!lastJD || Math.abs(jd - lastJD) > 365) {
                lastJD = jd;
                lastDt = AAJS.DynamicalTime.DeltaT(jd) / (3600 * 24);
            }
            jd += lastDt;
            return jd;
        }

        return {
            "givenDateToggle" : rightNow_specifyDate_toggle,
            "timeInUtc" : localTime_universalTime_toggle,
            "getCurrentDate" : getCurrentDate,
            "getCurrentJDE" : getCurrentJDE,
            "update": update,
            "onDateChanged":onDateChanged,
        };
    },

    Toggle : {
        New : function (domHost, meaning) {
            var appendDomNode = PlanetPage.prototype["addNodeChild"];

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
                on : function () { return input.checked; },
                set : function (checked) { input.checked = !checked; input.click(); }
            };

            returnedObj['onchange'] = Notifications.New();
            input.onchange = returnedObj.onchange.notify;

            returnedObj.onchange.add(function() { 
                if (input.checked) {
                    onLabel.classList.remove("disabledOption");
                    offLabel.classList.add("disabledOption");
                } else {
                    offLabel.classList.remove("disabledOption");
                    onLabel.classList.add("disabledOption");
                }
            });

            return returnedObj;
        }
    },

    Date : {
        New : function (host) {
            //<label class="settingsLabel">Date: <br><input type="date"></label>
            var appendDomNode = PlanetPage.prototype["addNodeChild"];
            var label = appendDomNode(host, "label", "Date: ");
            label.classList.add("settingsLabel");
            appendDomNode(label, "br");
            var input = appendDomNode(label, "input");
            input['type'] = 'date';
            return { input: input, label : label };
        }
    }, 

    Time : {
        New : function (host) {
            /*<label class="settingsLabel">Time: <br>
                    <input type="number" class="hours"> : 
                    <input type="number" class="minutes"> : 
                    <input type="number" class="seconds">
                </label>*/
            var appendDomNode = PlanetPage.prototype["addNodeChild"];
            var label = appendDomNode(host, "label", "Time: ");
            label.classList.add("settingsLabel");
            appendDomNode(label, "br");

            var hours = appendDomNode(label, "input");
            hours['type'] = 'number';
            appendDomNode(label, "span", " : ");

            var minutes = appendDomNode(label, "input");
            minutes['type'] = 'number';
            appendDomNode(label, "span", " : ");

            var seconds = appendDomNode(label, "input");
            seconds['type'] = 'number';
            appendDomNode(label, "span", " : ");

            return { hours: hours, minutes: minutes, seconds: seconds };
        }
    }
};
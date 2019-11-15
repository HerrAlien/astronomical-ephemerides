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

var PersistedControls = {};

(function() {

    function PersistedControl() {
        this.control = false;
        this.label = false;
        this.onValueChanged = false;
        this.update = false;
    };

    PersistedControls["registeredControls"] = {}; // pairs name - control

    // this is a slider-like toggle switch
    PersistedControls["addToggle"] = function (host, id, textLabel) {

        var createDom = RealTimeDataViewer.Utils.CreateDom;
        var checkboxParent = host;

        var persistedControl = new PersistedControl();

        if (textLabel) {
            persistedControl.label = createDom(host, "label");
            persistedControl.label.classList.add("switch");
            checkboxParent = persistedControl.label;
        }

        persistedControl.control = createDom(checkboxParent, "input");
        persistedControl.control.type = "checkbox";
        persistedControl.control.id = usingID;
        persistedControl.control.classList.add("switchinput");

        var span = createDom(checkboxParent, "span");
        span.classList.add("slider");
        span.classList.add("round");

        persistedControl.onValueChanged = Notifications.New();
        
        var ignoreThisEvent = false;
        persistedControl.onValueChanged.add(function(){
            if (!ignoreThisEvent) {
                localStorage.setItem(id + ".checked", persistedControl.control.checked);
            }
        });

        persistedControl.update = function() {
            var checked = localStorage.getItem(id + ".checked") == 'true';
            ignoreThisEvent = true;
            persistedControl.control.checked = checked;
            ignoreThisEvent = false;
        }

        PersistedControls.registeredControls["id"] = persistedControl;

        return persistedControl;
    }

})();
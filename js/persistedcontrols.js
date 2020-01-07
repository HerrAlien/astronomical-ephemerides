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
        this.defaultValue = false;
    };

    PersistedControls["registeredControls"] = {}; // pairs name - control

    // this is a slider-like toggle switch
    PersistedControls["addSettingsToggle"] = function (host, id, defaultValue, textLabel) {

        var createDom = RealTimeDataViewer.Utils.CreateDom;
        var checkboxParent = host;

        var persistedControl = new PersistedControl();

        if (textLabel) {
            persistedControl.label = createDom(host, "label");
            persistedControl.label.classList.add("switch");
            checkboxParent = persistedControl.label;
        }

        if (defaultValue) {
            persistedControl.defaultValue = defaultValue;
        }

        persistedControl.control = createDom(checkboxParent, "input");
        persistedControl.control.type = "checkbox";
        persistedControl.control.id = id;
        persistedControl.control.classList.add("switchinput");

        var span = createDom(checkboxParent, "span");
        span.classList.add("slider");
        span.classList.add("round");

        persistedControl.onValueChanged = Notifications.New();
        
        var ignoreThisEvent = false;
        var checkedKey = id + ".checked";

        persistedControl.onValueChanged.add(function(){
            if (!ignoreThisEvent) {
                localStorage.setItem(checkedKey, persistedControl.control.checked);
            }
        });

        persistedControl.update = function() {
            var checked = localStorage.getItem(checkedKey) == 'true';
            if (null == checked) {
                checked = persistedControl.defaultValue;
                localStorage.setItem(checkedKey, checked);
            }
            ignoreThisEvent = true;
            persistedControl.control.checked = checked;
            ignoreThisEvent = false;
        }

        PersistedControls.registeredControls["id"] = persistedControl;

        persistedControl.update();
        persistedControl.control.onchange = persistedControl.onValueChanged.notify;
        return persistedControl;
    }

})();
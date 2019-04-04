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

(function () {

    var navigationLinks = {};
    var lastVisited = false;

    (function () {

        function IsNormalBackground(clsName) {
            return clsName && (clsName.toLowerCase().indexOf("background") >= 0);
        }

        function GetActiveBackground(clsName) {
            return "Color" + clsName;
        }

        function ProcessLinksFor(links, target) {
            for (var i = 0; i < links.length; i++) {
                var menuLink = links[i];
                var correspondingURL = menuLink.hash;
                if (!correspondingURL) {
                    continue;
                }
                var pageTitle = decodeURIComponent(correspondingURL.substr(1));
                var linkFixture = menuLink;
                var linkData = { 'link': linkFixture };

                // go through class list ...
                var classList = linkFixture.classList;
                for (var classIndex = 0; classIndex < classList.length; classIndex++) {
                    var currentClass = classList[classIndex];
                    if (IsNormalBackground(currentClass)) {
                        linkData['normalBackground'] = currentClass;
                        linkData['activeBackground'] = GetActiveBackground(currentClass);
                    }
                }

                var linkDataObject = navigationLinks[pageTitle] || {};
                linkDataObject[target] = linkData;
                navigationLinks[pageTitle] = linkDataObject;
            }
        }

        var promotedMenuLinks = document.getElementsByClassName("promotedMenuLink");
        ProcessLinksFor(promotedMenuLinks, 'promotedMenu');

        var menuPageLinks = document.getElementById("more").getElementsByTagName("a");
        ProcessLinksFor(menuPageLinks, 'menuPage');

    })();


    function SetColorLinkDataObject(linkDataObject) {
        if (linkDataObject) {
            linkDataObject['link'].classList.add(linkDataObject['activeBackground']);
            linkDataObject['link'].classList.remove(linkDataObject['normalBackground']);
        }
    }

    function SetNormalLinkDataObject(linkDataObject) {
        if (linkDataObject) {
            linkDataObject['link'].classList.add(linkDataObject['normalBackground']);
            linkDataObject['link'].classList.remove(linkDataObject['activeBackground']);
        }
    }

    function ColorLinkOfPage(pageName) {
        if ("more" == pageName) {
            return;
        }

        if (lastVisited) {
            var lastVisitedLinkData = navigationLinks[lastVisited];
            if (lastVisitedLinkData) {
                SetNormalLinkDataObject(lastVisitedLinkData['promotedMenu']);
                SetNormalLinkDataObject(lastVisitedLinkData['menuPage']);
            }
        }

        lastVisited = pageName;
        var linksForPage = navigationLinks[pageName];
        if (linksForPage) {
            SetColorLinkDataObject(linksForPage['promotedMenu']);
            SetColorLinkDataObject(linksForPage['menuPage']);
        }
    }

    function DisplayPage(pageName) {
        var delayedDisplay = function () {
            try {
                ColorLinkOfPage(pageName);
                Pages[pageName].displayPage();
            } catch (err) {
                SyncedTimeOut(delayedDisplay, Timeout.onInit);
            }
        }
        delayedDisplay();
    }

    function error404(pageName) {
        $get("requestedresource").textContent = pageName;
        var list = $get("searchsuggestions");
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        var rankedPages = PageRank.rank(pageName.split(" "));
        for (var i = 0; i < rankedPages.length; i++) {
            var li = PlanetPage.prototype["addNodeChild"](list, "li");
            var anchor = PlanetPage.prototype["addNodeChild"](li, "a", rankedPages[i]);
            anchor.setAttribute("href", "#" + rankedPages[i]);
        }
    }

    var actions = null;

    function onhashchange() {
        if (typeof PageRank == 'undefined') {
            SyncedTimeOut(onhashchange, Timeout.onInit);
        } else {
            var searchFormInput = $get("searchTerms");
            searchFormInput.classList.remove("visible");
            searchFormInput.classList.add("hidden");
            searchFormInput.value = "";

            var hash = decodeURIComponent(location.hash);
            var pageName = hash.slice(1);
            if (pageName == "Search results") {
                return;
            }

            previousPage = $get(pageName);

            if (previousPage) {
                DisplayPage(pageName);
                if (actions) {
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (action.name == "scroll") {
                            (function () {
                                var targetDiv = false;
                                var attemptsCount = 0;
                                var maxAttempts = 200;
                                var timeout = 500;
                                var scollAction = function () {
                                    targetDiv = document.getElementById(action.parameters);
                                    if (targetDiv) {
                                        targetDiv.scrollIntoView();
                                        return;
                                    }
                                    if (attemptsCount < maxAttempts) {
                                        setTimeout(scollAction, timeout);
                                    }
                                    attemptsCount++;
                                }
                                scollAction();
                            })();
                        } else if (action.name == "classListRemove") {
                            var targetDiv = document.getElementById(action.parameters.target);
                            if (targetDiv) {
                                var classes = action.parameters.classes;
                                for (var clsIndex = 0; clsIndex < classes.length; clsIndex++) {
                                    targetDiv.classList.remove(classes[clsIndex]);
                                }
                            }
                        } else if (action.name == "classListAdd") {
                            var targetDiv = document.getElementById(action.parameters.target);
                            if (targetDiv) {
                                var classes = action.parameters.classes;
                                for (var clsIndex = 0; clsIndex < classes.length; clsIndex++) {
                                    targetDiv.classList.add(classes[clsIndex]);
                                }
                            }
                        }
                    }

                    actions = null;
                }
            } else {
                try {
                    /* {"page":"settings","actions":[{"name":"scroll","parameters":"realTimeSettingsContainer"}]} */
                    var payload = JSON.parse(pageName);
                    actions = payload.actions;
                    window.location.replace("#" + payload.page);
                } catch (err) {
                    error404(pageName);
                    window.location.replace("#Search results");
                }
            }
        }
    }

    window.addEventListener("hashchange", onhashchange, false);
    if (location.hash) SyncedTimeOut(onhashchange, Timeout.onInit);

})();

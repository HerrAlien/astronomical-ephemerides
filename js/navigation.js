(function() {

var navigationLinks = {};
var lastVisited = false;

(function(){

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
            var linkFixture = menuLink.firstElementChild;
            var linkData = { 'link' : linkFixture };

            // go through class list ...
            var classList = linkFixture.classList;
            for (var classIndex = 0; classIndex < classList.length; classIndex++) {
                var currentClass = classList[classIndex];
                if (IsNormalBackground(currentClass)) {
                    linkData['normalBackground'] = currentClass;
                    linkData['activeBackground'] = GetActiveBackground(currentClass);
                }
            }

            var linkDataObject = navigationLinks[pageTitle] || { };
            linkDataObject[target] = linkData;
            navigationLinks[pageTitle] = linkDataObject;
        }
    }

    var promotedMenuLinks = document.getElementsByClassName("promotedMenuLink");
    ProcessLinksFor (promotedMenuLinks, 'promotedMenu');

    var mainMenuListItems = document.getElementsByClassName("menuListItem");
    var menuPageLinks = new Array(mainMenuListItems.length);
    for (var i = 0; i < menuPageLinks.length; i++) {
        menuPageLinks[i] = mainMenuListItems[i].firstElementChild;
    }
    ProcessLinksFor (menuPageLinks, 'menuPage');

})();


function SetColorLinkDataObject (linkDataObject) {
    if (linkDataObject) {
        linkDataObject['link'].classList.add(linkDataObject['activeBackground']);
        linkDataObject['link'].classList.remove(linkDataObject['normalBackground']);
    }
}

function SetNormalLinkDataObject (linkDataObject) {
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

function DisplayPage (pageName) {
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
    while(list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }
    var rankedPages = PageRank.rank(pageName.split(" "));
    for (var i = 0; i < rankedPages.length; i++) {
        var li = PlanetPage.prototype["addNodeChild"](list, "li");
        var anchor = PlanetPage.prototype["addNodeChild"](li, "a", rankedPages[i]);
        anchor.setAttribute ("href", "#" + rankedPages[i]);
    }
}

function onhashchange(){
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

        if (previousPage){
            DisplayPage (pageName);
        } else {
            error404 (pageName);
            window.location.href = "#Search results";
        }
    }
}

window.addEventListener("hashchange", onhashchange, false);
if (location.hash) SyncedTimeOut(onhashchange, Timeout.onInit);

})();
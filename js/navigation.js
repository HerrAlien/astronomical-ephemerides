(function() {

var navigationLinks = {};

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
    for (var curentPageName in navigationLinks) {
        var linksForPage = navigationLinks[pageName];
        if (linksForPage) {
            if (pageName == curentPageName) {
                SetColorLinkDataObject(linksForPage['promotedMenu']);
                SetColorLinkDataObject(linksForPage['menuPage']);
            } else {
                SetNormalLinkDataObject(linksForPage['promotedMenu']);
                SetNormalLinkDataObject(linksForPage['menuPage']);
            }
        }
    }
}

function DisplayPage (pageName) {
    var delayedDisplay = function () {
        try {
            Pages[pageName].displayPage();
            ColorLinkOfPage(pageName);
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

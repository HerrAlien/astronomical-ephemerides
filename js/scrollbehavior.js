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

(function () {
    var sourceMenu = $get("navigation");
    var oldScrollTop = 0;

    window.addEventListener("scroll", function () {
        var scrolledTop = document.body.scrollTop || (document.body.getBoundingClientRect().y * -1);
        var scrolled = scrolledTop >= 20;
        var pageObj = false;
        if (previousPage) {
            pageObj = Pages[previousPage.id];
            if (pageObj && pageObj.header) {
                if (scrolled) {
                    pageObj.header.classList.add("fixed");
                } else {
                    pageObj.header.classList.remove("fixed");
                }
            }
        }

        if (scrolled) {
            sourceMenu.classList.add("withDropShadow");
        } else {
            sourceMenu.classList.remove("withDropShadow");
        }

        var hysterezis = 15;
        // is it on a small screen?
        if (pageObj && pageObj.header) {
            if (scrolledTop > oldScrollTop + hysterezis && scrolledTop > 180) {
                // scrolled down
                sourceMenu.classList.add("movedMenu");
                pageObj.header.classList.add("movedMenu");
            } else if (scrolledTop < oldScrollTop - hysterezis || scrolledTop < 180) {
                // scrolled up
                sourceMenu.classList.remove("movedMenu");
                pageObj.header.classList.remove("movedMenu");
            }

            oldScrollTop = scrolledTop;
        }
    });

    $get("showNavigationMenu").onclick = function () {
        var pageObj = Pages[previousPage.id];
        sourceMenu.classList.remove("movedMenu");
        if (pageObj && pageObj.header) {
            pageObj.header.classList.remove("movedMenu");
        }
    }
})();

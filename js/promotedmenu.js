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
    var menu = $get("promotedMenu");
    function toggleArrows() {
        if (menu.scrollLeft < 30) {
            menu.classList.add("noLeft");
        } else {
            menu.classList.remove("noLeft");
        }

        var rightLimit = menu.scrollWidth - menu.clientWidth - 30;
        if (menu.scrollLeft > rightLimit) {
            menu.classList.add("noRight");
        } else {
            menu.classList.remove("noRight");
        }
    }

    menu.addEventListener("scroll", function () { requestAnimationFrame(toggleArrows); }, false);
    toggleArrows();

})();


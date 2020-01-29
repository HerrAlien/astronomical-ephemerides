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
    var searchFormInput = document.getElementById("searchTerms");
    var button = document.getElementById("searchButton");
    var menu = document.getElementById("promotedMenu");

    var search = function () {
        if (searchFormInput.value.length > 0) {
            window.location.href = "#" + searchFormInput.value;
        }
    }

    searchFormInput.onblur = function () {
        button.classList.add("visible");
        button.classList.remove("hidden");
        menu.classList.remove("searchTermsVisible");
        searchFormInput.classList.remove("visible");
        searchFormInput.classList.add("hidden");
    };

    button.onclick = function () {
        button.classList.add("hidden");
        button.classList.remove("visible");

        searchFormInput.classList.remove("hidden");
        searchFormInput.classList.add("visible");
        searchFormInput.value = "";
        searchFormInput.focus();
        menu.classList.add("searchTermsVisible");
    }

    searchFormInput.onkeydown = function (evt) {
        if (evt.key == "Enter") {
            searchFormInput.onblur();
            search();
        }
    }


})();

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

(function() {

function PhysicalPositionalToggler (pageId, firstPhysicalColumnIndex) {
    var pageElement = document.getElementById(pageId);
    this.table = pageElement.getElementsByClassName("planetTable")[0];
    this.cellsToHide_physical = false;
    this.cellsToHide_positional = false;
    
    this.positionalButton = pageElement.getElementsByClassName("positionalButton")[0];
    this.physicalButton = pageElement.getElementsByClassName("physicalButton")[0];
    if (typeof firstPhysicalColumnIndex == 'undefined')
        this.firstPhysicalColumnIndex = 16;
    else
        this.firstPhysicalColumnIndex = firstPhysicalColumnIndex;
}

PhysicalPositionalToggler.prototype['updateCellsToHide'] = function () {
    return [];
}

PhysicalPositionalToggler.prototype['init'] = function () {
    var _this = this;

    this.positionalButton.onclick = function () {
        _this.positionalButton.classList.add("activeButton");
        _this.physicalButton.classList.remove("activeButton");
        _this.table.classList.remove ("showPhysical");
        _this.table.classList.add ("showPositional");
        if (!_this.cellsToHide_physical)
            _this.updateCellsToHide();
            
        for (var i = 0; i < _this.cellsToHide_physical.length; i++) {
            _this.cellsToHide_physical[i].classList.remove("physPosVisible");
            _this.cellsToHide_physical[i].classList.add("physPosHidden");
        }
            
        for (var i = 0; i < _this.cellsToHide_positional.length; i++) {
            _this.cellsToHide_positional[i].classList.remove("physPosHidden");
            _this.cellsToHide_positional[i].classList.add("physPosVisible");
        }
    }
 
    this.physicalButton.onclick = function () {
        _this.physicalButton.classList.add("activeButton");
        _this.positionalButton.classList.remove("activeButton");

        _this.table.classList.remove ("showPositional");
        _this.table.classList.add ("showPhysical");
        if (!_this.cellsToHide_physical)
            _this.updateCellsToHide();

         for (var i = 0; i < _this.cellsToHide_physical.length; i++) {
             _this.cellsToHide_physical[i].classList.remove("physPosHidden");  
             _this.cellsToHide_physical[i].classList.add("physPosVisible");
         }
             
         for (var i = 0; i < _this.cellsToHide_positional.length; i++) {
             _this.cellsToHide_positional[i].classList.remove("physPosVisible");
             _this.cellsToHide_positional[i].classList.add("physPosHidden");
         }
     }
 }

var jupiterToggler = new PhysicalPositionalToggler("Jupiter Ephemeris");
jupiterToggler.init();

var marsToggler = new PhysicalPositionalToggler("Mars Ephemeris");
marsToggler.init();
})();    
                

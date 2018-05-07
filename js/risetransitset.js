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

    function Transit (JD, functionToGetRADEC, epsilonInDays) {
    
        var jd = JD;
        var previousJd = jd;
        var radec = functionToGetRADEC(jd);
        jd =  GetAAJS().Date.LST2NextJD(radec.X, JD, Location.longitude);
        if (jd - JD > 1)
            jd -= 1;
        
        while (Math.abs(previousJd - jd) > epsilonInDays)
        {
            previousJd = jd;
            radec = functionToGetRADEC(jd);
            jd =  GetAAJS().Date.LST2NextJD(radec.X, JD, Location.longitude);
            if (jd - JD > 1)
                jd -= 1;
        }
        
        return jd;
    }

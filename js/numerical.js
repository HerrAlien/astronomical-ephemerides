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

var FunctionFitting = {
    PolynomialLSF : function (values, args, polynomialDegree) {
        var X = [];
        for (var i = 0; i < args.length; i++)
            X[i] = [];
        
        for (var argIndex = 0; argIndex < args.length; argIndex++) {
            for (var degree = 0; degree <= polynomialDegree; degree++ ) {
                X[argIndex][degree] = Math.pow(args[argIndex], degree);
            }
        }
        
        var X_t = Matrix.transpose(X);
        
        var multipliedTransposeWithSelf = Matrix.multiply (X_t, X);
        var reversedMatrix = Matrix.inverse (multipliedTransposeWithSelf);
        var reversedMultipliedWTrannspose = Matrix.multiply(reversedMatrix, X_t);
        
        var valuesColumnMatrix = [];
        for (var i = 0; i < values.length; i++) {
            valuesColumnMatrix[i] = [];
            valuesColumnMatrix[i][0] = values[i];
        }
        
        var coeffColumn = Matrix.multiply (reversedMultipliedWTrannspose, valuesColumnMatrix);
        var res = [];
        for (var i = 0; i < coeffColumn.length; i++)
            res[i] = coeffColumn[i][0];
        
        return res;
    },
    
    Taylor_ForwardDiff : function (ValuesArray) {
        var coefficients = [];
        if (ValuesArray.length >= 4) {
        
            coefficients[0] = ValuesArray[0];
            coefficients[1] = ValuesArray[1] - ValuesArray[0];
            coefficients[2] = ValuesArray[2] - 2 * ValuesArray[1] + ValuesArray[0];
            coefficients[3] = ValuesArray[3] - 3 * ValuesArray[2] + 3 * ValuesArray[1] - ValuesArray[0];

            coefficients[2] /= 2;
            coefficients[3] /= 6;

        }
        
        return coefficients;
    },
            
    Taylor_BackwardDiff : function (ValuesArray) {
        var coefficients = [];
        if (ValuesArray.length >= 4) {
        
            coefficients[0] = ValuesArray[3];
            coefficients[1] = ValuesArray[3] - ValuesArray[2];
            coefficients[2] = ValuesArray[3] - 2 * ValuesArray[2] + ValuesArray[1];
            coefficients[3] = ValuesArray[3] - 3 * ValuesArray[2] + 3 * ValuesArray[1] - ValuesArray[0];

            coefficients[2] /= 2;
            coefficients[3] /= 6;

        }
        
        return coefficients;
    },
            
    Taylor_Average : function (ValuesArray) {
    
        var forwardValues = ValuesArray.slice (3, 7);
        var backwardValues = ValuesArray.slice (0, 4);
    
        var forwards = FunctionFitting.Taylor_ForwardDiff(forwardValues);
        var backwards = FunctionFitting.Taylor_BackwardDiff (backwardValues);

        return [ 0.5 * (backwards[0] + forwards[0]),
                 0.5 * (backwards[1] + forwards[1]),
                 0.5 * (backwards[2] + forwards[2]),
                 0.5 * (backwards[3] + forwards[3])];
    }

};

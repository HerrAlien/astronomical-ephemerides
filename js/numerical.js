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
    PolynomialLSF: function (values, args, polynomialDegree) {
        this.ComputeInputMatrixFinalForm = function (args) {
            var X = [];
            for (var i = 0; i < args.length; i++)
                X[i] = [];

            for (var argIndex = 0; argIndex < args.length; argIndex++) {
                for (var degree = 0; degree <= polynomialDegree; degree++) {
                    X[argIndex][degree] = Math.pow(args[argIndex], degree);
                }
            }

            var X_t = Matrix.transpose(X);

            var multipliedTransposeWithSelf = Matrix.multiply(X_t, X);
            var reversedMatrix = Matrix.inverse(multipliedTransposeWithSelf);
            return Matrix.multiply(reversedMatrix, X_t);
        }

        var reversedMultipliedWTrannspose = this.ComputeInputMatrixFinalForm(args);

        this.ComputePolynomialCoeffs = function (reversedMultipliedWTrannspose, values) {

            var valuesColumnMatrix = [];
            for (var i = 0; i < values.length; i++) {
                valuesColumnMatrix[i] = [];
                valuesColumnMatrix[i][0] = values[i];
            }

            var coeffColumn = Matrix.multiply(reversedMultipliedWTrannspose, valuesColumnMatrix);
            var res = [];
            for (var i = 0; i < coeffColumn.length; i++)
                res[i] = coeffColumn[i][0];

            return res;
        }

        return this.ComputePolynomialCoeffs(reversedMultipliedWTrannspose, values);
    },

    Taylor_ForwardDiff: function (ValuesArray) {
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

    Taylor_BackwardDiff: function (ValuesArray) {
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

    Taylor_Average: function (ValuesArray) {

        var forwardValues = ValuesArray.slice(3, 7);
        var backwardValues = ValuesArray.slice(0, 4);

        var forwards = FunctionFitting.Taylor_ForwardDiff(forwardValues);
        var backwards = FunctionFitting.Taylor_BackwardDiff(backwardValues);

        return [0.5 * (backwards[0] + forwards[0]),
                 0.5 * (backwards[1] + forwards[1]),
                 0.5 * (backwards[2] + forwards[2]),
                 0.5 * (backwards[3] + forwards[3])];
    }

};

function QuadraticEquation(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;

    this.delta = this.b * this.b - 4 * this.a * this.c;
    var hasRealSolutions = this.delta > 0;

    this.x1 = { "real": NaN, "imaginary": NaN };
    this.x2 = { "real": NaN, "imaginary": NaN };

    var inverted2A = 1 / (2 * this.a);
    var realPart = -this.b * inverted2A;
    this.x1.real = realPart;
    this.x2.real = realPart;

    var absDelta = Math.abs(this.delta);
    var potentiallyImaginaryPart = Math.sqrt(absDelta) * inverted2A;

    if (hasRealSolutions) {
        this.x1.imaginary = 0;
        this.x2.imaginary = 0;
        this.x1.real -= potentiallyImaginaryPart;
        this.x2.real += potentiallyImaginaryPart;
    } else {
        this.x1.imaginary = -potentiallyImaginaryPart;
        this.x2.imaginary = potentiallyImaginaryPart;
    }
}

function DistanceDFromEqCoordinates (rah1, ded1, rah2, ded2) {
        var degra = Math.PI / 180;
        var rar1 = rah1 * 15 * degra;
        var der1 = ded1 * degra;

        var rar2 = rah2 * 15 * degra;
        var der2 = ded2 * degra;

        var dist = Math.acos(Math.sin(der1) * Math.sin(der2) +
                   Math.cos(der1) * Math.cos(der2) * Math.cos(rar1 - rar2));
        dist /= degra;
        return dist;

}

function PositionAngleDFromEqCoordinates (centerRah, centerDed, targetRah, targetDed) {
    var degra = Math.PI / 180;

    var dRaDeg = 15 * (targetRah - centerRah);
    if (dRaDeg > 180) {
        dRaDeg -= 360;
    } else if (dRaDeg < -180) {
        dRaDeg += 360;
    }

    var centerDeR = centerDed * degra;
    var targetDeR = targetDed * degra;

    var dRaR = dRaDeg * degra;
    var dx = Math.cos(centerDeR) * Math.tan(targetDeR) - Math.sin(centerDeR) * Math.cos(dRaR);
    var dy = Math.sin(dRaR);
    var PA = Math.atan2(dy, dx) / degra;
    if (PA < 0)
        PA += 360;
    return PA;
}

function ContactDetails (fixedObj, mobileObj, targetDistance, initialTime, timeAccuracy) {

    var t = initialTime;
    if (!timeAccuracy) {
        timeAccuracy = 1 / (24 * 3600);
    }

    var lastT = t - 0.5/24;

    var fixedObjData = fixedObj.getDataAsObjectForJD (lastT, false, false, true);
    var mobileObjData = mobileObj.getDataAsObjectForJD (lastT, false, false, true);

    var lastDistanceFromCenter = DistanceDFromEqCoordinates (fixedObjData.RaTopo, fixedObjData.DecTopo, 
                                                            mobileObjData.RaTopo, mobileObjData.DecTopo);


    for (var i = 0; i < 100 && Math.abs(lastT - t) > timeAccuracy && Math.abs(t - initialTime) < 1; i++) {
        
        fixedObjData = fixedObj.getDataAsObjectForJD (t, false, false, true);
        mobileObjData = mobileObj.getDataAsObjectForJD (t, false, false, true);

        var distanceFromCenter = DistanceDFromEqCoordinates (fixedObjData.RaTopo, fixedObjData.DecTopo, 
                                                            mobileObjData.RaTopo, mobileObjData.DecTopo);
        var derivative = (distanceFromCenter - lastDistanceFromCenter) / (t - lastT);

        lastT = t;
        lastDistanceFromCenter = distanceFromCenter;
        t -= (distanceFromCenter - targetDistance) / derivative;
    }

    if (Math.abs(t - initialTime) >= 1 || i == 100) {
        return false;
    }

    var fixedObjRa = fixedObjData.RaTopo ? fixedObjData.RaTopo : fixedObjData.RA;
    var fixedObjDec = fixedObjData.DecTopo ? fixedObjData.DecTopo : fixedObjData.Dec;
    var mobileObjRa =  mobileObjData.RaTopo ?  mobileObjData.RaTopo :  mobileObjData.RA;
    var mobileObjDec = mobileObjData.DecTopo ? mobileObjData.DecTopo : mobileObjData.Dec;

    return {t: t, PA: PositionAngleDFromEqCoordinates(fixedObjRa, fixedObjDec, mobileObjRa, mobileObjDec)};
}

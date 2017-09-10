

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
    }
};

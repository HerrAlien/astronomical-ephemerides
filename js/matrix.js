var Matrix = {
    multiply : function (m_xy, m_yz) {
        // result is a matrix xz
        if (m_xy[0].length != m_yz.length)
            throw "First matrix has " + m_xy[0].length + " columns, second one has " + m_yz.length + " rows!";
        
        var result = new Array(m_xy.length);
        for (var i = 0; i < result.length; i++)
            result[i] = [];
        
        for (var rowIndex = 0; rowIndex < m_xy.length; rowIndex++) {
            var row = m_xy[rowIndex];
            for (var colIndex = 0; colIndex < m_yz[0].length; colIndex++){
                result[rowIndex][colIndex] = 0;
                for (var i = 0; i < row.length; i++)
                    result[rowIndex][colIndex] += row[i] * m_yz[i][colIndex];
            }
        }
        
        return result;
    },
    
    transpose : function (matrix) {
        var transposed = [];
        for (var i = 0; i < matrix[0].length; i++)
            transposed[i] = [];
        
        for (var oldMatrixRowIndex = 0; oldMatrixRowIndex < matrix.length; oldMatrixRowIndex++) {
            for (var oldMatrixColIndex = 0; oldMatrixColIndex < matrix[0].length; oldMatrixColIndex++) {
                transposed[oldMatrixColIndex][oldMatrixRowIndex] = matrix[oldMatrixRowIndex][oldMatrixColIndex];
            }        
        }
        return transposed;
    },
    
    swapRows : function (matrix, rowIndex1, rowIndex2) {
        var tmp = matrix[rowIndex1];
        matrix[rowIndex1] = matrix[rowIndex2];
        matrix[rowIndex2] = tmp;
        return matrix;
    },
    
    appendUnitMatrix : function (targetMatrix) {
        var rowsCount = targetMatrix.length;
        var colsCount = targetMatrix[0].length;
        for (var rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
            for (var colIndex = 0; colIndex < colsCount; colIndex++) {
                var appendedValue = 0;
                if (colIndex == rowIndex)
                    appendedValue = 1;
                
                targetMatrix[rowIndex].push(appendedValue);
            }
        }
    },
    
    accumulateMultipliedRow : function (targetMatrix, destinationRow, rowToAdd, factor) {
        for (var i = 0; i < targetMatrix[destinationRow].length; i++)
            targetMatrix[destinationRow][i] += targetMatrix[rowToAdd][i] * factor;
    },
    
    scaleRow : function (targetMatrix, rowIndex, factor) {
        for (var i = 0; i < targetMatrix[rowIndex].length; i++)
            targetMatrix[rowIndex][i] *= factor;
    },
    
    inverse : function (matrix) {
        if (matrix.length != matrix[0].length)
            throw "Not a square matrix; has " + matrix.length + " rows and " + matrix[0].length + " columns!";
        
        
        
        
        
        
    },
        
};

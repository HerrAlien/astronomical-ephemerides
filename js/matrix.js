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
        
        var tmpMatrix = [];
        for (var i = 0; i < matrix.length; i++) {
            tmpMatrix[i] = new Array (matrix[0].length);
            for (var j = 0; j < matrix[0].length; j++)
                tmpMatrix[i][j] = matrix[i][j];
        }
                
        // append the unit matrix
        Matrix.appendUnitMatrix (tmpMatrix);
        // then for each column, from 0 to the old max. col:
        for (var colIndex = 0; colIndex < matrix[0].length; colIndex++) {
            // - get the row with the largest value on that column.
            var deservingRowIndex = colIndex;
            for (var searchingRowIndex = deservingRowIndex; searchingRowIndex < tmpMatrix.length; searchingRowIndex++) {
                if (tmpMatrix[searchingRowIndex][colIndex] > tmpMatrix[deservingRowIndex][colIndex])
                    deservingRowIndex = searchingRowIndex;
            }
            // - swap it with the row that is placed at row index = current column index
            Matrix.swapRows(tmpMatrix, deservingRowIndex, colIndex);
            // - accumulate it to all the other rows, to reduce that row's column position to 0
            var scaleFactor = 1/tmpMatrix[colIndex][colIndex];
            if (tmpMatrix[colIndex][colIndex] == 0)
                scaleFactor = 1/(1e-14 + tmpMatrix[colIndex][colIndex]);
            
            for (var accumulateRowIndex = 0; accumulateRowIndex < tmpMatrix.length; accumulateRowIndex++) {
                if (accumulateRowIndex == colIndex)
                    continue;
                Matrix.accumulateMultipliedRow(tmpMatrix, accumulateRowIndex, colIndex, -(tmpMatrix[accumulateRowIndex][colIndex] * scaleFactor));
            }
            // - scale the row down, so that the position at current column index is 1.
            Matrix.scaleRow (tmpMatrix, colIndex, scaleFactor);
        }
        
        var result = new Array (matrix.length);
        for (var i = 0; i < result.length; i++)
            result[i] = new Array(matrix.length);
        
        for (var i = 0; i < matrix.length; i++)
            for (var j = 0; j < matrix.length; j++)
                result[i][j] = tmpMatrix[i][j+matrix.length];
        
        return result;
    },
    
    areEqual : function (m1, m2, eps) {
        if (m1.length != m2.length)
            return false;
        if (m1[0].length != m2[0].length)
            return false;
        for (var i = 0; i < m1.length; i++) {
            for (var j = 0; j < m1[i].length; j++)
                if (!m2[i][j] || Math.abs(m1[i][j] - m2[i][j]) > eps)
                    return false;
        }
        return true;
    }
        
};

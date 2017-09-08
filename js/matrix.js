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
    }
    
};

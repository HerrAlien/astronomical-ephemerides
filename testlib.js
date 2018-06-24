var testlib = {
    
        logTest: function  (test, passed)
        {
            var paragraph = document.createElement("p");
           if (passed)
           {
                paragraph.style.color = "green";
                paragraph.innerHTML = test.name + " passed.";
            }
            else
             {
                paragraph.style.color = "red";
                paragraph.innerHTML = test.name + " failed. Expected " + JSON.stringify(test.expectedOutput) + ", got instead " + JSON.stringify(test.actualOutput);
            }
            document.body.appendChild (paragraph);
        },
        
        doubleEq: function  (a, b, eps)
        {
            return Math.abs(a - b) <= eps;
        },
        
        doubleEqArr: function  (a, b, eps)
        {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; i++)
                if (!this.doubleEq(a[i], b[i], eps))
                    return false;
            return true;
        },
        
        doubleEqObj : function (a, b, eps) {
            if (typeof a != typeof b)
                return false;
            
            if (typeof a === 'String')
                return a == b;
            
            if (typeof a != 'Aray' && typeof a != 'object')
                return this.doubleEq(a, b, eps);
            
            for (var key in a) {
                var typeof_b_key = typeof b[key];
                if (typeof_b_key === 'undefined')
                    return false;
                if (ttypeof_b_key != typeof a[key])
                    return false;
                if (typeof_b_key === 'object') {
                    var keyAsObjs = this.doubleEqObj(a[key], b[key], eps);
                    if (!keyAsObjs)
                        return false;
                }
                if (typeof_b_key === 'Array') {
                    var keyAsArrays = this.doubleEqArr(a[key], b[key], eps);
                    if (!keyAsArrays)
                        return false;
                }
            }
            
            return true;
        },
        
        runTests : function (tests)
        {
            var i = 0; 
            for (i = 0; i < tests.length; i++)
            {
                var currentTest = tests[i];
                var testPassed = false;
                try { 
                testPassed = currentTest.test(); 
                } catch (e){currentTest.actualOutput += " : " + e;}
                testlib.logTest(currentTest, testPassed);
            }
        }
};
var testlib = testlib || {
    
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
        
        runTests : function (tests)
        {
            var i = 0; 
            for (i = 0; i < tests.length; i++)
            {
                var currentTest = tests[i];
                var testPassed = false;
                try { 
                testPassed = currentTest.test(); 
                } catch (e){currentTest.actualOutput += " : " + e.message;}
                testlib.logTest(currentTest, testPassed);
            }
        }
};
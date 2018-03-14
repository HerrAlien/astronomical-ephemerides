(function(){
    var searchFormInput = document.getElementById("searchTerms"); 
    var button = document.getElementById("searchButton");

    var search = function () {
        if (searchFormInput.value.length > 0) {
            window.location.href = "#" + searchFormInput.value;
        }
    }

    button.onclick = function() {
        if (searchFormInput.classList.contains("hidden")) {
            searchFormInput.classList.remove("hidden");
            searchFormInput.classList.add("visible");
            searchFormInput.value = "";
            searchFormInput.focus();
        } else {
            searchFormInput.classList.remove("visible");
            searchFormInput.classList.add("hidden");
            search();
        }
    }

    searchFormInput.onkeydown = function (evt) {
      if (evt.key == "Enter") {
          button.onclick();
      }
    }

})();

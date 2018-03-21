(function(){
    var searchFormInput = document.getElementById("searchTerms"); 
    var button = document.getElementById("searchButton");
    var menu = document.getElementById("promotedMenu");

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
            menu.classList.add("searchTermsVisible");
        } else {
            searchFormInput.classList.remove("visible");
            searchFormInput.classList.add("hidden");
            menu.classList.remove("searchTermsVisible");
            search();
        }
    }

    searchFormInput.onkeydown = function (evt) {
      if (evt.key == "Enter") {
          button.onclick();
      }
    }

})();

(function(){
    var searchFormInput = document.getElementById("searchTerms"); 
    var button = document.getElementById("searchButton");
    var menu = document.getElementById("promotedMenu");

    var search = function () {
        if (searchFormInput.value.length > 0) {
            window.location.href = "#" + searchFormInput.value;
        }
    }

    searchFormInput.onblur = function() {
            button.classList.add("visible");
            button.classList.remove("hidden");
            menu.classList.remove("searchTermsVisible");
            searchFormInput.classList.remove("visible");
            searchFormInput.classList.add("hidden");
    };

    button.onclick = function() {
        button.classList.add("hidden");
        button.classList.remove("visible");

            searchFormInput.classList.remove("hidden");
            searchFormInput.classList.add("visible");
            searchFormInput.value = "";
            searchFormInput.focus();
            menu.classList.add("searchTermsVisible");
    }

    searchFormInput.onkeydown = function (evt) {
      if (evt.key == "Enter") {
          searchFormInput.onblur();
          search();
      }
    }


})();

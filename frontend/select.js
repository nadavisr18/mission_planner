function styleSelections(){
    var x, i, j, l, ll, selElmnt, a, b, c;

    /* Look for any elements with the class "selection-div": */
    x = document.getElementsByClassName("selection-div");
    l = x.length;

    for (i = 0; i < l; i++) {
        /* Propagate the input class to the children */
        var inputClass = "";
        if (x[i].classList.contains("waypoint-input")) inputClass = "waypoint-input";

        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;

        /* For each element, create a new DIV that will act as the selected item: */
        a = document.createElement("DIV");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;

        if (inputClass != ""){
          a.classList.add(inputClass);
        }
        a.classList.add("select-selected");
        a.setAttribute("id", x[i].id + "-selected")
        x[i].appendChild(a);

        /* For each element, create a new DIV that will contain the option list: */
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {

            /* For each option in the original select element,
            create a new DIV that will act as an option item: */
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {

                /* When an item is clicked, update the original select box,
                and the selected item: */
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                  if (s.options[i].innerHTML == this.innerHTML) {
                      s.selectedIndex = i;
                      h.innerHTML = this.innerHTML;
                      y = this.parentNode.getElementsByClassName("same-as-selected");
                      yl = y.length;
                      for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                      }
                      this.setAttribute("class", "same-as-selected");
                      selectionCallback(this.parentNode.parentNode.id, i);
                      break;
                  }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function(e) {
            /* When the select box is clicked, close any other select boxes,
            and open/close the current select box: */
            e.stopPropagation();
            if (this.classList.contains("greyed")) return;
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

function unstyleSelections()
{
  var x, i, j, l, ll, selElmnt, a, b, c;

  x = document.getElementsByClassName("same-as-selected");
  l = x.length;
  while (x.length > 0){
    x[0].remove();
  }

  x = document.getElementsByClassName("select-items");
  l = x.length;
  while (x.length > 0){
    x[0].remove();
  }

  /* Look for any elements with the class "select-selected": */
  x = document.getElementsByClassName("select-selected");
  l = x.length;
  while (x.length > 0){
    x[0].remove();
  }
  
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);

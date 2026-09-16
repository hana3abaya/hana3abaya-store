(function () {
  "use strict";

  function render() {
    var q = document.getElementById("q").value;
    var category = document.getElementById("category").value;
    var sort = document.getElementById("sort").value;
    var list = Hana.filterSortProducts({ q: q, category: category, sort: sort });
    var grid = document.getElementById("shop-grid");
    var empty = document.getElementById("shop-empty");
    var meta = document.getElementById("results-meta");

    meta.textContent =
      list.length === 0
        ? "لا نتائج"
        : "عرض " + list.length.toLocaleString("ar-EG") + " منتج";

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = list.map(Hana.productCardHtml).join("");
    Hana.bindProductImages(grid);
  }

  function fillCategories() {
    var sel = document.getElementById("category");
    Hana.categories().forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  }

  function applyUrlParams() {
    var params = new URLSearchParams(location.search);
    if (params.has("q")) document.getElementById("q").value = params.get("q");
    if (params.has("category")) {
      var c = params.get("category");
      var sel = document.getElementById("category");
      if ([].some.call(sel.options, function (o) { return o.value === c; })) {
        sel.value = c;
      }
    }
    if (params.has("sort")) document.getElementById("sort").value = params.get("sort");
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCategories();
    applyUrlParams();
    var form = document.getElementById("shop-filters");
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    render();
  });
})();

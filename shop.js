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
    var tabs = document.getElementById("category-tabs");
    var categories = Hana.categories();
    categories.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
    if (tabs) {
      var labels = [{ value: "all", label: "كل القطع" }].concat(
        categories.map(function (c) { return { value: c, label: c }; })
      );
      tabs.innerHTML = labels.map(function (item, index) {
        return '<button type="button" class="category-tab' + (index === 0 ? ' is-active' : '') +
          '" data-category="' + Hana.escapeHtml(item.value) + '">' +
          Hana.escapeHtml(item.label) + '</button>';
      }).join("");
    }
  }

  function syncTabs() {
    var value = document.getElementById("category").value;
    var tabs = document.querySelectorAll("[data-category]");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("is-active", tabs[i].getAttribute("data-category") === value);
    }
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
    form.addEventListener("input", function () { syncTabs(); render(); });
    form.addEventListener("change", function () { syncTabs(); render(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    var tabs = document.getElementById("category-tabs");
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        var button = e.target.closest("[data-category]");
        if (!button) return;
        document.getElementById("category").value = button.getAttribute("data-category");
        syncTabs();
        render();
      });
    }
    syncTabs();
    render();
  });
})();

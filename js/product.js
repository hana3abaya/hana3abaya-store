(function () {
  "use strict";

  function getId() {
    var params = new URLSearchParams(location.search);
    return (params.get("id") || "").trim().toUpperCase();
  }

  function specRow(label, value) {
    if (!value || !String(value).trim()) return "";
    return (
      "<li><span>" +
      Hana.escapeHtml(label) +
      "</span><span>" +
      Hana.escapeHtml(value) +
      "</span></li>"
    );
  }

  function render() {
    var root = document.getElementById("product-root");
    var id = getId();
    var p = Hana.getProductById(id);

    if (!p) {
      root.innerHTML =
        '<div class="empty-state" style="margin:2rem 0">' +
        "<p>المنتج غير موجود.</p>" +
        '<p><a class="btn btn--soft" href="shop.html">العودة للمتجر</a></p>' +
        "</div>";
      document.title = "منتج غير موجود | هنا عباية";
      return;
    }

    var name = Hana.productName(p);
    var hasPrice = p.price != null && !isNaN(p.price);
    var hasCompare = hasPrice && p.compare_at && p.compare_at > p.price;
    var desc = (p.description || "").trim();
    var img = Hana.imagePath(p.id);
    var phone = (window.HANA_CONFIG.whatsapp || "201010000533").replace(/\D/g, "");
    var inquiry = "https://wa.me/" + phone + "?text=" + encodeURIComponent("أريد الاستفسار عن " + name + " (" + p.id + ")");

    document.title = name + " | هنا عباية";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        (desc || name) + (hasPrice ? " — " + Hana.formatPrice(p.price) : "") + " من هنا عباية."
      );
    }
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", name + " | هنا عباية");
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) {
      canon.setAttribute(
        "href",
        "https://hana3abaya.com/product.html?id=" + encodeURIComponent(p.id)
      );
    }

    root.innerHTML =
      '<nav class="breadcrumb" aria-label="مسار التنقل" style="padding-top:1.25rem">' +
      '<a href="index.html">الرئيسية</a> · <a href="shop.html">المتجر</a> · ' +
      Hana.escapeHtml(name) +
      "</nav>" +
      '<article class="product-detail">' +
      '<div class="product-gallery">' +
      '<img src="' +
      img +
      '" alt="' +
      Hana.escapeHtml(name) +
      '" width="600" height="800" data-product-img="' +
      p.id +
      '">' +
      "</div>" +
      '<div class="product-info">' +
      "<h1>" +
      Hana.escapeHtml(name) +
      "</h1>" +
      '<p class="product-meta">' +
      Hana.escapeHtml(p.id) +
      (p.category ? " · " + Hana.escapeHtml(p.category) : "") +
      (p.availability ? " · " + Hana.escapeHtml(p.availability) : "") +
      "</p>" +
      (hasPrice ? '<div class="product-price-row">' +
      '<span class="price">' +
      Hana.formatPrice(p.price) +
      "</span>" +
      (hasCompare
        ? '<span class="price price--was">' + Hana.formatPrice(p.compare_at) + "</span>"
        : "") +
      "</div>" : "") +
      (desc
        ? '<p class="product-desc">' + Hana.escapeHtml(desc) + "</p>"
        : "") +
      '<ul class="specs">' +
      specRow("المقاسات", p.sizes) +
      specRow("الألوان", p.colors) +
      specRow("الخامة", p.material) +
      specRow("العناية", p.care) +
      "</ul>" +
      (hasPrice ? '<div class="qty-row">' +
      '<label for="qty">الكمية</label>' +
      '<div class="qty-control">' +
      '<button type="button" id="qty-minus" aria-label="تقليل الكمية">−</button>' +
      '<input type="number" id="qty" min="1" value="1" aria-label="الكمية">' +
      '<button type="button" id="qty-plus" aria-label="زيادة الكمية">+</button>' +
      "</div></div>" +
      '<div class="product-actions">' +
      '<button type="button" class="btn" id="add-btn">أضف إلى السلة</button>' +
      '<a class="btn btn--soft" href="cart.html">عرض السلة</a>' +
      "</div>" : '<div class="product-actions"><a class="btn btn--inquiry" href="' + inquiry + '" target="_blank" rel="noopener">استفسار عبر واتساب</a></div>') +
      "</div></article>";

    Hana.bindProductImages(root);

    if (!hasPrice) return;

    var qtyInput = document.getElementById("qty");
    document.getElementById("qty-minus").addEventListener("click", function () {
      var v = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
      qtyInput.value = v;
    });
    document.getElementById("qty-plus").addEventListener("click", function () {
      var v = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + 1);
      qtyInput.value = v;
    });
    document.getElementById("add-btn").addEventListener("click", function () {
      var q = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      if (Hana.addToCart(p.id, q)) {
        var btn = document.getElementById("add-btn");
        btn.textContent = "تمت الإضافة ✓";
        btn.classList.add("is-added");
        setTimeout(function () {
          btn.textContent = "أضف إلى السلة";
          btn.classList.remove("is-added");
        }, 1400);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();

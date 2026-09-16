/* Hana 3abaya — shared helpers (RTL Arabic storefront) */
(function () {
  "use strict";

  var CFG = window.HANA_CONFIG || {};
  var DATA = window.HANA_DATA || { products: [] };
  var CURATED_ORDER = [
    "HN-048", "HN-047", "HN-046", "HN-045",
    "HN-044", "HN-043", "HN-042", "HN-041",
    "HN-040", "HN-039", "HN-038", "HN-037",
    "HN-036", "HN-035", "HN-034", "HN-033",
    "HN-032", "HN-031", "HN-030", "HN-029",
    "HN-028", "HN-027",
    "HN-025", "HN-024", "HN-011", "HN-013",
    "HN-018", "HN-005", "HN-006", "HN-020",
    "HN-010", "HN-021", "HN-003", "HN-004",
    "HN-009", "HN-012", "HN-019", "HN-001",
    "HN-014", "HN-017", "HN-016", "HN-015",
    "HN-008", "HN-007", "HN-002", "HN-022",
    "HN-023", "HN-026"
  ];
  var ORDER_INDEX = CURATED_ORDER.reduce(function (map, id, index) {
    map[id] = index;
    return map;
  }, {});

  function productName(p) {
    var n = (p && p.name || "").trim();
    if (n) return n;
    return "منتج " + (p && p.id ? p.id : "");
  }

  function whatsappName(p) {
    var n = (p && p.whatsapp_name || "").trim();
    if (n) return n;
    return productName(p);
  }

  function formatPrice(n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("ar-EG") + " " + (CFG.currencyLabel || "ج.م");
  }

  function getProducts() {
    return (DATA.products || []).slice();
  }

  function getProductById(id) {
    if (!id) return null;
    id = String(id).toUpperCase();
    var list = DATA.products || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function categories() {
    var set = {};
    var list = DATA.products || [];
    for (var i = 0; i < list.length; i++) {
      var c = (list[i].category || "").trim();
      if (c) set[c] = true;
    }
    return Object.keys(set).sort();
  }

  function imagePath(id) {
    return "images/products/" + id + ".jpg";
  }

  function placeholderSvg(id) {
    var label = id || "Hana";
    return (
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="' +
          label +
          '">' +
          '<rect width="600" height="800" fill="#f3efe8"/>' +
          '<rect x="40" y="40" width="520" height="720" rx="16" fill="none" stroke="#d4cfc4" stroke-width="2"/>' +
          '<circle cx="300" cy="320" r="48" fill="none" stroke="#c8c0b4" stroke-width="2"/>' +
          '<path d="M220 480h160M250 520h100" stroke="#c8c0b4" stroke-width="2" stroke-linecap="round"/>' +
          '<text x="300" y="600" text-anchor="middle" fill="#9a9186" font-family="Tahoma,Arial,sans-serif" font-size="28">' +
          label +
          "</text>" +
          '<text x="300" y="640" text-anchor="middle" fill="#b5ada3" font-family="Tahoma,Arial,sans-serif" font-size="18">صورة قريباً</text>' +
          "</svg>"
      )
    );
  }

  function bindImageFallback(img, id) {
    if (!img) return;
    img.onerror = function () {
      img.onerror = null;
      img.src = placeholderSvg(id);
      img.classList.add("is-placeholder");
      img.alt = (img.alt || id) + " — صورة غير متوفرة";
    };
  }

  /* —— Cart (localStorage) —— */
  function readCart() {
    try {
      var raw = localStorage.getItem(CFG.cartKey || "hana3abaya_cart");
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CFG.cartKey || "hana3abaya_cart", JSON.stringify(items));
    updateCartBadge();
    try {
      window.dispatchEvent(new CustomEvent("hana:cart", { detail: items }));
    } catch (e) {}
  }

  function cartCount() {
    return readCart().reduce(function (s, it) {
      return s + (it.qty || 0);
    }, 0);
  }

  function addToCart(id, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var p = getProductById(id);
    if (!p) return false;
    var items = readCart();
    var found = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === p.id) {
        items[i].qty += qty;
        found = true;
        break;
      }
    }
    if (!found) {
      items.push({ id: p.id, qty: qty, price: p.price, name: productName(p) });
    }
    writeCart(items);
    return true;
  }

  function setQty(id, qty) {
    qty = parseInt(qty, 10) || 0;
    var items = readCart().filter(function (it) {
      if (it.id !== id) return true;
      if (qty <= 0) return false;
      it.qty = qty;
      return true;
    });
    writeCart(items);
  }

  function removeFromCart(id) {
    writeCart(
      readCart().filter(function (it) {
        return it.id !== id;
      })
    );
  }

  function clearCart() {
    writeCart([]);
  }

  function cartLines() {
    return readCart()
      .map(function (it) {
        var p = getProductById(it.id);
        if (!p) return null;
        return {
          id: p.id,
          qty: it.qty,
          price: p.price,
          name: productName(p),
          waName: whatsappName(p),
          product: p,
          lineTotal: p.price * it.qty
        };
      })
      .filter(Boolean);
  }

  function cartTotal() {
    return cartLines().reduce(function (s, l) {
      return s + l.lineTotal;
    }, 0);
  }

  function updateCartBadge() {
    var n = cartCount();
    var nodes = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = String(n);
      nodes[i].hidden = n === 0;
    }
  }

  function buildWhatsAppOrder(customer) {
    var lines = cartLines();
    var parts = [];
    parts.push("طلب جديد من متجر هناء عباية");
    parts.push("————————");
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      parts.push(
        (i + 1) +
          ") " +
          l.waName +
          " (" +
          l.id +
          ")" +
          "\nالكمية: " +
          l.qty +
          "\nالسعر: " +
          formatPrice(l.price) +
          "\nالإجمالي: " +
          formatPrice(l.lineTotal)
      );
    }
    parts.push("————————");
    parts.push("المجموع الكلي: " + formatPrice(cartTotal()));
    parts.push("طريقة الدفع: الدفع عند الاستلام");
    parts.push("————————");
    if (customer) {
      if (customer.name) parts.push("الاسم: " + customer.name);
      if (customer.phone) parts.push("الهاتف: " + customer.phone);
      if (customer.address) parts.push("العنوان: " + customer.address);
      if (customer.notes) parts.push("ملاحظات: " + customer.notes);
    }
    var text = parts.join("\n");
    var phone = (CFG.whatsapp || "201010000533").replace(/\D/g, "");
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
  }

  function productCardHtml(p) {
    var name = productName(p);
    var href = "product.html?id=" + encodeURIComponent(p.id);
    var hasPrice = p.price != null && !isNaN(p.price);
    var hasCompare = hasPrice && p.compare_at && p.compare_at > p.price;
    var img = imagePath(p.id);
    var phone = (CFG.whatsapp || "201010000533").replace(/\D/g, "");
    var inquiry = "https://wa.me/" + phone + "?text=" + encodeURIComponent("أريد الاستفسار عن " + name + " (" + p.id + ")");
    return (
      '<article class="product-card" data-id="' +
      p.id +
      '">' +
      '<a class="product-card__media" href="' +
      href +
      '" aria-label="' +
      escapeHtml(name) +
      '">' +
      '<img src="' +
      img +
      '" alt="' +
      escapeHtml(name) +
      '" loading="lazy" width="400" height="533" data-product-img="' +
      p.id +
      '">' +
      "</a>" +
      '<div class="product-card__body">' +
      (p.category
        ? '<span class="product-card__cat">' + escapeHtml(p.category) + "</span>"
        : "") +
      '<h3 class="product-card__title"><a href="' +
      href +
      '">' +
      escapeHtml(name) +
      "</a></h3>" +
      '<p class="product-card__sku">' +
      escapeHtml(p.id) +
      "</p>" +
      (hasPrice ? '<div class="product-card__price">' +
      '<span class="price">' +
      formatPrice(p.price) +
      "</span>" +
      (hasCompare
        ? '<span class="price price--was">' + formatPrice(p.compare_at) + "</span>"
        : "") +
      "</div>" : "") +
      (hasPrice ? '<button type="button" class="btn btn--soft btn--sm" data-add="' +
      p.id +
      '" aria-label="أضف ' +
      escapeHtml(name) +
      ' إلى السلة">أضف للسلة</button>' : '<a class="btn btn--sm btn--inquiry" href="' + inquiry + '" target="_blank" rel="noopener">استفسار واتساب</a>') +
      "</div></article>"
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindProductImages(root) {
    root = root || document;
    var imgs = root.querySelectorAll("[data-product-img]");
    for (var i = 0; i < imgs.length; i++) {
      bindImageFallback(imgs[i], imgs[i].getAttribute("data-product-img"));
    }
  }

  function bindAddButtons(root) {
    root = root || document;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn) return;
      var id = btn.getAttribute("data-add");
      if (addToCart(id, 1)) {
        btn.classList.add("is-added");
        var prev = btn.textContent;
        btn.textContent = "تمت الإضافة ✓";
        setTimeout(function () {
          btn.textContent = prev;
          btn.classList.remove("is-added");
        }, 1400);
      }
    });
  }

  function filterSortProducts(opts) {
    opts = opts || {};
    var list = getProducts();
    var q = (opts.q || "").trim().toLowerCase();
    var cat = (opts.category || "").trim();
    var sort = opts.sort || "default";

    if (cat && cat !== "all") {
      list = list.filter(function (p) {
        return (p.category || "") === cat;
      });
    }
    if (q) {
      list = list.filter(function (p) {
        var hay = (
          productName(p) +
          " " +
          (p.description || "") +
          " " +
          p.id +
          " " +
          (p.category || "")
        ).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }
    if (sort === "price-asc") {
      list.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (sort === "price-desc") {
      list.sort(function (a, b) {
        return b.price - a.price;
      });
    } else {
      list.sort(function (a, b) {
        var ai = Object.prototype.hasOwnProperty.call(ORDER_INDEX, a.id) ? ORDER_INDEX[a.id] : 9999;
        var bi = Object.prototype.hasOwnProperty.call(ORDER_INDEX, b.id) ? ORDER_INDEX[b.id] : 9999;
        return ai - bi || String(a.id).localeCompare(String(b.id));
      });
    }
    return list;
  }

  function setActiveNav() {
    var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!path || path === "") path = "index.html";
    var links = document.querySelectorAll("[data-nav]");
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  function initCommon() {
    updateCartBadge();
    setActiveNav();
    bindAddButtons(document);
    bindProductImages(document);
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
    var wa = document.querySelectorAll("[data-wa-display]");
    for (var i = 0; i < wa.length; i++) {
      wa[i].textContent = CFG.whatsappDisplay || "01010000533";
    }
    var waLinks = document.querySelectorAll("[data-wa-link]");
    var phone = (CFG.whatsapp || "201010000533").replace(/\D/g, "");
    for (var j = 0; j < waLinks.length; j++) {
      waLinks[j].href = "https://wa.me/" + phone;
    }
  }

  window.Hana = {
    CFG: CFG,
    productName: productName,
    whatsappName: whatsappName,
    formatPrice: formatPrice,
    getProducts: getProducts,
    getProductById: getProductById,
    categories: categories,
    imagePath: imagePath,
    placeholderSvg: placeholderSvg,
    bindImageFallback: bindImageFallback,
    bindProductImages: bindProductImages,
    productCardHtml: productCardHtml,
    filterSortProducts: filterSortProducts,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    readCart: readCart,
    cartLines: cartLines,
    cartTotal: cartTotal,
    cartCount: cartCount,
    updateCartBadge: updateCartBadge,
    buildWhatsAppOrder: buildWhatsAppOrder,
    escapeHtml: escapeHtml,
    initCommon: initCommon
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommon);
  } else {
    initCommon();
  }
})();

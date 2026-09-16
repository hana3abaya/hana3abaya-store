(function () {
  "use strict";

  function absoluteImageUrl(productId) {
    var base =
      (window.HANA_CONFIG && window.HANA_CONFIG.productImageBase) ||
      "https://hana3abaya.github.io/hana3abaya-store/images/products";
    return base.replace(/\/$/, "") + "/" + productId + ".jpg";
  }

  function setSubmitting(btn, on) {
    if (!btn) return;
    btn.disabled = !!on;
    btn.textContent = on ? "جاري تأكيد الطلب…" : "تأكيد الطلب";
  }

  function showFormError(msg) {
    var box = document.getElementById("checkout-error");
    if (!box) {
      alert(msg);
      return;
    }
    box.textContent = msg;
    box.hidden = !msg;
  }

  function render() {
    var root = document.getElementById("cart-layout");
    var lines = Hana.cartLines();

    if (!lines.length) {
      root.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1">' +
        "<p>سلتك فارغة حالياً.</p>" +
        '<p><a class="btn" href="shop.html">تصفّح المتجر</a></p>' +
        "</div>";
      return;
    }

    var itemsHtml = lines
      .map(function (l) {
        return (
          '<div class="cart-item" data-cart-id="' +
          l.id +
          '">' +
          '<a class="cart-item__img" href="product.html?id=' +
          encodeURIComponent(l.id) +
          '">' +
          '<img src="' +
          Hana.imagePath(l.id) +
          '" alt="' +
          Hana.escapeHtml(l.name) +
          '" data-product-img="' +
          l.id +
          '" width="72" height="96">' +
          "</a>" +
          "<div>" +
          '<h2 class="cart-item__title"><a href="product.html?id=' +
          encodeURIComponent(l.id) +
          '">' +
          Hana.escapeHtml(l.name) +
          "</a></h2>" +
          '<p class="cart-item__meta">' +
          Hana.escapeHtml(l.id) +
          " · " +
          Hana.formatPrice(l.price) +
          "</p>" +
          '<div class="cart-item__actions">' +
          '<div class="qty-control">' +
          '<button type="button" data-dec="' +
          l.id +
          '" aria-label="تقليل">−</button>' +
          '<input type="number" min="1" value="' +
          l.qty +
          '" data-qty="' +
          l.id +
          '" aria-label="كمية ' +
          Hana.escapeHtml(l.name) +
          '">' +
          '<button type="button" data-inc="' +
          l.id +
          '" aria-label="زيادة">+</button>' +
          "</div>" +
          '<button type="button" class="link-danger" data-remove="' +
          l.id +
          '">إزالة</button>' +
          "</div></div>" +
          '<div class="cart-item__line">' +
          Hana.formatPrice(l.lineTotal) +
          "</div></div>"
        );
      })
      .join("");

    root.innerHTML =
      '<section class="cart-panel" aria-labelledby="cart-heading">' +
      '<h1 id="cart-heading">سلة المشتريات</h1>' +
      '<div id="cart-items">' +
      itemsHtml +
      "</div>" +
      '<div class="cart-summary">' +
      "<span>المجموع</span>" +
      "<span>" +
      Hana.formatPrice(Hana.cartTotal()) +
      "</span></div>" +
      "</section>" +
      '<section class="checkout-panel" aria-labelledby="checkout-heading">' +
      '<h2 id="checkout-heading">إتمام الطلب</h2>' +
      '<p class="checkout-note">بعد تأكيد الطلب يُحفظ مباشرة لدى المتجر، وستصلكِ رسالة تأكيد على واتساب من فريق هناء عباية. طريقة الدفع: <strong>الدفع عند الاستلام</strong>. للدعم: <strong data-wa-display>01010000533</strong></p>' +
      '<form class="form-grid" id="checkout-form" novalidate>' +
      '<div class="field"><label for="name">الاسم الكامل *</label>' +
      '<input id="name" name="name" required autocomplete="name" placeholder="اسمك الثلاثي"></div>' +
      '<div class="field"><label for="phone">رقم الهاتف *</label>' +
      '<input id="phone" name="phone" type="tel" required autocomplete="tel" placeholder="01xxxxxxxxx" inputmode="tel"></div>' +
      '<div class="field"><label for="address">العنوان بالتفصيل *</label>' +
      '<textarea id="address" name="address" rows="3" required placeholder="المحافظة، المنطقة، الشارع، علامة مميزة"></textarea></div>' +
      '<div class="field"><label for="notes">ملاحظات (اختياري)</label>' +
      '<textarea id="notes" name="notes" rows="2" placeholder="مقاس، لون، أو أي ملاحظة"></textarea></div>' +
      '<p id="checkout-error" class="checkout-error" hidden role="alert"></p>' +
      '<div class="form-actions">' +
      '<button type="submit" class="btn btn--block" id="checkout-submit">تأكيد الطلب</button>' +
      '<p class="wa-hint">لن يُفتح واتساب تلقائياً — المتجر يتواصل معكِ لتأكيد الأوردر.</p>' +
      "</div></form></section>";

    Hana.bindProductImages(root);
    var waDisplay = root.querySelector("[data-wa-display]");
    if (waDisplay) {
      waDisplay.textContent =
        (window.HANA_CONFIG && window.HANA_CONFIG.whatsappDisplay) || "01010000533";
    }

    root.querySelector("#cart-items").addEventListener("click", function (e) {
      var rem = e.target.closest("[data-remove]");
      if (rem) {
        Hana.removeFromCart(rem.getAttribute("data-remove"));
        render();
        return;
      }
      var inc = e.target.closest("[data-inc]");
      if (inc) {
        var id = inc.getAttribute("data-inc");
        var line = Hana.cartLines().find(function (x) {
          return x.id === id;
        });
        if (line) Hana.setQty(id, line.qty + 1);
        render();
        return;
      }
      var dec = e.target.closest("[data-dec]");
      if (dec) {
        var id2 = dec.getAttribute("data-dec");
        var line2 = Hana.cartLines().find(function (x) {
          return x.id === id2;
        });
        if (line2) Hana.setQty(id2, Math.max(1, line2.qty - 1));
        render();
      }
    });

    root.querySelector("#cart-items").addEventListener("change", function (e) {
      var input = e.target.closest("[data-qty]");
      if (!input) return;
      var q = Math.max(1, parseInt(input.value, 10) || 1);
      Hana.setQty(input.getAttribute("data-qty"), q);
      render();
    });

    document.getElementById("checkout-form").addEventListener("submit", function (e) {
      e.preventDefault();
      showFormError("");
      var name = document.getElementById("name").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var address = document.getElementById("address").value.trim();
      var notes = document.getElementById("notes").value.trim();
      if (!name || !phone || !address) {
        showFormError("من فضلك أكملي الاسم والهاتف والعنوان.");
        return;
      }
      if (!Hana.cartLines().length) {
        showFormError("السلة فارغة.");
        return;
      }

      var apiBase = (
        (window.HANA_CONFIG && window.HANA_CONFIG.ordersApiBase) ||
        ""
      ).replace(/\/$/, "");
      var btn = document.getElementById("checkout-submit");

      if (!apiBase) {
        showFormError(
          "خادم الطلبات غير مُعد بعد (ordersApiBase فارغ). للتطوير المحلي عيّني رابط الـ Worker في js/config.js. للدعم تواصلي عبر واتساب من تذييل الصفحة."
        );
        return;
      }

      var lines = Hana.cartLines();
      var payload = {
        customer: { name: name, phone: phone, address: address, notes: notes },
        items: lines.map(function (l) {
          return {
            id: l.id,
            name: l.name,
            qty: l.qty,
            price: l.price,
            imageUrl: absoluteImageUrl(l.id),
          };
        }),
        total: Hana.cartTotal(),
        notes: notes,
        payment_method: "COD",
      };

      setSubmitting(btn, true);
      fetch(apiBase + "/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { res: res, data: data };
          });
        })
        .then(function (out) {
          if (!out.res.ok || !out.data || !out.data.ok || !out.data.orderNumber) {
            var msg =
              (out.data && (out.data.message || out.data.error)) ||
              "تعذّر حفظ الطلب. حاولي مرة أخرى.";
            if (msg === "rate_limited") msg = "محاولات كثيرة — انتظري دقيقة ثم أعيدي المحاولة.";
            if (msg === "validation") msg = "تحققي من البيانات والمنتجات ثم أعيدي المحاولة.";
            throw new Error(msg);
          }
          Hana.clearCart();
          window.location.href =
            "thank-you.html?order=" + encodeURIComponent(out.data.orderNumber);
        })
        .catch(function (err) {
          setSubmitting(btn, false);
          showFormError(
            (err && err.message) ||
              "حدث خطأ في الاتصال بخادم الطلبات. تحققي من الإنترنت أو تواصلي عبر واتساب للدعم."
          );
        });
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("hana:cart", function () {
    /* badge already updated; re-render if still on page with items change from elsewhere */
  });
})();

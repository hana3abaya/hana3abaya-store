# هناء عباية — Hana 3abaya Store

متجر ثابت (Static) بالعربية واتجاه RTL لعلامة **هناء عباية**. جاهز للرفع على **Cloudflare Pages** أو **GitHub Pages**.

المستودع المستهدف: `https://github.com/hana3abaya/hana3abaya-store`

---

## بالعربية

### ماذا يتضمن الموقع؟
- الصفحة الرئيسية، المتجر (بحث / فئة / ترتيب بالسعر)، صفحة منتج (`product.html?id=HN-XXX`)، السلة وإتمام الطلب.
- سلة محفوظة في `localStorage`.
- تأكيد الطلب يحفظ الأوردر في خادم Cloudflare (D1) مع صور المنتجات، ثم صفحة شكر برقم الطلب (مثل HNA-14001).
- المتجر يتواصل عبر واتساب لتأكيد الأوردر (رسائل جاهزة للنسخ من لوحة الإدارة). واتساب في التذييل للدعم فقط.
- رقم العرض: **01010000533** — رابط واتساب: `https://wa.me/201010000533`
- لوحة إدارة عربية: بعد نشر الـ Worker على `/admin/` — انظر [`cloudflare/README-CLOUDFLARE.md`](cloudflare/README-CLOUDFLARE.md).
- صور من المسار `images/products/HN-XXX.jpg` مع بديل تلقائي إن لم توجد الصورة.

### تعديل المنتجات
1. عدّلي الملف `data/products.json` (الأسعار والأسماء والأوصاف كما هي من المصدر — لا تختلقي أسعاراً).
2. بعد التعديل، حدّثي النسخة المضمّنة في الجافاسكربت ليعمل الموقع بدون خادم:

```bash
python3 -c "
import json
from pathlib import Path
data = json.loads(Path('data/products.json').read_text(encoding='utf-8'))
Path('js/products-data.js').write_text(
    '/* Generated from data/products.json */\nwindow.HANA_DATA = '
    + json.dumps(data, ensure_ascii=False, indent=2) + ';\n',
    encoding='utf-8')
print('OK', len(data['products']), 'products')
"
```

- الاسم الفارغ يظهر كـ: **منتج HN-0XX**.
- عدّلي رقم واتساب ورابط API الطلبات في `js/config.js` عند الحاجة (`whatsapp`، `whatsappDisplay`، `ordersApiBase`).

### إضافة الصور
ضعي الملفات في:

```
images/products/HN-001.jpg
…
images/products/HN-026.jpg
```

بدون صورة = شكل بديل أنيق (ليس صورة منتج وهمية).

### التشغيل المحلي
افتحي المجلد بأي خادم محلي بسيط (موصى به):

```bash
cd hana3abaya-store
python3 -m http.server 8080
```

ثم افتحي: `http://localhost:8080/`

أو افتحي `index.html` مباشرة في المتصفح — البيانات محمّلة عبر `js/products-data.js` لتعمل بدون خادم.


### خادم الطلبات (Cloudflare Worker) — بدون DNS
1. اتبعي الخطوات في [`cloudflare/README-CLOUDFLARE.md`](cloudflare/README-CLOUDFLARE.md).
2. انشري على رابط **`*.workers.dev` فقط** — **لا تغيّري DNS** لـ `hana3abaya.com`.
3. المتجر الحي يبقى على GitHub Pages: `https://hana3abaya.github.io/hana3abaya-store/`
4. بعد `wrangler deploy`، ضعي رابط الـ Worker في `js/config.js` → `ordersApiBase`.
5. لوحة الإدارة: `https://<worker>.workers.dev/admin/`
6. ربط الدومين المخصص **خطوة لاحقة اختيارية** وليست مطلوبة لعمل الطلبات.

### النشر على Cloudflare Pages
1. ارفعي هذا المجلد إلى مستودع GitHub `hana3abaya/hana3abaya-store`.
2. في Cloudflare Pages: Create project → Connect to Git → اختاري المستودع.
3. إعدادات البناء:
   - **Framework preset:** None
   - **Build command:** (فارغ)
   - **Build output directory:** `/` أو `.` (جذر المشروع)
4. Deploy. لا تغيّري الـ DNS للنطاق الحي في هذه المرحلة إلا بعد التحقق من المعاينة.

---

## English (short)

Static Arabic RTL storefront for **Hana 3abaya** (vanilla HTML/CSS/JS). Product data from `data/products.json` (26 SKUs). Cart in `localStorage`; checkout POSTs orders to a Cloudflare Worker/D1 backend (see `cloudflare/`), then shows `thank-you.html`. Put photos at `images/products/HN-XXX.jpg`. Set `ordersApiBase` and WhatsApp in `js/config.js`. Deploy storefront as static (Pages/GitHub Pages); deploy Worker separately.

---

## هيكل الملفات

```
hana3abaya-store/
  index.html
  shop.html
  product.html
  cart.html
  thank-you.html
  robots.txt
  sitemap.xml
  README.md
  css/styles.css
  js/config.js
  js/products-data.js
  js/app.js
  js/shop.js
  js/product.js
  js/cart-page.js
  data/products.json
  images/favicon.svg
  images/products/
  cloudflare/                 # Worker + D1 + admin
    wrangler.toml
    schema.sql
    README-CLOUDFLARE.md
    src/index.js
    admin/
```

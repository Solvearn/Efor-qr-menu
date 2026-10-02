# Efor At Çiftliği: QR Menü

Derleme gerektirmeyen statik site. Menü PDF'inin görünümü korunur (krem zemin, ince siyah çerçeve, harf aralıklı "M E N Ü" başlığı), telefonda tek sütun, geniş ekranda iki sütun gösterilir. Her üründe alerjen etiketleri vardır, ziyaretçi "Alerjenim var" ile filtreleyebilir.

## Dosyalar

- `menu.js`: tüm ürünler, fiyatlar ve alerjenler. Güncelleme için sadece bunu düzenleyin.
- `index.html`, `style.css`, `app.js`: sayfa, tasarım ve davranış.

## Fiyat veya ürün değiştirme

`menu.js` içinde ilgili satırı düzenleyin:

```js
{ n: "Tiramisu", p: 350, tag: WEEKEND, a: ["gluten", "sut", "yumurta"] },
```

Alerjen kodları: `gluten`, `sut`, `yumurta`, `kabuklu`, `susam`, `hardal`, `kereviz`, `balik`, `sulfit`, `soya`.

## Yerelde deneme

```sh
python3 -m http.server 8080
```

## Yayına alma

Klasörü Vercel, Netlify veya Cloudflare Pages'e statik site olarak yükleyin (Framework Preset: Other, build komutu yok, Root Directory ayarına gerek yok). Sabit bir adres alın, karekodu o adresten üretin. Menü değişse de adres aynı kaldığı için basılı karekodlar geçerli kalır.

## Karekod üretme

```sh
npx qrcode -t svg -o menu-qr.svg "https://MENU-ADRESINIZ"
```

Basımda en az 2×2 cm, koyu karekod açık zemin kullanın ve basmadan önce iPhone ve Android'de okutun.

## Alerjen bilgisi hakkında

Alerjenler menüdeki içerik açıklamalarından çıkarılmıştır. Açıklaması olmayan ürünlerde (Mantı, Menemen, omletler vb.) standart tarife göre tahmin edilmiştir. Yayına almadan önce mutfak ekibi her ürünü gerçek tarifiyle karşılaştırıp onaylamalıdır.

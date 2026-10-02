# Efor At Çiftliği: QR Menü

Telefonda açılan, alerjen filtreli QR menü ve menüyü yöneten bir yönetim paneli. Derleme gerektirmez, Vercel'de çalışır.

## Nasıl çalışır

- **Menü sayfası** (`/`): herkese açık. Menüyü `/api/menu` üzerinden okur. Veritabanı boşsa ya da yanıt vermezse `menu.js` içindeki varsayılan menüyü gösterir.
- **Yönetim paneli** (`/panel` veya `panel.alanadiniz.com`): kullanıcı adı ve şifreyle girilir. Ürün ekleme/silme/taşıma, fiyat, açıklama, etiket, not, alerjenler, kategori ve alerjen tanımı yönetimi buradan yapılır. Kaydettiğiniz değişiklik birkaç saniye içinde menüde görünür, yeniden yayına gerek yoktur.
- **Veri:** Upstash Redis'te (Vercel Marketplace, ücretsiz) tek bir kayıt olarak saklanır.

## Kurulum (Vercel)

1. **Veritabanı ekleyin.** Vercel'de projeyi açın: **Storage → Create Database → Upstash (Redis)**, ücretsiz planı seçin, projeye bağlayın. Vercel `KV_REST_API_URL` ve `KV_REST_API_TOKEN` değişkenlerini kendisi ekler.
2. **Yönetici bilgilerini girin.** **Settings → Environment Variables** bölümüne şu üçünü ekleyin (Production, Preview, Development için işaretli):

   | Ad | Değer |
   |---|---|
   | `ADMIN_USER` | Panel kullanıcı adı |
   | `ADMIN_PASSWORD` | Uzun, tahmin edilmesi zor bir şifre |
   | `SESSION_SECRET` | En az 16 karakterlik rastgele bir metin (örn. `openssl rand -base64 32` çıktısı) |

3. **Yeniden yayınlayın.** Ortam değişkenleri yalnızca yeni yayına uygulanır: **Deployments → son yayının `⋯` menüsü → Redeploy**.
4. **Panele girin.** `https://SITE-ADRESINIZ/panel`.

### `panel.` alt alan adı

`panel.menu.alanadiniz.com` gibi bir adres için: **Settings → Domains → Add** ile bu alt alan adını projeye ekleyin ve Vercel'in verdiği DNS kaydını alan adı sağlayıcınızda tanımlayın. Alt alan adının kökü (`panel.…/`) otomatik olarak panele gider. `vercel.app` adresinde alt alan adı açılamaz, orada `/panel` kullanın.

## Güvenlik

- Kullanıcı adı ve şifre kodda yazmaz, sadece Vercel ortam değişkenlerindedir. Şifreyi değiştirmek için değişkeni güncelleyip yeniden yayınlayın.
- Oturum 12 saat sürer. Çerez `HttpOnly`, `Secure` ve `SameSite=Strict`'tir.
- Aynı IP'den 15 dakikada 8 yanlış girişten sonra giriş kilitlenir.
- Kaydetme isteği oturum ve aynı-site denetiminden geçer, sunucu veriyi doğrulayıp temizler.
- Panel sayfası arama motorlarına kapalıdır (`noindex`).

## Dosyalar

- `index.html`, `style.css`, `app.js`: herkese açık menü.
- `admin.html`, `admin.css`, `admin.js`: yönetim paneli.
- `api/menu.js`: menüyü okur (herkes) ve kaydeder (sadece yönetici).
- `api/login.js`, `api/session.js`: giriş, oturum kontrolü, çıkış.
- `api/_lib.js`: veritabanı, oturum ve doğrulama yardımcıları.
- `menu.js`: veritabanı boşken kullanılan varsayılan menü.
- `vercel.json`: `/panel` ve `panel.` alt alan adı yönlendirmesi, güvenlik başlıkları.
- `dev-server.js`: yerelde deneme sunucusu.

## Yerelde deneme

```sh
ADMIN_USER=admin ADMIN_PASSWORD=deneme node dev-server.js
```

`http://localhost:3000` menü, `http://localhost:3000/panel` yönetim paneli. Yerelde veritabanı yerine bellek kullanılır, sunucuyu kapatınca kayıtlar silinir.

## Karekod

```sh
npx qrcode -t svg -o menu-qr.svg "https://MENU-ADRESINIZ"
```

Basımda en az 2×2 cm, koyu karekod açık zemin kullanın ve basmadan önce iPhone ve Android'de okutun. Menü içeriği panelden değiştiği için karekod hiç değişmez.

## Alerjen bilgisi hakkında

Başlangıç alerjenleri menü içeriklerinden çıkarılmıştır. Açıklaması olmayan ürünlerde standart tarife göre tahmin edilmiştir. Mutfak ekibi her ürünü gerçek tarifiyle karşılaştırıp panelden düzeltmelidir.

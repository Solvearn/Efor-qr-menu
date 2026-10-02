// Menü verisi. Fiyat veya ürün değiştirmek için sadece bu dosyayı düzenleyin.
// n: ad, p: fiyat (₺), d: açıklama, a: alerjen kodları, tag: etiket, note: ek not

window.ALLERGENS = {
  gluten: "Gluten",
  sut: "Süt",
  yumurta: "Yumurta",
  kabuklu: "Kabuklu yemiş",
  susam: "Susam",
  hardal: "Hardal",
  kereviz: "Kereviz",
  balik: "Balık",
  sulfit: "Sülfit",
  soya: "Soya",
};

const WEEKEND = "Hafta sonuna özel";

window.MENU = [
  {
    id: "kahvalti",
    title: "Kahvaltı",
    items: [
      { n: "Açık Tost", p: 350, d: "Tam tahıllı ekmek, mascarpone, roka, füme et, ıspanaklı scrambled egg.", a: ["gluten", "sut", "yumurta"] },
      { n: "Günaydın", p: 600, d: "Frankfurt sosis, karamelize soğanlı patates, mantar, ezine peyniri, kuru domates, avakado, tam tahıllı ekmek, sunny side up, çörekotu, mevsim yeşillikleri.", a: ["gluten", "sut", "yumurta"] },
      { n: "Serin Sabah", p: 250, d: "Simit, karpuz, ezine peyniri, zeytin.", a: ["gluten", "sut", "susam"] },
      { n: "French Toast", p: 300, d: "Yumurtalı pudra şekerli ekmek, çilek, yaban mersini, bal, top dondurma.", a: ["gluten", "yumurta", "sut"] },
      { n: "Esnaf", p: 400, d: "Bir göz yumurta, simit, zeytin, ezine peyniri, cherry domates, taze kekikli sızma zeytinyağı, salatalık, kasap sucuk, ceviz, bal kaymak, ev yapımı vişne reçeli.", a: ["yumurta", "gluten", "susam", "sut", "kabuklu"] },
      { n: "Tost", p: 250, d: "Kaşar peyniri, sucuk, ev yapımı salça.", a: ["gluten", "sut"] },
    ],
  },
  {
    id: "omletler",
    title: "Omletler",
    items: [
      { n: "Kaşarlı Omlet", p: 250, a: ["yumurta", "sut"] },
      { n: "Çiftliğin Omleti", p: 350, d: "Yumurta, mantar, taze biberiye, füme et.", a: ["yumurta"] },
      { n: "Sucuklu Biberli Omlet", p: 300, a: ["yumurta"] },
      { n: "Sade Omlet", p: 200, a: ["yumurta"] },
    ],
  },
  {
    id: "ekstralar",
    title: "Ekstralar",
    items: [
      { n: "Menemen", p: 300, a: ["yumurta"] },
      { n: "Saganaki", p: 250, d: "Güveçte feta peyniri, kaşar peyniri, biber, domates.", a: ["sut"] },
      { n: "Sütlü Biber", p: 300, d: "Kaşar peyniri, sivri biber, füme et, toz kırmızı biberli kızarmış yağ.", a: ["sut"] },
      { n: "Sahanda Sucuklu Göz Yumurta", p: 250, a: ["yumurta"] },
      { n: "Sahanda Göz Yumurta", p: 200, a: ["yumurta"] },
    ],
  },
  {
    id: "patatesler",
    title: "Patatesler",
    items: [
      { n: "Patates Kızartması", p: 200 },
      { n: "Elma Dilimli Patates Kızartması", p: 200 },
      { n: "Füme Etli, Chedarlı, Karamelize Soğanlı Patates", p: 350, a: ["sut"] },
      { n: "Türüflü Parmesanlı Patates", p: 300, a: ["sut"] },
      { n: "Atıştırma Tabağı", p: 500, d: "Patates kızartması, çıtır tavuk topları, kokteyl sosis, soğan halkası.", a: ["gluten", "yumurta", "hardal"] },
    ],
  },
  {
    id: "salatalar",
    title: "Salatalar",
    items: [
      { n: "Sezar Salata", p: 400, d: "Taze marul, cherry domates, kruton ekmekler, ızgara tavuk, sezar sos, taze parmesan peyniri.", a: ["gluten", "sut", "yumurta", "balik", "hardal"] },
      { n: "Çilekli Roka Salatası", p: 300, d: "Roka, çilek, taze kaju, hardallı sos eşliğinde.", a: ["kabuklu", "hardal"] },
      { n: "Semiz Otu Salatası", p: 250, d: "Semiz otu, cherry domates, iç ceviz, ezine peyniri, sirkeli sos eşliğinde.", a: ["sut", "kabuklu", "sulfit"] },
    ],
  },
  {
    id: "burgerler",
    title: "Burgerler",
    items: [
      { n: "Cheese Burger", p: 450, d: "İki köfte, üç peynir.", a: ["gluten", "sut", "susam"] },
      { n: "Klasik Burger", p: 400, d: "Köfte, ranch sos, marul, domates, turşu.", a: ["gluten", "sut", "yumurta", "susam"] },
      { n: "Füme Burger", p: 500, d: "Köfte, özel sos, füme et, cheddar, karamelize soğan.", a: ["gluten", "sut", "yumurta", "susam"] },
      { n: "Tavuk Burger", p: 450, d: "Panelenmiş tavuk, ranch sos, cheddar peyniri, mor lahana sosu.", a: ["gluten", "sut", "yumurta", "susam"] },
      { n: "Acılı Tavuk Burger", p: 450, d: "Panelenmiş tavuk, acı sos, cheddar peyniri, mor lahana sosu.", a: ["gluten", "sut", "yumurta", "susam"] },
    ],
  },
  {
    id: "ana-yemekler",
    title: "Ana Yemekler",
    items: [
      { n: "Köfte Bowl", p: 650, d: "Izgara köfte, taze naneli süzme yoğurt, mevsim yeşillikleri, basmati pilav, meksika fasulyesi, ızgara ananas.", a: ["gluten", "sut"] },
      { n: "Tavuk Bowl", p: 600, d: "Izgara tavuk, mor lahana sos, mevsim yeşillikleri, basmati pilav, mısır, meksika fasulyesi, ızgara mürdüm eriği.", a: ["yumurta"] },
      { n: "Şinitzel", p: 500, d: "Ev yapımı şinitzel, patates cipsi, Amerikan salata.", a: ["gluten", "yumurta"] },
      { n: "Tavuklu Keşkek", p: 450, d: "Keşkek yatağında ızgara tavuk, kızarmış tereyağı sos.", a: ["gluten", "sut"] },
      { n: "Mercimek Çorbası", p: 150, a: ["sut"] },
    ],
  },
  {
    id: "makarnalar",
    title: "Makarnalar",
    items: [
      { n: "Yaz Makarnası", p: 350, d: "Pesto sos, top peynir, cherry domates, balzamik glaze.", a: ["gluten", "sut", "kabuklu", "sulfit"] },
      { n: "Chicken Tagliatelle", p: 450, d: "Tavuk, krema, pesto sos, mantar, taze parmesan.", a: ["gluten", "sut", "yumurta", "kabuklu"] },
      { n: "Linguine Bolognese", p: 450, d: "Bolonez sos, taze parmesan.", a: ["gluten", "sut", "kereviz"] },
      { n: "Mantı", p: 400, a: ["gluten", "sut", "yumurta"] },
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    items: [
      { n: "Vişneli Brownie", p: 300, tag: WEEKEND, a: ["gluten", "sut", "yumurta", "soya"] },
      { n: "Kıbrıs Tatlısı", p: 300, tag: WEEKEND, a: ["gluten", "sut"] },
      { n: "Yaban Mersinli Cheesecake", p: 350, tag: WEEKEND, a: ["gluten", "sut", "yumurta"] },
      { n: "Tiramisu", p: 350, tag: WEEKEND, a: ["gluten", "sut", "yumurta"] },
      { n: "Berry Blanch", p: 350, d: "Kedi dili bisküvi, beyaz çikolatalı krema, frambuaz, çilek, beyaz çikolatalı kremşanti.", a: ["gluten", "sut", "yumurta", "soya"] },
      { n: "Lemon Bliss", p: 350, d: "Limonlu kek, beyaz çikolatalı krema, limonlu beyaz çikolatalı kremşanti.", a: ["gluten", "sut", "yumurta", "soya"] },
    ],
  },
  {
    id: "caylar",
    title: "Çaylar",
    items: [
      { n: "Türk Çayı", p: 35 },
      { n: "Japon Çiçeği Çayı", p: 100 },
      { n: "Vanilya Çayı", p: 100 },
      { n: "Papatya Çayı", p: 100 },
      { n: "Adaçayı", p: 100 },
      { n: "Ihlamur Çayı", p: 100 },
      { n: "Nane Limon", p: 100 },
    ],
  },
  {
    id: "soguk-kahveler",
    title: "Soğuk Kahveler",
    items: [
      { n: "Ice Latte", p: 250, a: ["sut"] },
      { n: "Iced Brown Sugar Oat Shaken Espresso", p: 280, a: ["gluten"] },
      { n: "Ice Vanilia Latte", p: 280, a: ["sut"] },
      { n: "Ice Caramell Latte", p: 280, a: ["sut"] },
      { n: "Ice Spanish Latte", p: 280, a: ["sut"] },
      { n: "Ice Americano", p: 200 },
      { n: "Ice Filtre", p: 200 },
      { n: "Dondurmalı Frape", p: 300, a: ["sut"] },
    ],
  },
  {
    id: "sicak-kahveler",
    title: "Sıcak Kahveler",
    items: [
      { n: "Espresso", p: 200 },
      { n: "Mocha", p: 200, a: ["sut", "soya"] },
      { n: "Latte", p: 200, a: ["sut"] },
      { n: "Flat White", p: 200, a: ["sut"] },
      { n: "Americano", p: 180 },
      { n: "Türk Kahvesi", p: 120 },
      { n: "Dibek Kahvesi", p: 130 },
    ],
  },
  {
    id: "demleme-kahveler",
    title: "Demleme Kahveler",
    items: [
      { n: "Filtre Kahve", p: 150 },
      { n: "V60", p: 200 },
    ],
  },
  {
    id: "mocktail",
    title: "Mocktail",
    items: [
      { n: "Ev Yapımı Limonata", p: 200 },
      { n: "Ev Yapımı Çilekli Limonata", p: 220 },
      { n: "Sıkma Portakal Suyu", p: 250 },
      { n: "Virgin Mojito", p: 200 },
      { n: "Cool Lime", p: 200 },
      { n: "Berry Hibiscus", p: 200 },
    ],
  },
  {
    id: "mesrubatlar",
    title: "Meşrubatlar",
    items: [
      { n: "Cola", p: 130 },
      { n: "Uludağ Portakal", p: 130 },
      { n: "Uludağ Gazoz", p: 130 },
      { n: "Uludağ Limonlu Gazoz", p: 130 },
      { n: "Fuse Tea Limon", p: 130 },
      { n: "Fuse Tea Şeftali", p: 130 },
      { n: "Fuse Tea Karpuz", p: 130 },
      { n: "Fuse Tea Mango & Ananas", p: 130 },
      { n: "Ayran", p: 100, a: ["sut"] },
      { n: "Su (330 ml)", p: 40 },
      { n: "Uludağ Limonata", p: 130 },
    ],
  },
  {
    id: "power",
    title: "Power",
    items: [
      { n: "Okyanus", p: 300, d: "Yaban mersini aromalı redbull, sprite, jelibon.", note: "Kafein içerir" },
      { n: "Berry Charge", p: 300, d: "Ahududu aromalı redbull, sprite, limon suyu.", note: "Kafein içerir" },
      { n: "Günbatımı", p: 300, d: "Şeftali aromalı redbull, sprite, limon suyu, şeftalili jelibon.", note: "Kafein içerir" },
      { n: "Hawana", p: 300, d: "Tropik meyve aromalı redbull, sprite, ananas, nane.", note: "Kafein içerir" },
    ],
  },
];

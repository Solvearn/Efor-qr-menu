(function () {
  var STORE_KEY = "menu-allergens";
  var selected = new Set();
  var data = null;
  var observer = null;

  var menuEl = document.getElementById("menu");
  var tabsEl = document.getElementById("tabs");
  var chipsEl = document.getElementById("allergy-chips");
  var clearBtn = document.getElementById("allergy-clear");
  var summary = document.querySelector("#allergy summary");

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function price(p) {
    return Number(p).toFixed(2) + " ₺";
  }

  function loadSelection() {
    try {
      JSON.parse(localStorage.getItem(STORE_KEY) || "[]").forEach(function (k) { selected.add(k); });
    } catch (e) { /* depolama yoksa sorun değil */ }
  }

  function saveSelection() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(selected))); } catch (e) {}
  }

  // Menü verisi: önce yönetim panelinin kaydettiği veri, olmazsa menu.js içindeki varsayılan.
  function seed() {
    return { allergens: window.ALLERGENS, categories: window.MENU };
  }

  function load() {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
    return fetch("/api/menu", ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        return j && j.menu && Array.isArray(j.menu.categories) && j.menu.allergens ? j.menu : null;
      })
      .catch(function () { return null; })
      .then(function (m) { clearTimeout(timer); return m || seed(); });
  }

  // --- Çizim ---
  function render(d) {
    data = d;
    menuEl.textContent = "";
    tabsEl.textContent = "";
    chipsEl.textContent = "";

    // Artık var olmayan alerjenleri seçimden düş
    Array.from(selected).forEach(function (k) { if (!data.allergens[k]) selected.delete(k); });

    data.categories.forEach(function (section) {
      if (!section.items.length) return;

      var sec = el("section", "section");
      sec.id = section.id;
      sec.appendChild(el("h2", "section__title", section.title));

      section.items.forEach(function (item) {
        var node = el("article", "item");
        node.dataset.allergens = (item.a || []).join(",");

        var row = el("div", "item__row");
        row.appendChild(el("span", "item__name", item.n));
        row.appendChild(el("span", "item__price", price(item.p)));
        node.appendChild(row);

        if (item.d) node.appendChild(el("p", "item__desc", item.d));
        if (item.tag) node.appendChild(el("p", "item__tag", item.tag));
        if (item.note) node.appendChild(el("p", "item__note", item.note));

        var warn = el("p", "item__warn");
        warn.hidden = true;
        node.appendChild(warn);

        sec.appendChild(node);
      });

      menuEl.appendChild(sec);

      var tab = el("a", null, section.title);
      tab.href = "#" + section.id;
      tab.dataset.target = section.id;
      tabsEl.appendChild(tab);
    });

    Object.keys(data.allergens).forEach(function (key) {
      var chip = el("button", "chip", data.allergens[key]);
      chip.type = "button";
      chip.dataset.key = key;
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () {
        if (selected.has(key)) selected.delete(key); else selected.add(key);
        saveSelection();
        apply();
      });
      chipsEl.appendChild(chip);
    });

    observe();
    apply();
  }

  // --- Aktif sekme ---
  function setActive(id) {
    tabsEl.querySelectorAll("a").forEach(function (a) {
      var on = a.dataset.target === id;
      a.classList.toggle("is-active", on);
      if (on) {
        var left = a.offsetLeft - (tabsEl.clientWidth - a.offsetWidth) / 2;
        tabsEl.scrollTo({ left: left, behavior: "smooth" });
      }
    });
  }

  function observe() {
    if (!("IntersectionObserver" in window)) return;
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".section").forEach(function (s) { observer.observe(s); });
  }

  // --- Alerjen filtresi ---
  clearBtn.addEventListener("click", function () {
    selected.clear();
    saveSelection();
    apply();
  });

  function apply() {
    chipsEl.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", selected.has(c.dataset.key) ? "true" : "false");
    });
    clearBtn.hidden = selected.size === 0;
    summary.firstChild.textContent = selected.size
      ? "Alerjenim var (" + selected.size + " seçili)"
      : "Alerjenim var";

    document.querySelectorAll(".item").forEach(function (node) {
      var keys = node.dataset.allergens ? node.dataset.allergens.split(",") : [];
      var hits = keys.filter(function (k) { return selected.has(k); });
      node.classList.toggle("is-blocked", hits.length > 0);

      var warn = node.querySelector(".item__warn");
      warn.hidden = hits.length === 0;
      warn.textContent = hits.length
        ? "İçerir: " + hits.map(function (k) { return data.allergens[k]; }).join(", ")
        : "";
    });
  }

  loadSelection();
  menuEl.appendChild(el("p", "loading", "Menü yükleniyor…"));
  load().then(render);
})();

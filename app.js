(function () {
  var STORE_KEY = "menu-allergens";
  var selected = new Set();

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function price(p) {
    return p.toFixed(2) + " ₺";
  }

  function loadSelection() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      saved.forEach(function (k) { if (window.ALLERGENS[k]) selected.add(k); });
    } catch (e) { /* depolama yoksa sorun değil */ }
  }

  function saveSelection() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(selected))); } catch (e) {}
  }

  // --- Menü ---
  var menuEl = document.getElementById("menu");
  var tabsEl = document.getElementById("tabs");

  window.MENU.forEach(function (section) {
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

      sec.appendChild(node);
    });

    menuEl.appendChild(sec);

    var tab = el("a", null, section.title);
    tab.href = "#" + section.id;
    tab.dataset.target = section.id;
    tabsEl.appendChild(tab);
  });

  // --- Aktif sekme ---
  var tabLinks = Array.from(tabsEl.querySelectorAll("a"));

  function setActive(id) {
    tabLinks.forEach(function (a) {
      var on = a.dataset.target === id;
      a.classList.toggle("is-active", on);
      if (on) {
        var left = a.offsetLeft - (tabsEl.clientWidth - a.offsetWidth) / 2;
        tabsEl.scrollTo({ left: left, behavior: "smooth" });
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".section").forEach(function (s) { io.observe(s); });
  }

  // --- Alerjen filtresi ---
  var chipsEl = document.getElementById("allergy-chips");
  var clearBtn = document.getElementById("allergy-clear");
  var summary = document.querySelector("#allergy summary");

  Object.keys(window.ALLERGENS).forEach(function (key) {
    var chip = el("button", "chip", window.ALLERGENS[key]);
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
    });
  }

  loadSelection();
  apply();
})();

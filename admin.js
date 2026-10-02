(function () {
  var state = { data: null, catId: null, view: "items", dirty: false };

  var $ = function (id) { return document.getElementById(id); };
  var loginEl = $("login"), appEl = $("app"), layoutEl = $("layout");
  var saveBtn = $("save"), statusEl = $("status"), toastEl = $("toast");
  var toastTimer = null, savedTimer = null;

  // ---------- Yardımcılar ----------
  function h(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
      else if (k === "value") node.value = v;
      else node.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  function api(path, opts) {
    var init = Object.assign({ credentials: "same-origin", headers: { "Content-Type": "application/json" } }, opts);
    return fetch(path, init).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (body) {
        if (!r.ok) {
          var err = new Error((body && body.error) || "İstek başarısız (" + r.status + ")");
          err.status = r.status;
          throw err;
        }
        return body;
      });
    });
  }

  function toast(msg, isError) {
    toastEl.textContent = msg;
    toastEl.className = "toast" + (isError ? " is-error" : "");
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, isError ? 6000 : 2500);
  }

  var TR = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
  function slugify(s) {
    var t = String(s).toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, function (c) { return TR[c]; });
    t = t.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
    return t || "yeni";
  }
  function uniqueKey(base, taken) {
    var key = base, i = 2;
    while (taken.indexOf(key) !== -1) { key = (base + "-" + i).slice(0, 40); i++; }
    return key;
  }

  function cat() {
    return state.data.categories.filter(function (c) { return c.id === state.catId; })[0] || null;
  }

  function move(arr, i, d) {
    var j = i + d;
    if (j < 0 || j >= arr.length) return false;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    return true;
  }

  // ---------- Durum çubuğu ----------
  function markDirty() {
    state.dirty = true;
    updateBar();
  }
  function updateBar() {
    saveBtn.disabled = !state.dirty;
    if (state.dirty) {
      statusEl.textContent = "Kaydedilmemiş değişiklikler var";
      statusEl.className = "bar__status is-dirty";
    } else if (!statusEl.classList.contains("is-saved")) {
      statusEl.textContent = "";
      statusEl.className = "bar__status";
    }
  }
  window.addEventListener("beforeunload", function (e) {
    if (state.dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  // ---------- Giriş / çıkış ----------
  function showLogin(msg) {
    appEl.hidden = true;
    loginEl.hidden = false;
    var err = $("login-error");
    err.hidden = !msg;
    err.textContent = msg || "";
    $("login-pass").value = "";
    $("login-user").focus();
  }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("login-submit");
    btn.disabled = true;
    api("/api/login", {
      method: "POST",
      body: JSON.stringify({ username: $("login-user").value.trim(), password: $("login-pass").value }),
    }).then(function () {
      $("login-error").hidden = true;
      return state.data ? showApp() : start();
    }).catch(function (err) {
      showLogin(err.message);
    }).then(function () { btn.disabled = false; });
  });

  $("logout").addEventListener("click", function () {
    if (state.dirty && !confirm("Kaydedilmemiş değişiklikler silinecek. Çıkış yapılsın mı?")) return;
    api("/api/session", { method: "POST" }).catch(function () {}).then(function () {
      state.data = null; state.dirty = false;
      showLogin();
    });
  });

  // ---------- Veri ----------
  function loadMenu() {
    return api("/api/menu?t=" + Date.now(), { cache: "no-store" }).then(function (r) {
      var m = r && r.menu && Array.isArray(r.menu.categories) ? r.menu : null;
      // Henüz hiç kaydedilmediyse menu.js içindeki varsayılan menüyle başla
      var src = m || { allergens: window.ALLERGENS, categories: window.MENU };
      return JSON.parse(JSON.stringify({ allergens: src.allergens, categories: src.categories }));
    });
  }

  function showApp() {
    loginEl.hidden = true;
    appEl.hidden = false;
    updateBar();
    render();
  }

  function start() {
    return loadMenu().then(function (data) {
      state.data = data;
      state.catId = data.categories.length ? data.categories[0].id : null;
      state.dirty = false;
      showApp();
    }).catch(function (err) {
      if (err.status === 401) return showLogin();
      showLogin(err.message);
    });
  }

  function validateLocal() {
    var cats = state.data.categories;
    for (var i = 0; i < cats.length; i++) {
      if (!cats[i].title.trim()) return { cat: cats[i].id, msg: "Adı boş bir kategori var." };
      for (var j = 0; j < cats[i].items.length; j++) {
        var it = cats[i].items[j];
        if (!String(it.n || "").trim()) return { cat: cats[i].id, msg: "“" + cats[i].title + "” kategorisinde adı boş bir ürün var." };
        if (!isFinite(Number(it.p)) || Number(it.p) < 0) return { cat: cats[i].id, msg: "“" + it.n + "” ürününün fiyatı geçersiz." };
      }
    }
    var keys = Object.keys(state.data.allergens);
    for (var k = 0; k < keys.length; k++) {
      if (!String(state.data.allergens[keys[k]]).trim()) return { view: "allergens", msg: "Adı boş bir alerjen var." };
    }
    return null;
  }

  function save() {
    var problem = validateLocal();
    if (problem) {
      if (problem.cat) { state.catId = problem.cat; state.view = "items"; }
      if (problem.view) state.view = problem.view;
      render();
      return toast(problem.msg, true);
    }
    saveBtn.disabled = true;
    statusEl.textContent = "Kaydediliyor…";
    api("/api/menu", { method: "PUT", body: JSON.stringify({ menu: state.data }) }).then(function () {
      state.dirty = false;
      statusEl.textContent = "Kaydedildi";
      statusEl.className = "bar__status is-saved";
      clearTimeout(savedTimer);
      savedTimer = setTimeout(function () { statusEl.className = "bar__status"; updateBar(); }, 3000);
      saveBtn.disabled = true;
    }).catch(function (err) {
      updateBar();
      if (err.status === 401) return showLogin("Oturum süresi doldu. Tekrar giriş yapın, değişiklikleriniz korunuyor.");
      toast(err.message, true);
    });
  }
  saveBtn.addEventListener("click", save);

  // ---------- Görünüm sekmeleri ----------
  $("views").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-view]");
    if (!b) return;
    state.view = b.dataset.view;
    render();
  });

  function render() {
    document.querySelectorAll("#views button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.view === state.view);
    });
    layoutEl.textContent = "";
    if (state.view === "allergens") {
      layoutEl.className = "layout";
      layoutEl.appendChild(allergenPanel());
    } else {
      layoutEl.className = "layout has-side";
      var left = h("section", { class: "panel", id: "cats-panel" });
      var right = h("section", { class: "panel", id: "editor-panel" });
      layoutEl.appendChild(left);
      layoutEl.appendChild(right);
      renderCats();
      renderEditor();
    }
  }

  // ---------- Kategoriler ----------
  function renderCats() {
    var panel = $("cats-panel");
    panel.textContent = "";
    panel.appendChild(h("h2", { text: "Kategoriler" }));

    var cats = state.data.categories;
    var list = h("ul", { class: "cats" });
    cats.forEach(function (c, i) {
      var li = h("li", { class: "cat" + (c.id === state.catId ? " is-active" : ""), onclick: function () {
        state.catId = c.id; renderCats(); renderEditor();
        if (window.innerWidth < 860) $("editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      } }, [
        h("span", { class: "cat__name", text: c.title || "(adsız)" }),
        h("span", { class: "cat__count", text: String(c.items.length) }),
        h("button", { class: "icon-btn", type: "button", title: "Yukarı taşı", "aria-label": c.title + " kategorisini yukarı taşı", text: "↑",
          disabled: i === 0, onclick: function (e) { e.stopPropagation(); move(cats, i, -1); markDirty(); renderCats(); } }),
        h("button", { class: "icon-btn", type: "button", title: "Aşağı taşı", "aria-label": c.title + " kategorisini aşağı taşı", text: "↓",
          disabled: i === cats.length - 1, onclick: function (e) { e.stopPropagation(); move(cats, i, 1); markDirty(); renderCats(); } }),
      ]);
      list.appendChild(li);
    });
    panel.appendChild(list);

    var input = h("input", { placeholder: "Yeni kategori adı", "aria-label": "Yeni kategori adı", maxlength: "60" });
    function add() {
      var title = input.value.trim();
      if (!title) return input.focus();
      var id = uniqueKey(slugify(title), cats.map(function (c) { return c.id; }));
      cats.push({ id: id, title: title, items: [] });
      state.catId = id;
      markDirty();
      render();
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    panel.appendChild(h("div", { class: "row" }, [
      h("div", { class: "grow" }, [input]),
      h("button", { class: "btn btn--small", type: "button", text: "Ekle", onclick: add }),
    ]));
  }

  // ---------- Ürünler ----------
  function renderEditor() {
    var panel = $("editor-panel");
    panel.textContent = "";
    var c = cat();
    if (!c) {
      panel.appendChild(h("p", { class: "empty", text: "Henüz kategori yok. Soldan bir kategori ekleyin." }));
      return;
    }

    var titleInput = h("input", { value: c.title, maxlength: "60", "aria-label": "Kategori adı" });
    titleInput.addEventListener("input", function () { c.title = titleInput.value; markDirty(); renderCats(); });

    panel.appendChild(h("div", { class: "cat-edit" }, [
      h("label", {}, ["Kategori adı", titleInput]),
      h("div", { class: "row" }, [
        h("button", { class: "btn btn--small", type: "button", text: "+ Ürün ekle", onclick: function () { addItem(c); } }),
        h("button", { class: "btn btn--small btn--danger", type: "button", text: "Kategoriyi sil", onclick: function () { deleteCat(c); } }),
      ]),
    ]));

    var items = h("div", { class: "items" });
    if (!c.items.length) items.appendChild(h("p", { class: "empty", text: "Bu kategoride ürün yok." }));
    c.items.forEach(function (it, i) { items.appendChild(itemCard(c, it, i)); });
    panel.appendChild(items);

    if (c.items.length > 2) {
      panel.appendChild(h("div", { class: "row", style: "margin-top:12px" }, [
        h("button", { class: "btn btn--small", type: "button", text: "+ Ürün ekle", onclick: function () { addItem(c); } }),
      ]));
    }
  }

  function addItem(c) {
    c.items.push({ n: "", p: 0 });
    markDirty();
    renderCats();
    renderEditor();
    var inputs = document.querySelectorAll(".item-card .js-name");
    var last = inputs[inputs.length - 1];
    if (last) { last.scrollIntoView({ block: "center" }); last.focus(); }
  }

  function deleteCat(c) {
    var msg = c.items.length
      ? "“" + c.title + "” kategorisi ve içindeki " + c.items.length + " ürün silinecek. Emin misiniz?"
      : "“" + c.title + "” kategorisi silinsin mi?";
    if (!confirm(msg)) return;
    var cats = state.data.categories;
    var i = cats.indexOf(c);
    cats.splice(i, 1);
    state.catId = cats.length ? cats[Math.min(i, cats.length - 1)].id : null;
    markDirty();
    render();
  }

  function itemCard(c, it, i) {
    var allergens = state.data.allergens;
    var nameIn = h("input", { class: "js-name", value: it.n, maxlength: "80", placeholder: "Ürün adı", "aria-label": "Ürün adı" });
    nameIn.addEventListener("input", function () { it.n = nameIn.value; markDirty(); });

    var priceIn = h("input", { type: "number", min: "0", max: "100000", step: "0.01", inputmode: "decimal", value: String(it.p), "aria-label": "Fiyat (₺)" });
    priceIn.addEventListener("input", function () { it.p = priceIn.value === "" ? NaN : Number(priceIn.value); markDirty(); });

    var descIn = h("textarea", { maxlength: "400", "aria-label": "Açıklama" });
    descIn.value = it.d || "";
    descIn.addEventListener("input", function () { it.d = descIn.value; markDirty(); });

    var tagIn = h("input", { value: it.tag || "", maxlength: "60", placeholder: "örn. Hafta sonuna özel", "aria-label": "Etiket" });
    tagIn.addEventListener("input", function () { it.tag = tagIn.value; markDirty(); });

    var noteIn = h("input", { value: it.note || "", maxlength: "60", placeholder: "örn. Kafein içerir", "aria-label": "Not" });
    noteIn.addEventListener("input", function () { it.note = noteIn.value; markDirty(); });

    var catSel = h("select", { "aria-label": "Kategori" });
    state.data.categories.forEach(function (o) {
      var opt = h("option", { value: o.id, text: o.title || "(adsız)" });
      if (o.id === c.id) opt.selected = true;
      catSel.appendChild(opt);
    });
    catSel.addEventListener("change", function () {
      var to = state.data.categories.filter(function (o) { return o.id === catSel.value; })[0];
      if (!to || to === c) return;
      c.items.splice(c.items.indexOf(it), 1);
      to.items.push(it);
      markDirty();
      renderCats();
      renderEditor();
      toast("Ürün “" + to.title + "” kategorisine taşındı.");
    });

    var chips = h("div", { class: "chips" });
    var keys = Object.keys(allergens);
    if (!keys.length) chips.appendChild(h("span", { class: "muted", text: "Önce “Alerjenler” sekmesinden alerjen tanımlayın." }));
    keys.forEach(function (k) {
      var on = (it.a || []).indexOf(k) !== -1;
      var chip = h("button", { class: "chip", type: "button", text: allergens[k], "aria-pressed": on ? "true" : "false" });
      chip.addEventListener("click", function () {
        var a = it.a || (it.a = []);
        var idx = a.indexOf(k);
        if (idx === -1) a.push(k); else a.splice(idx, 1);
        chip.setAttribute("aria-pressed", idx === -1 ? "true" : "false");
        markDirty();
      });
      chips.appendChild(chip);
    });

    return h("article", { class: "item-card" }, [
      h("div", { class: "item-card__top" }, [
        h("label", {}, ["Ürün adı", nameIn]),
        h("label", {}, ["Fiyat (₺)", priceIn]),
      ]),
      h("label", {}, ["Açıklama", descIn]),
      h("div", { class: "item-card__grid" }, [
        h("label", {}, ["Etiket", tagIn]),
        h("label", {}, ["Not", noteIn]),
      ]),
      h("label", {}, ["Kategori", catSel]),
      h("div", {}, [h("p", { class: "field-title", text: "Alerjenler (içerdikleri)" }), chips]),
      h("div", { class: "row row--end" }, [
        h("button", { class: "icon-btn", type: "button", text: "↑ Yukarı", disabled: i === 0, onclick: function () { move(c.items, i, -1); markDirty(); renderEditor(); } }),
        h("button", { class: "icon-btn", type: "button", text: "↓ Aşağı", disabled: i === c.items.length - 1, onclick: function () { move(c.items, i, 1); markDirty(); renderEditor(); } }),
        h("button", { class: "btn btn--small btn--danger", type: "button", text: "Sil", onclick: function () {
          if (!confirm("“" + (it.n || "Adsız ürün") + "” silinsin mi?")) return;
          c.items.splice(i, 1); markDirty(); renderCats(); renderEditor();
        } }),
      ]),
    ]);
  }

  // ---------- Alerjen tanımları ----------
  function allergenPanel() {
    var allergens = state.data.allergens;
    var panel = h("section", { class: "panel" });
    panel.appendChild(h("h2", { text: "Alerjen listesi" }));
    panel.appendChild(h("p", { class: "muted", text: "Burada tanımladığınız alerjenler, ürünlerde işaretlenebilir ve menüdeki “Alerjenim var” filtresinde görünür." }));

    Object.keys(allergens).forEach(function (k) {
      var inp = h("input", { value: allergens[k], maxlength: "40", "aria-label": "Alerjen adı" });
      inp.addEventListener("input", function () { allergens[k] = inp.value; markDirty(); });
      panel.appendChild(h("div", { class: "allergen-row" }, [
        h("div", { class: "grow" }, [inp]),
        h("button", { class: "btn btn--small btn--danger", type: "button", text: "Sil", onclick: function () {
          var used = 0;
          state.data.categories.forEach(function (c) { c.items.forEach(function (it) { if ((it.a || []).indexOf(k) !== -1) used++; }); });
          var msg = used
            ? "“" + allergens[k] + "” alerjeni silinecek ve " + used + " üründen kaldırılacak. Emin misiniz?"
            : "“" + allergens[k] + "” alerjeni silinsin mi?";
          if (!confirm(msg)) return;
          delete allergens[k];
          state.data.categories.forEach(function (c) {
            c.items.forEach(function (it) { if (it.a) it.a = it.a.filter(function (x) { return x !== k; }); });
          });
          markDirty();
          render();
        } }),
      ]));
    });

    var input = h("input", { placeholder: "Yeni alerjen adı (örn. Yer fıstığı)", maxlength: "40", "aria-label": "Yeni alerjen adı" });
    function add() {
      var label = input.value.trim();
      if (!label) return input.focus();
      if (Object.keys(allergens).length >= 30) return toast("En fazla 30 alerjen tanımlanabilir.", true);
      allergens[uniqueKey(slugify(label), Object.keys(allergens))] = label;
      markDirty();
      render();
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    panel.appendChild(h("div", { class: "row", style: "margin-top:14px" }, [
      h("div", { class: "grow" }, [input]),
      h("button", { class: "btn btn--small", type: "button", text: "Ekle", onclick: add }),
    ]));
    return panel;
  }

  // ---------- Başlangıç ----------
  api("/api/session").then(start).catch(function () { showLogin(); });
})();

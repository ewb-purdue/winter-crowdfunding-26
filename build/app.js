(function () {
  "use strict";

  var MEMBERS = __MEMBERS__;
  var TEAM_ORDER = __TEAM_ORDER__;
  var LINK_OK = /^https:\/\/support\.ewb-usa\.org\/fundraiser\/[0-9]{1,12}$/;

  function norm(s) {
    return String(s)
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  var people = [];
  for (var i = 0; i < MEMBERS.length; i++) {
    var m = MEMBERS[i];
    if (!m || typeof m.name !== "string" || typeof m.url !== "string") continue;
    if (m.url && !LINK_OK.test(m.url)) continue;
    var key = norm(m.name);
    people.push({ name: m.name, team: String(m.team || ""), url: m.url, key: key, words: key.split(" ") });
  }
  people.sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });

  var input = document.getElementById("q");
  var clearBtn = document.getElementById("clear");
  var results = document.getElementById("results");
  var statusEl = document.getElementById("status");
  var empty = document.getElementById("empty");
  var emptyQ = document.getElementById("empty-q");

  try {
    if (new URLSearchParams(window.location.search).has("thanks")) {
      document.getElementById("thanks").hidden = false;
    }
  } catch (e) { /* banner stays hidden */ }

  function initials(name) {
    var parts = name.trim().split(/\s+/);
    var first = parts[0] ? parts[0].charAt(0) : "";
    var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (first + last).toUpperCase();
  }

  var arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h8v8h-2V6.4l-6.3 6.3-1.4-1.4L9.6 5H5z" fill="currentColor"/></svg>';

  var tipCount = 0;

  function row(p) {
    var li = document.createElement("li");
    var a;
    if (p.url) {
      a = document.createElement("a");
      a.className = "member";
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "Donate to " + p.name + (p.team ? ", " + p.team : "") + ", opens their Engineers Without Borders USA page in a new tab");
    } else {
      a = document.createElement("div");
      a.className = "member no-page";
    }

    var av = document.createElement("span");
    av.className = "avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = initials(p.name);

    var who = document.createElement("span");
    who.className = "who";
    var nm = document.createElement("span");
    nm.className = "name";
    nm.textContent = p.name;
    var tm = document.createElement("span");
    tm.className = "team";
    tm.textContent = p.team;
    who.appendChild(nm);
    who.appendChild(tm);

    var btn;
    if (p.url) {
      btn = document.createElement("span");
      btn.className = "donate";
      btn.setAttribute("aria-hidden", "true");
      btn.textContent = "Donate";
      btn.insertAdjacentHTML("beforeend", arrow);
    } else {
      btn = document.createElement("span");
      btn.className = "donate-wrap";
      var off = document.createElement("button");
      off.type = "button";
      off.className = "donate donate-off";
      off.setAttribute("aria-disabled", "true");
      off.setAttribute("aria-label", "Donate to " + p.name + ", unavailable");
      off.textContent = "Donate";
      var tip = document.createElement("span");
      tip.className = "tip";
      tip.id = "tip-" + (++tipCount);
      tip.setAttribute("role", "tooltip");
      tip.textContent = p.name.split(" ")[0] + " hasn’t set up a personal crowdfunding page yet.";
      off.setAttribute("aria-describedby", tip.id);
      btn.appendChild(off);
      btn.appendChild(tip);
    }

    a.appendChild(av);
    a.appendChild(who);
    a.appendChild(btn);
    li.appendChild(a);
    return li;
  }

  function list(items) {
    var ul = document.createElement("ul");
    ul.className = "list";
    for (var j = 0; j < items.length; j++) ul.appendChild(row(items[j]));
    return ul;
  }

  function teamRank(team) {
    var k = TEAM_ORDER.indexOf(team);
    return k === -1 ? TEAM_ORDER.length : k;
  }

  function renderAll() {
    var groups = {};
    var names = [];
    for (var j = 0; j < people.length; j++) {
      var t = people[j].team || "Members";
      if (!groups[t]) { groups[t] = []; names.push(t); }
      groups[t].push(people[j]);
    }
    names.sort(function (a, b) { return teamRank(a) - teamRank(b) || (a < b ? -1 : 1); });
    var frag = document.createDocumentFragment();
    for (var k = 0; k < names.length; k++) {
      var h = document.createElement("h2");
      h.className = "group-title";
      h.textContent = names[k];
      frag.appendChild(h);
      frag.appendChild(list(groups[names[k]]));
    }
    results.className = "results-grouped";
    results.replaceChildren(frag);
    statusEl.textContent = people.length + (people.length === 1 ? " member" : " members");
  }

  function score(p, terms) {
    var best = 0;
    for (var t = 0; t < terms.length; t++) {
      var term = terms[t];
      var hit = 0;
      for (var w = 0; w < p.words.length; w++) {
        if (p.words[w].indexOf(term) === 0) { hit = w === 0 ? 3 : 2; break; }
      }
      if (!hit && p.key.indexOf(term) !== -1) hit = 1;
      if (!hit) return 0;
      best += hit;
    }
    return best;
  }

  var shown = [];

  function update() {
    var raw = input.value;
    var q = norm(raw);
    clearBtn.hidden = raw.length === 0;
    if (!q) {
      shown = people.slice();
      empty.hidden = true;
      renderAll();
      return;
    }
    var terms = q.split(" ");
    var hits = [];
    for (var j = 0; j < people.length; j++) {
      var s = score(people[j], terms);
      if (s) hits.push({ p: people[j], s: s });
    }
    hits.sort(function (a, b) { return b.s - a.s || (a.p.key < b.p.key ? -1 : 1); });
    shown = hits.map(function (h) { return h.p; });

    if (!shown.length) {
      results.replaceChildren();
      emptyQ.textContent = raw.trim();
      empty.hidden = false;
      statusEl.textContent = "No matches";
      return;
    }
    empty.hidden = true;
    results.className = "results-flat";
    results.replaceChildren(list(shown));
    statusEl.textContent = shown.length + (shown.length === 1 ? " match" : " matches");
  }

  input.addEventListener("input", update);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (shown.length === 1 && shown[0].url && input.value.trim()) window.open(shown[0].url, "_blank", "noopener");
    } else if (e.key === "Escape") {
      input.value = "";
      update();
    }
  });
  // Greyed-out rows: tap or click shows the "no page yet" note (hover covers mouse users).
  function closeTips(except) {
    var open = results.querySelectorAll(".tip-open");
    for (var j = 0; j < open.length; j++) if (open[j] !== except) open[j].classList.remove("tip-open");
  }
  document.addEventListener("click", function (e) {
    var r = e.target.closest ? e.target.closest(".no-page") : null;
    closeTips(r);
    if (r) r.classList.toggle("tip-open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeTips(null);
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    update();
    input.focus();
  });

  update();
  try {
    if (window.matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
  } catch (e) { /* no autofocus */ }
})();

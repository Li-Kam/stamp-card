/* Stamps of Gold — loads stamps.json and renders the card + jar.
   No build step. Just edit stamps.json and push to GitHub. */

const STAR_SVG =
  '<svg class="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 21s-6.7-4.35-9.3-8.04C1.1 10.7 1.4 7.6 3.7 6.1 5.7 4.8 8.2 5.4 9.6 7.2L12 10l2.4-2.8c1.4-1.8 3.9-2.4 5.9-1.1 2.3 1.5 2.6 4.6.99 6.86C18.7 16.65 12 21 12 21z"/></svg>';

const SEEN_KEY = "stamps-of-gold-seen";

function getSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || { stamps: 0, nuggets: 0 }; }
  catch { return { stamps: 0, nuggets: 0 }; }
}
function setSeen(v) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

async function load() {
  let data;
  try {
    const res = await fetch("stamps.json", { cache: "no-store" });
    data = await res.json();
  } catch (e) {
    document.querySelector(".layout").innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:#a00">Could not load stamps.json. ' +
      'If you opened this file directly, run a local server (see README).</p>';
    return;
  }
  render(data);
}

function render(data) {
  const cfg = data.config || {};
  const perCard = cfg.stampsPerCard || 10;
  const cards = data.cards || [];

  // ----- text personalization -----
  if (cfg.herName) document.getElementById("eyebrow").textContent = "For " + cfg.herName;
  if (cfg.title) {
    document.getElementById("title").textContent = cfg.title;
    document.title = cfg.title;
  }
  document.getElementById("subtitle").textContent = cfg.subtitle || "";
  document.getElementById("footer-msg").textContent = cfg.message || "";

  // A card earns a nugget once it's full AND marked redeemed (true), OR simply full.
  // We treat a "completed" card as one with >= perCard stamps.
  const completedCards = cards.filter((c) => (c.stamps || []).length >= perCard);
  const nuggetTotal = completedCards.length;

  // current card = first card that isn't full yet, else a fresh empty one
  const currentCard =
    cards.find((c) => (c.stamps || []).length < perCard) ||
    cards[cards.length - 1] ||
    { stamps: [] };
  const currentStamps = currentCard.stamps || [];

  const seen = getSeen();

  renderCard(currentStamps, perCard, seen);
  renderJar(nuggetTotal, seen);
  renderHistory(completedCards, perCard);

  // counts
  document.getElementById("card-progress").textContent =
    Math.min(currentStamps.length, perCard) + " / " + perCard;
  const nEl = document.getElementById("nugget-count");
  const wordEl = document.getElementById("nugget-word");
  wordEl.textContent = nuggetTotal === 1 ? "nugget" : "nuggets";
  animateCount(nEl, seen.nuggets || 0, nuggetTotal);

  const remaining = perCard - currentStamps.length;
  const jarSub = document.getElementById("jar-sub");
  if (currentStamps.length >= perCard) {
    jarSub.textContent = "Card full — ready to trade for gold!";
  } else if (remaining === 1) {
    jarSub.textContent = "1 more stamp until the next nugget.";
  } else {
    jarSub.textContent = remaining + " more stamps until the next nugget.";
  }

  // remember what she's now seen
  setSeen({ stamps: currentStamps.length, nuggets: nuggetTotal });
}

function renderCard(stamps, perCard, seen) {
  const card = document.getElementById("stamp-card");
  card.innerHTML = "";
  const justCompleted = stamps.length >= perCard && (seen.stamps || 0) < perCard;

  for (let i = 0; i < perCard; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    const stamp = stamps[i];
    if (stamp) {
      slot.classList.add("filled");
      slot.innerHTML = STAR_SVG;
      slot.setAttribute("role", "button");
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("aria-label", "Stamp " + (i + 1) + " — tap to read why");
      // animate stamps newer than what she last saw
      if (i >= (seen.stamps || 0)) {
        slot.classList.add("is-new");
        slot.style.animationDelay = (i - (seen.stamps || 0)) * 0.18 + "s";
      }
      if (justCompleted) slot.classList.add("complete-pulse");
      const open = () => openReason(i + 1, stamp);
      slot.addEventListener("click", open);
      slot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    } else {
      slot.textContent = i + 1;
    }
    card.appendChild(slot);
  }

  // banner when full
  const existing = document.querySelector(".card-complete-banner");
  if (existing) existing.remove();
  if (stamps.length >= perCard) {
    const banner = document.createElement("div");
    banner.className = "card-complete-banner";
    banner.innerHTML = '<span class="banner-mark">&#9825;</span> This card is full — trade it in for a real nugget of gold.';
    card.after(banner);
  }
}

function renderJar(count, seen) {
  const g = document.getElementById("nuggets");
  g.innerHTML = "";
  // Deterministic pile positions inside the jar interior.
  // Interior roughly x:[56,164], floor near y:268, stacks upward.
  const cols = [70, 90, 110, 130, 150];
  const rng = mulberry32(1234);
  const newFrom = seen.nuggets || 0;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols.length);
    const colIdx = i % cols.length;
    const jitterX = (rng() - 0.5) * 14;
    const jitterY = (rng() - 0.5) * 6;
    const cx = cols[colIdx] + jitterX + (row % 2) * 8;
    const cy = 262 - row * 20 + jitterY;
    const r = 11 + rng() * 3;

    const nug = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const body = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    body.setAttribute("cx", cx);
    body.setAttribute("cy", cy);
    body.setAttribute("rx", r);
    body.setAttribute("ry", r * 0.82);
    body.setAttribute("class", "nugget");

    const shine = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    shine.setAttribute("cx", cx - r * 0.3);
    shine.setAttribute("cy", cy - r * 0.35);
    shine.setAttribute("rx", r * 0.28);
    shine.setAttribute("ry", r * 0.18);
    shine.setAttribute("class", "nugget-shine");

    nug.appendChild(body);
    nug.appendChild(shine);

    // drop animation for newly earned nuggets
    if (i >= newFrom) {
      body.classList.add("dropping");
      body.style.animationDelay = (i - newFrom) * 0.35 + "s";
    }
    g.appendChild(nug);
  }
}

function renderHistory(completedCards, perCard) {
  const wrap = document.getElementById("history");
  const list = document.getElementById("history-list");
  if (!completedCards.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  list.innerHTML = "";
  completedCards.forEach((card, idx) => {
    const el = document.createElement("div");
    el.className = "history-card";
    const reasons = (card.stamps || [])
      .slice(0, perCard)
      .map((s) => "<li>" + escapeHtml(s.reason || "") + "</li>")
      .join("");
    el.innerHTML =
      '<h3><span class="hist-mark">&#9825;</span> Card ' + (idx + 1) + "</h3><ol>" + reasons + "</ol>";
    list.appendChild(el);
  });
}

/* ---------- Reason modal ---------- */
function openReason(no, stamp) {
  document.getElementById("reason-no").textContent = "Stamp #" + no;
  document.getElementById("reason-text").textContent = "“" + (stamp.reason || "") + "”";
  document.getElementById("reason-date").textContent = stamp.date ? formatDate(stamp.date) : "";
  document.getElementById("reason-modal").hidden = false;
}
function closeReason() { document.getElementById("reason-modal").hidden = true; }

document.getElementById("reason-close").addEventListener("click", closeReason);
document.getElementById("reason-modal").addEventListener("click", (e) => {
  if (e.target.id === "reason-modal") closeReason();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeReason(); });

/* ---------- helpers ---------- */
function animateCount(el, from, to) {
  if (from === to) { el.textContent = to; return; }
  const steps = Math.max(1, to - from);
  let cur = from;
  const tick = () => {
    cur++;
    el.textContent = cur;
    if (cur < to) setTimeout(tick, Math.min(400, 900 / steps));
  };
  setTimeout(tick, 400);
}
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// tiny seeded RNG so the pile looks the same every load
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

load();

/* ============================================
   SILLAGE — catalogue.js
   Filtres, tri, pagination, lecture des query params.
   Utilise getAllListings() async depuis store.js.
   Dépendances : store.js, main.js
============================================ */

const PAGE_SIZE = 9;

let state = {
  q: '',
  maisons: new Set(),
  familles: new Set(),
  fillRanges: new Set(),
  priceMin: null,
  priceMax: null,
  sort: 'recent',
  page: 1
};

let allListings = [];

/* ---------- Point d'entrée ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  showSkeletons();
  await ensureWishlistLoaded();
  allListings = await getAllListings();

  buildFilterPanels();
  readQueryParams();
  applyCheckboxesFromState();
  initEvents();
  renderAll();

  if (window.innerWidth <= 980) {
    document.getElementById('sidebar')?.classList.add('collapsed-mobile');
  }
});

/* ---------- Skeletons ---------- */
function showSkeletons() {
  const grid = document.getElementById('catalogueGrid');
  if (!grid) return;
  grid.innerHTML = Array(9).fill(0).map(() => `
    <div class="product-card skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-image"></div>
      <div class="product-card-body">
        <div class="skeleton skeleton-text" style="width:55%"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width:35%"></div>
      </div>
    </div>`).join('');
}

/* ---------- SVG check ---------- */
function checkSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>`;
}

/* ---------- Construction des panneaux de filtre ---------- */
function buildFilterPanels() {
  const maisonWrap = document.getElementById('maisonFilters');
  if (maisonWrap) {
    const maisons = [...new Set(allListings.map(l => l.maison))].sort();
    maisonWrap.innerHTML = maisons.map(m => {
      const count = allListings.filter(l => l.maison === m).length;
      return `<label class="filter-option">
        <input type="checkbox" name="maison" value="${escapeHTML(m)}">
        <span class="filter-check">${checkSVG()}</span>
        <span class="filter-option-label">${escapeHTML(m)}</span>
        <span class="filter-count">${count}</span>
      </label>`;
    }).join('');
  }

  const familleWrap = document.getElementById('familleFilters');
  if (familleWrap) {
    const familles = [...new Set(allListings.map(l => l.famille))].map(f => ({
      key: f,
      label: allListings.find(l => l.famille === f)?.familleLabel || familyLabel(f)
    }));
    familleWrap.innerHTML = familles.map(f => {
      const count = allListings.filter(l => l.famille === f.key).length;
      return `<label class="filter-option">
        <input type="checkbox" name="famille" value="${f.key}">
        <span class="filter-check">${checkSVG()}</span>
        <span class="filter-option-label">${escapeHTML(f.label)}</span>
        <span class="filter-count">${count}</span>
      </label>`;
    }).join('');
  }
}

/* ---------- Query params → state ---------- */
function readQueryParams() {
  const params = new URLSearchParams(window.location.search);

  const q = params.get('q') || params.get('search');
  if (q) {
    state.q = q;
    const si = document.getElementById('searchInput');
    if (si) si.value = q;
  }

  if (params.get('maison')) {
    const target = params.get('maison').toLowerCase();
    const maisons = [...new Set(allListings.map(l => l.maison))];
    const match = maisons.find(m =>
      m.toLowerCase().includes(target) || target.includes(m.toLowerCase().split(' ')[0])
    );
    if (match) state.maisons.add(match);
  }

  if (params.get('famille')) {
    state.familles.add(params.get('famille'));
  }

  const tag = params.get('tag');
  if (tag === 'vintage') state.q = 'vintage';
  if (tag === 'rares')   state.familles.add('epice');
}

/* ---------- Cocher les checkboxes depuis l'état ---------- */
function applyCheckboxesFromState() {
  document.querySelectorAll('input[name="maison"]').forEach(cb => {
    cb.checked = state.maisons.has(cb.value);
  });
  document.querySelectorAll('input[name="famille"]').forEach(cb => {
    cb.checked = state.familles.has(cb.value);
  });
  document.querySelectorAll('input[name="fill"]').forEach(cb => {
    cb.checked = state.fillRanges.has(cb.value);
  });
}

/* ---------- Filtrage ---------- */
function matchesFilters(l) {
  if (state.q) {
    const hay = `${l.maison} ${l.nom} ${l.familleLabel || ''} ${l.desc || ''}`.toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  if (state.maisons.size  && !state.maisons.has(l.maison))   return false;
  if (state.familles.size && !state.familles.has(l.famille)) return false;

  if (state.fillRanges.size) {
    let ok = false;
    state.fillRanges.forEach(r => {
      const cb  = document.querySelector(`input[name="fill"][value="${r}"]`);
      const min = cb ? +cb.dataset.min : 0;
      const max = cb && cb.dataset.max ? +cb.dataset.max : 100;
      if (l.fill >= min && l.fill <= max) ok = true;
    });
    if (!ok) return false;
  }

  if (state.priceMin != null && l.prix < state.priceMin) return false;
  if (state.priceMax != null && l.prix > state.priceMax) return false;
  return true;
}

/* ---------- Tri ---------- */
function sortListings(arr) {
  const sorted = [...arr];
  switch (state.sort) {
    case 'price-asc':  sorted.sort((a, b) => a.prix - b.prix);  break;
    case 'price-desc': sorted.sort((a, b) => b.prix - a.prix);  break;
    case 'rating':     sorted.sort((a, b) => b.note - a.note);  break;
    case 'fill-asc':   sorted.sort((a, b) => a.fill - b.fill);  break;
    default: break;
  }
  return sorted;
}

/* ---------- Filtres actifs (chips) ---------- */
function renderActiveFilters() {
  const wrap = document.getElementById('activeFilters');
  if (!wrap) return;

  const chips = [];
  state.maisons.forEach(m => chips.push({ type: 'maison', value: m, label: m }));
  state.familles.forEach(f => {
    const lbl = allListings.find(l => l.famille === f)?.familleLabel || familyLabel(f);
    chips.push({ type: 'famille', value: f, label: lbl });
  });
  if (state.priceMin != null || state.priceMax != null) {
    chips.push({
      type: 'price', value: 'price',
      label: `${state.priceMin || 0} € – ${state.priceMax != null ? state.priceMax + ' €' : '∞'}`
    });
  }
  if (state.q) chips.push({ type: 'q', value: state.q, label: `"${state.q}"` });

  wrap.innerHTML = chips.map(c => `
    <span class="active-filter-chip">
      ${escapeHTML(c.label)}
      <button onclick="removeFilter('${c.type}','${escapeHTML(c.value).replace(/'/g, "\\'")}')"
        aria-label="Retirer ${escapeHTML(c.label)}">✕</button>
    </span>`).join('');
}

function removeFilter(type, value) {
  if (type === 'maison')  state.maisons.delete(value);
  if (type === 'famille') state.familles.delete(value);
  if (type === 'q') {
    state.q = '';
    const si = document.getElementById('searchInput');
    if (si) si.value = '';
  }
  if (type === 'price') {
    state.priceMin = null;
    state.priceMax = null;
    const mn = document.getElementById('priceMin');
    const mx = document.getElementById('priceMax');
    if (mn) mn.value = '';
    if (mx) mx.value = '';
  }
  state.page = 1;
  applyCheckboxesFromState();
  renderAll();
}

/* ---------- Pagination ---------- */
function renderPagination(total) {
  const wrap  = document.getElementById('pagination');
  if (!wrap) return;
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { wrap.innerHTML = ''; return; }

  let html = `<button class="page-btn" ${state.page === 1 ? 'disabled' : ''}
    onclick="goPage(${state.page - 1})" aria-label="Page précédente">‹</button>`;

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
      html += `<button class="page-btn ${i === state.page ? 'active' : ''}"
        onclick="goPage(${i})" aria-current="${i === state.page ? 'page' : 'false'}">${i}</button>`;
    } else if (Math.abs(i - state.page) === 2) {
      html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
    }
  }

  html += `<button class="page-btn" ${state.page === pages ? 'disabled' : ''}
    onclick="goPage(${state.page + 1})" aria-label="Page suivante">›</button>`;

  wrap.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  renderAll();
  document.getElementById('catalogueGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- Rendu principal ---------- */
function renderAll() {
  const filtered  = sortListings(allListings.filter(matchesFilters));
  const total     = filtered.length;
  const start     = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const grid    = document.getElementById('catalogueGrid');
  const empty   = document.getElementById('emptyState');
  const counter = document.getElementById('resultsCount');

  if (counter) counter.textContent = `${total} flacon${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`;
  if (grid)  grid.innerHTML  = pageItems.map(renderCard).join('');
  if (empty) empty.style.display = total === 0 ? 'block' : 'none';
  if (grid)  grid.style.display  = total === 0 ? 'none'  : 'grid';

  renderActiveFilters();
  renderPagination(total);

  /* Brancher les boutons wishlist générés par renderCard */
  pageItems.forEach(l => {
    const btn = grid?.querySelector(`[data-wish-btn="${l.id}"]`);
    if (btn) btn.addEventListener('click', () => toggleWishlist(l.id, btn));
  });
}

/* ---------- Événements ---------- */
function initEvents() {
  document.getElementById('maisonFilters')?.addEventListener('change', e => {
    if (e.target.name !== 'maison') return;
    e.target.checked ? state.maisons.add(e.target.value) : state.maisons.delete(e.target.value);
    state.page = 1;
    renderAll();
  });

  document.getElementById('familleFilters')?.addEventListener('change', e => {
    if (e.target.name !== 'famille') return;
    e.target.checked ? state.familles.add(e.target.value) : state.familles.delete(e.target.value);
    state.page = 1;
    renderAll();
  });

  document.querySelectorAll('input[name="fill"]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.checked ? state.fillRanges.add(cb.value) : state.fillRanges.delete(cb.value);
      state.page = 1;
      renderAll();
    });
  });

  document.getElementById('priceMin')?.addEventListener('input', e => {
    state.priceMin = e.target.value ? +e.target.value : null;
    state.page = 1;
    renderAll();
  });

  document.getElementById('priceMax')?.addEventListener('input', e => {
    state.priceMax = e.target.value ? +e.target.value : null;
    state.page = 1;
    renderAll();
  });

  document.getElementById('sortSelect')?.addEventListener('change', e => {
    state.sort = e.target.value;
    renderAll();
  });

  document.getElementById('searchInput')?.addEventListener('input', e => {
    state.q = e.target.value.trim();
    state.page = 1;
    renderAll();
  });

  document.getElementById('resetFilters')?.addEventListener('click', resetAll);
  document.getElementById('emptyReset')?.addEventListener('click', resetAll);

  document.getElementById('filtersToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('collapsed-mobile');
  });
}

/* ---------- Reset ---------- */
function resetAll() {
  state = {
    q: '',
    maisons: new Set(),
    familles: new Set(),
    fillRanges: new Set(),
    priceMin: null,
    priceMax: null,
    sort: 'recent',
    page: 1
  };
  const si = document.getElementById('searchInput');
  const mn = document.getElementById('priceMin');
  const mx = document.getElementById('priceMax');
  const ss = document.getElementById('sortSelect');
  if (si) si.value = '';
  if (mn) mn.value = '';
  if (mx) mx.value = '';
  if (ss) ss.value = 'recent';
  applyCheckboxesFromState();
  renderAll();
}

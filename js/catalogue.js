/* ============================================
   SILLAGE — catalogue.js
   Filtres, tri, pagination, lecture des query params
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

const MAISONS = [...new Set(LISTINGS.map(l => l.maison))].sort();
const FAMILLES = [...new Set(LISTINGS.map(l => l.famille))].map(f => ({
  key: f,
  label: LISTINGS.find(l => l.famille === f).familleLabel
}));

function checkSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg>`;
}

function buildFilterPanels() {
  const maisonWrap = document.getElementById('maisonFilters');
  maisonWrap.innerHTML = MAISONS.map(m => {
    const count = LISTINGS.filter(l => l.maison === m).length;
    return `<label class="filter-option">
      <input type="checkbox" name="maison" value="${m}">
      <span class="filter-check">${checkSVG()}</span>
      <span class="filter-option-label">${m}</span>
      <span class="filter-count">${count}</span>
    </label>`;
  }).join('');

  const familleWrap = document.getElementById('familleFilters');
  familleWrap.innerHTML = FAMILLES.map(f => {
    const count = LISTINGS.filter(l => l.famille === f.key).length;
    return `<label class="filter-option">
      <input type="checkbox" name="famille" value="${f.key}">
      <span class="filter-check">${checkSVG()}</span>
      <span class="filter-option-label">${f.label}</span>
      <span class="filter-count">${count}</span>
    </label>`;
  }).join('');
}

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) state.q = params.get('q');
  if (params.get('maison')) {
    const m = MAISONS.find(x => x.toLowerCase().includes(params.get('maison').toLowerCase()) || params.get('maison').toLowerCase().includes(x.toLowerCase().split(' ')[0]));
    if (m) state.maisons.add(m);
  }
  const tag = params.get('tag');
  if (tag === 'vintage') state.q = 'vintage';
  if (tag === 'rares') state.familles.add('epice'); // illustratif
}

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

function matchesFilters(l) {
  if (state.q) {
    const hay = (l.maison + ' ' + l.nom + ' ' + l.familleLabel).toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  if (state.maisons.size && !state.maisons.has(l.maison)) return false;
  if (state.familles.size && !state.familles.has(l.famille)) return false;
  if (state.fillRanges.size) {
    let ok = false;
    state.fillRanges.forEach(r => {
      const cb = document.querySelector(`input[name="fill"][value="${r}"]`);
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

function sortListings(arr) {
  const sorted = [...arr];
  switch (state.sort) {
    case 'price-asc': sorted.sort((a, b) => a.prix - b.prix); break;
    case 'price-desc': sorted.sort((a, b) => b.prix - a.prix); break;
    case 'rating': sorted.sort((a, b) => b.note - a.note); break;
    case 'fill-asc': sorted.sort((a, b) => a.fill - b.fill); break;
    default: break; // 'recent' = ordre d'origine
  }
  return sorted;
}

function renderActiveFilters() {
  const wrap = document.getElementById('activeFilters');
  const chips = [];
  state.maisons.forEach(m => chips.push({ type: 'maison', value: m, label: m }));
  state.familles.forEach(f => {
    const label = FAMILLES.find(x => x.key === f)?.label || f;
    chips.push({ type: 'famille', value: f, label });
  });
  if (state.priceMin != null || state.priceMax != null) {
    chips.push({ type: 'price', value: 'price', label: `${state.priceMin || 0}€ – ${state.priceMax || '∞'}€` });
  }
  if (!chips.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = chips.map(c => `
    <span class="active-filter-chip">
      ${c.label}
      <button onclick="removeFilter('${c.type}','${c.value}')" aria-label="Retirer ${c.label}">✕</button>
    </span>`).join('');
}

function removeFilter(type, value) {
  if (type === 'maison') state.maisons.delete(value);
  if (type === 'famille') state.familles.delete(value);
  if (type === 'price') { state.priceMin = null; state.priceMax = null; document.getElementById('priceMin').value = ''; document.getElementById('priceMax').value = ''; }
  state.page = 1;
  applyCheckboxesFromState();
  renderAll();
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const wrap = document.getElementById('pagination');
  if (pages <= 1) { wrap.innerHTML = ''; return; }
  let html = `<button class="page-btn" ${state.page === 1 ? 'disabled' : ''} onclick="goPage(${state.page - 1})">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
      html += `<button class="page-btn ${i === state.page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    } else if (Math.abs(i - state.page) === 2) {
      html += `<span style="color:var(--text-tertiary);padding:0 4px">…</span>`;
    }
  }
  html += `<button class="page-btn" ${state.page === pages ? 'disabled' : ''} onclick="goPage(${state.page + 1})">›</button>`;
  wrap.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  renderAll();
  document.getElementById('catalogueGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAll() {
  const filtered = sortListings(LISTINGS.filter(matchesFilters));
  const total = filtered.length;
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  document.getElementById('resultsCount').textContent = `${total} flacon${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}`;
  document.getElementById('catalogueGrid').innerHTML = pageItems.map(renderCard).join('');
  document.getElementById('emptyState').style.display = total === 0 ? 'block' : 'none';
  document.getElementById('catalogueGrid').style.display = total === 0 ? 'none' : 'grid';

  renderActiveFilters();
  renderPagination(total);
}

function initEvents() {
  document.getElementById('maisonFilters').addEventListener('change', (e) => {
    if (e.target.name !== 'maison') return;
    e.target.checked ? state.maisons.add(e.target.value) : state.maisons.delete(e.target.value);
    state.page = 1;
    renderAll();
  });

  document.getElementById('familleFilters').addEventListener('change', (e) => {
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

  document.getElementById('priceMin').addEventListener('input', (e) => {
    state.priceMin = e.target.value ? +e.target.value : null;
    state.page = 1;
    renderAll();
  });
  document.getElementById('priceMax').addEventListener('input', (e) => {
    state.priceMax = e.target.value ? +e.target.value : null;
    state.page = 1;
    renderAll();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderAll();
  });

  document.getElementById('resetFilters').addEventListener('click', resetAll);
  document.getElementById('emptyReset').addEventListener('click', resetAll);

  document.getElementById('filtersToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed-mobile');
  });
}

function resetAll() {
  state = { q: '', maisons: new Set(), familles: new Set(), fillRanges: new Set(), priceMin: null, priceMax: null, sort: 'recent', page: 1 };
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.getElementById('sortSelect').value = 'recent';
  applyCheckboxesFromState();
  renderAll();
}

buildFilterPanels();
readQueryParams();
applyCheckboxesFromState();
initEvents();
renderAll();

// Sidebar visible par défaut sur mobile tant qu'on n'a pas cliqué (UX: cachée par défaut sous 980px)
if (window.innerWidth <= 980) {
  document.getElementById('sidebar').classList.add('collapsed-mobile');
}

/* ============================================
   SILLAGE — store.js
   Couche d'accès aux données : annonces, favoris,
   profil. Persistance via window.storage (partagée
   entre tous les visiteurs : shared = true).
   Aucune fausse annonce : le catalogue démarre vide.
   ============================================ */

const STORAGE_KEY_LISTINGS = 'listings'; // shared
const STORAGE_KEY_PROFILE  = 'profile';   // personnel
const STORAGE_KEY_WISHLIST = 'wishlist';  // personnel
const STORAGE_KEY_INDEX    = 'listings-index'; // shared : liste des ids, pour pouvoir tout lister

/* ---------- Familles olfactives : utilisées pour la teinte des illustrations ---------- */
const FAMILY_GLOW = {
  floral:     "#7C8CB8",
  oriental:   "#9A7CB8",
  boise:      "#6F8C7A",
  fougere:    "#7CA098",
  ambre:      "#B89A7C",
  hesperide:  "#7CA8B8",
  epice:      "#B87C8C",
  aquatique:  "#5C9CC4",
  autre:      "#8893A6"
};

const FAMILY_LABELS = {
  floral:    "Floral",
  oriental:  "Oriental",
  boise:     "Boisé",
  fougere:   "Fougère",
  ambre:     "Ambré",
  hesperide: "Hespéridé",
  epice:     "Épicé",
  aquatique: "Aquatique",
  autre:     "Autre"
};

const MAISON_SUGGESTIONS = [
  "Chanel", "Dior", "Creed", "Maison Francis Kurkdjian", "Tom Ford",
  "Serge Lutens", "Amouage", "Guerlain", "Yves Saint Laurent", "Hermès",
  "Le Labo", "Byredo", "Diptyque", "Parfums de Marly", "Xerjoff",
  "Nishane", "Initio", "Mancera", "Montale", "Roja Parfums"
];

function familyTint(famille) {
  return FAMILY_GLOW[famille] || FAMILY_GLOW.autre;
}

function familyLabel(famille) {
  return FAMILY_LABELS[famille] || famille || "Non précisé";
}

/* ---------- Illustration SVG générée (pas de vraie photo) ---------- */
function bottleSVG(famille, size = "100%") {
  const tint = familyTint(famille);
  return `<svg viewBox="0 0 60 84" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="22" y="6" width="16" height="10" rx="2" fill="none" stroke="${tint}" stroke-width="1.4"></rect>
<path d="M24 16h12l3 8v50a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V24l3-8Z" fill="${tint}" fill-opacity="0.14" stroke="${tint}" stroke-width="1.4"></path>
<line x1="20" y1="40" x2="40" y2="40" stroke="${tint}" stroke-width="1" stroke-opacity="0.5"></line>
<circle cx="30" cy="4" r="2" fill="${tint}"></circle>
 </svg>`;
}

/* ---------- Utilitaires ---------- */
function formatPrice(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('fr-FR') + ' €';
}

function starsString(note) {
  const n = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
}

function slugify(str) {
  return (str || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateId(maison, nom) {
  const base = slugify(`${maison}-${nom}`) || 'annonce';
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base}-${rand}`;
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ---------- Storage helpers ---------- */
async function safeGet(key, shared) {
  try {
    const res = await window.storage.get(key, shared);
    return res ? res.value : null;
  } catch (e) {
    return null;
  }
}

async function safeSet(key, value, shared) {
  try {
    const res = await window.storage.set(key, value, shared);
    return !!res;
  } catch (e) {
    console.error('Erreur de sauvegarde', key, e);
    return false;
  }
}

/* ---------- Index des annonces ---------- */
async function getListingIndex() {
  const raw = await safeGet(STORAGE_KEY_INDEX, true);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

async function setListingIndex(ids) {
  return safeSet(STORAGE_KEY_INDEX, JSON.stringify(ids), true);
}

/* ---------- API publique : annonces ---------- */
async function getAllListings() {
  const ids = await getListingIndex();
  if (!ids.length) return [];
  const listings = await Promise.all(ids.map(async id => {
    const raw = await safeGet(`listing:${id}`, true);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }));
  return listings.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function getListing(id) {
  const raw = await safeGet(`listing:${id}`, true);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function createListing(data) {
  const id = generateId(data.maison, data.nom);
  const profile = await getProfile();

  const listing = {
    id,
    maison:       (data.maison || '').trim(),
    nom:          (data.nom || '').trim(),
    famille:      data.famille || 'autre',
    familleLabel: data.familleLabel || familyLabel(data.famille),
    volume:       Number(data.volume) || null,
    fill:         Number(data.fill) || 100,
    prix:         Number(data.prix) || 0,
    prixNeuf:     data.prixNeuf ? Number(data.prixNeuf) : null,
    desc:         (data.desc || '').trim(),
    ville:        profile.ville || 'France',
    avatar:       initials(profile.nom || 'Vendeur'),
    vendeur:      profile.nom || 'Vendeur Sillage',
    note:         0,
    avis:         0,
    statut:       'active',
    createdAt:    Date.now()
  };

  const ok = await safeSet(`listing:${id}`, JSON.stringify(listing), true);
  if (!ok) throw new Error('Impossible d\'enregistrer l\'annonce.');

  const ids = await getListingIndex();
  ids.unshift(id);
  await setListingIndex(ids);

  const myIds = await getMyListingIds();
  myIds.unshift(id);
  await safeSet('my-listing-ids', JSON.stringify(myIds), false);

  return listing;
}

async function deleteListing(id) {
  const ids = (await getListingIndex()).filter(x => x !== id);
  await setListingIndex(ids);
  try { await window.storage.delete(`listing:${id}`, true); } catch (e) { }
  const myIds = (await getMyListingIds()).filter(x => x !== id);
  await safeSet('my-listing-ids', JSON.stringify(myIds), false);
}

async function getMyListingIds() {
  const raw = await safeGet('my-listing-ids', false);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

async function getMyListings() {
  const ids = await getMyListingIds();
  const listings = await Promise.all(ids.map(getListing));
  return listings.filter(Boolean);
}

/* ---------- API publique : profil ---------- */
async function getProfile() {
  const raw = await safeGet(STORAGE_KEY_PROFILE, false);
  if (!raw) return { nom: '', ville: '', email: '', stripeConnected: false };
  try { return JSON.parse(raw); } catch (e) { return { nom: '', ville: '', email: '', stripeConnected: false }; }
}

async function saveProfile(profile) {
  return safeSet(STORAGE_KEY_PROFILE, JSON.stringify(profile), false);
}

/* ---------- API publique : favoris ---------- */
async function getWishlistIds() {
  const raw = await safeGet(STORAGE_KEY_WISHLIST, false);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { return []; }
}

async function setWishlistIds(ids) {
  return safeSet(STORAGE_KEY_WISHLIST, JSON.stringify(ids), false);
}

async function toggleWishlistId(id) {
  const ids = await getWishlistIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) { ids.splice(idx, 1); }
  else { ids.unshift(id); }
  await setWishlistIds(ids);
  return ids.includes(id);
}

async function getWishlistListings() {
  const ids = await getWishlistIds();
  const listings = await Promise.all(ids.map(getListing));
  return listings.filter(Boolean);
}

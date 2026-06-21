/* ============================================
   SILLAGE — data.js
   Utilitaires partagés conservés pour
   compatibilité avec les anciens appels.
   Les annonces sont désormais gérées
   exclusivement via store.js (getAllListings,
   getListing, createListing, deleteListing).
   ============================================ */

/* Palette de glow par famille olfactive */
const FAMILY_GLOW = {
  floral:    "#7C8CB8",
  oriental:  "#9A7CB8",
  boise:     "#6F8C7A",
  fougere:   "#7CA098",
  ambre:     "#B89A7C",
  hesperide: "#7CA8B8",
  epice:     "#B87C8C",
  aquatique: "#5C9CC4",
  autre:     "#9A9A9A"
};

/* Labels lisibles par famille */
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

/* Retourne le label lisible d'une famille */
function familyLabel(famille) {
  return FAMILY_LABELS[famille] || famille;
}

/* Retourne la couleur de glow d'une famille */
function familyTint(famille) {
  return FAMILY_GLOW[famille] || FAMILY_GLOW.autre;
}

/* Génère un flacon SVG élégant teinté par famille */
function bottleSVG(family, size = "100%") {
  const tint = FAMILY_GLOW[family] || FAMILY_GLOW.autre;
  return `<svg viewBox="0 0 60 84" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="6" width="16" height="10" rx="2" fill="none" stroke="${tint}" stroke-width="1.4"/>
    <path d="M24 16h12l3 8v50a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V24l3-8Z"
      fill="${tint}" fill-opacity="0.14" stroke="${tint}" stroke-width="1.4"/>
    <line x1="20" y1="40" x2="40" y2="40" stroke="${tint}" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="30" cy="4" r="2" fill="${tint}"/>
  </svg>`;
}

/* Formatage prix FR */
function formatPrice(n) {
  if (n == null || isNaN(n)) return '— €';
  return Number(n).toLocaleString('fr-FR') + ' €';
}

/* Étoiles texte */
function starsString(note) {
  const full = Math.min(5, Math.max(0, Math.round(note || 0)));
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/* findListing conservé pour éviter les erreurs
   sur les pages pas encore migrées — délègue à store.js */
function findListing(id) {
  console.warn('findListing() est déprécié — utilisez getListing(id) depuis store.js');
  return null;
}

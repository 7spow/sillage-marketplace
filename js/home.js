/* ============================================
   SILLAGE — home.js
   Affichage des annonces vedettes sur l'accueil
   ============================================ */

(function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = LISTINGS.slice(0, 6);
  grid.innerHTML = featured.map(renderCard).join('');
})();

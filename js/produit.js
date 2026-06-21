/* ============================================
   SILLAGE — produit.js
   Rendu de la fiche produit selon ?id= dans l'URL
   ============================================ */

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || LISTINGS[0].id;
}

function generateReviews(listing) {
  const pool = [
    { name: "Camille R.", note: 5, text: "Parfait, exactement comme décrit. Vendeur très réactif et envoi rapide." },
    { name: "Antoine D.", note: 5, text: "Flacon en excellent état, emballage soigné. Je recommande sans hésiter." },
    { name: "Léa M.", note: 4, text: "Très satisfaite, juste un léger retard de livraison indépendant du vendeur." },
    { name: "Hugo P.", note: 5, text: "Transaction fluide du début à la fin, le parfum est authentique à 100%." }
  ];
  return pool.slice(0, 3 + (listing.id.length % 2));
}

function renderProduct() {
  const id = getProductId();
  const listing = findListing(id) || LISTINGS[0];
  const fee = Math.round(listing.prix * 0.03 + 2);

  document.title = `${listing.nom} — ${listing.maison} | Sillage`;
  document.getElementById('breadcrumbCurrent').textContent = `${listing.maison} ${listing.nom}`;

  const tint = FAMILY_GLOW[listing.famille];
  const wished = isWishlisted(listing.id);

  document.getElementById('productLayout').innerHTML = `
    <div class="product-gallery">
      <div class="gallery-main">
        <div class="gallery-main-glow" style="background:radial-gradient(circle, ${tint}, transparent 70%)"></div>
        ${bottleSVG(listing.famille, '180')}
      </div>
      <div class="gallery-thumbs">
        <div class="gallery-thumb active">${bottleSVG(listing.famille, '34')}</div>
        <div class="gallery-thumb">${bottleSVG(listing.famille, '34')}</div>
        <div class="gallery-thumb">${bottleSVG(listing.famille, '34')}</div>
        <div class="gallery-thumb">${bottleSVG(listing.famille, '34')}</div>
      </div>
    </div>

    <div class="product-info">
      <div class="p-maison">${listing.maison}</div>
      <h1>${listing.nom}</h1>
      <div class="rating-row">
        <span class="rating-stars">${starsString(listing.note)}</span>
        <span>${listing.note.toFixed(1)} · ${listing.avis} avis</span>
        <span>·</span>
        <span>${listing.ville}</span>
      </div>

      <div class="price-block">
        <span class="price-now">${formatPrice(listing.prix)}</span>
        <span class="price-was">${formatPrice(listing.prixNeuf)}</span>
        <span class="price-save">− ${Math.round((1 - listing.prix / listing.prixNeuf) * 100)}% vs prix boutique</span>
      </div>

      <div class="spec-grid">
        <div class="spec-cell"><span>Volume</span><strong>${listing.volume} ml</strong></div>
        <div class="spec-cell"><span>Remplissage</span><strong>${listing.fill}%</strong></div>
        <div class="spec-cell"><span>Famille</span><strong>${listing.familleLabel}</strong></div>
      </div>

      <div class="fill-meter">
        <div class="fill-meter-label"><span>Niveau de remplissage</span><span>${listing.fill}%</span></div>
        <div class="fill-meter-bar"><div class="fill-meter-fill" style="width:${listing.fill}%"></div></div>
      </div>

      <p class="product-desc">"${listing.desc}"</p>

      <div class="seller-box">
        <div class="seller-avatar-lg">${listing.avatar}</div>
        <div class="seller-box-info">
          <strong>${listing.vendeur}</strong>
          <span>${starsString(listing.note)} ${listing.note.toFixed(1)} · Vendeur vérifié ✦ · ${listing.ville}</span>
        </div>
        <button class="btn btn-secondary btn-sm">Contacter</button>
      </div>

      <div class="product-actions">
        <button class="btn btn-secondary" id="wishlistBtn" onclick="toggleWishlist('${listing.id}', this)">
          ${wished ? '♥ Dans vos favoris' : '♡ Ajouter aux favoris'}
        </button>
        <button class="btn btn-primary" onclick="openCheckout('${listing.id}')">
          Acheter · Paiement sécurisé
        </button>
      </div>

      <div class="guarantee-note">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" style="flex-shrink:0"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
        Paiement Stripe sécurisé · Fonds retenus jusqu'à confirmation de réception
      </div>
    </div>
  `;

  if (wished) document.getElementById('wishlistBtn').classList.add('active');

  document.getElementById('tabDescText').textContent = listing.desc + " L'annonce inclut une description fidèle de l'état du flacon ; toute différence majeure non mentionnée est couverte par notre protection acheteur.";

  const reviews = generateReviews(listing);
  document.getElementById('reviewsList').innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="seller-avatar-lg" style="width:38px;height:38px;font-size:0.74rem">${r.name.split(' ').map(w => w[0]).join('')}</div>
      <div class="review-body">
        <strong>${r.name}</strong>
        <div class="review-stars">${starsString(r.note)}</div>
        <p>${r.text}</p>
        <div class="review-date">Achat vérifié</div>
      </div>
    </div>
  `).join('');

  // Similar listings: same maison or famille, excluding current
  const similar = LISTINGS.filter(l => l.id !== listing.id && (l.maison === listing.maison || l.famille === listing.famille)).slice(0, 3);
  const fallback = similar.length < 3 ? LISTINGS.filter(l => l.id !== listing.id && !similar.includes(l)).slice(0, 3 - similar.length) : [];
  document.getElementById('similarGrid').innerHTML = [...similar, ...fallback].map(renderCard).join('');

  initTabs();
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

renderProduct();

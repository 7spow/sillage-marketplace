/* ============================================
   SILLAGE — main.js
   Logique partagée : nav mobile, modales, toast,
   wishlist (persistant), checkout Stripe (simulation front).
   ============================================ */

/* ---------- Nav mobile ---------- */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open-mobile');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:70px;left:0;right:0;background:#0B1424;border-bottom:1px solid rgba(255,255,255,0.1);padding:1.2rem 2rem;gap:1.1rem;z-index:99;';
    } else {
      links.removeAttribute('style');
    }
  });
})();

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ---------- Wishlist locale en mémoire, synchronisée avec le store ---------- */
let wishlistCache = new Set();
let wishlistLoaded = false;

async function ensureWishlistLoaded() {
  if (wishlistLoaded) return;
  const ids = await getWishlistIds();
  wishlistCache = new Set(ids);
  wishlistLoaded = true;
}

function isWishlisted(id) { return wishlistCache.has(id); }

async function toggleWishlist(id, btnEl) {
  await ensureWishlistLoaded();
  const nowWishlisted = await toggleWishlistId(id);
  if (nowWishlisted) {
    wishlistCache.add(id);
    showToast('Ajouté aux favoris ♡');
  } else {
    wishlistCache.delete(id);
    showToast('Retiré des favoris');
  }
  if (btnEl) {
    btnEl.classList.toggle('active', nowWishlisted);
    btnEl.innerHTML = heartIcon(nowWishlisted);
  }
  document.dispatchEvent(new CustomEvent('wishlist-changed', { detail: { id, wishlisted: nowWishlisted } }));
}

const heartIcon = (filled) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.6-9.5-9C.7 7.6 2.4 4 6 4c2 0 3.4 1 4.5 2.4C11.6 5 13 4 15 4c3.6 0 5.3 3.6 3.5 7-2.5 4.4-9.5 9-9.5 9Z"/></svg>`;

/* ---------- Carte produit ---------- */
function renderCard(listing) {
  const wished = isWishlisted(listing.id);
  const volumeTag = listing.volume ? `<span class="p-meta-tag">${listing.volume}ml</span>` : '';
  const priceOrig = listing.prixNeuf ? `<span class="p-price-orig">${formatPrice(listing.prixNeuf)} neuf</span>` : '';
  return `
  <article class="p-card" onclick="window.location.href='produit.html?id=${encodeURIComponent(listing.id)}'">
    <div class="p-card-img">
      <div class="p-card-img-glow" style="background:radial-gradient(circle, ${familyTint(listing.famille)}, transparent 70%)"></div>
      <div class="p-card-bottle">${bottleSVG(listing.famille, '100%')}</div>
      <button class="p-wishlist ${wished ? 'active' : ''}" aria-label="Ajouter aux favoris" onclick="event.stopPropagation(); toggleWishlist('${listing.id}', this)">
        ${heartIcon(wished)}
      </button>
    </div>
    <div class="p-card-body">
      <div class="p-maison">${escapeHTML(listing.maison) || 'Maison non précisée'}</div>
      <div class="p-name">${escapeHTML(listing.nom)}</div>
      <div class="p-meta">
        ${volumeTag}
        <span class="p-meta-tag">${listing.fill}% plein</span>
        <span class="p-meta-tag">${escapeHTML(listing.familleLabel)}</span>
      </div>
      <div class="p-footer">
        <div class="p-price-block">
          <strong>${formatPrice(listing.prix)}</strong>
          ${priceOrig}
        </div>
        <div class="p-seller">
          <div class="p-avatar">${listing.avatar}</div>
          <span class="p-rating">${listing.avis > 0 ? `<span class="star">★</span> ${listing.note.toFixed(1)}` : 'Nouveau vendeur'}</span>
        </div>
      </div>
    </div>
  </article>`;
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- Checkout Stripe (simulation) ---------- */
let checkoutListing = null;

async function openCheckout(id) {
  checkoutListing = await getListing(id);
  if (!checkoutListing) { showToast('Cette annonce n\'est plus disponible.'); return; }
  ensureCheckoutModal();
  const fee = Math.round(checkoutListing.prix * 0.03 + 2);
  document.getElementById('checkoutThumb').innerHTML = bottleSVG(checkoutListing.famille, '100%');
  document.getElementById('checkoutMaison').textContent = checkoutListing.maison || 'Maison non précisée';
  document.getElementById('checkoutName').textContent = checkoutListing.nom;
  document.getElementById('checkoutPrice').textContent = formatPrice(checkoutListing.prix);
  document.getElementById('checkoutFee').textContent = formatPrice(fee);
  document.getElementById('checkoutTotal').textContent = formatPrice(checkoutListing.prix + fee);
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutOverlay').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkoutOverlay')?.classList.remove('open');
}

function submitCheckout(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Traitement…';
  btn.disabled = true;
  setTimeout(() => {
    document.getElementById('checkoutStep1').style.display = 'none';
    document.getElementById('checkoutStep2').style.display = 'block';
    btn.textContent = original;
    btn.disabled = false;
  }, 1100);
}

function ensureCheckoutModal() {
  if (document.getElementById('checkoutOverlay')) return;
  const div = document.createElement('div');
  div.className = 'modal-overlay';
  div.id = 'checkoutOverlay';
  div.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" onclick="closeCheckout()" aria-label="Fermer">✕</button>
      <div id="checkoutStep1">
        <h2>Finaliser l'achat</h2>
        <p class="modal-sub">Paiement sécurisé — les fonds sont retenus jusqu'à confirmation de réception.</p>

        <div class="checkout-summary">
          <div class="checkout-thumb" id="checkoutThumb"></div>
          <div class="checkout-summary-info">
            <strong id="checkoutName"></strong>
            <span id="checkoutMaison"></span>
          </div>
        </div>

        <form id="checkoutForm" onsubmit="submitCheckout(event)">
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input type="email" class="form-input" placeholder="vous@exemple.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Numéro de carte</label>
            <input type="text" class="form-input" placeholder="4242 4242 4242 4242" required maxlength="19">
          </div>
          <div class="card-field-row">
            <div class="form-group">
              <label class="form-label">Expiration</label>
              <input type="text" class="form-input" placeholder="MM / AA" required maxlength="7">
            </div>
            <div class="form-group">
              <label class="form-label">CVC</label>
              <input type="text" class="form-input" placeholder="123" required maxlength="4">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Adresse de livraison</label>
            <input type="text" class="form-input" placeholder="12 rue de la Paix, 75002 Paris" required>
          </div>

          <div class="checkout-rows">
            <div class="checkout-row"><span>Sous-total</span><span id="checkoutPrice"></span></div>
            <div class="checkout-row"><span>Frais de service &amp; protection acheteur</span><span id="checkoutFee"></span></div>
            <div class="checkout-row total"><span>Total</span><span id="checkoutTotal"></span></div>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            Payer en toute sécurité
          </button>
        </form>
        <div class="stripe-secure-note">
          <span class="stripe-logo">stripe</span>
          <span>Paiement chiffré · 3D Secure · Fonds séquestrés</span>
        </div>
      </div>

      <div id="checkoutStep2" style="display:none">
        <div class="modal-success">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 13 4 4L19 7"/></svg>
          </div>
          <h2>Paiement confirmé</h2>
          <p>Votre achat est sécurisé. Les fonds sont retenus jusqu'à votre confirmation de réception du colis. Le vendeur a été notifié et va expédier sous 48h.</p>
          <button class="btn btn-primary btn-block" onclick="closeCheckout()">Retour au catalogue</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener('click', (e) => { if (e.target === div) closeCheckout(); });
}

/* ---------- Fermeture modales avec Échap ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ---------- Chargement initial du cache wishlist (best effort, non bloquant) ---------- */
ensureWishlistLoaded();

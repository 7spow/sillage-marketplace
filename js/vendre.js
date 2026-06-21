/* ============================================
   SILLAGE — vendre.js
   Formulaire de dépôt d'annonce (simulation front)
   ============================================ */

let stripeConnected = false;

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadLabel = document.getElementById('uploadLabel');

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#fff'; });
uploadZone.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  if (files.length > 0) {
    uploadLabel.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''} ✓`;
  }
}

const fPrix = document.getElementById('fPrix');
const commissionHint = document.getElementById('commissionHint');

fPrix.addEventListener('input', () => {
  const val = parseFloat(fPrix.value);
  if (val > 0) {
    const net = Math.round(val * 0.92 * 100) / 100;
    commissionHint.textContent = `Vous recevrez environ ${formatPrice(net)} après commission de 8%.`;
  } else {
    commissionHint.textContent = 'Vous recevrez environ — € après commission de 8%.';
  }
});

document.getElementById('stripeConnectBtn').addEventListener('click', function () {
  if (stripeConnected) return;
  this.textContent = 'Connexion…';
  this.disabled = true;
  setTimeout(() => {
    stripeConnected = true;
    document.getElementById('stripeStatus').textContent = 'Compte Stripe connecté ✓';
    this.textContent = 'Connecté';
    this.classList.add('btn-primary');
    this.classList.remove('btn-secondary');
    showToast('Compte Stripe connecté avec succès');
  }, 1000);
});

document.getElementById('sellForm').addEventListener('submit', function (e) {
  e.preventDefault();

  if (!stripeConnected) {
    showToast('Connectez Stripe avant de publier votre annonce');
    document.getElementById('stripeConnectBtn').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('submitBtn');
  const original = btn.textContent;
  btn.textContent = 'Publication…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Annonce publiée ✓';
    showToast('Votre annonce est en ligne !');
    setTimeout(() => { window.location.href = 'catalogue.html'; }, 1200);
  }, 1100);
});

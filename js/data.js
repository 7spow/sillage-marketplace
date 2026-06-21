/* ============================================
   SILLAGE — Données du catalogue (mock data)
   Partagé entre toutes les pages
   ============================================ */

// Palette de glow par famille olfactive, utilisée pour les vignettes SVG
const FAMILY_GLOW = {
  floral:   "#7C8CB8",
  oriental: "#9A7CB8",
  boise:    "#6F8C7A",
  fougere:  "#7CA098",
  ambre:    "#B89A7C",
  hesperide:"#7CA8B8",
  epice:    "#B87C8C",
  aquatique:"#5C9CC4"
};

// Génère un flacon SVG simple et élégant en mode "ligne", teinté par famille
function bottleSVG(family, size = "100%") {
  const tint = FAMILY_GLOW[family] || "#7C8CB8";
  return `<svg viewBox="0 0 60 84" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="6" width="16" height="10" rx="2" fill="none" stroke="${tint}" stroke-width="1.4"/>
    <path d="M24 16h12l3 8v50a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4V24l3-8Z" fill="${tint}" fill-opacity="0.14" stroke="${tint}" stroke-width="1.4"/>
    <line x1="20" y1="40" x2="40" y2="40" stroke="${tint}" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="30" cy="4" r="2" fill="${tint}"/>
  </svg>`;
}
    id: "creed-aventus",
    maison: "Creed",
    nom: "Aventus",
    famille: "fougere",
    familleLabel: "Fougère fruité",
    volume: 100,
    fill: 90,
    prix: 340,
    prixNeuf: 450,
    badge: "rare",
    badgeLabel: "Rare",
    avatar: "PL",
    vendeur: "Pierre L.",
    note: 5.0,
    avis: 112,
    ville: "Paris",
    desc: "Lot 21Q01, batch très demandé. Sillage puissant, projection et longévité au rendez-vous. Acheté chez Jovoy Paris, légèrement testé sur peau deux fois. Flacon impeccable, vaporisateur fonctionnel.",
    tags: ["100ml", "90% plein", "Fougère fruité", "Batch 21Q01"]
  },
  {
    id: "mfk-baccarat",
    maison: "Maison Francis Kurkdjian",
    nom: "Baccarat Rouge 540",
    famille: "ambre",
    familleLabel: "Floral ambré",
    volume: 70,
    fill: 85,
    prix: 210,
    prixNeuf: 325,
    badge: "rare",
    badgeLabel: "Collector",
    avatar: "SA",
    vendeur: "Sophie A.",
    note: 4.8,
    avis: 64,
    ville: "Marseille",
    desc: "L'un des jus les plus demandés du moment. Flacon authentique avec boîte d'origine, quelques utilisations seulement. Sillage et longévité exceptionnels, conservé dans son emballage cadeau.",
    tags: ["70ml", "85% plein", "Floral ambré", "Boîte incluse"]
  },
  {
    id: "tomford-oudwood",
    maison: "Tom Ford",
    nom: "Oud Wood",
    famille: "boise",
    familleLabel: "Boisé oriental",
    volume: 50,
    fill: 100,
    prix: 175,
    prixNeuf: 260,
    badge: "new",
    badgeLabel: "Jamais ouvert",
    avatar: "RD",
    vendeur: "Romain D.",
    note: 4.9,
    avis: 38,
    ville: "Bordeaux",
    desc: "Jamais ouvert, toujours sous son film de protection d'origine. Cadeau non désiré. Authentique avec facture de la boutique Tom Ford des Champs-Élysées, datée de janvier 2026.",
    tags: ["50ml", "100% plein", "Boisé oriental", "Jamais ouvert"]
  },
  {
    id: "amouage-interlude",
    maison: "Amouage",
    nom: "Interlude Man",
    famille: "epice",
    familleLabel: "Oriental épicé",
    volume: 100,
    fill: 75,
    prix: 290,
    prixNeuf: 420,
    badge: "rare",
    badgeLabel: "Édition 2019",
    avatar: "JM",
    vendeur: "Julien M.",
    note: 5.0,
    avis: 29,
    ville: "Paris",
    desc: "Édition 2019, formule appréciée des connaisseurs. Fumé, épicé, envoûtant. Acheté lors d'un voyage à Dubaï. Flacon avec boîte et pochette en velours d'origine, état irréprochable.",
    tags: ["100ml", "75% plein", "Oriental épicé", "Édition 2019"]
  },
  {
    id: "lutens-feminite",
    maison: "Serge Lutens",
    nom: "Féminité du Bois",
    famille: "boise",
    familleLabel: "Boisé floral",
    volume: 50,
    fill: 80,
    prix: 88,
    prixNeuf: 140,
    badge: "",
    badgeLabel: "Vintage",
    avatar: "CL",
    vendeur: "Camille L.",
    note: 4.7,
    avis: 21,
    ville: "Lille",
    desc: "Version ancienne, antérieure à la reformulation. Pour les amateurs de vintage Lutens. Flacon Palais-Royal avec sa boîte d'origine, quelques marques d'usage cosmétiques sur le carton.",
    tags: ["50ml", "80% plein", "Boisé floral", "Version vintage"]
  },
  {
    id: "dior-sauvage",
    maison: "Dior",
    nom: "Sauvage Elixir",
    famille: "epice",
    familleLabel: "Aromatique épicé",
    volume: 60,
    fill: 92,
    prix: 98,
    prixNeuf: 150,
    badge: "new",
    badgeLabel: "Nouveau",
    avatar: "TN",
    vendeur: "Thomas N.",
    note: 4.6,
    avis: 53,
    ville: "Toulouse",
    desc: "Concentré, intense, parfait pour l'hiver. Acheté il y a deux mois, quelques pulvérisations seulement. Conservé dans son coffret d'origine à l'abri de la chaleur.",
    tags: ["60ml", "92% plein", "Aromatique épicé", "Récent"]
  },
  {
    id: "guerlain-habit",
    maison: "Guerlain",
    nom: "Habit Rouge",
    famille: "hesperide",
    familleLabel: "Hespéridé chypré",
    volume: 100,
    fill: 60,
    prix: 65,
    prixNeuf: 110,
    badge: "",
    badgeLabel: "",
    avatar: "AF",
    vendeur: "Antoine F.",
    note: 4.5,
    avis: 17,
    ville: "Nantes",
    desc: "Un classique français intemporel. Flacon bien entamé mais encore beaucoup de jus. Idéal pour découvrir ce parfum culte sans investir dans un flacon neuf.",
    tags: ["100ml", "60% plein", "Hespéridé chypré"]
  },
  {
    id: "mfk-grand-soir",
    maison: "Maison Francis Kurkdjian",
    nom: "Grand Soir",
    famille: "ambre",
    familleLabel: "Ambré vanillé",
    volume: 70,
    fill: 70,
    prix: 165,
    prixNeuf: 245,
    badge: "",
    badgeLabel: "",
    avatar: "LN",
    vendeur: "Léa N.",
    note: 4.8,
    avis: 25,
    ville: "Nice",
    desc: "Vanille, ambre et tabac blond, une signature chaleureuse parfaite pour le soir. Bien conservé, flacon en parfait état esthétique. Boîte non incluse.",
    tags: ["70ml", "70% plein", "Ambré vanillé"]
  },
  {
    id: "creed-silver",
    maison: "Creed",
    nom: "Silver Mountain Water",
    famille: "aquatique",
    familleLabel: "Aquatique fruité",
    volume: 75,
    fill: 88,
    prix: 215,
    prixNeuf: 310,
    badge: "",
    badgeLabel: "",
    avatar: "EV",
    vendeur: "Éléonore V.",
    note: 4.9,
    avis: 33,
    ville: "Rennes",
    desc: "Frais, vert, légèrement fruité. Excellent pour le printemps et l'été. Flacon peu utilisé, conservé dans son coffret d'origine avec facture de la boutique Creed Paris.",
    tags: ["75ml", "88% plein", "Aquatique fruité"]
  },
  {
    id: "lutens-ambre",
    maison: "Serge Lutens",
    nom: "Ambre Sultan",
    famille: "ambre",
    familleLabel: "Ambré boisé",
    volume: 50,
    fill: 55,
    prix: 72,
    prixNeuf: 130,
    badge: "",
    badgeLabel: "",
    avatar: "HK",
    vendeur: "Hugo K.",
    note: 4.6,
    avis: 19,
    ville: "Strasbourg",
    desc: "Ambre intense et boisé, signature Lutens incontournable. Flacon bien entamé, idéal pour tester ce classique sans se ruiner. Bon état général.",
    tags: ["50ml", "55% plein", "Ambré boisé"]
  },
  {
    id: "tomford-tobacco",
    maison: "Tom Ford",
    nom: "Tobacco Vanille",
    famille: "epice",
    familleLabel: "Oriental épicé",
    volume: 50,
    fill: 97,
    prix: 225,
    prixNeuf: 300,
    badge: "rare",
    badgeLabel: "Très demandé",
    avatar: "NB",
    vendeur: "Nadia B.",
    note: 5.0,
    avis: 71,
    ville: "Paris",
    desc: "Vanille, tabac et épices, l'un des best-sellers Tom Ford. Quasiment neuf, testé deux fois seulement. Boîte d'origine incluse, facture disponible sur demande.",
    tags: ["50ml", "97% plein", "Oriental épicé", "Best-seller"]
  }
];

function findListing(id) {
  return LISTINGS.find(l => l.id === id);
}

function formatPrice(n) {
  return n.toLocaleString('fr-FR') + ' €';
}

function starsString(note) {
  const full = Math.round(note);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

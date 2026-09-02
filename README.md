# DronéoTech — landing page

Site statique (HTML/CSS/JS vanilla, aucune dépendance hors Google Fonts).
Hébergeable tel quel sur n'importe quel hébergeur : déposer le dossier à la racine.

## Parti pris de mise en page
Le site est construit comme une **fiche technique**, pas comme un thème :
pas de cartes, pas d'ombres portées, pas de coins arrondis, pas de sections centrées empilées.
La structure repose sur des filets d'1 px, une grille asymétrique et un rail latéral fixe.

- **Rail latéral** (≥ 1080 px) : logo, index 01–05 qui suit le défilement, jauge de progression,
  CTA vertical orange toujours accessible. En dessous : barre haute + barre d'action fixe en bas
  (Appeler / Demander un devis), pensée pour une consultation sur chantier.
- **Hero** : photo pleine page + **viseur thermique interactif**. Deux couches d'image sont
  superposées — `hero-drone.jpg` (visible) et `hero-drone-thermal.jpg` (sa transposition
  infrarouge) — la seconde étant révélée par un masque circulaire qui suit le pointeur
  (`--sx`, `--sy`, `--sr` sur `.hero`, pilotés par `script.js` § 1 bis). Sans pointeur, le viseur
  balaie l'image tout seul sur une trajectoire de Lissajous centrée sur le drone.
  Repères d'interface (coordonnées, données de prise de vue), grille, ligne de balayage,
  bandeau de caractéristiques en bas.
- **Offres** : dalle blanche pleine largeur, deux colonnes séparées par un simple filet vertical.
  Traitement strictement identique des deux prestations, prix et boutons alignés.
- **Effets** : champ de points 3D animé en canvas dans le hero, titre mot à mot, balayage lumineux,
  révélations au défilement, radar animé, bandeau défilant. Tout est neutralisé si le visiteur a
  activé « réduire les animations » (`prefers-reduced-motion`), et les révélations sont
  conditionnées à la classe `js` sur `<html>` pour que le contenu reste visible sans JavaScript.

## Fichiers
- `index.html` — la page
- `styles.css` — styles (palette et typo en variables CSS en haut du fichier)
- `script.js` — année du footer, pré-sélection de l'offre, validation du formulaire
- `assets/logo.jpg` — logo original fourni
- `assets/logo-mark.jpg` — même logo recadré (marges blanches retirées), pour les fonds clairs
- `assets/logo-reverse.png` — **version réservée** : marque détourée en blanc sur fond transparent,
  générée à partir du logo original. C'est elle qui est utilisée dans le rail, la barre haute et le
  pied de page, pour que la marque s'inscrive dans le fond sombre sans plaque blanche.
  Pour la régénérer après une modification du logo, repartir de `logo-mark.jpg` : conversion en PNG,
  puis alpha = inverse de la luminance (le blanc devient transparent, l'encre devient blanche)
- `assets/favicon.png`, `assets/apple-touch-icon.png` — icônes générées depuis le logo

## Coordonnées en place
- Téléphone : 06.71.65.04.94 (`tel:+33671650494`)
- E-mail : contact@droneotech.fr (page + constante `DESTINATAIRE` de `script.js`)
- Domaine : droneotech.fr (canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`)

## Images
- **Hero** : `assets/hero-drone.jpg` en place (Matrice 4T en vol, 1119 × 1400, 116 Ko).
  Elle remplit toute la colonne droite en `object-fit: cover` ; le fondu est assuré par
  `.slab-veil` (dégradés + voile bleu de marque). Pour la remplacer, garder un format vertical
  ~4/5 avec le sujet centré horizontalement.
- **Jumeau thermique** : `assets/hero-drone-thermal.jpg` (575 × 720, 52 Ko) est généré à partir de
  `hero-drone.jpg` — la chaleur est prise comme l'inverse de la luminance (le ciel est lumineux
  mais froid, le sol sombre mais chaud), puis passée dans une palette infrarouge bleu → blanc.
  Les deux images sont cadrées à l'identique par `object-fit: cover`, donc elles restent alignées
  quelle que soit leur résolution. Si vous changez la photo du hero, il faut régénérer ce jumeau.

- **Offres** : `assets/offre-thermique.jpg` et `assets/offre-chantier.jpg`, tous deux ramenés
  en **1040 × 780 (4/3)** pour un rendu identique dans les deux colonnes. Les sources d'origine
  étaient en 5/4 et en 9/16 : le recadrage est fait dans le fichier, pas en CSS.
  Pour remplacer un visuel, fournir du 4/3 — sinon `.prestation-visuel` recadre en `cover`.

Plus aucun placeholder dans la page.

## Pages
- `index.html` — la page de vente
- `mentions-legales.html`, `cgv.html`, `confidentialite.html` — pages légales, même charte,
  même barre haute et même pied de page. Elles portent la classe `page-doc` sur `<body>` :
  pas de rail latéral, contenu en colonne de lecture.

## Informations légales intégrées
Toutes les pages légales sont complètes — plus aucun bloc « à compléter ».
- Exploitant UAS : FRAb70ed6ss29hdx
- RC Pro : Allianz Global Corporate, police n° 10/31793
- Paiement : acompte 30 % à la commande, solde à 30 jours date de facture, par virement
- Pénalités de retard : 3 × le taux d'intérêt légal + 40 € d'indemnité forfaitaire (art. L. 441-10)
- Report / annulation : gratuit si annoncé 48 h avant (report) ou 7 jours avant (annulation) ;
  au-delà, l'acompte reste acquis. Report du fait de DronéoTech : sans frais, remboursement
  intégral si aucune date sous 60 jours.
- Droits sur les images : licence non exclusive et illimitée au client, DronéoTech conserve le
  droit d'usage promotionnel avec possibilité d'opposition écrite du client.
- Clientèle exclusivement professionnelle : pas de médiateur de la consommation, pas de mentions
  relevant du code de la consommation.

À vérifier : `confidentialite.html` § 05 annonce une conservation de 3 ans après le dernier
contact pour les demandes sans suite (recommandation CNIL). Modifier si ce n'est pas votre pratique.

## À COMPLÉTER avant mise en ligne
Image de partage réseaux sociaux (`og:image`) : pointe encore sur le logo. À traiter plus tard.

## Mise en ligne sur GitHub Pages
Le dossier est prêt à être publié tel quel, à la racine du dépôt.
- `CNAME` contient `droneotech.fr` : GitHub Pages configure le domaine personnalisé à partir de
  ce fichier. Ne pas le supprimer.
- `.nojekyll` désactive le traitement Jekyll (inutile ici et source d'effets de bord).
- Tous les chemins sont **relatifs** : le site fonctionne aussi bien à la racine d'un domaine
  que dans un sous-dossier de projet GitHub.
- DNS à créer chez le registrar de droneotech.fr :
  - 4 enregistrements `A` sur l'apex vers `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153`
  - un `CNAME` `www` vers `<utilisateur>.github.io`
  - puis cocher « Enforce HTTPS » dans les réglages Pages une fois le certificat émis.

## SEO
Deux blocs de données structurées sont en place : `ProfessionalService` (coordonnées, zone, tarifs)
et `FAQPage` (les 4 questions de la section « Questions fréquentes »), qui peut faire apparaître
les questions directement dans les résultats Google.

`robots.txt` et `sitemap.xml` sont prêts pour https://droneotech.fr/. Après mise en ligne :
déclarer le site dans Google Search Console et créer la fiche Google Business Profile
(Velaines / Meuse) — c'est le principal levier en référencement local.

## Formulaire
Aucun backend : la soumission ouvre le client mail du visiteur avec la demande pré-remplie
(`mailto:`). Pour un envoi serveur, remplacer le bloc `mailto` de `script.js` par un `fetch()`
vers un script PHP ou un service type Formspree.

## Aperçu local
```
python3 -m http.server 8777
```
puis http://127.0.0.1:8777
